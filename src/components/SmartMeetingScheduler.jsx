// src/components/SmartMeetingScheduler.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { supabase } from "../supabaseClient";
import { useGoogleLogin } from "@react-oauth/google";

const SmartMeetingScheduler = ({ session, googleToken, setGoogleToken }) => {
  const [interns, setInterns] = useState([]);
  const [selectedIntern, setSelectedIntern] = useState("");
  const [title, setTitle] = useState("1:1 Weekly Meeting");
  const [purpose, setPurpose] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [status, setStatus] = useState("");

  // Google token
  const [token, setToken] = useState(googleToken);

  // Loads token from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("google_token");
    if (saved) {
      const parsed = JSON.parse(saved);
      setToken(parsed);
      setGoogleToken(parsed);
    }
  }, []);

  // Google Login
  const login = useGoogleLogin({
    scope:
      "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
    onSuccess: (t) => {
      setToken(t);
      setGoogleToken(t);
      localStorage.setItem("google_token", JSON.stringify(t));
    },
    onError: () => alert("Google login failed"),
  });

  // Load interns
  useEffect(() => {
    const fetchInterns = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "intern");

      setInterns(data || []);
    };
    fetchInterns();
  }, []);

  // ---- Helper for Google timestamp format ----
  const toGoogleDateTime = (value) =>
    new Date(value).toISOString(); // FIXES your 400 error

  // Create event
  const scheduleMeeting = async () => {
    if (!token) return alert("Please connect Google Calendar first!");
    if (!selectedIntern) return alert("Please select an intern");
    if (!start || !end) return alert("Please select start and end time");

    setStatus("Scheduling...");

    try {
      const intern = interns.find((i) => i.id === selectedIntern);

      const event = {
        summary: title,
        description: purpose,
        start: { dateTime: toGoogleDateTime(start), timeZone: "Asia/Kolkata" },
        end: { dateTime: toGoogleDateTime(end), timeZone: "Asia/Kolkata" },
        attendees: [{ email: intern.email }],
        reminders: { useDefault: true },
      };

      // Google API request
      const response = await axios.post(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all",
        event,
        {
          headers: { Authorization: `Bearer ${token.access_token}` },
        }
      );

      const googleEventId = response.data.id;

      // Save to supabase
      await supabase.from("scheduled_meetings").insert([
        {
          intern_id: selectedIntern,
          manager_id: session.user.id,
          title,
          purpose,
          start_time: start,
          end_time: end,
          google_event_id: googleEventId,
        },
      ]);

      setStatus("Meeting scheduled ✔ Invitations sent!");
    } catch (err) {
      console.error("Google Error:", err.response?.data || err);
      setStatus("Failed to schedule meeting ❌ (Check console)");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-2xl font-bold mb-4">📅 Smart Meeting Scheduler</h3>

      {!token ? (
        <button
          onClick={login}
          className="bg-red-500 text-white px-4 py-2 rounded-md mb-4"
        >
          Connect Google Calendar
        </button>
      ) : (
        <p className="text-green-600 font-medium mb-4">
          ✔ Google Calendar Connected
        </p>
      )}

      {/* UI Fields */}
      <div className="space-y-4">
        <select
          className="w-full border p-2 rounded"
          value={selectedIntern}
          onChange={(e) => setSelectedIntern(e.target.value)}
        >
          <option value="">Select Intern</option>
          {interns.map((intern) => (
            <option key={intern.id} value={intern.id}>
              {intern.full_name} — {intern.email}
            </option>
          ))}
        </select>

        <input
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Meeting Title"
        />

        <textarea
          className="w-full border p-2 rounded"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Meeting Purpose"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="datetime-local"
            className="border p-2 rounded"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <input
            type="datetime-local"
            className="border p-2 rounded"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>

        <button
          onClick={scheduleMeeting}
          className="w-full bg-indigo-600 text-white py-2 rounded-md"
        >
          Schedule Meeting
        </button>

        {status && <p className="text-sm text-gray-600">{status}</p>}
      </div>
    </div>
  );
};

export default SmartMeetingScheduler;
