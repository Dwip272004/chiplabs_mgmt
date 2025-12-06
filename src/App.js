// src/App.jsx

import React, { useState, useEffect } from 'react';
// 1. Ensure you have imported both components
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard'; 
import { supabase } from './supabaseClient'; 

function App() {
  const [session, setSession] = useState(null);
  // Add a loading state to prevent premature rendering
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    // Function to handle the initial session check
    const checkSession = async () => {
      // 1. Check initial session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false); // Once checked, set loading to false
    };

    checkSession();

    // 2. Listen for auth changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );
    
    // Clean up listener
    return () => {
      authListener.subscription?.unsubscribe(); // Use optional chaining for safety
    };
  }, []);

  // --- Render Logic ---
  
  // 1. Show a loader while checking the session status
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl text-indigo-600">Checking authentication...</p>
        {/* You could add a simple spinning loader here */}
      </div>
    );
  }

  // 2. Show the appropriate component once the session is determined
  // If session is found, render Dashboard; otherwise, render LoginPage.
  return session ? <Dashboard session={session} /> : <LoginPage />;
}

export default App;