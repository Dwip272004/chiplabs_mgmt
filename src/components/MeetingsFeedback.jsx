// src/components/NoticeFeed.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const NoticeFeed = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const loadNotices = async () => {
      const { data, error } = await supabase
        .from("notices")
        .select(`
          id,
          title,
          content,
          created_at,
          profiles:manager_id (full_name)
        `)
        .order("created_at", { ascending: false });

      if (!error) setNotices(data);
    };

    loadNotices();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-xl font-semibold mb-4">📢 Notices</h3>

      {notices.length === 0 ? (
        <p className="text-gray-500">No notices published yet.</p>
      ) : (
        <div className="space-y-4">
          {notices.map((n) => (
            <div key={n.id} className="p-4 border rounded-md bg-gray-50">
              <h4 className="text-lg font-bold text-indigo-700">{n.title}</h4>
              <p className="text-gray-700 mt-1">{n.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                Posted by {n.profiles?.full_name || "Manager"} on{" "}
                {new Date(n.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticeFeed;
