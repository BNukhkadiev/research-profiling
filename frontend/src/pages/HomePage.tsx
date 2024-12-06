import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import "./HomePage.css"; // Import the external CSS file

function HomePage() {
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const navigate = useNavigate(); // React Router navigation hook

  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Navigate to the search results page with query as a parameter
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 64px)", // Adjust height based on header size
        backgroundColor: "#f4f4f4",
        padding: 2,
      }}
    >
      {/* Title */}
      <Typography
        variant="h2"
        sx={{
          marginBottom: 4,
          color: "#232E58",
          fontWeight: "bold",
        }}
      >
        Mannheim View
      </Typography>

      {/* Search Bar and Icon */}
      <Box className="search-container">
        <TextField
          placeholder="Search"
          variant="outlined"
          className="search-field"
          value={searchTerm} // Bind the input value to state
          onChange={(e) => setSearchTerm(e.target.value)} // Update state on input
          onKeyPress={handleKeyPress} // Handle Enter key press
          InputProps={{
            endAdornment: (
              <IconButton className="search-icon" onClick={handleSearch}>
                <SearchIcon />
              </IconButton>
            ),
          }}
        />
      </Box>

      {/* Welcome Message Section */}
      <Box
        sx={{
          marginTop: 4,
          maxWidth: "800px",
          padding: 3,
          borderRadius: "10px",
          backgroundColor: "rgba(0, 0, 0, 0.4)", // Semi-transparent black
          color: "white",
          textAlign: "center",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
        }}
        className="welcome-message"
      >
        <Typography variant="h5" sx={{ marginBottom: 1 }}>
          Welcome to Mannheim View
        </Typography>
        <Typography variant="body1">
          A platform for exploring detailed researcher profiles, publications,
          and contributions. Please explore and engage with the resources we
          offer to support your research and practice.
        </Typography>
      </Box>
    </Box>
  );
}

export default HomePage;
