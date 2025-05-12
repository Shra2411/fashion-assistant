import React, { useState } from 'react';
import { loginWithEmail, registerWithEmail, signInWithGoogle } from '../auth';

const AuthForm = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // For handling form submission loading state
  const [error, setError] = useState(''); // For handling error messages
  const [user, setUser] = useState(null); // Store user info (for logged-in user)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when form is submitted
    setError(''); // Reset any previous error

    try {
      if (isRegistering) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      setUser({ email }); // Update user state (can store more user data here)
    } catch (err) {
      setError("Authentication failed: " + err.message); // Handle errors
    } finally {
      setLoading(false); // Set loading to false after submission
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await signInWithGoogle();
      setUser(user); // Store user info after successful login
    } catch (err) {
      setError('Google sign-in failed: ' + err.message); // Handle Google sign-in error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center text-zinc-800 dark:text-zinc-100">
        {isRegistering ? 'Register' : 'Login'}
      </h2>

      {/* Display error message if there is one */}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* If a user is logged in, display their info */}
      {user && <p className="text-green-500 text-center mb-4">Logged in as: {user.email}</p>}

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
          disabled={loading} // Disable the button while loading
        >
          {loading ? 'Loading...' : isRegistering ? 'Register' : 'Login'}
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
          onClick={handleGoogleSignIn}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          disabled={loading} // Disable the Google button while loading
        >
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
