import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ProfileHeader from "../components/ProfileHeader";
import AwardsCard from "../components/AwardsCard";
import VenuesCard from "../components/VenuesCard";
import CommonTopicsCard from "../components/CommonTopicsCard";
import Filters from "../components/Filters";
import ResearchersWork from "../components/ResearchersWork";
import { useAuthorDetailsQuery } from "../react-query/useAuthorDetailsQuery";

const ResearcherProfilePage: React.FC = () => {
  const { authorId } = useParams<{ authorId: string }>(); // Extract authorId from URL
  const [activeFilters, setActiveFilters] = useState({});

  // Fetch author details using the authorId
  const {
    data: authorDetails,
    isLoading: loadingAuthorDetails,
    isError: errorAuthorDetails,
    error: authorDetailsError,
  } = useAuthorDetailsQuery(authorId || "");

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
    console.log("Active Filters:", filters);
  };

  if (!authorId) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4" color="error">
          Researcher ID is missing!
        </Typography>
      </Box>
    );
  }

  if (loadingAuthorDetails) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4">Loading author details...</Typography>
      </Box>
    );
  }

  if (errorAuthorDetails) {
    console.error("Author Details Error:", authorDetailsError);

    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4" color="error">
          Failed to fetch author details. Please try again later.
        </Typography>
      </Box>
    );
  }

  console.log("Fetched Author Details:", authorDetails);

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      {/* Filters */}
      <Filters onFilterChange={handleFilterChange} />

      {/* Profile Header */}
      <ProfileHeader
        author={authorDetails?.name || "Unknown Author"}
        profileUrl={authorDetails?.url || ""}
        affiliations={
          authorDetails?.affiliations?.join(", ") || "Affiliations not available"
        }
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
          <ResearchersWork
            author={authorDetails?.name || ""}
            authorId={authorId}
          />
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
          {/* Placeholder for future features */}
        </Box>
      </Box>
    </Box>
  );
};

export default ResearcherProfilePage;
