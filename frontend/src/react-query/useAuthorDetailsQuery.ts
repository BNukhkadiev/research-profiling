import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Define the response structure for a researcher's profile
export interface ResearcherProfileResponse {
  name: string;
  pid: string;
  affiliations: string[];
  hIndex: number;
  gIndex: number;
  totalPapers: number;
  totalCitations: number;
  venues: { name: string; count: number; coreRank: string }[];
  topics: { name: string; count: number }[];
  papers: {
    title: string;
    year: number;
    type: string;
    venue: string;
    citations: number;
    topics: string[];
    authors: { name: string; pid: string }[];
    links: string[];
  }[];
  coauthors: { name: string; pid: string; publicationsTogether: number }[];
}

// Fetch function for researcher profile
const fetchResearcherProfile = async (pid: string): Promise<ResearcherProfileResponse> => {
  const encodedPid = encodeURIComponent(pid);

  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/researcher-profile/?pid=${encodedPid}`);
    const data = response.data;

    // Transform venues safely
    const venues = Array.isArray(data.venues)
      ? data.venues.map((venue: Record<string, { count: number; core_rank: string }>) => {
          const name = Object.keys(venue)[0];
          const details = venue[name];
          return {
            name,
            count: details.count,
            coreRank: details.core_rank,
          };
        })
      : [];

    // Transform topics safely
    const topics = Array.isArray(data.topics)
      ? data.topics.map((topic: Record<string, number>) => {
          const name = Object.keys(topic)[0];
          const count = topic[name];
          return { name, count };
        })
      : [];

    // Transform coauthors safely
    const coauthors = Array.isArray(data.coauthors)
      ? data.coauthors.map((coauthor: any) => ({
          name: coauthor.name,
          pid: coauthor.pid,
          publicationsTogether: coauthor.publications_together,
        }))
      : [];

    return {
      name: data.name,
      pid: data.pid,
      affiliations: data.affiliations,
      hIndex: data['h-index'],
      gIndex: data['g-index'],
      totalPapers: data.total_papers,
      totalCitations: data.total_citations,
      venues,
      topics,
      papers: Array.isArray(data.papers) ? data.papers : [],
      coauthors,
    };
  } catch (error: any) {
    console.error(`❌ Error fetching researcher profile for PID: ${pid}`, error);
    throw error.response?.data || new Error("Failed to fetch researcher profile.");
  }
};

// React Query hook for researcher profile
export const useResearcherProfileQuery = (pid: string) => {
  return useQuery<ResearcherProfileResponse>({
    queryKey: ["researcherProfile", pid],
    queryFn: () => fetchResearcherProfile(pid),
    enabled: Boolean(pid),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 2, // retry twice on failure
  });
};