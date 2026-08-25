import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login, register, continueAsGuest, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const defaultMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState(defaultMode);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({ username: '', email: '', password: '' });

  useEffect(() => {
    if (user) navigate('/chat');
  }, [user]);

  useEffect(() => {
    if (searchParams.get('mode') === 'guest') {
      handleGuest();
    }
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back! 💜');
        navigate('/chat');
      } else {
        await register(form.username, form.email, form.password);
        toast.success('Account created! Welcome to Serene 🌟');
        navigate('/chat');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await continueAsGuest();
      toast.success('Starting guest session...');
      navigate('/chat');
    } catch {
      toast.error('Could not start guest session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Card */}
        <div className="glass-card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-glow-purple animate-breathe">
              <Brain size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text mb-1">Serene</h1>
            <p className="text-white/40 text-sm">Your AI Therapy Companion</p>
          </div>

          {/* Mode Tabs */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-6">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  mode === m
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {mode === 'register' && (
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    name="username"
                    type="text"
                    placeholder="Your name"
                    value={form.username}
                    onChange={handleChange}
                    className="input-field pl-11"
                    required
                    minLength={2}
                  />
                </div>
              )}

              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field pl-11"
                  required
                />
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field pl-11 pr-11"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles size={16} />
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Guest Button */}
          <button
            onClick={handleGuest}
            disabled={loading}
            className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
          >
            <UserX size={16} />
            Continue as Guest
          </button>

          {/* Footer note */}
          <p className="text-center text-white/25 text-xs mt-5 leading-relaxed">
            By continuing, you agree that Serene is a wellness tool,
            not a substitute for professional mental health care.
          </p>
        </div>

        <p className="text-center mt-4 text-white/30 text-xs">
          <Link to="/" className="hover:text-white/60 transition-colors">← Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
