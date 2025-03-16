import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ProfileHeader from "../components/ProfileHeader";
import AwardsCard from "../components/AwardsCard";
import VenuesCard from "../components/VenuesCard";
import CommonTopicsCard from "../components/CommonTopicsCard";
import Filters from "../components/Filters";
import StatisticsCard from "../components/StatisticsCard";
import CoauthorsList from "../components/CoauthorsList";
import ResearchersWork from "../components/ResearchersWork";
import { useResearcherProfileQuery } from "../react-query/useAuthorDetailsQuery";

const ResearcherProfilePage: React.FC = () => {
  const { name } = useParams<{ name: string }>();

  const [filters, setFilters] = useState<{
    yearRange: [number, number] | null;
    venue: string[];
    coreRanking: string | null;
    sort: "asc" | "desc" | null;
  }>({
    yearRange: null,
    venue: [],
    coreRanking: null,
    sort: null,
  });

  const { data: researcherProfile, isLoading, isError, error } = useResearcherProfileQuery(name || "");

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

  const statistics = { papers: totalPapers, citations: totalCitations, hIndex, gIndex };

  const availableVenues = [...new Set(papers.map((p) => p.venue))];

  // ✅ Apply filters to papers
  const filteredPapers = useMemo(() => {
    let filtered = [...papers];

    if (filters.venue.length > 0) {
      filtered = filtered.filter((paper) => filters.venue.includes(paper.venue));
    }

    if (filters.coreRanking) {
      filtered = filtered.filter((paper) => paper.coreRank === filters.coreRanking);
    }

    if (filters.yearRange) {
      filtered = filtered.filter(
        (paper) => paper.year >= filters.yearRange![0] && paper.year <= filters.yearRange![1]
      );
    }

    if (filters.sort) {
      filtered = filtered.sort((a, b) => (filters.sort === "asc" ? a.year - b.year : b.year - a.year));
    }

    return filtered;
  }, [papers, filters]);

  // ✅ Aggregate filtered venues
  const filteredVenuesMap = filteredPapers.reduce((acc: Record<string, { count: number; coreRank: string }>, paper) => {
    if (paper.venue) {
      const venueName = paper.venue;
      if (!acc[venueName]) {
        acc[venueName] = { count: 0, coreRank: paper.coreRank || "N/A" };
      }
      acc[venueName].count += 1;
    }
    return acc;
  }, {});

  const filteredVenues = Object.entries(filteredVenuesMap).map(([name, data]) => ({
    name,
    count: data.count,
    coreRank: data.coreRank,
  }));

  // ✅ Aggregate filtered topics
  const filteredTopicsMap = filteredPapers.reduce((acc: Record<string, number>, paper) => {
    paper.topics?.forEach((topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
    });
    return acc;
  }, {});

  const filteredTopics = Object.entries(filteredTopicsMap).map(([name, count]) => ({ name, count }));

  // ✅ Aggregate filtered coauthors
  const filteredCoauthorsMap = filteredPapers.reduce((acc: Record<string, number>, paper) => {
    paper.authors?.forEach((author) => {
      if (author.name !== authorName) {
        acc[author.name] = (acc[author.name] || 0) + 1;
      }
    });
    return acc;
  }, {});

  const filteredCoauthors = Object.entries(filteredCoauthorsMap).map(([name, publicationsTogether]) => ({
    name,
    publicationsTogether,
  }));

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // ⚠️ Hooks are done — below are conditional returns, safe now:
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

  // ✅ Render final responsive and filtered page:
  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      <Filters onFilterChange={handleFilterChange} availableVenues={availableVenues} />

      <ProfileHeader
        author={authorName}
        profileUrl={`https://dblp.org/search?q=${encodeURIComponent(authorName)}`}
        affiliations={affiliations.length > 0 ? affiliations.join(", ") : "Affiliations not available"}
        addToCompare={() => console.log(`Add to Compare Clicked for ${authorName}`)}
        isSelected={false}
      />

      <Box sx={{ display: "flex", gap: 4, marginTop: 4 }}>
        {/* Left */}
        <Box sx={{ width: "25%", display: "flex", flexDirection: "column", gap: 2 }}>
          <AwardsCard />
          <VenuesCard venues={filteredVenues} /> {/* Responsive venues */}
          <CommonTopicsCard topics={filteredTopics} /> {/* Responsive topics */}
        </Box>

        {/* Center */}
        <Box sx={{ width: "50%", display: "flex", flexDirection: "column", gap: 2 }}>
          <ResearchersWork author={authorName} publications={filteredPapers} />
        </Box>

        {/* Right */}
        <Box sx={{ width: "25%", display: "flex", flexDirection: "column", gap: 2 }}>
          <StatisticsCard author={statistics} />
          <CoauthorsList coauthors={filteredCoauthors} /> {/* Responsive coauthors */}
        </Box>
      </Box>
    </Box>
  );
};

export default ResearcherProfilePage;
