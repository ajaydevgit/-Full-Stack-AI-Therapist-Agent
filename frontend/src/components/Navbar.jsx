import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Brain, MessageCircle, History, LogOut, User, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center shadow-glow-purple group-hover:shadow-glow-teal transition-all duration-300">
              <Brain size={20} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-400 rounded-full animate-pulse-slow" />
          </div>
          <span className="font-bold text-lg gradient-text">Serene</span>
        </Link>

        {/* Navigation Links */}
        {user && (
          <div className="flex items-center gap-1">
            <Link
              to="/chat"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/chat')
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <MessageCircle size={16} />
              <span className="hidden sm:inline">New Chat</span>
            </Link>
            <Link
              to="/sessions"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/sessions')
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <History size={16} />
              <span className="hidden sm:inline">History</span>
            </Link>
          </div>
        )}

        {/* User Menu */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white">
                  {user.username?.[0]?.toUpperCase() || 'G'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-medium text-white leading-none">{user.username}</p>
                  {user.is_anonymous && (
                    <p className="text-[10px] text-white/40 leading-none mt-0.5">Guest</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn-ghost p-2 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
              <Link to="/login?mode=register" className="btn-primary text-sm py-2 px-4">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
