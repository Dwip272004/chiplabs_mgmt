import React, { useState } from "react";
import axios from "axios";

const CreateGoogleEvent = ({ token }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [attendees, setAttendees] = useState("");

  const createEvent = async () => {
    if (!token) {
      return alert("Connect Google Calendar first!");
    }

    if (!title || !start || !end) {
      return alert("Please fill title, start & end time!");
    }

    const guestList =
      attendees
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0)
        .map((email) => ({ email })) || [];

    const event = {
      summary: title,
      description: description,
      start: {
        dateTime: new Date(start).toISOString(),
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: new Date(end).toISOString(),
        timeZone: "Asia/Kolkata",
      },
      attendees: guestList,
      reminders: {
        useDefault: true, // Google automatically emails guests
      },
    };

    try {
      await axios.post(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all",
        event,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        }
      );

      alert("Event created successfully! Guests have been emailed.");
      setTitle("");
      setDescription("");
      setStart("");
      setEnd("");
      setAttendees("");

    } catch (err) {
      console.error(err.response?.data || err);
      alert("Failed to create event.");
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md space-y-4">
      <h3 className="text-xl font-semibold">Create Calendar Event</h3>

      <input
        type="text"
        placeholder="Event Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded w-full"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 rounded w-full"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      <input
        type="text"
        placeholder="Attendees (comma-separated emails)"
        value={attendees}
        onChange={(e) => setAttendees(e.target.value)}
        className="border p-2 rounded w-full"
      />

      <button
        onClick={createEvent}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md w-full"
      >
        Create Event & Notify Guests
      </button>
    </div>
  );
};

export default CreateGoogleEvent;
