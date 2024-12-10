import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Define the types for the response
interface AuthorDetailsResponse {
  name: string;
  url: string;
  affiliations: string[];
  paperCount: number;
  hIndex: number;
  citationCount: number;
}

const fetchAuthorDetails = async (authorId: string): Promise<AuthorDetailsResponse> => {
  const response = await axios.get("http://127.0.0.1:8000/api/author-details/", {
    params: { author_id: authorId }, // Pass author_id as query parameter
  });
  return response.data;
};

// React Query hook for author details
export const useAuthorDetailsQuery = (authorId: string) => {
  return useQuery<AuthorDetailsResponse>({
    queryKey: ["authorDetails", authorId], // Unique key based on author ID
    queryFn: () => fetchAuthorDetails(authorId), // Fetching function
    enabled: !!authorId, // Ensure the query runs only if authorId exists
  });
};
