// src/components/AddData.js
import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function AddData() {
  const { currentUser } = useAuth();
  const [text, setText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "usersData"), {
        uid: currentUser.uid,
        text,
        createdAt: new Date(),
      });
      setText("");
      alert("Data Added!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Enter something"/>
      <button type="submit">Add Data</button>
    </form>
  );
}
