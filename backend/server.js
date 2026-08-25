require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const { userQueries, sessionQueries, messageQueries } = require('./db');
const { generateToken, authMiddleware } = require('./auth');
const { chat, generateSummary, initGemini } = require('./gemini');
const { detectCrisis, EMERGENCY_RESOURCES } = require('./crisis');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Gemini on startup
initGemini();

// Middleware - CORS enabled for Vercel, localhost, and custom domains
app.use(cors({
  origin: true, // Allow all origins in production/cross-hosting
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// ─────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check existing user
    const existingEmail = userQueries.findByEmail.get(email);
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const existingUsername = userQueries.findByUsername.get(username);
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    userQueries.create.run({
      id: userId,
      username,
      email,
      password_hash: passwordHash,
      is_anonymous: 0,
    });

    const token = generateToken(userId);
    res.status(201).json({
      token,
      user: { id: userId, username, email, is_anonymous: false },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = userQueries.findByEmail.get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_anonymous: false,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Anonymous / Guest session
app.post('/api/auth/guest', (req, res) => {
  try {
    const userId = uuidv4();
    const username = `Guest_${userId.slice(0, 6)}`;

    userQueries.create.run({
      id: userId,
      username,
      email: null,
      password_hash: null,
      is_anonymous: 1,
    });

    const token = generateToken(userId);
    res.status(201).json({
      token,
      user: { id: userId, username, email: null, is_anonymous: true },
    });
  } catch (err) {
    console.error('Guest session error:', err);
    res.status(500).json({ error: 'Could not create guest session' });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const { id, username, email, is_anonymous } = req.user;
  res.json({ id, username, email, is_anonymous: !!is_anonymous });
});

// ─────────────────────────────────────────────
// SESSION ROUTES
// ─────────────────────────────────────────────

// Create new session
app.post('/api/sessions', authMiddleware, (req, res) => {
  try {
    const { mood } = req.body;
    const sessionId = uuidv4();

    sessionQueries.create.run({
      id: sessionId,
      user_id: req.user.id,
      title: 'New Session',
      mood: mood || null,
    });

    const session = sessionQueries.findById.get(sessionId);
    res.status(201).json(session);
  } catch (err) {
    console.error('Create session error:', err);
    res.status(500).json({ error: 'Could not create session' });
  }
});

// Get all sessions for user
app.get('/api/sessions', authMiddleware, (req, res) => {
  try {
    const sessions = sessionQueries.findByUser.all(req.user.id);
    res.json(sessions);
  } catch (err) {
    console.error('Get sessions error:', err);
    res.status(500).json({ error: 'Could not fetch sessions' });
  }
});

// Get single session with messages
app.get('/api/sessions/:id', authMiddleware, (req, res) => {
  try {
    const session = sessionQueries.findById.get(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = messageQueries.findBySession.all(req.params.id);
    
    // Parse coping_steps if stored as JSON string
    let copingSteps = session.coping_steps;
    try {
      if (typeof copingSteps === 'string') copingSteps = JSON.parse(copingSteps);
    } catch {}

    res.json({ ...session, coping_steps: copingSteps, messages });
  } catch (err) {
    console.error('Get session error:', err);
    res.status(500).json({ error: 'Could not fetch session' });
  }
});

// End session and generate summary
app.post('/api/sessions/:id/end', authMiddleware, async (req, res) => {
  try {
    const session = sessionQueries.findById.get(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (session.status === 'ended') {
      // Return existing summary
      const messages = messageQueries.findBySession.all(req.params.id);
      let copingSteps = session.coping_steps;
      try {
        if (typeof copingSteps === 'string') copingSteps = JSON.parse(copingSteps);
      } catch {}
      return res.json({ ...session, coping_steps: copingSteps, messages });
    }

    const messages = messageQueries.findBySession.all(req.params.id);
    const msgCount = messages.length;

    if (msgCount < 2) {
      // Too few messages — still end but with minimal summary
      sessionQueries.endSession.run(
        'Session ended early.',
        JSON.stringify([]),
        msgCount,
        req.params.id
      );
      const updated = sessionQueries.findById.get(req.params.id);
      return res.json({ ...updated, coping_steps: [], messages });
    }

    // Generate AI summary
    const summaryData = await generateSummary(messages);

    // Update session title from summary
    if (summaryData.title) {
      sessionQueries.updateTitle.run(summaryData.title, req.params.id);
    }

    sessionQueries.endSession.run(
      summaryData.summary || '',
      JSON.stringify(summaryData.copingSteps || []),
      msgCount,
      req.params.id
    );

    const updatedSession = sessionQueries.findById.get(req.params.id);
    res.json({
      ...updatedSession,
      title: summaryData.title,
      mood: summaryData.mood,
      keyThemes: summaryData.keyThemes,
      insights: summaryData.insights,
      coping_steps: summaryData.copingSteps,
      messages,
    });
  } catch (err) {
    console.error('End session error:', err);
    res.status(500).json({ error: 'Could not end session' });
  }
});

// ─────────────────────────────────────────────
// MESSAGE / CHAT ROUTES
// ─────────────────────────────────────────────

// Send message
app.post('/api/sessions/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content required' });
    }

    const session = sessionQueries.findById.get(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (session.status === 'ended') {
      return res.status(400).json({ error: 'Session has ended' });
    }

    // Crisis detection
    const isCrisis = detectCrisis(content);

    // Save user message
    const userMsgId = uuidv4();
    messageQueries.create.run({
      id: userMsgId,
      session_id: req.params.id,
      role: 'user',
      content: content.trim(),
    });
    sessionQueries.updateMessageCount.run(req.params.id);

    // Get all messages for context
    const allMessages = messageQueries.findBySession.all(req.params.id);

    // Get AI response
    const aiResponse = await chat(allMessages, content.trim());

    // Save AI message
    const aiMsgId = uuidv4();
    messageQueries.create.run({
      id: aiMsgId,
      session_id: req.params.id,
      role: 'assistant',
      content: aiResponse,
    });
    sessionQueries.updateMessageCount.run(req.params.id);

    // Auto-generate title after first user message
    if (allMessages.length <= 1 && content.length > 10) {
      const titleWords = content.trim().split(' ').slice(0, 5).join(' ');
      sessionQueries.updateTitle.run(titleWords + '...', req.params.id);
    }

    res.json({
      userMessage: { id: userMsgId, role: 'user', content: content.trim() },
      aiMessage: { id: aiMsgId, role: 'assistant', content: aiResponse },
      crisis: isCrisis ? EMERGENCY_RESOURCES : null,
    });
  } catch (err) {
    console.error('Message error:', err);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get messages for session
app.get('/api/sessions/:id/messages', authMiddleware, (req, res) => {
  try {
    const session = sessionQueries.findById.get(req.params.id);
    if (!session || session.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = messageQueries.findBySession.all(req.params.id);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch messages' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  if (require.main === module) {
    app.listen(PORT, () => {
      console.log(`🧠 Therapist AI Backend running on http://localhost:${PORT}`);
    });
  }
}

module.exports = app;
