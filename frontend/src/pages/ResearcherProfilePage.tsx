import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ProfileHeader from "../components/ProfileHeader";
import AwardsCard from "../components/AwardsCard";
import VenuesCard, { VenueData } from "../components/VenuesCard";
import CommonTopicsCard, { CommonTopicStats } from "../components/CommonTopicsCard";
import Filters, { FilterState } from "../components/Filters";
import StatisticsCard from "../components/StatisticsCard";
import CoauthorsSection from "../components/CoauthorsSection";
import { ResearchersWork } from "../components/ResearchersWork";
import { useResearcherProfileQuery } from "../react-query/useAuthorDetailsQuery";
import { getCoreRanking } from "../utilities/coreRankings";
import { useParams } from "react-router-dom";

/** Minimal shape for each paper (adjust as needed) */
interface Paper {
  id?: string; // unique id from API, if available
  title: string;
  year: number;
  venue?: string;
  citations?: number;
  authors: { id?: string; name: string }[];
  topics?: (string | number)[];
  url?: string;
}

interface Coauthor {
  name: string;
  pid: string;
  publicationsTogether: number;
}

const ResearcherProfilePage: React.FC = () => {
  const { pid } = useParams<{ pid: string }>();
  const encodedPid = pid ? encodeURIComponent(pid) : "";

  // Universal filter state
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    startYear: null,
    endYear: null,
    venues: [],
    coreRanking: null,
    sort: null,
  });

  // Filtered papers
  const [filteredPapers, setFilteredPapers] = useState<Paper[]>([]);

  // Derived data: venues, coauthors, topics
  const [venues, setVenues] = useState<VenueData[]>([]);
  const [coauthors, setCoauthors] = useState<Coauthor[]>([]);
  const [topics, setTopics] = useState<CommonTopicStats[]>([]);

  // For year-based filtering
  const [minYear, setMinYear] = useState<number | null>(null);
  const [maxYear, setMaxYear] = useState<number | null>(null);
  const [availableVenues, setAvailableVenues] = useState<string[]>([]);

  // Fetch the researcher profile data
  const {
    data: researcherProfile,
    isLoading: loadingProfile,
    isError: errorProfile,
  } = useResearcherProfileQuery(encodedPid);

  // When profile data arrives, compute min/max years and available venues.
  useEffect(() => {
    if (!researcherProfile?.papers?.length) {
      setMinYear(null);
      setMaxYear(null);
      setAvailableVenues([]);
      return;
    }
    const years = researcherProfile.papers.map((p: Paper) => p.year);
    setMinYear(Math.min(...years));
    setMaxYear(Math.max(...years));

    const venueSet = new Set<string>();
    researcherProfile.papers.forEach((p: Paper) => {
      if (p.venue) {
        venueSet.add(p.venue);
      }
    });
    setAvailableVenues(Array.from(venueSet));
  }, [researcherProfile]);

  // Filter the papers based on activeFilters
  useEffect(() => {
    if (!researcherProfile?.papers?.length) {
      setFilteredPapers([]);
      return;
    }
    let temp = [...researcherProfile.papers];

    // Filter by year range if both start and end are selected
    if (activeFilters.startYear !== null && activeFilters.endYear !== null) {
      temp = temp.filter(
        (paper) =>
          paper.year >= activeFilters.startYear! &&
          paper.year <= activeFilters.endYear!
      );
    }

    // Filter by venue
    if (activeFilters.venues.length > 0) {
      temp = temp.filter(
        (paper) => paper.venue && activeFilters.venues.includes(paper.venue)
      );
    }

    // Filter by core ranking using getCoreRanking
    if (activeFilters.coreRanking) {
      temp = temp.filter((paper) => {
        const rank = getCoreRanking(paper.venue);
        return rank === activeFilters.coreRanking;
      });
    }

    // Sorting by year
    if (activeFilters.sort === "Newest") {
      temp.sort((a, b) => b.year - a.year);
    } else if (activeFilters.sort === "Oldest") {
      temp.sort((a, b) => a.year - b.year);
    }

    setFilteredPapers(temp);
  }, [researcherProfile, activeFilters]);

  // Derive venues, coauthors, and topics from filteredPapers
  useEffect(() => {
    if (!filteredPapers.length) {
      setVenues([]);
      setCoauthors([]);
      setTopics([]);
      return;
    }

    // Venues: count occurrences and get core ranking
    const venueMap: Record<string, { count: number; rank?: string }> = {};
    filteredPapers.forEach((p: Paper) => {
      if (p.venue) {
        const rank = getCoreRanking(p.venue);
        if (!venueMap[p.venue]) {
          venueMap[p.venue] = { count: 0, rank };
        }
        venueMap[p.venue].count++;
      }
    });
    const newVenues: VenueData[] = Object.entries(venueMap).map(([name, data]) => ({
      name,
      count: data.count,
      coreRank: data.rank || "",
    }));
    setVenues(newVenues);

    // Coauthors: count publications per coauthor
    const coauthorMap: Record<string, Coauthor> = {};
    filteredPapers.forEach((paper: Paper) => {
      paper.authors.forEach((author) => {
        if (author.id !== pid) {
          const key = author.id || author.name;
          if (!coauthorMap[key]) {
            coauthorMap[key] = {
              name: author.name,
              pid: author.id || "",
              publicationsTogether: 0,
            };
          }
          coauthorMap[key].publicationsTogether++;
        }
      });
    });
    setCoauthors(Object.values(coauthorMap));

    // Topics: count keywords
    const topicMap: Record<string, number> = {};
    filteredPapers.forEach((paper: Paper) => {
      paper.topics?.forEach((topic) => {
        const topicString = topic.toString();
        if (!topicMap[topicString]) topicMap[topicString] = 0;
        topicMap[topicString]++;
      });
    });
    const sortedTopics = Object.entries(topicMap).sort((a, b) => b[1] - a[1]);
    const finalTopics: CommonTopicStats[] = sortedTopics.map(([name, count]) => ({ [name]: count }));
    setTopics(finalTopics);
  }, [filteredPapers, pid]);

  // When filters change, update the active filters.
  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
  };

  // Handle loading and error states.
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
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4" color="error">
          Failed to fetch researcher profile. Please try again later.
        </Typography>
      </Box>
    );
  }

  // Compute total citations (fallback using each paper's citations)
  const computedCitations = filteredPapers.reduce((acc: number, paper: Paper) => {
    return acc + (paper.citations !== undefined ? paper.citations : 0);
  }, 0);

  const statistics = {
    papers: researcherProfile?.totalPapers || filteredPapers.length,
    citations: researcherProfile?.totalCitations || computedCitations,
    hIndex: researcherProfile?.hIndex || 0,
    gIndex: researcherProfile?.gIndex || 0,
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      {/* Filters */}
      <Filters
        onFilterChange={handleFilterChange}
        minYear={minYear}
        maxYear={maxYear}
        availableVenues={availableVenues}
      />

      {/* Profile Header */}
      <ProfileHeader
        author={researcherProfile?.name || "Unknown Author"}
        profileUrl={`https://dblp.org/pid/${pid}`}
        affiliations={
          researcherProfile?.affiliations?.join(", ") ||
          "Affiliations not available"
        }
        addToCompare={() =>
          console.log(`Add to Compare Clicked for ${researcherProfile?.name}`)
        }
        isSelected={false}
      />

      {/* Main Layout */}
      <Box sx={{ display: "flex", gap: 4, marginTop: 4 }}>
        {/* Left Column */}
        <Box sx={{ width: "25%", display: "flex", flexDirection: "column", gap: 2 }}>
          <AwardsCard />
          <VenuesCard venues={venues} />
          <CommonTopicsCard topics={topics} />
        </Box>

        {/* Center Column */}
        <Box sx={{ width: "50%" }}>
          <ResearchersWork
            author={researcherProfile?.name || ""}
            authorId={pid}
            publications={
              researcherProfile?.papers?.map((paper: Paper, index: number) => ({
                id: paper.id || `${paper.title}-${paper.year}-${index}`,
                ...paper,
                url: paper.url || "",
                authors: paper.authors || [],
                citationCount: paper.citations ?? 0,
                topics: paper.topics?.map(topic => topic.toString()) || [],
              })) || []
            }
            filters={undefined}
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