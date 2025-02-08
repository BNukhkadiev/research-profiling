import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Define the response type based on the updated API
interface Author {
  name: string;
  affiliations: string[];
  dblp_url: string;
  abstract: string;
}

// Fetch function for researchers
const fetchResearchers = async (query: string): Promise<Author[]> => {
  const response = await axios.get("http://127.0.0.1:8000/api/dblp-search/", {
    params: { query },
  });

  return response.data.authors || []; // Adjusted to correctly extract "authors"
};

// React Query hook for researchers
export const useResearchersQuery = (query: string) => {
  return useQuery<Author[]>({
    queryKey: ["researchers", query], // Unique key
    queryFn: () => fetchResearchers(query), // Fetching function
    enabled: !!query, // Ensures the query runs only when there's a query string
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes to reduce API calls
    retry: 2, // Retry twice on failure
  });
};
