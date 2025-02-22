import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { useAuthorDetailsQuery } from "../react-query/useAuthorDetailsQuery";
import { usePublicationsQuery } from "../react-query/usePublicationsQuery";
import ProfileHeader from "../components/ProfileHeader";
import AwardsCard from "../components/AwardsCard";
import VenuesCard from "../components/VenuesCard";
import CommonTopicsCard from "../components/CommonTopicsCard";
import Filters, { FilterState } from "../components/Filters";
import StatisticsCard from "../components/StatisticsCard";
import CoauthorsSection from "../components/CoauthorsSection";
import { getCoreRanking } from "../utilities/coreRankings";
import ResearchersWork from "../components/ResearchersWork";

// Example interfaces
interface Publication {
  url: string;
  title: string;
  year: number;
  venue?: string;
  citationCount?: number;
  topics?: string[];
  authors: { name: string; id?: string }[];
}

interface Coauthor {
  name: string;
  id: string;
}

interface VenueData {
  name: string;
  papers: number;
  ranking?: string;
}

const ResearcherProfilePage: React.FC = () => {
  const { authorId } = useParams<{ authorId?: string }>();
  const safeAuthorId = authorId ?? "UnknownAuthor";

  // 1) Fetch author details
  const {
    data: authorDetails,
    isLoading: loadingAuthorDetails,
    isError: errorAuthorDetails,
  } = useAuthorDetailsQuery(safeAuthorId);

  // 2) Fetch all publications
  const {
    data: allPublications = [],
    isLoading: loadingPublications,
    isError: errorPublications,
  } = usePublicationsQuery<Publication[]>(safeAuthorId);

  // For bounding the year-based filter
  const [minYear, setMinYear] = useState<number | null>(null);
  const [maxYear, setMaxYear] = useState<number | null>(null);

  // For dynamic venue filter
  const [availableVenues, setAvailableVenues] = useState<string[]>([]);

  // The user's chosen filters
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    startYear: null,
    endYear: null,
    venues: [],
    coreRanking: null,
    sort: null,
  });

  // Filtered publications
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);

  // Derived data
  const [venues, setVenues] = useState<VenueData[]>([]);
  const [coauthors, setCoauthors] = useState<Coauthor[]>([]);
  const [commonTopics, setCommonTopics] = useState<string[]>([]);

  // A) minYear, maxYear, availableVenues
  useEffect(() => {
    if (!allPublications.length) {
      setMinYear(null);
      setMaxYear(null);
      setAvailableVenues([]);
      return;
    }
    const years = allPublications.map((p) => p.year);
    setMinYear(Math.min(...years));
    setMaxYear(Math.max(...years));

    const venueSet = new Set<string>();
    allPublications.forEach((pub) => {
      if (pub.venue) {
        venueSet.add(pub.venue);
      }
    });
    setAvailableVenues(Array.from(venueSet));
  }, [allPublications]);

  // B) Filter logic
  useEffect(() => {
    if (!allPublications.length) {
      setFilteredPublications([]);
      return;
    }
    let temp = [...allPublications];

    // 1) Year-based filter
    if (activeFilters.startYear !== null && activeFilters.endYear !== null) {
      temp = temp.filter(
        (pub) => pub.year >= activeFilters.startYear! && pub.year <= activeFilters.endYear!
      );
    }

    // 2) Venues
    if (activeFilters.venues.length > 0) {
      temp = temp.filter(
        (pub) => pub.venue && activeFilters.venues.includes(pub.venue)
      );
    }

    // 3) Core ranking
    if (activeFilters.coreRanking) {
      temp = temp.filter((pub) => {
        const rank = getCoreRanking(pub.venue);
        return rank === activeFilters.coreRanking;
      });
    }

    // 4) Sort
    if (activeFilters.sort === "Newest") {
      temp.sort((a, b) => b.year - a.year);
    } else if (activeFilters.sort === "Oldest") {
      temp.sort((a, b) => a.year - b.year);
    }

    setFilteredPublications(temp);
  }, [allPublications, activeFilters]);

  // C) Derive Venues, Coauthors, Topics
  useEffect(() => {
    if (!filteredPublications.length) {
      setVenues([]);
      setCoauthors([]);
      setCommonTopics([]);
      return;
    }

    const venueMap: Record<string, { papers: number; ranking?: string }> = {};
    const coauthorMap: Record<string, Coauthor> = {};
    const topicMap: Record<string, number> = {};

    filteredPublications.forEach((pub) => {
      // Venues
      if (pub.venue) {
        const rank = getCoreRanking(pub.venue);
        if (!venueMap[pub.venue]) {
          venueMap[pub.venue] = { papers: 0, ranking: rank };
        }
        venueMap[pub.venue].papers += 1;
      }

      // Coauthors
      pub.authors.forEach((author) => {
        if (author.id !== safeAuthorId) {
          const coKey = author.id || author.name;
          coauthorMap[coKey] = { name: author.name, id: coKey };
        }
      });

      // Topics
      if (pub.topics) {
        pub.topics.forEach((topic) => {
          if (!topicMap[topic]) topicMap[topic] = 0;
          topicMap[topic]++;
        });
      }
    });

    const newVenues = Object.entries(venueMap).map(([name, data]) => ({
      name,
      papers: data.papers,
      ranking: data.ranking,
    }));

    setVenues(newVenues);
    setCoauthors(Object.values(coauthorMap));

    const sortedTopics = Object.keys(topicMap).sort((a, b) => topicMap[b] - topicMap[a]);
    setCommonTopics(sortedTopics);
  }, [filteredPublications, safeAuthorId]);

  // D) Handle filter updates
  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
  };

  // Loading states
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
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4" color="error">
          Failed to load data.
        </Typography>
      </Box>
    );
  }

  // Example stats
  const statistics = {
    papers: authorDetails?.paperCount || filteredPublications.length,
    citations: authorDetails?.citationCount || 0,
    hIndex: authorDetails?.hIndex || 0,
    gIndex: 0,
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      {/* (Removed the second Mannheim View heading) */}

      {/* Profile Header */}
      <Box sx={{ padding: 4 }}>
        <ProfileHeader
          author={authorDetails?.name || "Unknown Author"}
          profileUrl={authorDetails?.url || ""}
          affiliations={authorDetails?.affiliations?.join(", ") || "No affiliation available"}
          addToCompare={() => console.log(`Add to Compare for ${authorDetails?.name}`)}
          isSelected={false}
        />
      </Box>

      {/* Filters */}
      <Box sx={{ paddingX: 4 }}>
        <Filters
          onFilterChange={handleFilterChange}
          minYear={minYear}
          maxYear={maxYear}
          availableVenues={availableVenues}
        />
      </Box>

      {/* 3 columns */}
      <Box sx={{ display: "flex", gap: 4, padding: 4 }}>
        {/* Left Column */}
        <Box sx={{ width: "25%", display: "flex", flexDirection: "column", gap: 2 }}>
          <AwardsCard />
          <VenuesCard venues={venues} />
          <CommonTopicsCard topics={commonTopics} />
        </Box>

        {/* Center Column: <ResearchersWork> with tabs for Publications, Repos, HuggingFace */}
        <Box sx={{ width: "50%" }}>
          <ResearchersWork
            author={authorDetails?.name || "Unknown Author"}
            authorId={safeAuthorId}
            filters={activeFilters}
            publications={filteredPublications}
          />
        </Box>

        {/* Right Column */}
        <Box sx={{ width: "25%", display: "flex", flexDirection: "column", gap: 2 }}>
          <StatisticsCard author={statistics} />
          <CoauthorsSection coauthors={coauthors} />
        </Box>
      </Box>
    </Box>
  );
};

export default ResearcherProfilePage;
