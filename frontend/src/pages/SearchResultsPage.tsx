import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import SearchCard from "../components/SearchCard"; // For researcher results
import PublicationCard from "../components/PublicationCard"; // For publication results
import { useResearchersQuery } from "../react-query/useResearchersQuery";
import { usePublicationsQuery } from "../react-query/usePublicationsQuery";

// Define types for API response
interface Researcher {
  name: string;
  url: string;
  affiliations: string[]; // Add affiliations to the Researcher type
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
  const [searchQuery, setSearchQuery] = useState(initialQuery); // Query for API calls
  const [activeTab, setActiveTab] = useState<"researchers" | "publications">(
    "researchers"
  );
  const [selectedResearchers, setSelectedResearchers] = useState<string[]>([]);

  const { data: researchers = [], isLoading: loadingResearchers } =
    useResearchersQuery(activeTab === "researchers" ? searchQuery : "");
  const { data: publications = [], isLoading: loadingPublications } =
    usePublicationsQuery(
      activeTab === "publications" && selectedResearchers.length
        ? selectedResearchers[0]
        : ""
    ); // Fetch publications for the first selected researcher

  const handleSearch = () => {
    setSearchQuery(query);
    navigate(`?query=${query}`);
  };

  const handleAddToCompare = (author: string) => {
    setSelectedResearchers((prev) =>
      prev.includes(author)
        ? prev.filter((name) => name !== author)
        : [...prev, author]
    );
  };

  const handleViewProfile = (
    authorName: string,
    profileUrl: string,
    affiliations: string[]
  ) => {
    const authorId = profileUrl.split("/").pop(); // Extract the author ID from the URL
    const affiliation = affiliations.length > 0 ? affiliations[0] : "Unknown";
    navigate(`/profile/${authorId}/${encodeURIComponent(affiliation)}`, {
      state: { authorName, authorId },
    });
  };

  const handleGetToComparison = () => {
    // Navigate to a comparison page with selected researchers
    navigate(`/comparison?authors=${selectedResearchers.join(",")}`);
  };

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
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={query.trim() === ""}
        >
          Search
        </Button>
      </Box>

      {/* Tabs */}
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
          disabled={selectedResearchers.length === 0} // Disable if no researcher selected
        >
          Publications
        </Button>
      </Box>

      {/* Get to Comparison */}
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

      {/* Results */}
      {loadingResearchers || loadingPublications ? (
        <Typography>Loading...</Typography>
      ) : (
        <Box>
          {activeTab === "researchers"
            ? researchers.map((researcher: Researcher, index: number) => (
                <SearchCard
                  key={`${researcher.url}-${index}`} // Ensure unique keys
                  name={researcher.name}
                  affiliations={researcher.affiliations} // Pass affiliations to SearchCard
                  profileUrl={researcher.url}
                  addToCompare={() => handleAddToCompare(researcher.name)}
                  isSelected={selectedResearchers.includes(researcher.name)}
                  onViewProfile={() =>
                    handleViewProfile(
                      researcher.name,
                      researcher.url,
                      researcher.affiliations
                    )
                  }
                />
              ))
            : publications.map((publication: Publication, index: number) => (
                <PublicationCard
                  key={`${publication.url}-${index}`} // Ensure unique keys
                  title={publication.title}
                  authors={publication.authors.map((author) => author.name)} // Flatten authors
                  venue={publication.year.toString()}
                  url={publication.url}
                />
              ))}
        </Box>
      )}
    </Box>
  );
};

export default SearchResultsPage;
