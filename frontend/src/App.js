import React, { useState } from 'react';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:5000/search?query=${query}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Error fetching results:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Compare Prices</h1>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search product"
      />
      <button onClick={handleSearch}>Search</button>

      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 20 }}>
        {results.map((item, index) => (
          <div key={index} style={{
            width: 250, padding: 10, margin: 10,
            border: '1px solid #ccc', borderRadius: '8px'
          }}>
            <img
              src={item.image}
              alt={item.title}
              style={{ width: '100%', height: 200, objectFit: 'cover' }}
            />
            <h3>{item.title}</h3>
            <p>{item.price}</p>
            <p><strong>{item.site}</strong></p>

            {/* ✅ This ensures external site navigation */}
            <button
              onClick={() => {
                window.open(item.link, '_blank', 'noopener,noreferrer');
              }}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              View Product
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
