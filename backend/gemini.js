const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let geminiModel = null;

const DEFAULT_OPENROUTER_MODEL = 'google/gemma-4-26b-a4b-it:free';

// Top active free fallback models on OpenRouter
const OPENROUTER_FREE_FALLBACKS = [
  'google/gemma-4-26b-a4b-it:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'deepseek/deepseek-r1-distill-llama-70b:free',
  'qwen/qwen-2.5-coder-32b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'openai/gpt-4o-mini',
];

const SYSTEM_PROMPT = `You are Serene, a compassionate and empathetic AI therapist assistant. Your role is to provide emotional support, active listening, and evidence-based therapeutic techniques.

CORE PRINCIPLES:
- Practice active listening and validate emotions without judgment
- Use techniques from CBT, mindfulness, and positive psychology
- Ask one thoughtful follow-up question at a time
- Reflect back what you hear to show understanding
- Use warm, conversational language — never clinical or cold
- Acknowledge the person's courage in sharing their feelings
- Offer practical, actionable coping strategies when appropriate
- Never diagnose, prescribe medication, or replace professional therapy
- If someone is in crisis, gently encourage professional help

RESPONSE STYLE:
- Keep responses concise (2-4 paragraphs max)
- Start with empathy, then exploration, then gentle guidance
- Use "I notice..." and "It sounds like..." and "I'm here with you..."
- Avoid generic phrases like "That must be hard" — be specific
- End with an open question to keep the conversation flowing

IMPORTANT: You are NOT a replacement for professional mental health care. You are a supportive companion.`;

const MOCK_RESPONSES = [
  "I hear you, and I want you to know that what you're feeling is completely valid. It takes real courage to put these feelings into words. Can you tell me more about when these feelings tend to be strongest?",
  "Thank you for sharing that with me. It sounds like you've been carrying a lot lately. I'm curious — is there a specific moment recently where you felt this most intensely?",
  "What you're describing makes complete sense given what you've been through. Sometimes our minds and bodies are trying to tell us something important. How have you been taking care of yourself during this time?",
  "I appreciate your trust in sharing this. It sounds like you're navigating something really challenging. What does support look like for you right now — what would feel most helpful?",
  "That sounds really overwhelming, and I want you to know you don't have to face it alone. I'm wondering — have there been any small moments of relief or peace, even briefly?",
];

let mockIndex = 0;

const getProvider = () => {
  if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your_openrouter_api_key_here') {
    return 'openrouter';
  }
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    return 'openai';
  }
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    return 'gemini';
  }
  return 'mock';
};

const initGemini = () => {
  const provider = getProvider();
  if (provider === 'openrouter') {
    const model = process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL;
    console.log(`🤖 AI Provider: OpenRouter connected (Primary: ${model})`);
    return true;
  }
  if (provider === 'openai') {
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    console.log(`🤖 AI Provider: OpenAI connected (Model: ${model})`);
    return true;
  }
  if (provider === 'gemini') {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('🤖 AI Provider: Google Gemini connected');
    return true;
  }
  console.warn('⚠️  No AI API key found (OPENROUTER_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY). Using mock responses.');
  return false;
};

// Clean thinking/reasoning tags if returned by reasoning models
function stripThinkingTags(text) {
  if (!text) return '';
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .trim();
}

