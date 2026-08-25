import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Square, Sparkles, ArrowDown, Brain, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../contexts/AuthContext';
import ChatMessage, { TypingIndicator } from '../components/ChatMessage';
import CrisisAlert from '../components/CrisisAlert';
import SessionSummary from '../components/SessionSummary';

const MOODS = [
  { emoji: '😔', label: 'Sad', value: 'Sadness' },
  { emoji: '😰', label: 'Anxious', value: 'Anxiety' },
  { emoji: '😤', label: 'Stressed', value: 'Stress' },
  { emoji: '😶', label: 'Numb', value: 'Numbness' },
  { emoji: '😠', label: 'Angry', value: 'Anger' },
  { emoji: '🤔', label: 'Confused', value: 'Confusion' },
  { emoji: '🙂', label: 'Okay', value: 'Neutral' },
  { emoji: '💭', label: 'Overthinking', value: 'Anxiety' },
];

const WELCOME_MESSAGES = [
  "Hello, I'm Serene 🌿 I'm here to listen without judgment. How are you feeling today?",
  "Welcome. This is a safe, compassionate space just for you. What's on your mind?",
  "Hi there 💜 I'm glad you're here. Take a deep breath — you can share anything with me.",
];

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState('mood-select'); // 'mood-select' | 'chatting' | 'ended'
  const [selectedMood, setSelectedMood] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [crisisData, setCrisisData] = useState(null);
  const [endedSession, setEndedSession] = useState(null);
  const [endingSession, setEndingSession] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user]);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!isNearBottom);
  };

  const startSession = async (mood) => {
    setSelectedMood(mood);
    try {
      const res = await axios.post(`${API_BASE}/sessions`, { mood: mood.value });
      setSessionId(res.data.id);

      // Add welcome message
      const welcome = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
      const moodGreeting = `I can see you're feeling ${mood.label.toLowerCase()} today ${mood.emoji}. `;
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: moodGreeting + welcome,
        created_at: new Date().toISOString(),
      }]);
      setPhase('chatting');
      setTimeout(() => inputRef.current?.focus(), 300);
    } catch (err) {
      toast.error('Could not start session. Please try again.');
    }
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isTyping || !sessionId) return;

    setInput('');
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsTyping(true);

    try {
      const res = await axios.post(`${API_BASE}/sessions/${sessionId}/messages`, { content: text });
      const { userMessage, aiMessage, crisis } = res.data;

      setMessages(prev => [
        ...prev.filter(m => m.id !== tempUserMsg.id),
        { ...userMessage, created_at: new Date().toISOString() },
        { ...aiMessage, created_at: new Date().toISOString() },
      ]);

      if (crisis) {
        setCrisisData(crisis);
      }
    } catch (err) {
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setIsTyping(false);
    }
  };

  const endSession = async () => {
    if (!sessionId || endingSession) return;
    setEndingSession(true);
    try {
      const res = await axios.post(`${API_BASE}/sessions/${sessionId}/end`);
      setEndedSession(res.data);
      setPhase('ended');
    } catch {
      toast.error('Could not end session. Please try again.');
    } finally {
      setEndingSession(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Mood Selection Screen ──────────────────────────────────────────────────
  if (phase === 'mood-select') {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg relative"
        >
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center mx-auto mb-5 shadow-glow-purple animate-breathe">
              <Brain size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">How are you feeling?</h2>
            <p className="text-white/50 text-sm mb-8">
              Choosing a mood helps Serene understand and support you better.
            </p>

            <div className="grid grid-cols-4 gap-3 mb-8">
              {MOODS.map((mood) => (
                <motion.button
                  key={mood.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startSession(mood)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                    selectedMood?.label === mood.label
                      ? 'bg-primary-500/20 border-primary-500/50 shadow-glow-purple'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-[11px] text-white/60 font-medium">{mood.label}</span>
                </motion.button>
              ))}
            </div>

            <button
              onClick={() => startSession({ emoji: '💭', label: 'Open', value: 'Exploratory' })}
              className="btn-secondary w-full text-sm"
            >
              Skip — I just want to talk
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Session Summary Screen ─────────────────────────────────────────────────
  if (phase === 'ended' && endedSession) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold gradient-text mb-2">Session Wrapped Up</h2>
            <p className="text-white/50">Here's a summary of your conversation with Serene</p>
          </div>
          <SessionSummary
            session={endedSession}
            onNewSession={() => {
              setPhase('mood-select');
              setMessages([]);
              setSessionId(null);
              setEndedSession(null);
              setSelectedMood(null);
            }}
            onGoHome={() => navigate('/sessions')}
          />
        </div>
      </div>
    );
  }

  // ── Chat Screen ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen pt-16">
      {/* Crisis Alert */}
      {crisisData && (
        <CrisisAlert resources={crisisData} onClose={() => setCrisisData(null)} />
      )}

      {/* Chat Header */}
      <div className="glass border-b border-white/10 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center shadow-glow-purple animate-breathe">
              <Brain size={18} className="text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-dark-950" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">Serene</p>
            <p className="text-[10px] text-green-400">Online — Ready to listen</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedMood && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-white/50 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              {selectedMood.emoji} {selectedMood.label}
            </span>
          )}
          <button
            onClick={endSession}
            disabled={endingSession || messages.length < 2}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            {endingSession ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Square size={12} />
            )}
            End Session
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      >
        <AnimatePresence>
          {messages.map((msg, i) => (
            <ChatMessage key={msg.id} message={msg} isLast={i === messages.length - 1} />
          ))}
          {isTyping && <TypingIndicator key="typing" />}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-24 right-6 w-9 h-9 rounded-full glass border border-white/20 flex items-center justify-center text-white/60 hover:text-white shadow-lg"
          >
            <ArrowDown size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="glass border-t border-white/10 px-4 py-4 flex-shrink-0">
        <form onSubmit={sendMessage} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind..."
              rows={1}
              className="input-field resize-none pr-12 leading-relaxed min-h-[44px] max-h-32 overflow-y-auto"
              style={{ height: 'auto' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="btn-primary p-3 flex-shrink-0 rounded-xl disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-center text-white/20 text-[10px] mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default Chat;
