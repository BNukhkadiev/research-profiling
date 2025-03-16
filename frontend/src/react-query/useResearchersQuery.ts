import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Define Author type
interface Author {
  name: string;
  description: string;
  affiliations: string[];
}

// Fetch function for single researcher
const fetchResearcher = async (query: string): Promise<Author | null> => {
  const response = await axios.get("http://127.0.0.1:8000/api/search/", {
    params: { query },
  });

  // Extract and return single author object
  return response.data.authors || null;
};

// React Query hook for fetching single researcher
export const useResearcherQuery = (query: string) => {
  return useQuery<Author | null>({
    queryKey: ["researcher", query], // Unique cache key
    queryFn: () => fetchResearcher(query), // Fetch function
    enabled: !!query, // Only fetch if query is not empty
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2, // Retry twice on failure
  });
};
