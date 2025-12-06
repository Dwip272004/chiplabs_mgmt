import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Logged in");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Toaster />
      <div className="max-w-md w-full p-8 bg-white rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-2 border rounded"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            type="email"
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            type="password"
          />
          <button className="w-full p-2 bg-blue-600 text-white rounded">Login</button>
          <div className="text-sm">
            <Link to="/register" className="text-blue-600">Create account</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
