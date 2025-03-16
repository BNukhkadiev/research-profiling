import React from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ProfileHeader from "../components/ProfileHeader";
import AwardsCard from "../components/AwardsCard";
import VenuesCard from "../components/VenuesCard";
import CommonTopicsCard from "../components/CommonTopicsCard";
import Filters from "../components/Filters";
import StatisticsCard from "../components/StatisticsCard";
import CoauthorsList from "../components/CoauthorsList"; // ✅ Using corrected CoauthorsList
import ResearchersWork from "../components/ResearchersWork";
import { useResearcherProfileQuery } from "../react-query/useAuthorDetailsQuery"; // ✅ Correct import

const ResearcherProfilePage: React.FC = () => {
  const { name } = useParams<{ name: string }>(); // ✅ 'name' from URL

  // Fetch researcher data using React Query
  const { data: researcherProfile, isLoading, isError, error } = useResearcherProfileQuery(name || "");

  // Handle missing name param
  if (!name) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4" color="error">
          Researcher name is missing!
        </Typography>
      </Box>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4">Loading data...</Typography>
      </Box>
    );
  }

  // Handle error state
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

  // ✅ Destructure response with safe fallbacks
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

  // ✅ Aggregate venues from papers (since backend doesn't return venues directly)
  const aggregatedVenuesMap = papers.reduce((acc: Record<string, { count: number; coreRank: string }>, paper) => {
    if (paper.venue) {
      const venueName = paper.venue;
      if (!acc[venueName]) {
        acc[venueName] = { count: 0, coreRank: paper.coreRank || "N/A" }; // Use paper's core_rank if present
      }
      acc[venueName].count += 1;
    }
    return acc;
  }, {});

  // ✅ Convert venue map to array
  const venues = Object.entries(aggregatedVenuesMap).map(([name, data]) => ({
    name,
    count: data.count,
    coreRank: data.coreRank,
  }));

  // ✅ Optional filter handling (not wired fully)
  const handleFilterChange = (filters: any) => {
    console.log("Filters changed:", filters);
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      {/* Filters (Optional future functionality) */}
      <Filters onFilterChange={handleFilterChange} />

      {/* Profile Header */}
      <ProfileHeader
        author={authorName}
        profileUrl={`https://dblp.org/search?q=${encodeURIComponent(authorName)}`} // Optional external link to DBLP search
        affiliations={affiliations.length > 0 ? affiliations.join(", ") : "Affiliations not available"}
        addToCompare={() => console.log(`Add to Compare Clicked for ${authorName}`)} // Optional for future feature
        isSelected={false} // Placeholder for compare logic
      />

      {/* Main Content */}
      <Box sx={{ display: "flex", gap: 4, marginTop: 4 }}>
        {/* Left Column */}
        <Box sx={{ width: "25%", display: "flex", flexDirection: "column", gap: 2 }}>
          <AwardsCard /> {/* Placeholder, can be implemented or removed */}
          <VenuesCard venues={venues} /> {/* ✅ Now venues are correctly computed */}
          <CommonTopicsCard topics={topics} />
        </Box>

        {/* Center Column */}
        <Box sx={{ width: "50%", display: "flex", flexDirection: "column", gap: 2 }}>
          <ResearchersWork author={authorName} publications={papers} />
        </Box>

        {/* Right Column */}
        <Box sx={{ width: "25%", display: "flex", flexDirection: "column", gap: 2 }}>
          <StatisticsCard author={statistics} />
          <CoauthorsList coauthors={coauthors} />
        </Box>
      </Box>
    </Box>
  );
};

export default ResearcherProfilePage;
