import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ProfileHeader from "../components/ProfileHeader";
import AwardsCard from "../components/AwardsCard";
import VenuesCard from "../components/VenuesCard";
import CommonTopicsCard from "../components/CommonTopicsCard";
import StatisticsCard from "../components/StatisticsCard";
import CoauthorsList from "../components/CoauthorsList";
import Filters from "../components/Filters";
import ResearchersWork from "../components/ResearchersWork";

const ResearcherProfilePage: React.FC = () => {
  const location = useLocation();
  const { state } = location;
  const { author, profileUrl, affiliations } = state || {};

  const [activeFilters, setActiveFilters] = useState({});

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
    console.log("Active Filters:", filters);
  };

  if (!author || !profileUrl) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4" color="error">
          Researcher profile data is missing!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      {/* Filters */}
      <Filters onFilterChange={handleFilterChange} />

      {/* Profile Header */}
      <ProfileHeader
        author={author}
        profileUrl={profileUrl}
        affiliations={affiliations || "Affiliation not available"}
        addToCompare={() => console.log("Add to Compare Clicked")}
        isSelected={false}
      />

      {/* Main Layout */}
      <Box sx={{ display: "flex", gap: 4, marginTop: 4 }}>
        {/* Left Column */}
        <Box
          sx={{
            width: "25%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <AwardsCard />
          <VenuesCard />
          <CommonTopicsCard />
        </Box>

        {/* Middle Column */}
        <Box sx={{ width: "50%" }}>
          <ResearchersWork author={author} />
        </Box>

        {/* Right Column */}
        <Box
          sx={{
            width: "25%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <StatisticsCard author={author} />
          <CoauthorsList author={author} />
        </Box>
      </Box>
    </Box>
  );
};

export default ResearcherProfilePage;