// ── OpenRouter / OpenAI API Call Helper with Auto-Fallback ─────────────────
async function callOpenRouterWithFallback({ apiKey, model, messages, jsonMode = false }) {
  const configuredModel = model || DEFAULT_OPENROUTER_MODEL;
  
  // Create priority list of models
  const modelsToTry = [
    configuredModel,
    ...OPENROUTER_FREE_FALLBACKS.filter(m => m !== configuredModel)
  ];

  let lastError = null;

  for (const currentModel of modelsToTry) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://serene-ai-therapist.vercel.app',
        'X-Title': 'Serene AI Therapist Agent',
      };

      const body = {
        model: currentModel,
        messages,
        temperature: 0.85,
        max_tokens: 800,
      };

      if (jsonMode) {
        body.response_format = { type: 'json_object' };
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const errJson = (() => { try { return JSON.parse(errorText); } catch { return {}; } })();
        
        // If rate-limited (429), busy (503/500/404), switch to next free model
        if (response.status === 429 || response.status === 404 || response.status >= 500 || errJson.error?.code === 429) {
          console.warn(`⚠️  Model ${currentModel} returned ${response.status}. Trying fallback model...`);
          lastError = new Error(`AI API error (${response.status}): ${errorText}`);
          continue;
        }
        throw new Error(`AI API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content || '';
      const cleaned = stripThinkingTags(rawContent);
      if (cleaned) {
        return cleaned;
      }
    } catch (err) {
      lastError = err;
      console.warn(`⚠️  Attempt with ${currentModel} failed: ${err.message}. Retrying with next model...`);
    }
  }

  throw lastError || new Error('All OpenRouter fallback models failed');
}

const chat = async (messages, userMessage) => {
  const provider = getProvider();

  if (provider === 'openrouter') {
    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      const model = process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL;

      const formattedMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
        { role: 'user', content: userMessage }
      ];

      const reply = await callOpenRouterWithFallback({
        apiKey,
        model,
        messages: formattedMessages,
      });

      return reply || MOCK_RESPONSES[mockIndex++ % MOCK_RESPONSES.length];
    } catch (err) {
      console.error('OpenRouter Chat error after fallbacks:', err.message);
      const response = MOCK_RESPONSES[mockIndex % MOCK_RESPONSES.length];
      mockIndex++;
      return response;
    }
  }

  if (provider === 'openai') {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

      const formattedMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
        { role: 'user', content: userMessage }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature: 0.85,
          max_tokens: 800,
        }),
      });

      const data = await response.json();
      return data.choices?.[0]?.message?.content || MOCK_RESPONSES[mockIndex++ % MOCK_RESPONSES.length];
    } catch (err) {
      console.error('OpenAI Chat error:', err.message);
      const response = MOCK_RESPONSES[mockIndex % MOCK_RESPONSES.length];
      mockIndex++;
      return response;
    }
  }

  if (provider === 'gemini') {
    try {
      if (!geminiModel) initGemini();
      const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const chatSession = geminiModel.startChat({
        history,
        generationConfig: {
          maxOutputTokens: 512,
          temperature: 0.85,
          topP: 0.95,
        },
        systemInstruction: SYSTEM_PROMPT,
      });

      const result = await chatSession.sendMessage(userMessage);
      return result.response.text();
    } catch (error) {
      console.error('Gemini API error:', error.message);
      const response = MOCK_RESPONSES[mockIndex % MOCK_RESPONSES.length];
      mockIndex++;
      return response;
    }
  }

  // Fallback mock
  const response = MOCK_RESPONSES[mockIndex % MOCK_RESPONSES.length];
  mockIndex++;
  return response;
};

const generateSummary = async (messages) => {
  const provider = getProvider();

  const conversation = messages
    .map(m => `${m.role === 'user' ? 'User' : 'Serene'}: ${m.content}`)
    .join('\n\n');

  const summaryPrompt = `Based on this therapy session conversation, provide a structured summary in JSON format.

CONVERSATION:
${conversation}

Respond ONLY with valid JSON in this exact format:
{
  "title": "Brief session title (max 6 words)",
  "mood": "Primary emotional theme (e.g., Anxiety, Grief, Stress, Hope)",
  "keyThemes": ["theme1", "theme2", "theme3"],
  "summary": "2-3 sentence compassionate summary of what was discussed and any progress made",
  "insights": "One meaningful insight or observation about the person's journey",
  "copingSteps": [
    "Specific coping strategy 1",
    "Specific coping strategy 2",
    "Specific coping strategy 3",
    "Specific coping strategy 4",
    "Specific coping strategy 5"
  ]
}`;

  if (provider === 'openrouter') {
    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      const model = process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL;

      const text = await callOpenRouterWithFallback({
        apiKey,
        model,
        messages: [{ role: 'user', content: summaryPrompt }],
        jsonMode: false,
      });

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch (err) {
      console.error('Summary error (OpenRouter):', err.message);
    }
  }

  if (provider === 'openai') {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [{ role: 'user', content: summaryPrompt }],
        }),
      });
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.error('Summary error (OpenAI):', err.message);
    }
  }

  if (provider === 'gemini') {
    try {
      if (!genAI) initGemini();
      const summaryModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await summaryModel.generateContent(summaryPrompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Summary generation error (Gemini):', error.message);
    }
  }

  // Default fallback summary
  return {
    title: 'Reflective Session',
    mood: 'Exploratory',
    keyThemes: ['Self-awareness', 'Emotional processing', 'Growth'],
    summary: 'In this session, you explored your feelings and practiced self-reflection. You showed great courage in opening up about your experiences.',
    insights: 'You demonstrated resilience and a genuine desire to understand yourself better.',
    copingSteps: [
      'Practice 5 minutes of deep breathing when feeling overwhelmed',
      'Journal your thoughts for 10 minutes each morning',
      'Reach out to one trusted person in your support network this week',
      'Try a 10-minute mindfulness walk in nature',
      'Celebrate one small win or positive moment each evening'
    ]
  };
};

module.exports = { chat, generateSummary, initGemini, getProvider };
