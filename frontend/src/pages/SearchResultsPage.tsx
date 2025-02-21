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
<<<<<<< HEAD
  info: {
    author: string;
    notes?: {
      note:
        | { "@type": string; text: string }
        | { "@type": string; text: string }[];
    };
    url: string;
  };
=======
  name: string;
  affiliations: string[];
  pid: string;
  dblp_url: string;
  abstract: string;
>>>>>>> origin/bagas_branch
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
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<"researchers" | "publications">("researchers");
  const [selectedResearchers, setSelectedResearchers] = useState<string[]>([]);

  // Fetch researchers based on search query
  const { data: researchers = [], isLoading: loadingResearchers } =
    useResearchersQuery(activeTab === "researchers" ? searchQuery : "");

  // Fetch publications for the first selected researcher
  const { data: publications = [], isLoading: loadingPublications } =
<<<<<<< HEAD
    usePublicationsQuery(activeTab === "publications" ? searchQuery : "");
=======
    usePublicationsQuery(
      activeTab === "publications" && selectedResearchers.length
        ? selectedResearchers[0] // Use the first selected researcher
        : ""
    );
>>>>>>> origin/bagas_branch

  // Trigger search
  const handleSearch = () => {
    setSearchQuery(query);
    navigate(`?query=${query}`);
  };

  // Add/remove researcher from comparison list
  const handleAddToCompare = (pid: string) => {
    setSelectedResearchers((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]
    );
  };

<<<<<<< HEAD
  const handleViewProfile = (author: string, profileUrl: string) => {
    navigate("/profile", { state: { author, profileUrl } });
=======
  // Navigate to profile page using `pid`
  const handleViewProfile = (pid: string) => {
    navigate(`/profile/${encodeURIComponent(pid)}`);
>>>>>>> origin/bagas_branch
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
<<<<<<< HEAD
=======
          disabled={selectedResearchers.length === 0} // Disable if no researcher is selected
>>>>>>> origin/bagas_branch
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
            ? researchers.map((researcher: Researcher) => (
                <SearchCard
<<<<<<< HEAD
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
=======
                  key={researcher.pid} // Use PID as key
                  name={researcher.name}
                  affiliations={researcher.affiliations}
                  pid={researcher.pid} // Pass PID for profile navigation
                  dblp_url={researcher.dblp_url} // Keep DBLP profile link
                  abstract={researcher.abstract} // Pass abstract
                  addToCompare={() => handleAddToCompare(researcher.pid)}
                  isSelected={selectedResearchers.includes(researcher.pid)}
                  onViewProfile={() => handleViewProfile(researcher.pid)} // Ensure navigation works
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
>>>>>>> origin/bagas_branch
        </Box>
      )}
    </Box>
  );
};

export default SearchResultsPage;
