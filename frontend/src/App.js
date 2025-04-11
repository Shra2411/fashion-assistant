import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [prompt, setPrompt] = useState('');
  const [products, setProducts] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/prompt', { prompt });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Fashion Assistant</h1>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g. black t-shirt, jeans"
      />
      <button onClick={handleSearch} style={{ marginLeft: "10px" }}>Search</button>

      <div style={{ marginTop: "30px" }}>
        {products.map((product, index) => (
          <div key={index} style={{
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "15px",
            marginBottom: "10px",
            width: "300px"
          }}>
            <h3>{product.name}</h3>
            <p><strong>Price:</strong> {product.price}</p>
            <a href={product.link} target="_blank" rel="noopener noreferrer">
              View Product
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
