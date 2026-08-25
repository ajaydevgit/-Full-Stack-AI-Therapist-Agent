import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, MessageCircle, Shield, History, Sparkles, Heart, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MOODS = [
  { emoji: '😔', label: 'Sad' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😤', label: 'Stressed' },
  { emoji: '😶', label: 'Numb' },
  { emoji: '😤', label: 'Angry' },
  { emoji: '🤔', label: 'Confused' },
  { emoji: '🙂', label: 'Okay' },
  { emoji: '💭', label: 'Overthinking' },
];

const FEATURES = [
  {
    icon: MessageCircle,
    color: 'from-primary-500 to-purple-600',
    title: 'Real-Time Therapy Chat',
    desc: 'Empathetic AI responses powered by Gemini, trained to listen and support.',
  },
  {
    icon: History,
    color: 'from-teal-500 to-cyan-600',
    title: 'Session History',
    desc: 'All your conversations securely saved. Revisit any session anytime.',
  },
  {
    icon: Sparkles,
    color: 'from-pink-500 to-rose-600',
    title: 'Smart Session Summaries',
    desc: 'AI-generated insights and personalized coping strategies after each session.',
  },
  {
    icon: Shield,
    color: 'from-green-500 to-emerald-600',
    title: 'Safety First',
    desc: 'Crisis detection with immediate access to emergency mental health resources.',
  },
];

const Landing = () => {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4">
        {/* Hero Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center py-20 lg:py-28"
        >
          {/* Pill badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary-500/30 text-primary-300 text-sm font-medium mb-8">
            <Sparkles size={14} className="animate-pulse-slow" />
            AI-Powered Mental Wellness Companion
          </motion.div>

          {/* Main heading */}
          <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            Your Safe Space to{' '}
            <span className="gradient-text">Heal & Grow</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg lg:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Talk to Serene — an empathetic AI therapist available 24/7. Share your thoughts,
            process your emotions, and build resilience with personalized support.
          </motion.p>

          {/* CTA buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {user ? (
              <Link to="/chat" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
                <MessageCircle size={20} />
                Start Session
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/login?mode=register" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
                  <Brain size={20} />
                  Begin Your Journey
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login?mode=guest" className="btn-secondary flex items-center gap-2 text-base px-6 py-3.5">
                  Try as Guest
                </Link>
              </>
            )}
          </motion.div>

          {/* Trust indicators */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-6 text-white/40 text-sm">
            {['No judgment zone', 'Always available', 'Privacy first', 'Evidence-based'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-teal-500" />
                {item}
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* Mood Check-In */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card p-8 mb-16"
        >
          <div className="text-center mb-6">
            <Heart size={24} className="text-pink-400 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-white mb-2">How are you feeling today?</h2>
            <p className="text-white/50 text-sm">No matter what you're going through, Serene is here to listen.</p>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-6">
            {MOODS.map(({ emoji, label }) => (
              <Link
                key={label}
                to={user ? '/chat' : '/login'}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/15 transition-all duration-200 cursor-pointer group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{emoji}</span>
                <span className="text-[10px] text-white/40 group-hover:text-white/70">{label}</span>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link
              to={user ? '/chat' : '/login'}
              className="btn-primary inline-flex items-center gap-2"
            >
              Talk to Serene <ArrowRight size={16} />
            </Link>
          </div>
        </motion.section>

        {/* Features */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Everything you need to <span className="gradient-text">feel better</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Serene combines the warmth of human therapy with the accessibility of AI.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map(({ icon: Icon, color, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-card p-6 hover:border-white/20 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-10 text-center mb-16 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-teal-500/10 pointer-events-none" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center mx-auto mb-5 shadow-glow-purple animate-breathe">
              <Brain size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Ready to start healing?
            </h2>
            <p className="text-white/55 max-w-md mx-auto mb-7">
              Join thousands of people who use Serene to navigate life's challenges.
              Your first session is completely free.
            </p>
            <Link
              to={user ? '/chat' : '/login?mode=register'}
              className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
            >
              <Sparkles size={18} />
              {user ? 'Start a New Session' : 'Get Started — It\'s Free'}
            </Link>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Brain size={18} className="text-primary-400" />
            <span className="font-bold gradient-text">Serene</span>
          </div>
          <p className="text-white/30 text-xs max-w-md mx-auto">
            Serene is an AI wellness companion and is not a substitute for professional psychiatric or psychological treatment.
            If you are in crisis, please call emergency services or a crisis helpline immediately.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
