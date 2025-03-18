import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ProfileHeader from "../components/ProfileHeader";
import VenuesCard from "../components/VenuesCard";
import CommonTopicsCard from "../components/CommonTopicsCard";
import Filters from "../components/Filters";
import StatisticsCard from "../components/StatisticsCard";
import CoauthorsList from "../components/CoauthorsList";
import ResearchersWork from "../components/ResearchersWork";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useResearcherProfileQuery } from "../react-query/useAuthorDetailsQuery";
import {
  useComparisonResearchers,
  useAddResearcher,
  useRemoveResearcher,
} from "../react-query/useComparisonQuery";

const ResearcherProfilePage: React.FC = () => {
  const { name } = useParams<{ name?: string }>();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<{
    yearRange: [number, number] | null;
    venue: string[];
    coreRanking: string | null;
    sort: "asc" | "desc" | null;
  }>({
    yearRange: null,
    venue: [],
    coreRanking: null,
    sort: null,
  });

  const { profile: researcherProfile, isLoading, isError, refetch } = useResearcherProfileQuery(name || "");
  
  const {
    name: authorName = "Unknown Author",
    affiliations = [],
    publications = [],
    coauthors = [],
    totalPapers = 0,
    totalCitations = 0,
    hIndex = 0,
    gIndex = 0,
  } = researcherProfile || {};

  // Fetch comparison list
  const { comparisonList = [] } = useComparisonResearchers();
  const addResearcherMutation = useAddResearcher();
  const removeResearcherMutation = useRemoveResearcher();

  // Check if researcher is in comparison list
  const isSelected = comparisonList.includes(authorName);

  // Toggle researcher in comparison list with notification
  const handleToggleCompare = () => {
    if (isSelected) {
      removeResearcherMutation.mutate(authorName, {
        onSuccess: () => toast.error(`Removed ${authorName} from comparison list`),
      });
    } else {
      addResearcherMutation.mutate(authorName, {
        onSuccess: () => toast.success(`Added ${authorName} to comparison list`),
      });
    }
  };

  const availableVenues = [...new Set(publications.map((p) => p.venue).filter(Boolean))];

  // Apply filters to publications
  const filteredPublications = useMemo(() => {
    if (!Array.isArray(publications)) return [];

    let filtered = [...publications];

    if (filters.venue.length > 0) {
      filtered = filtered.filter((pub) => filters.venue.includes(pub.venue));
    }

    if (filters.coreRanking) {
      filtered = filtered.filter((pub) => pub.core_rank === filters.coreRanking);
    }

    if (filters.yearRange) {
      filtered = filtered.filter((pub) => pub.year >= filters.yearRange![0] && pub.year <= filters.yearRange![1]);
    }

    if (filters.sort) {
      filtered.sort((a, b) => (filters.sort === "asc" ? a.year - b.year : b.year - a.year));
    }

    return filtered;
  }, [publications, filters]);

  const totalFilteredCitations = useMemo(() => {
    return filteredPublications.reduce((sum, pub) => sum + (pub.citations ?? 0), 0);
  }, [filteredPublications]);

  const computeHIndex = (publications: { citations?: number }[]) => {
    const sortedCitations = publications
      .map((pub) => pub.citations ?? 0)
      .sort((a, b) => b - a);

    let h = 0;
    for (let i = 0; i < sortedCitations.length; i++) {
      if (sortedCitations[i] >= i + 1) {
        h = i + 1;
      } else {
        break;
      }
    }
    return h;
  };

  const computeGIndex = (publications: { citations?: number }[]) => {
    const sortedCitations = publications
      .map((pub) => pub.citations ?? 0)
      .sort((a, b) => b - a);

    let g = 0, citationSum = 0;
    for (let i = 0; i < sortedCitations.length; i++) {
      citationSum += sortedCitations[i];
      if (citationSum >= (i + 1) ** 2) {
        g = i + 1;
      } else {
        break;
      }
    }
    return g;
  };

  const filteredHIndex = useMemo(() => computeHIndex(filteredPublications), [filteredPublications]);
  const filteredGIndex = useMemo(() => computeGIndex(filteredPublications), [filteredPublications]);

  const statistics = {
    papers: filteredPublications.length,
    citations: totalFilteredCitations,
    hIndex: filteredHIndex,
    gIndex: filteredGIndex,
  };

  // Aggregate filtered venues
  const filteredVenues = useMemo(() => {
    const venueMap = filteredPublications.reduce<Record<string, { count: number; coreRank: string }>>(
      (acc, pub) => {
        if (pub.venue) {
          if (!acc[pub.venue]) {
            acc[pub.venue] = { count: 0, coreRank: pub.core_rank || "Unknown" };
          }
          acc[pub.venue].count += 1;
        }
        return acc;
      },
      {}
    );

    return Object.entries(venueMap).map(([name, data]) => ({
      name,
      count: data.count,
      coreRank: data.coreRank,
    }));
  }, [filteredPublications]);

  // ✅ FIX: Ensure topics update dynamically based on filtered publications
  const filteredTopics = useMemo(() => {
    const topicCounts = filteredPublications.reduce<Record<string, number>>((acc, pub) => {
      if (Array.isArray(pub.topics)) {
        pub.topics.forEach((topic) => {
          acc[topic] = (acc[topic] || 0) + 1;
        });
      }
      return acc;
    }, {});

    return Object.entries(topicCounts).map(([name, count]) => ({ name, count }));
  }, [filteredPublications]);

  // ✅ FIX: Ensure coauthors update dynamically based on filtered publications
  const filteredCoauthors = useMemo(() => {
    const coauthorCounts = filteredPublications.reduce<Record<string, number>>((acc, pub) => {
      if (Array.isArray(pub.coauthors)) {
        pub.coauthors.forEach((coauthor) => {
          acc[coauthor] = (acc[coauthor] || 0) + 1;
        });
      }
      return acc;
    }, {});

    return Object.entries(coauthorCounts).map(([name, publicationsTogether]) => ({
      name,
      publicationsTogether,
    }));
  }, [filteredPublications]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      <ToastContainer position="top-right" autoClose={3000} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <Filters onFilterChange={handleFilterChange} availableVenues={availableVenues} />
        {comparisonList.length > 0 && (
          <Button variant="contained" onClick={() => navigate("/compare-researchers")}>
            Go to Comparisons
          </Button>
        )}
      </Box>

      <ProfileHeader author={authorName} affiliations={affiliations.join(", ") || "Affiliations not available"} onToggleCompare={handleToggleCompare} isSelected={isSelected} />

      <Box sx={{ display: "flex", gap: 4, marginTop: 4 }}>
        <Box sx={{ width: "25%", display: "flex", flexDirection: "column", gap: 2 }}>
          <VenuesCard venues={filteredVenues} />
          <CommonTopicsCard topics={filteredTopics} />
        </Box>

        <Box sx={{ width: "50%", display: "flex", flexDirection: "column", gap: 2 }}>
          <ResearchersWork author={authorName} affiliations={affiliations} publications={filteredPublications} />
        </Box>

        <Box sx={{ width: "25%", display: "flex", flexDirection: "column", gap: 2 }}>
          <StatisticsCard author={statistics} />
          <CoauthorsList coauthors={filteredCoauthors} />
        </Box>
      </Box>
    </Box>
  );
};

export default ResearcherProfilePage;
