import React, { useState, useEffect } from "react";
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
import { useResearcherProfileQuery } from "../react-query/useAuthorDetailsQuery";

interface VenueData {
  name: string;
  papers: number;
  ranking?: string;
}

interface Coauthor {
  name: string;
  pid: string;
}

const ResearcherProfilePage: React.FC = () => {
  const { pid } = useParams<{ pid: string }>();
  const encodedPid = pid ? encodeURIComponent(pid) : ""; // Ensure proper encoding

  const [activeFilters, setActiveFilters] = useState({});
  const [venues, setVenues] = useState<VenueData[]>([]);
  const [coauthors, setCoauthors] = useState<Coauthor[]>([]);
  const [topics, setTopics] = useState<{ [key: string]: number }[]>([]);

  // Fetch researcher profile
  const {
    data: researcherProfile,
    isLoading: loadingProfile,
    isError: errorProfile,
  } = useResearcherProfileQuery(encodedPid);

  // Extract venues and compute counts/rankings
  useEffect(() => {
    if (researcherProfile?.venues) {
      const venueData: VenueData[] = researcherProfile.venues.map((venue) => {
        const [venueName, paperCount] = Object.entries(venue)[0];
        return {
          name: venueName,
          papers: paperCount as number,
          ranking: getVenueRanking(venueName),
        };
      });

      setVenues(venueData);
    }
  }, [researcherProfile]);

  // Extract coauthors
  useEffect(() => {
    if (researcherProfile?.coauthors) {
      setCoauthors(researcherProfile.coauthors);
    }
  }, [researcherProfile]);

  // Extract topics
  useEffect(() => {
    if (researcherProfile?.topics) {
      setTopics(researcherProfile.topics);
    }
  }, [researcherProfile]);

  // Function to fetch ranking data (replace with actual logic if available)
  const getVenueRanking = (venue: string): string | undefined => {
    const rankings = {
      ICML: "A*",
      NeurIPS: "A",
      "Journal of Web Semantics": "B",
      "IEEE Computer": "C",
    };
    return Object.entries(rankings).find(([key]) => venue.includes(key))?.[1];
  };

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
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

  if (loadingProfile) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4">Loading data...</Typography>
      </Box>
    );
  }

  if (errorProfile) {
    console.error("Error fetching researcher profile:", errorProfile);

    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4" color="error">
          Failed to fetch researcher profile. Please try again later.
        </Typography>
      </Box>
    );
  }

  // Prepare statistics for StatisticsCard
  const statistics = {
    papers: researcherProfile?.totalPapers || 0,
    citations: researcherProfile?.totalCitations || 0,
    hIndex: researcherProfile?.hIndex || 0,
    gIndex: researcherProfile?.gIndex || 0,
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      {/* Filters */}
      <Filters onFilterChange={handleFilterChange} />

      {/* Profile Header */}
      <ProfileHeader
        author={researcherProfile?.name || "Unknown Author"}
        profileUrl={`https://dblp.org/pid/${pid}`} // Construct DBLP profile URL
        affiliations={
          researcherProfile?.affiliations?.join(", ") || "Affiliations not available"
        }
        addToCompare={() =>
          console.log(`Add to Compare Clicked for ${researcherProfile?.name}`)
        }
        isSelected={false} // Example: Update state if dynamic selection is needed
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
          <VenuesCard venues={venues} />
          <CommonTopicsCard topics={topics} />
        </Box>

        {/* Middle Column */}
        <Box sx={{ width: "50%" }}>
          <ResearchersWork
            author={researcherProfile?.name || ""}
            authorId={pid}
            filters={activeFilters}
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
          <StatisticsCard author={statistics} />
          <CoauthorsSection coauthors={coauthors} />
        </Box>
      </Box>
    </Box>
  );
};

export default ResearcherProfilePage;
