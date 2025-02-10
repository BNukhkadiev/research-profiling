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
  venues: { name: string; count: number }[]; // Explicitly define venue structure
  topics: { name: string; count: number }[]; // Explicitly define topics structure
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
  coauthors: { name: string; pid: string }[];
}

// Fetch function for researcher profile
const fetchResearcherProfile = async (pid: string): Promise<ResearcherProfileResponse> => {
  const encodedPid = encodeURIComponent(pid); // Encode PID to handle slashes

  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/researcher-profile/?pid=${encodedPid}`);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error fetching researcher profile for PID: ${pid}`, error);
    throw error.response?.data || new Error("Failed to fetch researcher profile.");
  }
};

// React Query hook for researcher profile
export const useResearcherProfileQuery = (pid: string) => {
  return useQuery<ResearcherProfileResponse>({
    queryKey: ["researcherProfile", pid], // Unique query key based on PID
    queryFn: () => fetchResearcherProfile(pid), // Fetch function
    enabled: Boolean(pid), // Ensures query runs only if PID exists
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    retry: 2, // Retry twice on failure
  });
};
