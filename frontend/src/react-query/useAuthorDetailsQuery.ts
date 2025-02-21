import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Define the response structure for a researcher's profile
interface ResearcherProfileResponse {
  name: string;
  affiliations: string[];
  hIndex: number;
  gIndex: number;
  totalPapers: number;
  totalCitations: number;
  venues: { name: string; count: number; coreRank: string }[]; // Updated to include coreRank
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

    return {
      ...data,
      hIndex: data['h-index'],
      gIndex: data['g-index'],
      totalPapers: data.total_papers,
      totalCitations: data.total_citations,
      venues: data.venues.map((venue: any) => ({
        name: Object.keys(venue)[0],
        count: venue[Object.keys(venue)[0]].count,
        coreRank: venue[Object.keys(venue)[0]].core_rank,
      })),
      coauthors: data.coauthors.map((coauthor: any) => ({
        name: coauthor.name,
        pid: coauthor.pid,
        publicationsTogether: coauthor.publications_together,
      })),
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
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
