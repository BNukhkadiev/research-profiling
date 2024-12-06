import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Fetch function for researchers
const fetchResearchers = async (query: string) => {
  const response = await axios.get("http://127.0.0.1:8000/api/dblp-search/", {
    params: { query },
  });
  return response.data.result.hits.hit || [];
};

// React Query hook for researchers
export const useResearchersQuery = (query: string) => {
  return useQuery({
    queryKey: ["researchers", query], // Unique key
    queryFn: () => fetchResearchers(query), // Fetching function
    enabled: !!query, // Ensures the query runs only when there's a query string
  });
};
