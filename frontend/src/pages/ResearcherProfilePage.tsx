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
import CoauthorsSection from "../components/CoauthorsSection";
import ResearchersWork from "../components/ResearchersWork";
import { useResearcherProfileQuery } from "../react-query/useAuthorDetailsQuery"; // Updated import path

const ResearcherProfilePage: React.FC = () => {
  const { pid } = useParams<{ pid: string }>();

  const { data: researcherProfile, isLoading, isError, error } = useResearcherProfileQuery(pid || "");

  const handleFilterChange = (filters: any) => {
    console.log("Filters changed:", filters);
  };

  if (!pid) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4" color="error">
          Researcher ID is missing!
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

  // Destructure and provide fallback empty arrays
  const {
    name = "Unknown Author",
    affiliations = [],
    venues = [],
    topics = [],
    papers = [],
    coauthors = [],
    totalPapers = 0,
    totalCitations = 0,
    hIndex = 0,
    gIndex = 0,
  } = researcherProfile || {};

  const statistics = { papers: totalPapers, citations: totalCitations, hIndex, gIndex };

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      <Filters onFilterChange={handleFilterChange} />
      <ProfileHeader
        author={name}
        profileUrl={`https://dblp.org/pid/${pid}`}
        affiliations={affiliations.length > 0 ? affiliations.join(", ") : "Affiliations not available"}
        addToCompare={() => console.log(`Add to Compare Clicked for ${name}`)}
        isSelected={false}
      />
      <Box sx={{ display: "flex", gap: 4, marginTop: 4 }}>
        {/* Left column */}
        <Box sx={{ width: "25%", display: "flex", flexDirection: "column", gap: 2 }}>
          <AwardsCard />
          <VenuesCard venues={venues} />
          <CommonTopicsCard topics={topics} />
        </Box>
        {/* Center column */}
        <Box sx={{ width: "50%" }}>
          <ResearchersWork author={name} authorId={pid} publications={papers} />
        </Box>
        {/* Right column */}
        <Box sx={{ width: "25%", display: "flex", flexDirection: "column", gap: 2 }}>
          <StatisticsCard author={statistics} />
          <CoauthorsSection coauthors={coauthors} />
        </Box>
      </Box>
    </Box>
  );
};

export default ResearcherProfilePage;
