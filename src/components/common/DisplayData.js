// src/components/DisplayData.js
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function DisplayData() {
  const { currentUser } = useAuth();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, "usersData"), where("uid", "==", currentUser.uid));
      const snapshot = await getDocs(q);
      setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, [currentUser]);

  return (
    <ul>
      {data.map(item => <li key={item.id}>{item.text}</li>)}
    </ul>
  );
}
