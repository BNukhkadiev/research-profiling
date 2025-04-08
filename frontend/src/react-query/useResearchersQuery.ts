import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Type for each author in results
export interface Author {
  description: string;
  affiliations: string[];
}

// Full response type from backend
interface AuthorSearchResponse {
  query: string;
  results: Record<string, Author>; // key = author name
}

// Just returns the 'results' part for UI
const fetchResearchers = async (query: string): Promise<Record<string, Author>> => {
  const response = await axios.get<AuthorSearchResponse>("http://134.155.86.170:8000/api/search/", {
    params: { query },
  });

  return response.data.results || {};
};

// React Query hook to fetch multiple researchers
export const useResearcherQuery = (query: string) => {
  return useQuery<Record<string, Author>>({
    queryKey: ["researcher", query],
    queryFn: () => fetchResearchers(query),
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
