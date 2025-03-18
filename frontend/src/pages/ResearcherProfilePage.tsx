import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ProfileHeader from "../components/ProfileHeader";
import AwardsCard from "../components/AwardsCard";
import VenuesCard from "../components/VenuesCard";
import CommonTopicsCard from "../components/CommonTopicsCard";
import Filters from "../components/Filters";
import StatisticsCard from "../components/StatisticsCard";
import CoauthorsList from "../components/CoauthorsList";
import ResearchersWork from "../components/ResearchersWork";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { useResearcherProfileQuery } from "../react-query/useAuthorDetailsQuery";
import {
  useComparisonResearchers,
  useAddResearcher,
  useRemoveResearcher,
} from "../react-query/useComparisonQuery"; // ✅ Import hooks for add/remove functionality

const ResearcherProfilePage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate(); // ✅ Initialize navigate function

  const [filters, setFilters] = useState({
    yearRange: null as [number, number] | null,
    venue: [] as string[],
    coreRanking: null as string | null,
    sort: null as "asc" | "desc" | null,
  });

  const {
    data: researcherProfile,
    isLoading,
    isError,
    error,
  } = useResearcherProfileQuery(name || "");

  const {
    name: authorName = "Unknown Author",
    affiliations = [],
    papers = [],
    topics = [],
    coauthors = [],
    totalPapers = 0,
    totalCitations = 0,
    hIndex = 0,
    gIndex = 0,
  } = researcherProfile || {};

  const statistics = {
    papers: totalPapers,
    citations: totalCitations,
    hIndex,
    gIndex,
  };

  // ✅ Fetch the comparison list
  const { comparisonList = [] } = useComparisonResearchers();
  const addResearcherMutation = useAddResearcher();
  const removeResearcherMutation = useRemoveResearcher();

  // ✅ Check if researcher is in comparison list
  const isSelected = comparisonList.includes(authorName);

  // ✅ Toggle researcher in comparison list with notification
  const handleToggleCompare = () => {
    if (isSelected) {
      removeResearcherMutation.mutate(authorName, {
        onSuccess: () => {
          toast.error(`Removed ${authorName} from comparison list`);
        },
      });
    } else {
      addResearcherMutation.mutate(authorName, {
        onSuccess: () => {
          toast.success(`Added ${authorName} to comparison list`);
        },
      });
    }
  };

  const availableVenues = [...new Set(papers.map((p) => p.venue))];

  // ✅ Apply filters to papers
  const filteredPapers = useMemo(() => {
    let filtered = [...papers];

    if (filters.venue.length > 0) {
      filtered = filtered.filter((paper) =>
        filters.venue.includes(paper.venue)
      );
    }

    if (filters.coreRanking) {
      filtered = filtered.filter(
        (paper) => paper.coreRank === filters.coreRanking
      );
    }

    if (filters.yearRange) {
      filtered = filtered.filter(
        (paper) =>
          paper.year >= filters.yearRange![0] &&
          paper.year <= filters.yearRange![1]
      );
    }

    if (filters.sort) {
      filtered = filtered.sort((a, b) =>
        filters.sort === "asc" ? a.year - b.year : b.year - a.year
      );
    }

    return filtered;
  }, [papers, filters]);

  // ✅ Aggregate filtered venues
  const filteredVenuesMap = filteredPapers.reduce(
    (acc: Record<string, { count: number; coreRank: string }>, paper) => {
      if (paper.venue) {
        const venueName = paper.venue;
        if (!acc[venueName]) {
          acc[venueName] = { count: 0, coreRank: paper.coreRank || "N/A" };
        }
        acc[venueName].count += 1;
      }
      return acc;
    },
    {}
  );

  const filteredVenues = Object.entries(filteredVenuesMap).map(
    ([name, data]) => ({
      name,
      count: data.count,
      coreRank: data.coreRank,
    })
  );

  // ✅ Aggregate filtered topics
  const filteredTopicsMap = filteredPapers.reduce(
    (acc: Record<string, number>, paper) => {
      paper.topics?.forEach((topic) => {
        acc[topic] = (acc[topic] || 0) + 1;
      });
      return acc;
    },
    {}
  );

  const filteredTopics = Object.entries(filteredTopicsMap).map(
    ([name, count]) => ({
      name,
      count,
    })
  );

  // ✅ Aggregate filtered coauthors
  const filteredCoauthorsMap = filteredPapers.reduce(
    (acc: Record<string, number>, paper) => {
      paper.authors?.forEach((author) => {
        if (author.name !== authorName) {
          acc[author.name] = (acc[author.name] || 0) + 1;
        }
      });
      return acc;
    },
    {}
  );

  const filteredCoauthors = Object.entries(filteredCoauthorsMap).map(
    ([name, publicationsTogether]) => ({
      name,
      publicationsTogether,
    })
  );

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  if (!name) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4" color="error">
          Researcher name is missing!
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4">Loading data...</Typography>
      </Box>
    );
  }

  if (isError) {
    console.error("Error fetching researcher profile:", error);
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4" color="error">
          Failed to fetch researcher profile. Please try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      {/* ✅ Toast notifications container */}
      <ToastContainer position="top-right" autoClose={3000} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 3,
        }}
      >
        <Filters
          onFilterChange={handleFilterChange}
          availableVenues={availableVenues}
        />
        {/* ✅ Go to Comparisons Button (Only Shows When Researchers are Added) */}
        {comparisonList.length > 0 && (
          <Button
            variant="contained"
            onClick={() => navigate("/compare-researchers")} // ✅ Navigate to Comparison Page
          >
            Go to Comparisons
          </Button>
        )}
      </Box>

      {/* ✅ Pass toggle function & selection state to ProfileHeader */}
      <ProfileHeader
        author={authorName}
        profileUrl={`https://dblp.org/search?q=${encodeURIComponent(
          authorName
        )}`}
        affiliations={
          affiliations.length > 0
            ? affiliations.join(", ")
            : "Affiliations not available"
        }
        onToggleCompare={handleToggleCompare}
        isSelected={isSelected}
      />

      <Box sx={{ display: "flex", gap: 4, marginTop: 4 }}>
        {/* Left */}
        <Box
          sx={{
            width: "25%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <AwardsCard />
          <VenuesCard venues={filteredVenues} />
          <CommonTopicsCard topics={filteredTopics} />
        </Box>

        {/* Center */}
        <Box
          sx={{
            width: "50%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <ResearchersWork author={authorName} publications={filteredPapers} />
        </Box>

        {/* Right */}
        <Box
          sx={{
            width: "25%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <StatisticsCard author={statistics} />
          <CoauthorsList coauthors={filteredCoauthors} />
        </Box>
      </Box>
    </Box>
  );
};

export default ResearcherProfilePage;
