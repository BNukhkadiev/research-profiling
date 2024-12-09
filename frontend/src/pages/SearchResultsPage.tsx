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
  info: {
    author: string;
    notes?: {
      note:
        | { "@type": string; text: string }
        | { "@type": string; text: string }[];
    };
    url: string;
  };
}

interface Publication {
  info: {
    title: string;
    authors: { author: { text: string } | { text: string }[] };
    venue?: string;
    url: string;
  };
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
    usePublicationsQuery(activeTab === "publications" ? searchQuery : "");

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

  const handleViewProfile = (author: string, profileUrl: string) => {
    navigate("/profile", { state: { author, profileUrl } });
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
                  key={`${researcher.info.url}-${index}`} // Ensure unique keys
                  name={researcher.info.author}
                  affiliations={
                    Array.isArray(researcher.info.notes?.note)
                      ? researcher.info.notes.note.map((n: any) => n.text)
                      : [
                          researcher.info.notes?.note?.text ||
                            "No affiliation available",
                        ]
                  }
                  profileUrl={researcher.info.url}
                  addToCompare={() =>
                    handleAddToCompare(researcher.info.author)
                  }
                  isSelected={selectedResearchers.includes(
                    researcher.info.author
                  )}
                  onViewProfile={() =>
                    handleViewProfile(
                      researcher.info.author,
                      researcher.info.url
                    )
                  }
                />
              ))
            : publications.map((publication: any, index: number) => {
                // Process authors
                const authors = Array.isArray(publication.info.authors.author)
                  ? publication.info.authors.author
                  : [publication.info.authors.author];

                return (
                  <PublicationCard
                    key={`${publication.info.url}-${index}`} // Ensure unique keys
                    title={publication.info.title}
                    authors={authors} // Pass processed authors
                    venue={publication.info.venue || "Unknown Venue"}
                    url={publication.info.url}
                  />
                );
              })}
        </Box>
      )}
    </Box>
  );
};

export default SearchResultsPage;
