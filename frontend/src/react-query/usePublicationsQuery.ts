import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Define the response type
interface Author {
  name: string;
  id: string; // Include author ID
}

interface Publication {
  url: string;
  title: string;
  year: number;
  authors: Author[]; // Use the updated Author type
  abstract?: string;
  venue?: string;
  citationCount?: number;
  fieldsOfStudy?: string[];
}

// Fetch function for publications
const fetchPublications = async (authorId: string): Promise<Publication[]> => {
  const response = await axios.get(
    "http://134.155.86.170:8000/api/sem-scholar-publication-search/",
    {
      params: { author_id: authorId }, // Use `author_id` as the query parameter
    }
  );

  return (
    response.data?.publications?.map((publication: any) => ({
      url: publication.url,
      title: publication.title,
      year: publication.year,
      authors: publication.authors.map((author: any) => ({
        name: author.name,
        id: author.id, // Map the author ID from the API response
      })),
      abstract: publication.abstract,
      venue: publication.venue,
      citationCount: publication.citationCount,
      fieldsOfStudy: publication.fieldsOfStudy,
    })) || []
  );
};

// React Query hook for publications
export const usePublicationsQuery = (authorId: string) => {
  return useQuery<Publication[]>({
    queryKey: ["publications", authorId], // Unique key based on author ID
    queryFn: () => fetchPublications(authorId), // Fetching function
    enabled: !!authorId, // Ensure the query runs only if `authorId` is provided
  });
};
