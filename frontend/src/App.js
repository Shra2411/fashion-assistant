import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon, HeartIcon, MoonIcon,
  SunIcon, XMarkIcon
} from '@heroicons/react/24/solid';
import Login from './Login';

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('user'));
  const [userDetails, setUserDetails] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : {};
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [showTryOn, setShowTryOn] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modelImage, setModelImage] = useState(null);

  const suggestions = ['oversized tshirt', 'printed tshirt', 'Shoes', 'cargo pants for men'];

  const handleSearch = async (searchQuery) => {
    const finalQuery = (searchQuery || query || '').toString();
    if (!finalQuery.trim()) return;

    setHasSearched(true);
    setLoading(true);

    const trimmedQuery = finalQuery.trim();
    if (!searchHistory.includes(trimmedQuery)) {
      const updatedHistory = [trimmedQuery, ...searchHistory].slice(0, 10);
      setSearchHistory(updatedHistory);
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    }

    try {
      const response = await fetch(`http://localhost:5000/search?query=${finalQuery}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      alert('Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (tag) => {
    setQuery(tag);
    setHasSearched(true);
    setTimeout(() => handleSearch(tag), 0);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const removeHistoryItem = (item) => {
    const updatedHistory = searchHistory.filter((historyItem) => historyItem !== item);
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  const toggleFavorite = (index, item) => {
    const updatedFavorites = { ...favorites };
    if (updatedFavorites[index]) {
      delete updatedFavorites[index];
    } else {
      updatedFavorites[index] = item;
    }
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const handleTryOnClick = (item) => {
    setSelectedItem(item);
    setShowTryOn(true);
  };

  const handleModelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setModelImage(URL.createObjectURL(file));
    }
  };

  const handleLogin = (email, password) => {
    const user = { email, password }; // Placeholder user data
    setUserDetails(user);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(user)); // Save user details to localStorage
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserDetails(null);
    localStorage.removeItem('user'); // Clear user data from localStorage
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-zinc-900 to-black text-zinc-100' : 'bg-white text-zinc-900'} pb-24 transition-colors duration-300`}>
      {/* Navbar */}
      <nav className={`px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-10 border-b ${theme === 'dark' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-black border-zinc-200'}`}>
        <h1 className="text-2xl font-bold tracking-wide">Clothx</h1>
        <div className="flex items-center space-x-4 text-sm">
          <a href="#" className="hover:text-emerald-400 transition">Favorites</a>
          <a href="#" className="hover:text-emerald-400 transition">Trending</a>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-emerald-100 dark:hover:bg-zinc-700 transition" title="Toggle Theme">
            {theme === 'dark' ? <SunIcon className="w-5 h-5 text-yellow-300" /> : <MoonIcon className="w-5 h-5 text-zinc-800" />}
          </button>
          {isLoggedIn ? (
            <button onClick={handleLogout} className="bg-emerald-500 px-4 py-2 rounded-full text-white hover:scale-105 transition-transform">Logout</button>
          ) : (
            <button onClick={() => setIsLoggedIn(true)} className="bg-emerald-500 px-4 py-2 rounded-full text-white hover:scale-105 transition-transform">Login</button>
          )}
        </div>
      </nav>

      {/* Conditional rendering for login or main content */}
      {isLoggedIn ? (
        <div className="flex flex-col items-center justify-center flex-1 px-4 mt-10 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">Welcome, {userDetails?.email}</h2>
          {/* Main content goes here */}
        </div>
      ) : (
        <Login onLogin={handleLogin} />
      )}

      {!hasSearched && (
        <div className="flex flex-col items-center justify-center flex-1 px-4 mt-10 text-center">
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Find Your Fit</h2>
            <p className="text-lg md:text-xl text-zinc-400 dark:text-zinc-300">Discover the latest styles from your favorite brands.</p>
          </div>
          <div className="mb-6 flex flex-wrap justify-center gap-3">
            {suggestions.map((tag) => (
              <button key={tag} onClick={() => handleSuggestionClick(tag)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-emerald-500 dark:text-emerald-400 px-4 py-1.5 rounded-full hover:scale-105 transition-all text-sm shadow-sm">{tag}</button>
            ))}
          </div>
          {searchHistory.length > 0 && (
            <div className="mt-6 text-left w-full max-w-xl">
              <h4 className="text-sm font-semibold mb-2 text-zinc-400 dark:text-zinc-300">Recent Searches:</h4>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <button onClick={() => handleSuggestionClick(item)} className="bg-zinc-200 dark:bg-zinc-700 text-sm text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full hover:scale-105 transition">{item}</button>
                    <button onClick={() => removeHistoryItem(item)} className="text-zinc-400 dark:text-zinc-300 hover:text-emerald-500" title="Remove from history"><XMarkIcon className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
              <button onClick={clearSearchHistory} className="mt-4 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-500">Clear All History</button>
            </div>
          )}
          <div className="w-full max-w-xl relative mt-6">
            <input type="text" value={query} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} onChange={(e) => setQuery(e.target.value)} placeholder="Search for a product..." className="w-full pl-4 pr-12 py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
            <button onClick={handleSearch} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-400 transition"><MagnifyingGlassIcon className="w-5 h-5" /></button>
          </div>
        </div>
      )}

      

      {loading && <Spinner />}

      {results.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">Search Results for <span className="text-emerald-400">"{query.charAt(0).toUpperCase() + query.slice(1)}"</span></h2>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {results.map((item, index) => {
                const isFavorited = favorites[index];
                return (
                  <div key={index} className="bg-white dark:bg-zinc-800/80 backdrop-blur-md rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow border border-zinc-200 dark:border-zinc-700 relative">
                    <button onClick={() => toggleFavorite(index, item)} className="absolute top-4 right-4 z-10 bg-zinc-900/70 hover:bg-zinc-800 p-1.5 rounded-full transition" title="Add to favorites">
                      <HeartIcon className={`w-5 h-5 ${isFavorited ? 'text-rose-500' : 'text-zinc-400'} transition`} />
                    </button>
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="group relative">
                      <img src={item.image} alt={item.title} className="h-56 w-full object-contain bg-white p-3 transition-transform group-hover:scale-105" />
                    </a>
                    <div className="p-4 flex flex-col flex-grow space-y-2">
                      <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-emerald-400 font-semibold">{item.price}</span>
                        <span className="text-zinc-400">{item.site}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                         <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex-1 text-white bg-emerald-500 px-3 py-2 rounded-md text-xs text-center hover:bg-emerald-600 transition">View</a>
                         <button onClick={() => handleTryOnClick(item)} className="flex-1 text-emerald-400 border border-emerald-500 px-3 py-2 rounded-md text-xs text-center hover:bg-emerald-900 transition">Try On</button>
                      </div>
                    </div>
                 </div>
               );
       })}
    </div>
  </div>
)}

