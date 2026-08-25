import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

const ChatMessage = ({ message, isLast }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center shadow-glow-purple animate-breathe">
          <Brain size={16} className="text-white" />
        </div>
      )}

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-sm font-semibold text-white/80">
          Y
        </div>
      )}

      {/* Bubble */}
      <div className={isUser ? 'message-bubble-user' : 'message-bubble-ai'}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        {message.created_at && (
          <p className={`text-[10px] mt-1.5 ${isUser ? 'text-white/50 text-right' : 'text-white/30'}`}>
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="flex items-end gap-3"
  >
    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center shadow-glow-purple animate-breathe">
      <Brain size={16} className="text-white" />
    </div>
    <div className="message-bubble-ai flex items-center gap-1.5 py-4 px-5">
      <span className="typing-dot w-2 h-2 bg-primary-400 rounded-full block" />
      <span className="typing-dot w-2 h-2 bg-primary-400 rounded-full block" />
      <span className="typing-dot w-2 h-2 bg-primary-400 rounded-full block" />
    </div>
  </motion.div>
);

export default ChatMessage;
