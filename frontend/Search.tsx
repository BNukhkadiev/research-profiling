import React, { useState } from "react";
import '../styles/search.css';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Function to handle API call
  const handleSearch = async () => {
    if (!query) return; // Prevent empty searches
    setLoading(true);

    try {
      // Replace this URL with your API endpoint
      const response = await fetch(`https://api.example.com/search?q=${query}`);
      const data = await response.json();

      setResults(data.results || []); // Adjust this based on API response format
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      {/* Logo and Header */}
      <div className="header">
        <img src="/logo.png" alt="Mannheim View Logo" className="logo" />
        <h1>MannheimView</h1>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && <p className="loading">Loading...</p>}

      {/* Search Results */}
      <div className="results-container">
        {results.length > 0 ? (
          results.map((item, index) => (
            <div key={index} className="result-item">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                View More
              </a>
            </div>
          ))
        ) : (
          !loading && <p className="no-results">No results found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
