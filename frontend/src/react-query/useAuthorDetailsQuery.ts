import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";


// Define structure for a researcher's profile
export interface ResearcherProfileResponse {
  name: string;
  affiliations: string[];
  hIndex: number;
  gIndex: number;
  totalPapers?: number;
  totalCitations?: number;
  venues: { name: string; count: number; coreRank: string }[];
  coauthors: { name: string; publicationsTogether: number }[]; // ✅ Now expects a structured list
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
  const response = await axios.get(
    `http://127.0.0.1:8000/api/researcher-profile/?author_name=${encodedName}`
  );
  return response.data;
};



// **Step 3: Generate Topics (LLM)**
const generateTopics = async (dois: string[]) => {
  if (dois.length === 0) return Promise.resolve();
  return axios.post("http://127.0.0.1:8000/api/generate-topics/", { dois });
};

// **React Query Hook for Researcher Profile**
export const useAuthorDetailsQuery = (name: string) => {
  const queryClient = useQueryClient();
  const failedDoisRef = React.useRef<Set<string>>(new Set());
  const lastRateLimitRef = React.useRef<number | null>(null);

  const fetchOpenAlexData = async (dois: string[]) => {
    if (dois.length === 0) return Promise.resolve();
  
    try {
      return await axios.post("http://127.0.0.1:8000/api/open-alex/", { dois });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
  
        if (status === 404) {
          dois.forEach((doi) => failedDoisRef.current.add(doi));
        }
  
        if (status === 429) {
          lastRateLimitRef.current = Date.now();
          console.warn("Received 429 from OpenAlex. Will retry in 60 seconds.");
          throw new Error("Rate limited");
        }
      }
  
      throw error;
    }
    
  };
  
  const batchDOIs = (dois: string[], batchSize = 20): string[][] => {
    const batches: string[][] = [];
    for (let i = 0; i < dois.length; i += batchSize) {
      batches.push(dois.slice(i, i + batchSize));
    }
    return batches;
  };
  

  // **Fetch Profile First**
  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ["researcherProfile", name],
    queryFn: () => fetchResearcherProfile(name),
    enabled: !!name,
    staleTime: 5 * 60 * 1000,
  });

  // **Ensure Query Refetches When Clicking on a Coauthor**
  React.useEffect(() => {
    if (name) {
      refetch(); // ✅ Force data refresh when user clicks a coauthor
    }
  }, [name, refetch]);

  // **Force Query Cache Invalidation When Profile Changes**
  React.useEffect(() => {
    if (profile) {
      queryClient.invalidateQueries(["researcherProfile", name]); // ✅ Ensure fresh data
    }
  }, [name, profile, queryClient]);

  

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

  // **Compute H-Index**
  const computeHIndex = (publications: { citations?: number }[]) => {
    const sortedCitations = publications.map((pub) => pub.citations ?? 0).sort((a, b) => b - a);

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

  // **Compute G-Index**
  const computeGIndex = (publications: { citations?: number }[]) => {
    const sortedCitations = publications.map((pub) => pub.citations ?? 0).sort((a, b) => b - a);

    let g = 0,
      citationSum = 0;
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

  // ✅ **Use Coauthors Directly from Backend**
  const coauthors = profile?.coauthors || [];

  // **Extract DOIs Needing OpenAlex Fetch**
  const doisToFetch = React.useMemo(() => {
    if (!profile?.publications) return [];
  
    return profile.publications
      .filter((pub) => !pub.abstract)
      .flatMap((pub) => pub.links ?? [])
      .filter((link) => link.startsWith("https://doi.org/"))
      .map((doi) => doi.replace("https://doi.org/", ""))
      .filter((doi) => !failedDoisRef.current.has(doi)); // ✅ skip failed
  }, [profile]);
  
  // **Fetch OpenAlex Data (If Needed)**
  const openAlexMutation = useMutation({
    mutationFn: () => fetchOpenAlexData(doisToFetch),
    onSuccess: () => {
      queryClient.invalidateQueries(["researcherProfile", name]);
    },
    onError: (error) => {
      if ((error as Error).message === "Rate limited") {
        toast.warn("⚠️ OpenAlex is rate-limited. Retrying in 60 seconds...");
        return;
      }
  
      queryClient.invalidateQueries(["researcherProfile", name]);
    },
  });
  


  // **Extract DOIs Needing Topic Generation**
  const doisForTopics = React.useMemo(() => {
    if (!profile?.publications) return [];
    return profile.publications
      .filter((pub) => !Array.isArray(pub.topics) || pub.topics.length === 0)
      .flatMap((pub) => pub.links ?? [])
      .filter((link) => link.startsWith("https://doi.org/"));
  }, [profile]);

  // **Fetch Topics Only After OpenAlex**
  const generateTopicsMutation = useMutation({
    mutationFn: () => generateTopics(doisForTopics),
    onSuccess: () => {
      queryClient.invalidateQueries(["researcherProfile", name]);
    },
  });

  // ✅ Trigger OpenAlex mutation
  const fetchedDOIsRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    const now = Date.now();
    const lastLimit = lastRateLimitRef.current;
    const cooldownTime = 60 * 1000;

    const unprocessedDOIs = doisToFetch.filter(
      (doi) => !fetchedDOIsRef.current.has(doi) && !failedDoisRef.current.has(doi)
    );

    if (
      unprocessedDOIs.length === 0 ||
      openAlexMutation.isLoading ||
      (lastLimit && now - lastLimit < cooldownTime)
    ) {
      return;
    }

    const batches = batchDOIs(unprocessedDOIs, 10); // 🧠 10 DOIs per batch

    const runOpenAlexBatches = async () => {
      for (const batch of batches) {
        try {
          await fetchOpenAlexData(batch);
          batch.forEach((doi) => fetchedDOIsRef.current.add(doi));
          queryClient.invalidateQueries(["researcherProfile", name]);
          await new Promise((res) => setTimeout(res, 300)); // ⏱ delay between batches
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 429) {
            lastRateLimitRef.current = Date.now();
            toast.warn("⚠️ OpenAlex rate-limited. Pausing requests.");
            break;
          } else {
            batch.forEach((doi) => failedDoisRef.current.add(doi));
            console.error("❌ OpenAlex batch failed:", batch);
          }
        }
      }
    };

    runOpenAlexBatches();
  }, [doisToFetch, fetchOpenAlexData, queryClient, name, openAlexMutation.isLoading]);

  

  // ✅ Trigger topic generation after OpenAlex
  const generatedDOIsRef = React.useRef<Set<string>>(new Set());
  const hasRunTopicGenerationRef = React.useRef(false);
  
  React.useEffect(() => {
    const newDOIs = doisForTopics.filter((doi) => !generatedDOIsRef.current.has(doi));
  
    console.log("🧠 Topic check:");
    console.log("newDOIs:", newDOIs);
    console.log("generateTopicsMutation.isLoading:", generateTopicsMutation.isLoading);
    console.log("hasRunTopicGenerationRef.current:", hasRunTopicGenerationRef.current);
  
    if (
      newDOIs.length > 0 &&
      !generateTopicsMutation.isLoading &&
      !hasRunTopicGenerationRef.current
    ) {
      const batches = batchDOIs(newDOIs, 10);
      hasRunTopicGenerationRef.current = true;
  
      const runBatches = async () => {
        for (const batch of batches) {
          try {
            const response = await generateTopics(batch);
            const updatedPubs = response.data?.existing_publications ?? [];
  
            queryClient.setQueryData<ResearcherProfileResponse>(["researcherProfile", name], (oldData) => {
              if (!oldData) return oldData;
  
              const updated = oldData.publications.map((pub) => {
                const pubDOI = (pub.links ?? []).find((link) => link.startsWith("https://doi.org/")) ?? "";
                const updatedPub = updatedPubs.find((p) => p.doi === pubDOI);
                return updatedPub ? { ...pub, topics: updatedPub.topics } : pub;
              });
  
              return { ...oldData, publications: updated };
            });
  
            batch.forEach((doi) => generatedDOIsRef.current.add(doi));
          } catch (err) {
            toast.error("❌ Failed to generate some topics.");
            break;
          }
        }
      };
  
      runBatches();
    }
  }, [doisForTopics, generateTopicsMutation, queryClient, name]);
  

  return {
    profile: profile
      ? { ...profile, totalPapers, totalCitations, venues: venueCounts, coauthors }
      : undefined,
    isLoading,
    isError,
    refetch,
    openAlexMutation,
    generateTopicsMutation,
  };
};
