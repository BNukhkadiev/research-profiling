import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Fetch function for publications
const fetchPublications = async (query: string) => {
  const response = await axios.get(
    "http://127.0.0.1:8000/api/dblp-publication-search/",
    {
      params: { query },
    }
  );
  return response.data.result.hits.hit || [];
};

// React Query hook for publications
export const usePublicationsQuery = (query: string) => {
  return useQuery({
    queryKey: ["publications", query], // Unique key
    queryFn: () => fetchPublications(query), // Fetching function
    enabled: !!query, // Ensures the query runs only when there's a query string
  });
};
