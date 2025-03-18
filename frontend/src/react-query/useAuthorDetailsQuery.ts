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
  coauthors: string[]; // ✅ Now expects a direct list from backend
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

// **Step 1: Fetch Researcher Profile**
const fetchResearcherProfile = async (name: string): Promise<ResearcherProfileResponse> => {
  const encodedName = encodeURIComponent(name);
  const response = await axios.get(`http://127.0.0.1:8000/api/researcher-profile/?author_name=${encodedName}`);
  return response.data;
};

// **Step 2: Fetch OpenAlex Data**
const fetchOpenAlexData = async (dois: string[]) => {
  if (dois.length === 0) return Promise.resolve();
  return axios.post("http://127.0.0.1:8000/api/open-alex/", { dois });
};

// **Step 3: Generate Topics (LLM)**
const generateTopics = async (dois: string[]) => {
  if (dois.length === 0) return Promise.resolve();
  return axios.post("http://127.0.0.1:8000/api/generate-topics/", { dois });
};

// **React Query Hook for Researcher Profile**
export const useResearcherProfileQuery = (name: string) => {
  const queryClient = useQueryClient();

  // **Fetch Profile First**
  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ["researcherProfile", name],
    queryFn: () => fetchResearcherProfile(name),
    enabled: !!name,
    staleTime: 5 * 60 * 1000,
  });

  // **Compute Total Papers**
  const totalPapers = profile?.publications?.length ?? 0;

  // **Compute Total Citations**
  const totalCitations = React.useMemo(() => {
    if (!profile?.publications) return 0;
    return profile.publications.reduce((sum, pub) => sum + (pub.citations ?? 0), 0);
  }, [profile?.publications]);

  // **Fix Venue Counting**
  const venueCounts = React.useMemo(() => {
    if (!profile?.publications) return [];

    const counts = profile.publications.reduce<Record<string, { count: number; coreRank: string }>>(
      (acc, pub) => {
        if (!pub.venue || pub.venue === "Unknown") return acc;
        if (!acc[pub.venue]) {
          acc[pub.venue] = { count: 0, coreRank: pub.coreRank ?? "Unknown" };
        }
        acc[pub.venue].count += 1;
        return acc;
      },
      {}
    );

    return Object.entries(counts).map(([name, data]) => ({
      name,
      count: data.count,
      coreRank: data.coreRank,
    }));
  }, [profile]);

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

  // **Fix Coauthors Extraction (Directly from Backend)**
  const coauthorCounts = React.useMemo(() => {
    if (!Array.isArray(profile?.coauthors)) return [];

    // ✅ Convert raw coauthor names into objects with collaboration count
    return profile.coauthors.map((coauthor) => ({
      name: coauthor,
      publicationsTogether: profile.publications.filter((pub) => pub.authors.some((a) => a.name === coauthor)).length,
    }));
  }, [profile]);

  // **Extract DOIs Needing OpenAlex Fetch**
  const doisToFetch = React.useMemo(() => {
    if (!profile?.publications) return [];
    return profile.publications
      .filter((pub) => !pub.abstract)
      .flatMap((pub) => pub.links ?? [])
      .filter((link) => link.startsWith("https://doi.org/"))
      .map((doi) => doi.replace("https://doi.org/", ""));
  }, [profile]);

  // **Fetch OpenAlex Data (If Needed)**
  const openAlexMutation = useMutation({
    mutationFn: () => fetchOpenAlexData(doisToFetch),
    onSuccess: () => {
      queryClient.invalidateQueries(["researcherProfile", name]);
    },
  });

  // **Extract DOIs Needing Topic Generation**
  const doisForTopics = React.useMemo(() => {
    if (!profile?.publications) return [];
    return profile.publications
      .filter((pub) => !Array.isArray(pub.topics) || pub.topics.length === 0) // ✅ No need for abstract check
      .flatMap((pub) => pub.links ?? [])
      .filter((link) => link.startsWith("https://doi.org/")); // ✅ Keep full DOI link
  }, [profile]);

  // **Fetch Topics Only After OpenAlex**
  const generateTopicsMutation = useMutation({
    mutationFn: () => generateTopics(doisForTopics), // ✅ Now sends full DOI links
    onSuccess: () => {
      queryClient.invalidateQueries(["researcherProfile", name]);
    },
  });

  // **Trigger OpenAlex Fetch if Needed**
  React.useEffect(() => {
    if (profile && doisToFetch.length > 0 && !openAlexMutation.isPending && !openAlexMutation.isSuccess) {
      openAlexMutation.mutate();
    }
  }, [profile, doisToFetch, openAlexMutation.isPending, openAlexMutation.isSuccess]);

  // **Trigger Topics Generation After OpenAlex**
  React.useEffect(() => {
    if (
      profile &&
      openAlexMutation.isSuccess &&
      doisForTopics.length > 0 &&
      !generateTopicsMutation.isPending &&
      !generateTopicsMutation.isSuccess
    ) {
      generateTopicsMutation.mutate();
    }
  }, [profile, openAlexMutation.isSuccess, doisForTopics, generateTopicsMutation.isPending, generateTopicsMutation.isSuccess]);

  return {
    profile: profile
      ? { ...profile, totalPapers, totalCitations, venues: venueCounts, coauthors: coauthorCounts }
      : undefined,
    isLoading,
    isError,
    refetch,
    openAlexMutation,
    generateTopicsMutation,
  };
};
