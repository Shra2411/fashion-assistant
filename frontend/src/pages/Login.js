import React, { useState } from 'react';
import { loginWithEmail, registerWithEmail, signInWithGoogle } from '../auth';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      console.error("Auth error:", err.message);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center text-zinc-800 dark:text-zinc-100">
        {isRegistering ? 'Register' : 'Login'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isRegistering ? 'Register' : 'Login'}
        </button>
      </form>

      <p
        className="text-sm text-center mt-4 text-blue-500 cursor-pointer hover:underline"
        onClick={() => setIsRegistering(!isRegistering)}
      >
        {isRegistering
          ? 'Already have an account? Login'
          : "Don't have an account? Register"}
      </p>

      <div className="mt-6 text-center">
        <button
          onClick={signInWithGoogle}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
