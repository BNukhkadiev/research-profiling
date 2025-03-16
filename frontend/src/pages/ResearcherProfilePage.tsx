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
  count: number;
  coreRank: string;
}

interface Coauthor {
  name: string;
  pid: string;
  publicationsTogether: number;
}

const ResearcherProfilePage: React.FC = () => {
  const { pid } = useParams<{ pid: string }>();
  const encodedPid = pid ? encodeURIComponent(pid) : "";

  const [activeFilters, setActiveFilters] = useState({});
  const [venues, setVenues] = useState<VenueData[]>([]);
  const [coauthors, setCoauthors] = useState<Coauthor[]>([]);
  const [topics, setTopics] = useState<{ name: string; count: number }[]>([]);
  const [publications, setPublications] = useState([]);

  const {
    data: researcherProfile,
    isLoading: loadingProfile,
    isError: errorProfile,
  } = useResearcherProfileQuery(encodedPid);

  useEffect(() => {
    if (researcherProfile?.venues) {
      setVenues(researcherProfile.venues);
    }
  }, [researcherProfile]);

  useEffect(() => {
    if (researcherProfile?.coauthors) {
      setCoauthors(researcherProfile.coauthors);
    }
  }, [researcherProfile]);

  useEffect(() => {
    if (researcherProfile?.topics) {
      setTopics(researcherProfile.topics);
    }
  }, [researcherProfile]);

  useEffect(() => {
    if (researcherProfile?.papers) {
      setPublications(researcherProfile.papers);
    }
  }, [researcherProfile]);

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

  const statistics = {
    papers: researcherProfile?.totalPapers ?? null,
    citations: researcherProfile?.totalCitations ?? null,
    hIndex: researcherProfile?.hIndex ?? null,
    gIndex: researcherProfile?.gIndex ?? null,
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      <Filters onFilterChange={handleFilterChange} />
      <ProfileHeader
        author={researcherProfile?.name || "Unknown Author"}
        profileUrl={`https://dblp.org/pid/${pid}`}
        affiliations={
          researcherProfile?.affiliations?.join(", ") || "Affiliations not available"
        }
        addToCompare={() =>
          console.log(`Add to Compare Clicked for ${researcherProfile?.name}`)
        }
        isSelected={false}
      />
      <Box sx={{ display: "flex", gap: 4, marginTop: 4 }}>
        <Box sx={{ width: "25%", display: "flex", flexDirection: "column", gap: 2 }}>
          <AwardsCard />
          <VenuesCard venues={venues} />
          <CommonTopicsCard topics={topics} />
        </Box>
        <Box sx={{ width: "50%" }}>
        <ResearchersWork
          author={researcherProfile?.name || ""}
          authorId={pid}
          affiliations={researcherProfile?.affiliations || []}  // <--- This is good
          publications={publications}
        />
        </Box>
        <Box sx={{ width: "25%", display: "flex", flexDirection: "column", gap: 2 }}>
          <StatisticsCard author={statistics} />
          <CoauthorsSection coauthors={coauthors} />
        </Box>
      </Box>
    </Box>
  );
};

export default ResearcherProfilePage;
