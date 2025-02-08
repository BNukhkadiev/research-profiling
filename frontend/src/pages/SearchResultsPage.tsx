import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import SearchCard from "../components/SearchCard"; // Researcher card
import PublicationCard from "../components/PublicationCard"; // Publication card
import { useResearchersQuery } from "../react-query/useResearchersQuery";
import { usePublicationsQuery } from "../react-query/usePublicationsQuery";

// Define types based on updated API response
interface Researcher {
  name: string;
  affiliations: string[];
  dblp_url: string;
  abstract: string;
}

interface Publication {
  url: string;
  title: string;
  year: number;
  authors: { name: string }[];
}

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get("query") || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery); // Used for API calls
  const [activeTab, setActiveTab] = useState<"researchers" | "publications">("researchers");
  const [selectedResearchers, setSelectedResearchers] = useState<string[]>([]);

  // Fetch researchers based on search query
  const { data: researchers = [], isLoading: loadingResearchers } =
    useResearchersQuery(activeTab === "researchers" ? searchQuery : "");

  // Fetch publications for the first selected researcher
  const { data: publications = [], isLoading: loadingPublications } =
    usePublicationsQuery(
      activeTab === "publications" && selectedResearchers.length
        ? selectedResearchers[0] // Use the first selected researcher
        : ""
    );

  // Trigger search
  const handleSearch = () => {
    setSearchQuery(query);
    navigate(`?query=${query}`);
  };

  // Add/remove researcher from comparison list
  const handleAddToCompare = (author: string) => {
    setSelectedResearchers((prev) =>
      prev.includes(author) ? prev.filter((name) => name !== author) : [...prev, author]
    );
  };

  // Navigate to profile page
  const handleViewProfile = (authorName: string, dblpUrl: string, affiliations: string[]) => {
    const authorId = dblpUrl.split("/").pop(); // Extract author ID from DBLP URL
    const affiliation = affiliations.length > 0 ? affiliations[0] : "Unknown";
    navigate(`/profile/${authorId}/${encodeURIComponent(affiliation)}`, {
      state: { authorName, authorId },
    });
  };

  // Navigate to comparison page
  const handleGetToComparison = () => {
    navigate(`/comparison?authors=${selectedResearchers.join(",")}`);
  };

  // Handle Enter key for search
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && query.trim()) {
      handleSearch();
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
          onKeyDown={handleKeyDown} // Trigger search on Enter key
          sx={{ flexGrow: 1, marginRight: 2 }}
        />
        <Button variant="contained" onClick={handleSearch} disabled={query.trim() === ""}>
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
          disabled={selectedResearchers.length === 0} // Disable if no researcher is selected
        >
          Publications
        </Button>
      </Box>

      {/* Get to Comparison Button */}
      {activeTab === "researchers" && (
        <Box sx={{ marginBottom: 3, textAlign: "right" }}>
          <Button
            variant="contained"
            onClick={handleGetToComparison}
            disabled={selectedResearchers.length === 0}
          >
            Get to Comparison
          </Button>
        </Box>
      )}

      {/* Display Results */}
      {loadingResearchers || loadingPublications ? (
        <Typography>Loading...</Typography>
      ) : (
        <Box>
          {activeTab === "researchers"
            ? researchers.map((researcher: Researcher, index: number) => (
                <SearchCard
                  key={`${researcher.dblp_url}-${index}`} // Ensure unique keys
                  name={researcher.name}
                  affiliations={researcher.affiliations}
                  dblp_url={researcher.dblp_url} // Use correct property
                  abstract={researcher.abstract} // Pass abstract
                  addToCompare={() => handleAddToCompare(researcher.name)}
                  isSelected={selectedResearchers.includes(researcher.name)}
                  onViewProfile={() => handleViewProfile(researcher.name, researcher.dblp_url, researcher.affiliations)}
                />
              ))
            : publications.map((publication: Publication, index: number) => (
                <PublicationCard
                  key={`${publication.url}-${index}`} // Ensure unique keys
                  title={publication.title}
                  authors={publication.authors.map((author) => author.name)} // Flatten authors array
                  venue={publication.year.toString()} // Convert year to string
                  url={publication.url}
                />
              ))}
        </Box>
      )}
    </Box>
  );
};

export default SearchResultsPage;
