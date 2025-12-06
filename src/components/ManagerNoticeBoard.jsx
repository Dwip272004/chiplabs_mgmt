// src/components/ManagerNoticeBoard.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const ManagerNoticeBoard = ({ session }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("notices")
      .insert([
        {
          title,
          content,
          manager_id: session.user.id
        }
      ]);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Notice posted successfully!" });
      setTitle("");
      setContent("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Post a Notice 📢</h2>

      {message && (
        <div className={`p-3 rounded-md mb-4 ${message.type === "error" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Notice Title"
          className="w-full border p-3 rounded-md"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Write your notice..."
          className="w-full border p-3 rounded-md"
          rows="5"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
        >
          Post Notice
        </button>
      </form>
    </div>
  );
};

export default ManagerNoticeBoard;
