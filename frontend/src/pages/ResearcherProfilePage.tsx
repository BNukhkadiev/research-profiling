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
import { useAuthorDetailsQuery } from "../react-query/useAuthorDetailsQuery";
import { usePublicationsQuery } from "../react-query/usePublicationsQuery";

interface VenueData {
  name: string;
  papers: number;
  ranking?: string;
}

interface Coauthor {
  name: string;
  id: string;
}

const ResearcherProfilePage: React.FC = () => {
  const { authorId, affiliation } = useParams<{ authorId: string; affiliation?: string }>();
  const decodedAffiliation = affiliation ? decodeURIComponent(affiliation) : undefined;

  const [activeFilters, setActiveFilters] = useState({});
  const [venues, setVenues] = useState<VenueData[]>([]);
  const [coauthors, setCoauthors] = useState<Coauthor[]>([]);

  // Fetch author details
  const {
    data: authorDetails,
    isLoading: loadingAuthorDetails,
    isError: errorAuthorDetails,
    error: authorDetailsError,
  } = useAuthorDetailsQuery(authorId || "");

  // Fetch publications
  const {
    data: publications = [],
    isLoading: loadingPublications,
    isError: errorPublications,
  } = usePublicationsQuery(authorId || "");

  // Extract venues from publications and compute counts/rankings
  useEffect(() => {
    if (publications.length > 0) {
      const venueMap: Record<string, { papers: number; ranking?: string }> = {};
      publications.forEach((pub) => {
        if (pub.venue) {
          if (!venueMap[pub.venue]) {
            venueMap[pub.venue] = { papers: 0, ranking: getVenueRanking(pub.venue) };
          }
          venueMap[pub.venue].papers += 1;
        }
      });

      const venueData: VenueData[] = Object.entries(venueMap).map(([name, data]) => ({
        name,
        papers: data.papers,
        ranking: data.ranking,
      }));

      setVenues(venueData);
    }
  }, [publications]);

  // Extract coauthors from publications
  useEffect(() => {
    if (publications.length > 0) {
      const coauthorMap: Record<string, Coauthor> = {};

      publications.forEach((publication) => {
        publication.authors.forEach((author) => {
          if (author.id !== authorId) {
            // Ensure we don't include the current researcher as their own coauthor
            coauthorMap[author.id] = { name: author.name, id: author.id };
          }
        });
      });

      const coauthorData = Object.values(coauthorMap);
      setCoauthors(coauthorData);
    }
  }, [publications, authorId]);

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

  if (!authorId) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4" color="error">
          Researcher ID is missing!
        </Typography>
      </Box>
    );
  }

  if (loadingAuthorDetails || loadingPublications) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4">Loading data...</Typography>
      </Box>
    );
  }

  if (errorAuthorDetails || errorPublications) {
    console.error("Error fetching data:", authorDetailsError);

    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4" color="error">
          Failed to fetch data. Please try again later.
        </Typography>
      </Box>
    );
  }

  // Prepare data for the StatisticsCard
  const statistics = {
    papers: authorDetails?.paperCount || 0,
    citations: authorDetails?.citationCount || 0,
    hIndex: authorDetails?.hIndex || 0,
    gIndex: authorDetails?.gIndex || 0, // Assuming gIndex is part of authorDetails; add/remove as necessary
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      {/* Filters */}
      <Filters onFilterChange={handleFilterChange} />

      {/* Profile Header */}
      <ProfileHeader
        author={authorDetails?.name || "Unknown Author"}
        profileUrl={authorDetails?.url || ""}
        affiliations={
          decodedAffiliation || authorDetails?.affiliations?.join(", ") || "Affiliations not available"
        }
        addToCompare={() =>
          console.log(`Add to Compare Clicked for ${authorDetails?.name}`)
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
          <CommonTopicsCard />
        </Box>

        {/* Middle Column */}
        <Box sx={{ width: "50%" }}>
          <ResearchersWork
            author={authorDetails?.name || ""}
            authorId={authorId}
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
