import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Define structure for a researcher's profile
export interface ResearcherProfileResponse {
  name: string;
  affiliations: string[];
  hIndex: number;
  gIndex: number;
  totalPapers?: number;
  totalCitations?: number;
  venues: { name: string; count: number; coreRank: string }[];
  coauthors: { name: string; publicationsTogether: number }[];
  publications: {
    title: string;
    year: number;
    venue: string;
    coreRank?: string;
    citations?: number;
    topics?: string[];
    authors: { name: string }[];
    links?: string[];
    abstract?: string;
    isPreprint: boolean;
  }[];
}

// **Fetch Researcher Profile**
const fetchResearcherProfile = async (name: string): Promise<ResearcherProfileResponse> => {
  if (!name) throw new Error("Author name is required");
  const encodedName = encodeURIComponent(name);
  const response = await axios.get(`http://127.0.0.1:8000/api/researcher-profile/?author_name=${encodedName}`);
  return response.data;
};

// **React Query Hook for Researcher Profile**
export const useResearcherProfileQuery = (name: string) => {
  const queryClient = useQueryClient();

  // Fetch Profile Data
  const { data: profile, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["researcherProfile", name],
    queryFn: () => fetchResearcherProfile(name),
    enabled: !!name, // Only fetch if name exists
    staleTime: 0,
  });

  // Compute Total Papers
  const totalPapers = profile?.publications?.length ?? 0;

  // Compute Total Citations
  const totalCitations = React.useMemo(() => {
    return profile?.publications?.reduce((sum, pub) => sum + (pub.citations ?? 0), 0) ?? 0;
  }, [profile?.publications]);

  // **🔹 Fix Coauthors Extraction**
  const coauthorCounts = React.useMemo(() => {
    if (!profile?.publications || !Array.isArray(profile.publications)) return [];

    const coauthorMap = profile.publications.reduce<Record<string, number>>(
      (acc, pub) => {
        if (Array.isArray(pub.authors)) {
          pub.authors.forEach((author) => {
            const coauthorName = author.name.trim(); // Ensure clean name
            if (coauthorName && coauthorName !== name) {
              acc[coauthorName] = (acc[coauthorName] || 0) + 1;
            }
          });
        }
        return acc;
      },
      {}
    );

    return Object.entries(coauthorMap)
      .map(([coauthorName, publicationsTogether]) => ({
        name: coauthorName,
        publicationsTogether,
      }))
      .sort((a, b) => b.publicationsTogether - a.publicationsTogether); // Sort by most collaborations
  }, [profile?.publications, name]);

  return {
    profile: profile
      ? { ...profile, totalPapers, totalCitations, coauthors: coauthorCounts }
      : undefined,
    isLoading,
    isFetching,
    isError,
    refetch,
  };
};