{hasSearched && (
  <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-zinc-800">
    <div className="max-w-4xl mx-auto relative">
      <input type="text" value={query} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} onChange={(e) => setQuery(e.target.value)} placeholder="Search for a product..." className="w-full pl-6 pr-12 py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
      <button onClick={handleSearch} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-400 transition"><MagnifyingGlassIcon className="w-5 h-5" /></button>
    </div>
  </div>
)}

{/* TRY-ON MODAL */}
{showTryOn && selectedItem && (
  <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg max-w-3xl w-full relative shadow-xl">
      <button onClick={() => setShowTryOn(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-red-400">
        <XMarkIcon className="w-6 h-6" />
      </button>
      <h2 className="text-xl font-bold mb-4 text-center">Virtual Clothes Try-On</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Model Upload */}
        <div>
          <label className="block font-semibold mb-2">Upload Model Photo</label>
          <div className="border-2 border-dashed p-4 rounded-lg relative text-center dark:border-zinc-600">
            {modelImage ? (
              <img src={modelImage} alt="model" className="w-full h-48 object-contain mx-auto" />
            ) : (
              <p className="text-sm text-zinc-400">Click to upload model image</p>
            )}
            <input type="file" accept="image/*" onChange={handleModelUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
        </div>

        {/* Garment Preview */}
        <div>
          <label className="block font-semibold mb-2">Garment Preview</label>
          <div className="border p-4 rounded-lg text-center dark:border-zinc-600">
            <img src={selectedItem.image} alt="garment" className="w-full h-48 object-contain mx-auto" />
            <p className="text-sm mt-2">{selectedItem.title}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button className="bg-emerald-500 hover:bg-emerald-600 px-6 py-2 text-white rounded-full">Generate Try-On</button>
      </div>
    </div>
  </div>
)}
</div>
);
}

export default App;
