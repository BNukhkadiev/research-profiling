import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Define the response type
interface Author {
  name: string;
  id?: string; // Optional ID for the author
}

interface PublicationDetails {
  url: string;
  year: number;
  authors: Author[];
  abstract?: string;
  fieldsOfStudy?: string[];
  venue?: string;
}

// Fetch function for publication details
const fetchPublicationDetails = async (paperId: string): Promise<PublicationDetails> => {
  const response = await axios.get("http://134.155.86.170:8000/api/paper-details/", {
    params: { paper_id: paperId }, // Use `paper_id` as the query parameter
  });

  // Map the API response to the desired format
  const paper = response.data?.paper;
  if (!paper) {
    throw new Error("Publication details not found.");
  }

  return {
    url: paper.url || "N/A",
    year: paper.year || 0,
    authors: paper.authors?.map((author: any) => ({
      name: author.name || "Unknown Author",
      id: author.id, // Include the author ID if available
    })) || [],
    abstract: paper.abstract || "Abstract not available.",
    fieldsOfStudy: paper.fieldsOfStudy || [],
    venue: paper.venue || "Unknown Venue",
  };
};

// React Query hook for publication details
export const usePublicationDetailsQuery = (paperId: string) => {
  return useQuery<PublicationDetails>({
    queryKey: ["publicationDetails", paperId], // Unique key based on paper ID
    queryFn: () => fetchPublicationDetails(paperId), // Fetching function
    enabled: !!paperId, // Ensure the query runs only if `paperId` is provided
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    retry: 2, // Retry fetching the data 2 times on failure
  });
};
