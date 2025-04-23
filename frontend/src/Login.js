// Login.js
import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would call the actual login logic or API
    onLogin(email, password);
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold">Email</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 focus:ring-emerald-500" 
              required 
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-semibold">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 focus:ring-emerald-500" 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-emerald-500 text-white py-2 rounded-md">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
