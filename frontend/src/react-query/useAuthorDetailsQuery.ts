import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Define the types for the response based on our Django view
interface ResearcherProfileResponse {
  name: string;
  affiliations: string[];
  hIndex: number;
  gIndex: number;
  totalPapers: number;
  totalCitations: number;
  venues: Record<string, number>[];
  topics: string[];
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
  const response = await axios.get(`http://127.0.0.1:8000/api/researcher-profile/?pid=${encodedPid}`);
  return response.data;
};

// React Query hook for researcher profile
export const useResearcherProfileQuery = (pid: string) => {
  return useQuery<ResearcherProfileResponse>({
    queryKey: ["researcherProfile", pid], // Unique query key based on PID
    queryFn: () => fetchResearcherProfile(pid), // Fetch function
    enabled: !!pid, // Ensures query runs only if PID exists
  });
};
