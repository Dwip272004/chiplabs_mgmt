// src/components/TeamOverview.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
// 1. IMPORT THE NEW COMPONENT
import ManagerActionItems from './ManagerActionItems'; 

const getMoodEmoji = (score) => {
  if (score >= 4) return '😊'; // Great/Good
  if (score === 3) return '😐'; // Neutral
  if (score <= 2) return '😟'; // Bad/Tough
  return '';
};

// 2. RECEIVE THE SESSION PROP
const TeamOverview = ({ session }) => {
  const [teamLogs, setTeamLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]); // Default to today

  // --- Data Fetching: Load Team Logs ---
  const fetchTeamLogs = async (date) => {
    setLoading(true);

    // Fetch daily logs for the selected date, including related profile and project data
    const { data, error } = await supabase
      .from('daily_logs')
      .select(`
        created_at, 
        hours_spent, 
        work_description, 
        blockers, 
        mood_score,
        profiles (full_name),
        projects (name)
      `)
      .eq('date', date)
      .order('created_at', { ascending: true }); // Order by submission time

    if (error) {
      console.error('Error fetching team logs:', error);
    } else {
      setTeamLogs(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeamLogs(dateFilter);
  }, [dateFilter]); // Refetch data whenever the date filter changes

  // Aggregate stats for the top bar
  const totalHoursToday = teamLogs.reduce((sum, log) => sum + log.hours_spent, 0);
  const internsWithBlockers = teamLogs.filter(log => log.blockers && log.blockers.trim() !== '').length;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Team Daily Overview 👥</h2>
      
      {/* Date Filter */}
      <div className="mb-6 flex items-center space-x-4">
        <label htmlFor="date" className="font-medium text-gray-700">View Date:</label>
        <input
          id="date"
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-indigo-500">
          <p className="text-sm font-medium text-gray-500">Total Interns Logged</p>
          <p className="text-3xl font-extrabold text-gray-900">
            {new Set(teamLogs.map(log => log.profiles?.full_name)).size}
          </p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-500">Total Hours Logged</p>
          <p className="text-3xl font-extrabold text-gray-900">
            {totalHoursToday.toFixed(1)} hrs
          </p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-red-500">
          <p className="text-sm font-medium text-gray-500">Interns with Blockers</p>
          <p className="text-3xl font-extrabold text-gray-900">
            {internsWithBlockers}
          </p>
        </div>
      </div>
      
      {/* Manager Action Items Widget (New) */}
      <div className="grid grid-cols-1 gap-6 mb-8">
    
          <ManagerActionItems managerId={session.user.id} />
      </div>
      
      {/* Daily Logs Table */}
      <h3 className="text-xl font-semibold mb-4">Detailed Daily Logs</h3>

      {loading ? (
        <div className="text-center p-10 text-gray-500">Loading daily logs...</div>
      ) : teamLogs.length === 0 ? (
        <div className="p-10 bg-gray-100 text-center rounded-lg text-gray-600">
          No logs submitted for {dateFilter}.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intern</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Description</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Mood</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blockers</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamLogs.map((log) => (
                <tr key={log.id} className={log.blockers ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.profiles?.full_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                    {log.projects?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.hours_spent}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={log.work_description}>
                    {log.work_description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-xl">
                    {getMoodEmoji(log.mood_score)}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    {log.blockers ? (
                      <span className="text-red-600 italic">{log.blockers}</span>
                    ) : (
                      <span className="text-green-500">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// 4. Update export to receive session prop
export default TeamOverview;