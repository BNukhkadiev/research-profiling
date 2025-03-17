// src/react-query/usePublicationDetailsQuery.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Define the response types
interface Author {
  name: string;
  id?: string;
}

export interface PublicationDetails {
  title: string;
  citationCount: number;
  url: string;
  year: number;
  authors: Author[];
  abstract?: string;
  fieldsOfStudy?: string[];
  venue?: string;
  // You can include additional fields if needed.
}

// Fetch function for publication details
const fetchPublicationDetails = async (paperId: string): Promise<PublicationDetails> => {
  const response = await axios.get("http://127.0.0.1:8000/api/paper-details/", {
    params: { paper_id: paperId },
  });

  // Assume your API returns an object with a "paper" field.
  const paper = response.data?.paper;
  if (!paper) {
    throw new Error("Publication details not found.");
  }

  return {
    title: paper.title || "Untitled",
    // Use the API's citationCount if available; default to 0 otherwise.
    citationCount: paper.citationCount !== undefined ? paper.citationCount : 0,
    url: paper.url && paper.url !== "" ? paper.url : "N/A",
    year: paper.year || 0,
    authors: paper.authors?.map((author: any) => ({
      name: author.name || "Unknown Author",
      id: author.id,
    })) || [],
    abstract: paper.abstract || "Abstract not available.",
    fieldsOfStudy: paper.fieldsOfStudy || [],
    venue: paper.venue || "Unknown Venue",
  };
};

export const usePublicationDetailsQuery = (paperId: string) => {
  return useQuery<PublicationDetails>({
    queryKey: ["publicationDetails", paperId],
    queryFn: () => fetchPublicationDetails(paperId),
    enabled: !!paperId, // Run only if paperId is provided
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
  });
};
