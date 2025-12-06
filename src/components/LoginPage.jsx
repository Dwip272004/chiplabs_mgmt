// src/components/LoginPage.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Import your client

const LoginPage = () => {
  // State for form inputs and UI feedback
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Supabase sign-in method
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError(error.message);
      setMessage(''); // Clear any success message on error
      console.error('Login Error:', error);
    } else {
      // On successful login, the Supabase Auth listener (which you'll set up in App.jsx) 
      // will handle the navigation to the dashboard.
      setMessage('Login successful! Redirecting...');
      // Clear form inputs
      setEmail('');
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 max-w-sm w-full bg-white shadow-lg rounded-xl">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
          Intern Dashboard
        </h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="manager@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading 
                ? 'bg-indigo-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            {loading ? 'Logging In...' : 'Sign In'}
          </button>
        </form>

        {/* Feedback Messages */}
        {error && (
          <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
        )}
        {message && (
          <p className="mt-4 text-sm text-green-600 text-center">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;