import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ManagerActionItems = ({ managerId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!managerId) return; // prevents bad UUID query

    const fetchActionItems = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('feedback')
        .select(`
          id,
          date_of_feedback,
          action_item_manager,
          sender:sender_id (full_name),
          projects:related_project_id (name)
        `)
        .eq('feedback_type', 'meeting_log')
        .eq('recipient_id', managerId)         // manager is the recipient
        .not('action_item_manager', 'is', null)
        .not('action_item_manager', 'eq', '')  // avoid blank strings
        .order('date_of_feedback', { ascending: false });

      if (error) {
        console.error('Error fetching action items:', error);
      } else {
        setItems(data);
      }

      setLoading(false);
    };

    fetchActionItems();
  }, [managerId]);

  if (loading) return <p>Loading action items...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-yellow-500">
      <h3 className="text-xl font-semibold mb-4">Action Items For You 📢</h3>

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-gray-500">No open action items from recent meetings.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-3 border-b border-gray-100">
              <p className="font-medium text-gray-800">{item.action_item_manager}</p>
              <p className="text-xs text-gray-500 mt-1">
                From: {item.sender?.full_name}
                {' '} on {new Date(item.date_of_feedback).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManagerActionItems;
