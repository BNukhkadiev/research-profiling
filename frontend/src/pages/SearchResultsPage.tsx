import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import SearchCard from "../components/SearchCard";
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

  const { data: researchers, isLoading: loadingResearchers, isError } = useResearcherQuery(
    activeTab === "researchers" ? searchQuery : ""
  );

  const handleSearch = () => {
    setSearchQuery(query);
    navigate(`?query=${encodeURIComponent(query)}`);
  };

  return (
    <Box sx={{ padding: 4 }}>
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
        <Button variant="contained" onClick={handleSearch} disabled={!query.trim()}>
          Search
        </Button>
      </Box>

      {/* Tab Toggle */}
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

      {/* Researcher Results */}
      {loadingResearchers ? (
        <Typography>Loading...</Typography>
      ) : isError ? (
        <Typography>Error fetching researchers.</Typography>
      ) : activeTab === "researchers" ? (
        researchers && Object.keys(researchers).length > 0 ? (
          Object.entries(researchers).map(([name, data]) => (
            <SearchCard
              key={name}
              name={name}
              affiliations={data.affiliations}
              description={data.description}
              onViewProfile={() =>
                navigate(`/profile/${encodeURIComponent(name)}`)
              }
            />
          ))
        ) : (
          <Typography>No researchers found.</Typography>
        )
      ) : null}
    </Box>
  );
};

export default SearchResultsPage;
