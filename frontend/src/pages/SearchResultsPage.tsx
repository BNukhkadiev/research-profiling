import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import SearchCard from "../components/SearchCard"; // Researcher card
import { useResearcherQuery } from "../react-query/useResearchersQuery"; // ✅ Make sure this is singular now!
import {
  useComparisonResearchers,
  useAddResearcher,
  useRemoveResearcher,
} from "../react-query/useComparisonQuery";

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get("query") || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<"researchers" | "publications">(
    "researchers"
  );

  // ✅ Fetch selected researchers from backend comparison list
  const { comparisonList = [], isLoading: loadingComparison } =
    useComparisonResearchers();
  const addResearcherMutation = useAddResearcher();
  const removeResearcherMutation = useRemoveResearcher();

  // ✅ Fetch single researcher based on search query
  const { data: researcher, isLoading: loadingResearchers } = useResearcherQuery(
    activeTab === "researchers" ? searchQuery : ""
  );

  // ✅ Trigger search
  const handleSearch = () => {
    setSearchQuery(query);
    navigate(`?query=${query}`);
  };

  // ✅ Add/remove researcher from comparison list (Instant UI Update)
  const handleToggleCompare = (name: string) => {
    if (comparisonList.includes(name)) {
      removeResearcherMutation.mutate(name);
    } else {
      addResearcherMutation.mutate(name);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
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
          disabled={comparisonList.length === 0}
        >
          Publications
        </Button>
      </Box>

      {/* Go to Comparison Button */}
      {activeTab === "researchers" && (
        <Box sx={{ marginBottom: 3, textAlign: "right" }}>
          <Button
            variant="contained"
            onClick={() => navigate(`/compare-researchers`)}
            disabled={comparisonList.length === 0}
          >
            Go to Comparison
          </Button>
        </Box>
      )}

      {/* Display Results */}
      {loadingResearchers || loadingComparison ? (
        <Typography>Loading...</Typography>
      ) : activeTab === "researchers" ? (
        researcher ? (
          <SearchCard
            name={researcher.name}
            affiliations={researcher.affiliations}
            description={researcher.description}
            addToCompare={() => handleToggleCompare(researcher.name)}
            isSelected={comparisonList.includes(researcher.name)}
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
