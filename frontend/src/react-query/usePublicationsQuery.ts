import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Define the response type
interface Publication {
  url: string;
  title: string;
  year: number;
  authors: { name: string }[];
}

// Fetch function for publications
const fetchPublications = async (authorId: string): Promise<Publication[]> => {
  const response = await axios.get(
    "http://127.0.0.1:8000/api/sem-scholar-publication-search/",
    {
      params: { author_id: authorId }, // Use `author_id` as the query parameter
    }
  );
  return response.data?.data?.map((publication: any) => ({
    url: publication.url,
    title: publication.title,
    year: publication.year,
    authors: publication.authors.map((author: any) => ({
      name: author.name,
    })),
  })) || []; // Map the response structure to match the frontend types
};

// React Query hook for publications
export const usePublicationsQuery = (authorId: string) => {
  return useQuery<Publication[]>({
    queryKey: ["publications", authorId], // Unique key based on author ID
    queryFn: () => fetchPublications(authorId), // Fetching function
    enabled: !!authorId, // Ensure the query runs only if `authorId` is provided
  });
};
