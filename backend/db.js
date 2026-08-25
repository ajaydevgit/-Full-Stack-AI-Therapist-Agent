const fs = require('fs');
const path = require('path');
const os = require('os');

// In Vercel serverless environment, local directories are read-only, so use OS tempdir
const DB_FILE = process.env.VERCEL 
  ? path.join(os.tmpdir(), 'therapist-data.json')
  : path.join(__dirname, 'therapist-data.json');

// In-memory data store with file persistence
let data = {
  users: [],
  sessions: [],
  messages: []
};

// Load existing data from file if present
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    data = JSON.parse(raw);
    if (!data.users) data.users = [];
    if (!data.sessions) data.sessions = [];
    if (!data.messages) data.messages = [];
  } else {
    saveData();
  }
} catch (err) {
  console.warn('⚠️  Could not read database file, using in-memory store:', err.message);
}

function saveData() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // Keep in-memory store active even if disk write fails on serverless
    console.warn('Database write warning (using memory):', err.message);
  }
}

// User queries matching the prepared statement interface
const userQueries = {
  create: {
    run: (params) => {
      const now = new Date().toISOString();
      const user = {
        id: params.id,
        username: params.username,
        email: params.email || null,
        password_hash: params.password_hash || null,
        is_anonymous: params.is_anonymous ? 1 : 0,
        created_at: now,
        updated_at: now
      };
      data.users.push(user);
      saveData();
      return { changes: 1 };
    }
  },
  findByEmail: {
    get: (email) => {
      return data.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase()) || null;
    }
  },
  findByUsername: {
    get: (username) => {
      return data.users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase()) || null;
    }
  },
  findById: {
    get: (id) => {
      return data.users.find(u => u.id === id) || null;
    }
  }
};

// Session queries matching the prepared statement interface
const sessionQueries = {
  create: {
    run: (params) => {
      const now = new Date().toISOString();
      const session = {
        id: params.id,
        user_id: params.user_id,
        title: params.title || 'New Session',
        mood: params.mood || null,
        status: 'active',
        summary: null,
        coping_steps: null,
        message_count: 0,
        started_at: now,
        ended_at: null
      };
      data.sessions.push(session);
      saveData();
      return { changes: 1 };
    }
  },
  findByUser: {
    all: (userId) => {
      return data.sessions
        .filter(s => s.user_id === userId)
        .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
        .slice(0, 20);
    }
  },
  findById: {
    get: (id) => {
      return data.sessions.find(s => s.id === id) || null;
    }
  },
  updateTitle: {
    run: (title, id) => {
      const session = data.sessions.find(s => s.id === id);
      if (session) {
        session.title = title;
        saveData();
        return { changes: 1 };
      }
      return { changes: 0 };
    }
  },
  endSession: {
    run: (summary, coping_steps, message_count, id) => {
      const session = data.sessions.find(s => s.id === id);
      if (session) {
        session.status = 'ended';
        session.ended_at = new Date().toISOString();
        session.summary = summary;
        session.coping_steps = coping_steps;
        session.message_count = message_count;
        saveData();
        return { changes: 1 };
      }
      return { changes: 0 };
    }
  },
  updateMessageCount: {
    run: (id) => {
      const session = data.sessions.find(s => s.id === id);
      if (session) {
        session.message_count = (session.message_count || 0) + 1;
        saveData();
        return { changes: 1 };
      }
      return { changes: 0 };
    }
  }
};

// Message queries matching the prepared statement interface
const messageQueries = {
  create: {
    run: (params) => {
      const message = {
        id: params.id,
        session_id: params.session_id,
        role: params.role,
        content: params.content,
        created_at: new Date().toISOString()
      };
      data.messages.push(message);
      saveData();
      return { changes: 1 };
    }
  },
  findBySession: {
    all: (sessionId) => {
      return data.messages
        .filter(m => m.session_id === sessionId)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
  },
  countBySession: {
    get: (sessionId) => {
      const count = data.messages.filter(m => m.session_id === sessionId).length;
      return { count };
    }
  }
};

module.exports = { data, userQueries, sessionQueries, messageQueries };
