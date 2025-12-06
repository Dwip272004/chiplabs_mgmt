import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

import NoticeFeed from './MeetingsFeedback';               
import ManagerNoticeBoard from './ManagerNoticeBoard';
import ManagerCalendar from './ManagerCalendar';   // ← NEW IMPORT

const MeetingLogForm = ({ session, managerId }) => {
  const [summary, setSummary] = useState('');
  const [actionIntern, setActionIntern] = useState('');
  const [actionManager, setActionManager] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [role, setRole] = useState(null);

  // Fetch user role
  useEffect(() => {
    const fetchRole = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      
      setRole(data?.role);
    };

    fetchRole();
  }, [session.user.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const logData = {
      sender_id: session.user.id,
      recipient_id: managerId,
      feedback_type: 'meeting_log',
      discussion_summary: summary,
      action_item_intern: actionIntern,
      action_item_manager: actionManager,
    };

    const { error } = await supabase.from('feedback').insert([logData]);

    if (error) {
      setMessage({ type: 'error', text: `Failed to log meeting: ${error.message}` });
    } else {
      setMessage({ type: 'success', text: 'Meeting log submitted!' });
      setSummary('');
      setActionIntern('');
      setActionManager('');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg max-w-4xl mx-auto space-y-8">

      {/* IF MANAGER → Show Calendar + Notice Board */}
      {role === "manager" ? (
        <>
          <ManagerCalendar session={session} />

          <ManagerNoticeBoard session={session} />
        </>
      ) : (
        <NoticeFeed />
      )}

      {/* Meeting Log Form */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">1:1 Meeting Log</h3>

        {message && (
          <div
            className={`p-3 rounded-md mb-4 ${
              message.type === 'error'
                ? 'bg-red-100 text-red-600'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Key Discussion Points
            </label>
            <textarea
              rows="3"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Action Item for Me (Intern)
            </label>
            <input
              type="text"
              value={actionIntern}
              onChange={(e) => setActionIntern(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Action Item for Manager
            </label>
            <input
              type="text"
              value={actionManager}
              onChange={(e) => setActionManager(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Submitting…' : 'Submit Log'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MeetingLogForm;
