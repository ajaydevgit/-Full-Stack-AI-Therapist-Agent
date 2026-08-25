import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { History, MessageCircle, Clock, ChevronRight, Plus, Brain, Inbox } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../contexts/AuthContext';

const STATUS_COLORS = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  ended: 'bg-white/10 text-white/50 border-white/15',
};

const Sessions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchSessions();
  }, [user]);

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/sessions`);
      setSessions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString();
  };

  const getDuration = (session) => {
    if (!session.started_at || !session.ended_at) return null;
    const mins = Math.round((new Date(session.ended_at) - new Date(session.started_at)) / 60000);
    return `${mins} min`;
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Session <span className="gradient-text">History</span>
            </h1>
            <p className="text-white/50 text-sm">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} recorded
            </p>
          </div>
          <Link to="/chat" className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            New Session
          </Link>
        </div>

        {/* Sessions List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="h-4 bg-white/10 rounded-lg w-2/3 mb-3" />
                <div className="h-3 bg-white/5 rounded-lg w-1/2" />
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
              <Inbox size={28} className="text-white/30" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No sessions yet</h3>
            <p className="text-white/40 text-sm mb-6">
              Start your first session with Serene to begin your wellness journey.
            </p>
            <Link to="/chat" className="btn-primary inline-flex items-center gap-2">
              <Brain size={16} />
              Start First Session
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Link
                  to={`/sessions/${session.id}`}
                  className="glass-card p-5 flex items-center gap-4 hover:border-white/20 hover:bg-white/10 transition-all duration-200 group block"
                >
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500/20 to-teal-500/20 border border-primary-500/20 flex items-center justify-center flex-shrink-0 group-hover:shadow-glow-purple transition-shadow">
                    <MessageCircle size={20} className="text-primary-300" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-white text-sm truncate group-hover:text-primary-300 transition-colors">
                        {session.title || 'Untitled Session'}
                      </h3>
                      <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${STATUS_COLORS[session.status]}`}>
                        {session.status === 'active' ? '🟢 Active' : '✓ Ended'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-white/35">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {formatDate(session.started_at)}
                      </span>
                      {session.message_count > 0 && (
                        <span>{session.message_count} messages</span>
                      )}
                      {getDuration(session) && (
                        <span>{getDuration(session)}</span>
                      )}
                      {session.mood && (
                        <span className="text-primary-400">{session.mood}</span>
                      )}
                    </div>
                    {session.summary && (
                      <p className="text-white/35 text-xs mt-2 line-clamp-1">{session.summary}</p>
                    )}
                  </div>

                  <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sessions;
