import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ProfileHeader from "../components/ProfileHeader";
import AwardsCard from "../components/AwardsCard";
import VenuesCard, { VenueData } from "../components/VenuesCard";
import CommonTopicsCard, {CommonTopicStats} from "../components/CommonTopicsCard";
import Filters, { FilterState } from "../components/Filters";
import StatisticsCard from "../components/StatisticsCard";
import CoauthorsSection from "../components/CoauthorsSection";
import { ResearchersWork } from "../components/ResearchersWork";
import { useResearcherProfileQuery } from "../react-query/useAuthorDetailsQuery";
// If you have a dictionary-based ranking, import getCoreRanking
import { getCoreRanking } from "../utilities/coreRankings";

/** Minimal shape for each "Paper" from the API. Adjust as needed. */
interface Paper {
  [x: string]: any;
  title: string;
  year: number;
  venue?: string;
  // etc...
}

interface Coauthor {
  name: string;
  pid: string;
  publicationsTogether: number;
}

const ResearcherProfilePage: React.FC = () => {
  const { pid } = useParams<{ pid: string }>();
  const encodedPid = pid ? encodeURIComponent(pid) : "";

  // 1) universal filter state
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    startYear: null,
    endYear: null,
    venues: [],
    coreRanking: null,
    sort: null,
  });

  // 2) final filtered list of papers
  const [filteredPapers, setFilteredPapers] = useState<Paper[]>([]);

  // derived data from the filtered set
  const [venues, setVenues] = useState<VenueData[]>([]);
  const [coauthors, setCoauthors] = useState<Coauthor[]>([]);
  const [topics, setTopics] = useState<CommonTopicStats[]>([]);

  // For bounding year filter
  const [minYear, setMinYear] = useState<number | null>(null);
  const [maxYear, setMaxYear] = useState<number | null>(null);
  const [availableVenues, setAvailableVenues] = useState<string[]>([]);

  // 3) fetch the researcher profile
  const {
    data: researcherProfile,
    isLoading: loadingProfile,
    isError: errorProfile,
  } = useResearcherProfileQuery(encodedPid);

  // We assume researcherProfile?.papers is our main array
  // We'll do bounding date logic on that.

  /** A) Once we have `researcherProfile` or `papers`, define minYear, maxYear, availableVenues. */
  useEffect(() => {
    if (!researcherProfile?.papers?.length) {
      setMinYear(null);
      setMaxYear(null);
      setAvailableVenues([]);
      return;
    }
    const years = researcherProfile.papers.map((p) => p.year);
    setMinYear(Math.min(...years));
    setMaxYear(Math.max(...years));

    const venueSet = new Set<string>();
    researcherProfile.papers.forEach((p) => {
      if (p.venue) {
        venueSet.add(p.venue);
      }
    });
    setAvailableVenues(Array.from(venueSet));
  }, [researcherProfile]);

  /** B) Filter logic: from `researcherProfile?.papers` => filteredPapers */
  useEffect(() => {
    if (!researcherProfile?.papers?.length) {
      setFilteredPapers([]);
      return;
    }
    let temp = [...researcherProfile.papers];

    // 1) year-based filter
    if (activeFilters.startYear !== null && activeFilters.endYear !== null) {
      temp = temp.filter(
        (paper) =>
          paper.year >= activeFilters.startYear! &&
          paper.year <= activeFilters.endYear!
      );
    }

    // 2) venue filter
    if (activeFilters.venues.length > 0) {
      temp = temp.filter(
        (paper) => paper.venue && activeFilters.venues.includes(paper.venue)
      );
    }

    // 3) core ranking filter (if you want dictionary-based approach)
    if (activeFilters.coreRanking) {
      temp = temp.filter((paper) => {
        const rank = getCoreRanking(paper.venue);
        return rank === activeFilters.coreRanking;
      });
    }

    // 4) sort
    if (activeFilters.sort === "Newest") {
      temp.sort((a, b) => b.year - a.year);
    } else if (activeFilters.sort === "Oldest") {
      temp.sort((a, b) => a.year - b.year);
    }

    setFilteredPapers(temp);
  }, [researcherProfile, activeFilters]);

  /** C) Derive Venues, Coauthors, Topics from filteredPapers */
  useEffect(() => {
    if (!filteredPapers.length) {
      setVenues([]);
      setCoauthors([]);
      setTopics([]);
      return;
    }

    // 1) venues
    const venueMap: Record<string, { count: number; rank?: string }> = {};
    filteredPapers.forEach((p) => {
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
      coreRank: data.rank || '',
    }));
    setVenues(newVenues);

    // 2) coauthors
    const coauthorMap: Record<string, Coauthor> = {};
    filteredPapers.forEach((paper) => {
      // if each paper has authors with { name, id }, do:
      paper.authors.forEach((author: { id: string | undefined; name: any; }) => {
        if (author.id !== pid) {
          const coKey = author.id || author.name;
          if (!coauthorMap[coKey]) {
            coauthorMap[coKey] = {
              name: author.name,
              pid: author.id || "",
              publicationsTogether: 0,
            };
          }
          coauthorMap[coKey].publicationsTogether++;
        }
      });
    });
    setCoauthors(Object.values(coauthorMap));

    // 3) topics
    const topicMap: Record<string, number> = {};
    filteredPapers.forEach((paper) => {
      // if paper has paper.topics = string[]
      paper.topics?.forEach((topic: string | number) => {
        if (!topicMap[topic]) topicMap[topic] = 0;
        topicMap[topic]++;
      });
    });
    const sortedTopics = Object.entries(topicMap).sort((a, b) => b[1] - a[1]);
    const finalTopics: CommonTopicStats[] = sortedTopics.map(([name, count]) => ({ [name]: count }));
    setTopics(finalTopics);
  }, [filteredPapers, pid]);
  /** D) handle filter changes from <Filters> */
  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
  };

  // loading / error states
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

  // example stats
  const statistics = {
    papers: researcherProfile?.totalPapers || filteredPapers.length,
    citations: researcherProfile?.totalCitations || 0,
    hIndex: researcherProfile?.hIndex || 0,
    gIndex: researcherProfile?.gIndex || 0,
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      {/* universal Filters */}
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

      {/* Layout: 3 columns */}
      <Box sx={{ display: "flex", gap: 4, marginTop: 4 }}>
        {/* Left Column */}
        <Box sx={{ width: "25%", display: "flex", flexDirection: "column", gap: 2 }}>
          <AwardsCard />
          {/* We pass derived `venues` from filteredPapers */}
          <VenuesCard venues={venues} />
          {/* We pass derived `topics` from filteredPapers */}
          <CommonTopicsCard topics={topics} />
        </Box>

        {/* Center Column */}
        <Box sx={{ width: "50%" }}>
          {/* We pass final filteredPapers to <ResearchersWork> */}
          <ResearchersWork
            author={researcherProfile?.name || ""}
            authorId={pid}
            publications={filteredPapers.map(paper => ({
              ...paper,
              url: paper.url || '',
              authors: paper.authors || []
            }))} filters={undefined}          />
        </Box>

        {/* Right Column */}
        <Box sx={{ width: "25%", display: "flex", flexDirection: "column", gap: 2 }}>
          <StatisticsCard author={statistics} />
          {/* We pass derived `coauthors` from filteredPapers */}
          <CoauthorsSection coauthors={coauthors} />
        </Box>
      </Box>
    </Box>
  );
};

export default ResearcherProfilePage;
