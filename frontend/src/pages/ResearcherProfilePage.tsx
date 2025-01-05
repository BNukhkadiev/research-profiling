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

const ResearcherProfilePage: React.FC = () => {
  const location = useLocation();
  const { state } = location;
  const { author, profileUrl } = state || {};

  const [affiliationData, setAffiliationData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch affiliation data
  useEffect(() => {
    const fetchAffiliations = async () => {
      if (!author) return;
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/researchers/${author}/affiliations/`);
        setAffiliationData(response.data.affiliations || []);
      } catch (err) {
        console.error("Error fetching affiliation data:", err);
        setError("Failed to fetch affiliations.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAffiliations();
  }, [author]);

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
        <Box sx={{ width: "25%", display: "flex", flexDirection: "column", gap: 2 }}>
          <AwardsCard />
          <VenuesCard />
          <CommonTopicsCard />
        </Box>
        <Box sx={{ width: "50%" }}>
          <ResearchersWork author={author} />
        </Box>

        <Box sx={{ width: "25%", display: "flex", flexDirection: "column", gap: 2 }}>
          <StatisticsCard author={author} />
          <CoauthorsList author={author} />
        </Box>
      </Box>

      {/* Affiliation Timeline Section */}
      <Box sx={{ marginTop: 4, padding: 2, backgroundColor: "#ffffff", borderRadius: 2, boxShadow: 1 }}>
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
          <Timeline>
            {affiliationData.map((affiliation: { institution: string; position?: string; start_year: string; end_year?: string }, index) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot color="primary" />
                  {index < affiliationData.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Box sx={{ backgroundColor: "#f5f5f5", padding: 2, borderRadius: 1 }}>
                    <Typography variant="h6">{affiliation.institution}</Typography>
                    <Typography variant="body2">
                      {affiliation.position || "Position not available"} (
                      {affiliation.start_year} - {affiliation.end_year || "Present"})
                    </Typography>
                  </Box>
                </TimelineContent>
              </TimelineItem>
            ))}          </Timeline>
        ) : (
          <Typography>No affiliations found for this researcher.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default ResearcherProfilePage;