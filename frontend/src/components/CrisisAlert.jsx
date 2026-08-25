import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, MessageSquare, X, Heart } from 'lucide-react';

const CrisisAlert = ({ resources, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="w-full max-w-md glass-card p-6 border-red-500/30"
          style={{ borderColor: 'rgba(239,68,68,0.3)' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">You're Not Alone</h3>
                <p className="text-white/50 text-xs">Immediate help is available</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors p-1"
            >
              <X size={18} />
            </button>
          </div>

          {/* Message */}
          <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-white/80 text-sm leading-relaxed">
              <Heart size={14} className="inline text-red-400 mr-1" />
              It sounds like you may be going through something really difficult right now. 
              You matter, and there are people who care about you and want to help.
              Please reach out to one of these resources:
            </p>
          </div>

          {/* Resources */}
          <div className="space-y-2 mb-5">
            {resources.map((resource, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
              >
                <span className="text-lg">{resource.country}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{resource.name}</p>
                  <p className="text-white/50 text-xs">{resource.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-mono text-primary-300 text-sm font-bold">{resource.number}</p>
                  <p className="text-white/30 text-[10px]">{resource.available}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 btn-secondary text-sm py-2.5"
            >
              I'm okay, continue chat
            </button>
            <a
              href="tel:9152987821"
              className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4"
            >
              <Phone size={14} />
              Call Now
            </a>
          </div>

          <p className="text-center text-white/30 text-[10px] mt-3">
            This chat is not a substitute for professional crisis intervention
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CrisisAlert;
