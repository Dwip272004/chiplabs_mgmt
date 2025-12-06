import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import GoogleCalendarConnect from "./GoogleCalendarConnect"; // your button component

const ManagerCalendar = ({ session }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      if (!session || !session.user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error loading role:", error);
      }

      setRole(data?.role || null);
      setLoading(false);
    };

    loadRole();
  }, [session]);

  // ⏳ Show loading state
  if (loading) {
    return <p className="text-gray-500">Checking permissions...</p>;
  }

  // 🔒 Intern block
  if (role !== "manager") {
    return (
      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-md mb-8">
        <p className="text-gray-700">
          🔒 You do not have access to the Manager Calendar.
        </p>
      </div>
    );
  }

  // ✔ Manager sees Google Calendar Connect Button
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-8 space-y-4">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Google Calendar Integration 📅
      </h3>

      <GoogleCalendarConnect />

      {/* Optional: show the embedded calendar below */}
      <iframe
        src="https://calendar.google.com/calendar/embed?src=maxbhardwaj645%40gmail.com&ctz=Asia%2FKolkata"
        style={{ border: 0 }}
        width="100%"
        height="600"
        frameBorder="0"
        scrolling="no"
        title="Manager Calendar"
      />
    </div>
  );
};

export default ManagerCalendar;
