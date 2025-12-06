import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import CreateGoogleEvent from "./CreateGoogleEvent";

const GoogleCalendarConnect = ({ onToken }) => {
  const [token, setToken] = useState(null);

  // Load saved token
  useEffect(() => {
    const saved = localStorage.getItem("google_token");
    if (saved) {
      const parsed = JSON.parse(saved);
      setToken(parsed);
      onToken && onToken(parsed);
    }
  }, []);

  const login = useGoogleLogin({
    scope:
      "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
    onSuccess: (tokenResponse) => {
      setToken(tokenResponse);
      localStorage.setItem("google_token", JSON.stringify(tokenResponse));
      onToken && onToken(tokenResponse);
    },
    onError: () => alert("Google login failed!"),
  });

  const createTestEvent = async () => {
    if (!token) return alert("Please connect Google Calendar first!");

    const event = {
      summary: "Test Event",
      start: { dateTime: new Date().toISOString(), timeZone: "Asia/Kolkata" },
      end: {
        dateTime: new Date(Date.now() + 3600000).toISOString(),
        timeZone: "Asia/Kolkata",
      },
    };

    try {
      await axios.post(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        event,
        { headers: { Authorization: `Bearer ${token.access_token}` } }
      );
      alert("Event created!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-md space-y-4">
      <h3 className="font-semibold text-lg">Google Calendar Integration</h3>

      {!token ? (
        <button
          onClick={login}
          className="bg-red-500 text-white px-4 py-2 rounded-md w-full"
        >
          Connect Google Calendar
        </button>
      ) : (
        <>
          <p className="text-green-600 font-medium">✔ Connected to Google Calendar</p>

          <button
            onClick={createTestEvent}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md w-full"
          >
            Create Test Event
          </button>

          <CreateGoogleEvent token={token} />
        </>
      )}
    </div>
  );
};

export default GoogleCalendarConnect;
