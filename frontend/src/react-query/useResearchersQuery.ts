import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Define the response type
interface Author {
  name: string;
  url: string;
}

// Fetch function for researchers
const fetchResearchers = async (query: string): Promise<Author[]> => {
  const response = await axios.get("http://127.0.0.1:8000/api/sem-scholar-search/", {
    params: { query },
  });
  return response.data.data || []; // Adjust to match the "data" field in the API response
};

// React Query hook for researchers
export const useResearchersQuery = (query: string) => {
  return useQuery<Author[]>({
    queryKey: ["researchers", query], // Unique key
    queryFn: () => fetchResearchers(query), // Fetching function
    enabled: !!query, // Ensures the query runs only when there's a query string
  });
};
