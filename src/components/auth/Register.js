import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(email, password, { firstName });
      toast.success("Account created");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Toaster />
      <div className="max-w-md w-full p-8 bg-white rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-2 border rounded"
            placeholder="First name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
          />
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
          <button className="w-full p-2 bg-green-600 text-white rounded">Create account</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
