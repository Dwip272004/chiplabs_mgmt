// src/components/MyProgress.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const MyProgress = ({ session }) => {
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState({
    totalHours: 0,
    averageMood: 0,
    logStreak: 0,
    logCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchProgressData = async () => {
      setLoading(true);
      
      // Fetch all historical logs for the current user, ordered by date
      const { data, error } = await supabase
        .from('daily_logs')
        .select(`
          date, 
          hours_spent, 
          mood_score,
          projects (name)
        `)
        .eq('user_id', session.user.id)
        .order('date', { ascending: false }); // Newest logs first

      if (error) {
        console.error('Error fetching progress:', error);
      } else {
        setLogs(data || []);
        calculateMetrics(data || []);
      }
      setLoading(false);
    };

    if (session) {
      fetchProgressData();
    }
  }, [session]);

  // --- Data Aggregation and Metric Calculation ---
  const calculateMetrics = (logData) => {
    if (logData.length === 0) return;

    const totalHours = logData.reduce((sum, log) => sum + log.hours_spent, 0);
    const totalMood = logData.reduce((sum, log) => sum + log.mood_score, 0);
    const averageMood = totalMood / logData.length;

    // Calculate Streak (Simplified: counts consecutive unique days logged)
    const dates = [...new Set(logData.map(log => log.date))]
      .sort((a, b) => new Date(b) - new Date(a)); // Sort descending

    let streak = 0;
    if (dates.length > 0) {
      // Check the latest date
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); 
      
      let checkDate = new Date(dates[0]);
      checkDate.setHours(0, 0, 0, 0);
      
      // Determine if the last log was today or yesterday to start the streak count
      let initialCheck = 0;
      const diffTime = Math.abs(currentDate - checkDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) { // If log was today or yesterday
          streak = 1;
          initialCheck = 1;
      }
      
      // Calculate remaining streak backward
      for (let i = initialCheck; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1] || 0); // Use 0 for safety
        const currDate = new Date(dates[i]);
        
        // Calculate the difference in days between two consecutive logs
        const diffDaysLog = Math.ceil(Math.abs(prevDate - currDate) / (1000 * 60 * 60 * 24));

        if (diffDaysLog === 1) {
          streak++;
        } else if (diffDaysLog > 1 && diffDaysLog <= 2) {
          // Allow for weekend gap (Friday to Monday log)
          const dayOfWeek = prevDate.getDay(); // 0=Sun, 5=Fri, 6=Sat
          if (dayOfWeek === 1 || dayOfWeek === 0) { // If previous log was Mon or Sun, should be 1 day diff. If Fri, should be 3.
              if (diffDaysLog === 3 && dayOfWeek === 5) {
                  streak++;
              }
          }
        } else {
          break; // Streak broken
        }
      }
    }


    setMetrics({
      totalHours: totalHours,
      averageMood: averageMood,
      logStreak: dates.length > 0 ? streak : 0, // Simplified: use days logged as streak
      logCount: logData.length,
    });
  };

  const getMoodDescription = (score) => {
    if (score >= 4.5) return { text: 'Excellent', color: 'text-green-600' };
    if (score >= 3.5) return { text: 'Good', color: 'text-indigo-600' };
    if (score >= 2.5) return { text: 'Neutral', color: 'text-yellow-600' };
    return { text: 'Needs Check-in', color: 'text-red-600' };
  };
  
  const mood = getMoodDescription(metrics.averageMood);

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Calculating progress and achievements...</div>;
  }

  if (logs.length === 0) {
      return (
          <div className="p-10 bg-gray-100 text-center rounded-lg text-gray-600">
              Submit your first Daily Log to start tracking your progress! 🚀
          </div>
      );
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">My Progress & Achievements 📈</h2>

      {/* 1. Key Metric Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-indigo-500">
          <p className="text-sm font-medium text-gray-500">Total Hours Logged</p>
          <p className="text-4xl font-extrabold text-gray-900 mt-1">
            {metrics.totalHours.toFixed(1)}
          </p>
          <p className="text-sm text-gray-500">Across {metrics.logCount} logs</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-green-500">
          <p className="text-sm font-medium text-gray-500">Current Log Streak</p>
          <p className="text-4xl font-extrabold text-gray-900 mt-1">
            {metrics.logStreak}
          </p>
          <p className="text-sm text-gray-500">Consecutive days logged! 🔥</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-yellow-500">
          <p className="text-sm font-medium text-gray-500">Average Mood Score</p>
          <p className={`text-4xl font-extrabold mt-1 ${mood.color}`}>
            {metrics.averageMood.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">Status: {mood.text}</p>
        </div>
      </div>

      {/* 2. Visualizations Placeholder (For future Chart integration) */}
      <div className="mb-10 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Hours Logged Trend (Placeholder)</h3>
        <div className="h-40 bg-gray-100 flex items-center justify-center rounded-lg border border-dashed border-gray-400">
          <p className="text-gray-500">
            [Chart Integration Here: e.g., Line Chart of Hours per Day]
          </p>
        </div>
      </div>

      {/* 3. Recent Activity History */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {logs.slice(0, 5).map((log, index) => (
            <div key={index} className="p-4 bg-white rounded-lg shadow-sm flex justify-between items-center border-l-4 border-indigo-200">
              <div>
                <p className="font-medium text-gray-800">
                  Logged {log.hours_spent} hours on <span className="text-indigo-600">{log.projects.name || 'N/A'}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Submitted on {new Date(log.date).toLocaleDateString()}
                </p>
              </div>
              <p className="text-sm font-medium text-gray-600">
                Mood: {log.mood_score}/5
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyProgress;