import React, { useState } from 'react';
import { MagnifyingGlassIcon, HeartIcon } from '@heroicons/react/24/solid';

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState({}); // 🔖 Favorite tracking by index

  const suggestions = ['oversized tshirt', 'printed tshirt', 'Shoes', 'cargo pants for men'];

  const handleSearch = async (searchQuery) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    setHasSearched(true);
    setLoading(true);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black text-zinc-100 pb-24">
      {/* Navbar */}
      <nav className="bg-zinc-800 text-white px-6 py-4 flex justify-between items-center shadow-lg border-b border-zinc-700 sticky top-0 z-10">
        <h1 className="text-2xl font-bold tracking-wide">Clothx</h1>
        <div className="space-x-4 text-sm">
          <a href="#" className="hover:text-emerald-400 transition">Favorites</a>
          <a href="#" className="hover:text-emerald-400 transition">Trending</a>
          <button className="bg-emerald-500 px-4 py-2 rounded-full text-white hover:scale-105 transition-transform">
            Login
          </button>
        </div>
      </nav>

      {/* Jumbotron and Search Bar */}
      {!hasSearched && (
        <div className="flex flex-col items-center justify-center flex-1 px-4 mt-10 text-center">
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Find Your Fit
            </h2>
            <p className="text-lg md:text-xl text-zinc-400">
              Discover the latest styles from your favorite brands.
            </p>
          </div>

          {/* Suggestion Tags */}
          <div className="mb-6 flex flex-wrap justify-center gap-3">
            {suggestions.map((tag) => (
              <button
                key={tag}
                onClick={() => handleSuggestionClick(tag)}
                className="bg-zinc-800 border border-zinc-600 text-emerald-400 px-4 py-1.5 rounded-full hover:bg-zinc-700 hover:scale-105 transition-all text-sm shadow-sm"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Search Input with Icon */}
          <div className="w-full max-w-xl relative">
            <input
              type="text"
              value={query}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a product..."
              className="w-full pl-4 pr-12 py-3 rounded-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            <button
              onClick={handleSearch}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-emerald-400 transition"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {loading && <Spinner />}

      {/* Results Section */}
      {results.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-8">
        <h2 className="text-2xl font-bold text-white mb-4">Search Results for <span className="text-emerald-400">"{query.charAt(0).toUpperCase() + query.slice(1)}"</span>
        </h2>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto mt-8">
          {results.map((item, index) => {
            const isFavorited = favorites[index];

            return (
              <div
                key={index}
                className="bg-zinc-800/80 backdrop-blur-md rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow border border-zinc-700 relative"
              >
                {/* Favorite Button */}
                <button
                  onClick={() =>
                    setFavorites((prev) => ({ ...prev, [index]: !prev[index] }))
                  }
                  className="absolute top-45 right-4 z-10 bg-zinc-900/70 hover:bg-zinc-800 p-1.5 rounded-full transition"
                  title="Add to favorites"
                >
                  <HeartIcon
                    className={`w-5 h-5 ${
                      isFavorited ? 'text-rose-500' : 'text-zinc-400'
                    } transition`}
                  />
                </button>

                {/* Product Image */}
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="group relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-56 w-full object-contain bg-white p-3 transition-transform group-hover:scale-105"
                  />
                </a>

                {/* Card Content */}
                <div className="p-4 flex flex-col flex-grow space-y-2">
                  <h3 className="font-semibold text-sm text-white line-clamp-2">{item.title}</h3>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-emerald-400 font-semibold">{item.price}</span>
                    <span className="text-zinc-400">{item.site}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-white bg-emerald-500 px-3 py-2 rounded-md text-xs text-center hover:bg-emerald-600 transition"
                    >
                      View
                    </a>
                    <a
                      href="#"
                      className="flex-1 text-emerald-400 border border-emerald-500 px-3 py-2 rounded-md text-xs text-center hover:bg-emerald-900 transition"
                    >
                      Try On
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      )}

      {/* Bottom Search Bar After Search */}
      {hasSearched && (
        <div className="fixed bottom-0 left-0 right-0 p-4">
          <div className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={query}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a product..."
              className="w-full pl-6 pr-12 py-3 rounded-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            <button
              onClick={handleSearch}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-emerald-400 transition"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
