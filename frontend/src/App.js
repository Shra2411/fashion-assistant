import React, { useState } from 'react';

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const suggestions = ['oversized tshirt', 'printed tshirt', 'Shoes', 'cargo pants for men'];

  const handleSearch = async (searchQuery) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;
  
    setHasSearched(true);
    setLoading(true); // Show spinner
  
    try {
      const response = await fetch(`http://localhost:5000/search?query=${finalQuery}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      alert('Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false); // Hide spinner
    }
  };
  
  

  const handleSuggestionClick = (tag) => {
    setQuery(tag);
    setHasSearched(true);
    // Use a slight delay to make sure state updates before calling handleSearch
    setTimeout(() => handleSearch(tag), 0);
  };
  

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pb-24 relative">
      {/* Navbar */}
      <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-semibold">Clothx</h1>
        <div className="space-x-6 text-sm">
          <a href="#" className="hover:text-primary transition">Favorites</a>
          <a href="#" className="hover:text-primary transition">Trending</a>
          <button className="bg-primary px-4 py-2 rounded-md text-white border border-emerald-600 hover:bg-emerald-600 transition">
            Login
          </button>
        </div>
      </nav>

      {/* Centered Search Bar Before Search */}
      {!hasSearched && (
        <div className="flex flex-col items-center justify-center flex-1 px-4 mt-10">
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {suggestions.map((tag) => (
              <button
                key={tag}
                onClick={() => handleSuggestionClick(tag)}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition text-sm"
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="w-full max-w-xl flex gap-4">
            <input
              type="text"
              value={query}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}              
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a product..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSearch}
              className="bg-primary text-black border px-6 py-3 rounded-md hover:bg-emerald-600 hover:text-white transition"
            >
              Search
            </button>
          </div>
        </div>
      )}

      {loading && <Spinner />}
      {/* Results Section */}
      {results.length > 0 && (
        <div className="p-6 flex flex-wrap gap-6 max-w-7xl mx-auto">
          {results.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col w-full sm:w-[45%] lg:w-[30%] xl:w-[22%] max-w-xs transition hover:shadow-lg"
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-48 w-full object-contain"
              />
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-base mb-1 line-clamp-2">{item.title}</h3>
                <p className="text-green-600 font-semibold">{item.price}</p>
                <p className="text-sm text-gray-500 mb-2">{item.site}</p>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto text-black border bg-secondary px-4 py-2 rounded-md text-center hover:bg-blue-600 hover:text-white transition"
                >
                  View Product
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Search Bar After Search */}
      {hasSearched && (
        <div className="fixed bottom-0 left-0 right-0 p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <input
              type="text"
              value={query}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}              
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a product..."
              className="flex-1 px-4 py-3 border border-zinc-700 bg-zinc-800 text-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSearch}
              className="bg-primary text-zinc-300 border border-zinc-700 bg-zinc-800 px-6 py-3 rounded-md hover:bg-emerald-600 hover:text-white transition"
            >
              Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
