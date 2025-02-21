import React, { useState, useEffect } from "react";
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
<<<<<<< HEAD
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
} from "@mui/lab";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";

interface Affiliation {
  institution: string;
  position: string;
  start_year: string;
  end_year: string;
}

const ResearcherProfilePage: React.FC = () => {
  const location = useLocation();
  const { state } = location;
  const { author, profileUrl } = state || {};

  const [affiliationData, setAffiliationData] = useState<Affiliation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch affiliation data
  useEffect(() => {
    const fetchAffiliations = async () => {
      if (!author) return;
      try {
        setIsLoading(true);
        const response = await axios.get("http://127.0.0.1:8000/api/dblp-search/", { params: { query: author } });
        const resultData = response.data.result;

        if (resultData && resultData.hits && resultData.hits.hit) {
          const hits = resultData.hits.hit;
          const affiliations: Affiliation[] = [];

          hits.forEach((hit: any) => {
            const notes = hit.info.notes?.note || [];
            notes.forEach((note: any) => {
              if (note["@type"] === "affiliation") {
                affiliations.push({
                  institution: note.text,
                  position: "Researcher",
                  start_year: "Unknown",
                  end_year: "Unknown",
                });
              }
            });
          });

          setAffiliationData(affiliations);
        } else {
          setAffiliationData([]);
        }
      } catch (err) {
        console.error("Error fetching affiliation data:", err);
        setError("Failed to fetch affiliations.");
      } finally {
        setIsLoading(false);
      }
    };
=======
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
>>>>>>> origin/bagas_branch

    fetchAffiliations();
  }, [author]);

<<<<<<< HEAD
  if (!author || !profileUrl) {
=======
  if (!pid) {
>>>>>>> origin/bagas_branch
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4" color="error">
          Researcher profile data is missing!
        </Typography>
      </Box>
    );
  }

<<<<<<< HEAD
  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      {/* Filters */}
      <Filters onFilterChange={(filters: any) => console.log(filters)} />
  
      {/* Profile Header */}
      <ProfileHeader
        author={author}
        profileUrl={profileUrl}
        affiliations="Affiliation data available below"
        addToCompare={() => console.log("Add to Compare Clicked")}
        isSelected={false}
      />
  
      {/* Main Layout */}
      <Box sx={{ display: "flex", gap: 4, marginTop: 4 }}>
        {/* Left Column */}
        <Box sx={{ width: "25%", display: "flex", flexDirection: "column", gap: 2 }}>
          <AwardsCard />
          <Box sx={{ marginTop: 2, padding: 2, backgroundColor: "#ffffff", borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h5" sx={{ marginBottom: 2, color: "#1976d2" }}>
              Affiliations Over Time
            </Typography>
            {isLoading ? (
              <Box sx={{ textAlign: "center", padding: 2 }}>
                <CircularProgress />
                <Typography>Loading affiliations...</Typography>
              </Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : affiliationData.length > 0 ? (
              <Timeline sx={{ margin: 0, padding: 0 }}>
                {affiliationData.map((affiliation, index) => (
                  <TimelineItem key={index}>
                    <TimelineSeparator>
                      <TimelineDot color="primary" />
                      {index < affiliationData.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Box sx={{ backgroundColor: "#f5f5f5", padding: 2, borderRadius: 1 }}>
                        <Typography variant="h6">{affiliation.institution}</Typography>
                        <Typography variant="body2">
                          {affiliation.position} ({affiliation.start_year} - {affiliation.end_year})
                        </Typography>
                      </Box>
                    </TimelineContent>
                  </TimelineItem>
                ))}              </Timeline>
            ) : (
              <Typography>No affiliations found for this researcher.</Typography>
            )}
          </Box>
        </Box>
  
        {/* Middle Column */}
        <Box sx={{ width: "50%" }}>
          <ResearchersWork author={author} />
        </Box>
  
        {/* Right Column */}
        <Box sx={{ width: "25%", display: "flex", flexDirection: "column", gap: 2 }}>
          <StatisticsCard author={author} />
          <CoauthorsList author={author} />
=======
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
          <ResearchersWork author={researcherProfile?.name || ""} authorId={pid} publications={publications} />
        </Box>
        <Box sx={{ width: "25%", display: "flex", flexDirection: "column", gap: 2 }}>
          <StatisticsCard author={statistics} />
          <CoauthorsSection coauthors={coauthors} />
>>>>>>> origin/bagas_branch
        </Box>
      </Box>
    </Box>
  );
};
export default ResearcherProfilePage;