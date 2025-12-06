// src/components/MyProjects.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const MyProjects = ({ session }) => {
  const [projectSummary, setProjectSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectSummary = async () => {
      setLoading(true);
      
      // Fetch distinct project IDs and sum of hours spent by the logged-in user
      // Note: This requires a JOIN and SUM, which is often best done via a Postgres function
      // or a simple View in Supabase for performance. For simplicity, we'll fetch all logs 
      // and process the aggregation in the front-end (less efficient but functional).
      
      // More Efficient Supabase RLS Join (Postgres magic):
      const { data: logs, error } = await supabase
        .from('daily_logs')
        .select(`
          project_id, 
          hours_spent, 
          projects (name, status)
        `)
        .eq('user_id', session.user.id); 

      if (error) {
        console.error('Error fetching project summary:', error);
        setLoading(false);
        return;
      }

      // Aggregate data in the client-side
      const summaryMap = logs.reduce((acc, log) => {
        const projectId = log.projects.name;
        if (!acc[projectId]) {
          acc[projectId] = { 
            name: log.projects.name, 
            status: log.projects.status,
            totalHours: 0 
          };
        }
        acc[projectId].totalHours += log.hours_spent;
        return acc;
      }, {});

      setProjectSummary(Object.values(summaryMap));
      setLoading(false);
    };

    if (session) {
      fetchProjectSummary();
    }
  }, [session]);

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading project breakdown...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">My Project Work Summary 🚀</h2>
      
      <div className="space-y-4">
        {projectSummary.length === 0 ? (
          <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-center">
            You haven't logged any hours against any projects yet. Start logging your daily progress!
          </div>
        ) : (
          projectSummary.map((project) => (
            <div key={project.name} className="p-5 bg-white shadow rounded-lg border border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-indigo-700">{project.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Status: 
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {project.status}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-gray-900">{project.totalHours.toFixed(1)}</p>
                <p className="text-sm text-gray-500">Total Hours Logged</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyProjects;