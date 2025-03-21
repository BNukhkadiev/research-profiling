import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify"; // ✅ Import Toastify
import "react-toastify/dist/ReactToastify.css"; // ✅ Import Toastify styles
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import SearchCard from "../components/SearchCard"; // Researcher card
import { useResearcherQuery } from "../react-query/useResearchersQuery";

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get("query") || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<"researchers" | "publications">(
    "researchers"
  );

  // ✅ Fetch single researcher based on search query
  const { data: researcher, isLoading: loadingResearchers } =
    useResearcherQuery(activeTab === "researchers" ? searchQuery : "");

  // ✅ Trigger search
  const handleSearch = () => {
    setSearchQuery(query);
    navigate(`?query=${query}`);
  };

  return (
    <Box sx={{ padding: 4 }}>
      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Search Bar */}
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: 3 }}>
        <TextField
          label="Search Researchers or Publications"
          variant="outlined"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && query.trim() && handleSearch()}
          sx={{ flexGrow: 1, marginRight: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={query.trim() === ""}
        >
          Search
        </Button>
      </Box>

      {/* Tabs for Researchers / Publications */}
      <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
        <Button
          variant={activeTab === "researchers" ? "contained" : "outlined"}
          onClick={() => setActiveTab("researchers")}
        >
          Researchers
        </Button>
        <Button
          variant={activeTab === "publications" ? "contained" : "outlined"}
          onClick={() => setActiveTab("publications")}
        >
          Publications
        </Button>
      </Box>

      {/* Go to Comparison Button */}

      {/* Display Results */}
      {loadingResearchers ? (
        <Typography>Loading...</Typography>
      ) : activeTab === "researchers" ? (
        researcher ? (
          <SearchCard
            name={researcher.name}
            affiliations={researcher.affiliations}
            description={researcher.description}
            onViewProfile={() =>
              navigate(`/profile/${encodeURIComponent(researcher.name)}`)
            }
          />
        ) : (
          <Typography>No researcher found.</Typography>
        )
      ) : null}
    </Box>
  );
};

export default SearchResultsPage;
