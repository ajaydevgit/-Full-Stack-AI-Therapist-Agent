import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, MessageCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../contexts/AuthContext';
import SessionSummary from '../components/SessionSummary';
import ChatMessage from '../components/ChatMessage';

const SessionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' | 'messages'

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchSession();
  }, [user, id]);

  const fetchSession = async () => {
    try {
      const res = await axios.get(`${API_BASE}/sessions/${id}`);
      const data = res.data;
      // Parse coping_steps if string
      if (typeof data.coping_steps === 'string') {
        try { data.coping_steps = JSON.parse(data.coping_steps); } catch {}
      }
      setSession(data);
    } catch (err) {
      toast.error('Could not load session');
      navigate('/sessions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen pt-24 px-4 pb-10">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <Link to="/sessions" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Sessions
        </Link>

        {/* Toggle between summary and chat */}
        {session.status === 'ended' && session.messages?.length > 0 && (
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-6">
            {['summary', 'messages'].map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  viewMode === m
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {m === 'summary' ? (
                  <><Brain size={14} /> Summary</>
                ) : (
                  <><MessageCircle size={14} /> Messages ({session.messages.length})</>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {viewMode === 'summary' ? (
          <SessionSummary
            session={session}
            onNewSession={() => navigate('/chat')}
            onGoHome={() => navigate('/sessions')}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 pb-10"
          >
            {session.messages?.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SessionDetail;
