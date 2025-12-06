// src/components/DailyLogForm.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const DailyLogForm = ({ session }) => {
  // State for Form Inputs
  const [projectId, setProjectId] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [hoursSpent, setHoursSpent] = useState('');
  const [blockers, setBlockers] = useState('');
  const [moodScore, setMoodScore] = useState(5); // 1 (Bad) to 5 (Great)
  
  // State for Component Logic
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // --- 1. Fetch Projects for Dropdown ---
  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('status', 'active'); // Only show active projects

      if (error) {
        console.error('Error fetching projects:', error);
      } else {
        setProjects(data);
      }
    };
    fetchProjects();
  }, []);

  // --- 2. Handle Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Basic validation
    if (!projectId || !workDescription || !hoursSpent) {
      setMessage({ type: 'error', text: 'Please fill out Project, Work Description, and Hours.' });
      setLoading(false);
      return;
    }

    const newLog = {
      user_id: session.user.id,
      project_id: projectId,
      work_description: workDescription,
      hours_spent: parseFloat(hoursSpent), // Ensure number format
      blockers: blockers || null, // Allow null if empty
      mood_score: moodScore,
      date: new Date().toISOString().split('T')[0], // Submit current date
    };

    const { error } = await supabase
      .from('daily_logs')
      .insert([newLog]);

    if (error) {
      setMessage({ type: 'error', text: `Submission failed: ${error.message}` });
      console.error('Supabase Insert Error:', error);
    } else {
      setMessage({ type: 'success', text: 'Daily progress logged successfully!' });
      // Clear form after successful submission
      setProjectId('');
      setWorkDescription('');
      setHoursSpent('');
      setBlockers('');
      setMoodScore(5);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-lg">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
        Daily Work Log
      </h3>
      
      {/* Success/Error Message */}
      {message && (
        <div className={`p-3 mb-4 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Project Selection */}
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-700">
              Project <span className="text-red-500">*</span>
            </label>
            <select
              id="project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="" disabled>Select a Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Hours Spent */}
          <div>
            <label htmlFor="hours" className="block text-sm font-medium text-gray-700">
              Hours Spent <span className="text-red-500">*</span>
            </label>
            <input
              id="hours"
              type="number"
              min="0.5"
              step="0.5"
              value={hoursSpent}
              onChange={(e) => setHoursSpent(e.target.value)}
              required
              placeholder="e.g., 4.0"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        
        {/* Work Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            What did you work on today? <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows="4"
            value={workDescription}
            onChange={(e) => setWorkDescription(e.target.value)}
            required
            placeholder="Detailed description of tasks completed and achievements..."
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Blockers */}
        <div>
          <label htmlFor="blockers" className="block text-sm font-medium text-gray-700">
            Blockers / Issues Encountered
          </label>
          <textarea
            id="blockers"
            rows="2"
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
            placeholder="e.g., Waiting for API key, need manager sign-off on design."
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Mood Score (1-5) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How was your day? (1 = Tough, 5 = Great)
          </label>
          <div className="flex justify-between max-w-sm mx-auto">
            {[1, 2, 3, 4, 5].map((score) => (
              <label key={score} className="cursor-pointer text-center">
                <input
                  type="radio"
                  name="mood"
                  value={score}
                  checked={moodScore === score}
                  onChange={() => setMoodScore(score)}
                  className="hidden"
                />
                <div className={`p-2 rounded-full border-2 transition duration-150 ease-in-out ${
                  moodScore === score 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                    : 'bg-gray-100 border-gray-300 text-gray-800 hover:bg-indigo-100'
                }`}>
                  {score}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submission Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white transition duration-150 ease-in-out ${
            loading 
              ? 'bg-indigo-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {loading ? 'Submitting...' : 'Log Daily Progress'}
        </button>
      </form>
    </div>
  );
};

export default DailyLogForm;