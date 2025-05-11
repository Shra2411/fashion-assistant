import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid'; // Assuming you're using Heroicons

const Navbar = ({ theme, setTheme, isLoggedIn, handleLogout }) => {
  const navigate = useNavigate();

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <nav className={`px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-10 border-b ${theme === 'dark' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-black border-zinc-200'}`}>
      <h1 className="text-2xl font-bold tracking-wide">Clothx</h1>
      <div className="flex items-center space-x-4 text-sm">
        <button onClick={() => navigate('/tryon')} className="hover:text-emerald-400 transition">TryOn</button>
        <a href="#" className="hover:text-emerald-400 transition">Favorites</a>
        <a href="#" className="hover:text-emerald-400 transition">Trending</a>
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-emerald-100 dark:hover:bg-zinc-700 transition" title="Toggle Theme">
          {theme === 'dark' ? <SunIcon className="w-5 h-5 text-yellow-300" /> : <MoonIcon className="w-5 h-5 text-zinc-800" />}
        </button>
        {isLoggedIn ? (
          <button onClick={handleLogout} className="bg-emerald-500 px-4 py-2 rounded-full text-white hover:scale-105 transition-transform">Logout</button>
        ) : (
          <button onClick={() => navigate('/login')} className="bg-emerald-500 px-4 py-2 rounded-full text-white hover:scale-105 transition-transform">Login</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
