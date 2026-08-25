import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Heart, BookOpen, CheckCircle2, Tag, TrendingUp } from 'lucide-react';

const MOOD_COLORS = {
  Anxiety: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
  Grief: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
  Stress: 'from-red-500/20 to-pink-500/20 border-red-500/30',
  Hope: 'from-green-500/20 to-teal-500/20 border-green-500/30',
  Depression: 'from-purple-500/20 to-blue-500/20 border-purple-500/30',
  default: 'from-primary-500/20 to-teal-500/20 border-primary-500/30',
};

const SessionSummary = ({ session, onNewSession, onGoHome }) => {
  const {
    title,
    mood,
    keyThemes = [],
    summary,
    insights,
    coping_steps = [],
    message_count,
    started_at,
    ended_at,
  } = session;

  const moodColor = MOOD_COLORS[mood] || MOOD_COLORS.default;
  const duration = started_at && ended_at
    ? Math.round((new Date(ended_at) - new Date(started_at)) / 60000)
    : null;

  const themes = Array.isArray(keyThemes) ? keyThemes : [];
  const steps = Array.isArray(coping_steps) ? coping_steps : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-5 pb-10"
    >
      {/* Header */}
      <div className={`glass-card p-6 bg-gradient-to-br ${moodColor}`}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center shadow-glow-purple flex-shrink-0">
            <Brain size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-primary-400" />
              <span className="text-primary-300 text-xs font-medium uppercase tracking-wider">Session Complete</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{title || 'Therapy Session'}</h2>
            <div className="flex items-center flex-wrap gap-3 text-xs text-white/50">
              {mood && (
                <span className="tag">
                  <Heart size={10} />
                  {mood}
                </span>
              )}
              {message_count > 0 && (
                <span className="text-white/40">{message_count} messages</span>
              )}
              {duration !== null && (
                <span className="text-white/40">{duration} min session</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Key Themes */}
      {themes.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={16} className="text-teal-400" />
            <h3 className="font-semibold text-white/90">Key Themes</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {themes.map((theme, i) => (
              <span key={i} className="tag">{theme}</span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Summary */}
      {summary && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={16} className="text-primary-400" />
            <h3 className="font-semibold text-white/90">Session Summary</h3>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">{summary}</p>
        </motion.div>
      )}

      {/* Insights */}
      {insights && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 border-teal-500/20" style={{ borderColor: 'rgba(20,184,166,0.2)' }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-teal-400" />
            <h3 className="font-semibold text-white/90">Therapist Insight</h3>
          </div>
          <div className="flex gap-3">
            <div className="w-1 rounded-full bg-gradient-to-b from-teal-500 to-primary-500 flex-shrink-0" />
            <p className="text-white/70 text-sm leading-relaxed italic">{insights}</p>
          </div>
        </motion.div>
      )}

      {/* Coping Steps */}
      {steps.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={16} className="text-green-400" />
            <h3 className="font-semibold text-white/90">Suggested Coping Strategies</h3>
          </div>
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-xs font-bold text-primary-300 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-white/75 text-sm leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex gap-3">
        {onGoHome && (
          <button onClick={onGoHome} className="btn-secondary flex-1">
            View All Sessions
          </button>
        )}
        {onNewSession && (
          <button onClick={onNewSession} className="btn-primary flex-1">
            Start New Session
          </button>
        )}
      </motion.div>

      <p className="text-center text-white/25 text-xs pb-4">
        Remember: This AI companion is not a replacement for professional mental health care.
        If you're struggling, please reach out to a licensed therapist.
      </p>
    </motion.div>
  );
};

export default SessionSummary;
