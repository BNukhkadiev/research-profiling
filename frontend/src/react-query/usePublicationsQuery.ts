import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Define the Author interface
export interface Author {
  name: string;
  id: string;
}

// Define the Publication interface based on your API response
export interface Publication {
  url: string;
  title: string;
  year: number;
  authors: Author[];
  abstract?: string;
  venue?: string;
  citationCount?: number;
  fieldsOfStudy?: string[];
  // If you have other known properties, add them here:
  // e.g. publicationDate?: string;  // "2023-01-15T00:00:00Z"
  // e.g. somethingElse?: number;
}

// Fetch function for publications
const fetchPublications = async (authorId: string): Promise<Publication[]> => {
  const response = await axios.get(
    "http://127.0.0.1:8000/api/sem-scholar-publication-search/",
    {
      params: { author_id: authorId }, // Use `author_id` as the query parameter
    }
  );

  // Transform the raw API data into your Publication interface shape
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
