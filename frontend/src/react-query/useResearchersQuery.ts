import { useQuery } from "@tanstack/react-query";
import axios from "axios";

<<<<<<< HEAD
// Fetch function for researchers
const fetchResearchers = async (query: string) => {
  const response = await axios.get("http://127.0.0.1:8000/api/dblp-search/", {
    params: { query },
  });
  return response.data.result.hits.hit || [];
=======
// Define the response type based on the updated API
interface Author {
  name: string;
  pid: string; // Include pid
  affiliations: string[];
  dblp_url: string;
  abstract: string;
}

// Fetch function for researchers
const fetchResearchers = async (query: string): Promise<Author[]> => {
  const response = await axios.get("http://127.0.0.1:8000/api/dblp-search/", {
    params: { query },
  });

  return response.data.authors.map((author: any) => ({
    name: author.name,
    pid: author.pid, // Ensure pid is included
    affiliations: author.affiliations,
    dblp_url: author.dblp_url,
    abstract: author.abstract,
  })) || []; // Adjusted to correctly extract "authors"
>>>>>>> origin/bagas_branch
};

// React Query hook for researchers
export const useResearchersQuery = (query: string) => {
  return useQuery({
    queryKey: ["researchers", query], // Unique key
    queryFn: () => fetchResearchers(query), // Fetching function
    enabled: !!query, // Ensures the query runs only when there's a query string
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes to reduce API calls
    retry: 2, // Retry twice on failure
  });
};
