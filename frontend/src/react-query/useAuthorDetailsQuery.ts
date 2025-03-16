import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Define the response structure for a researcher's profile
export interface ResearcherProfileResponse {
  name: string;
  affiliations: string[];
  hIndex: number;
  gIndex: number;
  totalPapers: number;
  totalCitations: number;
  venues: { name: string; count: number; coreRank: string }[];
  topics: { name: string; count: number }[];
  papers: {
    title: string;
    year: number;
    venue: string;
    coreRank: string; // ✅ Added coreRank as part of paper
    citations: number;
    topics: string[];
    authors: { name: string }[]; // Only name now
    links: string[];
    abstract: string; // Placeholder or filled
    preprint: boolean; // Added for preprint flag
  }[];
  coauthors: { name: string; publicationsTogether: number }[];
}

// Fetch function for researcher profile
const fetchResearcherProfile = async (name: string): Promise<ResearcherProfileResponse> => {
  const encodedName = encodeURIComponent(name);

  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/researcher-profile/?author_name=${encodedName}`);
    const data = response.data;

    // ✅ Direct mapping of venues (if backend sends it as [{name, count, core_rank}])
    const venues = Array.isArray(data.venues)
      ? data.venues.map((venue: any) => ({
          name: venue.name,
          count: venue.count,
          coreRank: venue.core_rank,
        }))
      : [];

    // ✅ Transform topics
    const topics = Array.isArray(data.topics)
      ? data.topics.map((topic: Record<string, number>) => {
          const topicName = Object.keys(topic)[0];
          const count = topic[topicName];
          return { name: topicName, count };
        })
      : [];

    // ✅ Transform coauthors
    const coauthors = Array.isArray(data.coauthors)
      ? data.coauthors.map((coauthor: any) => ({
          name: coauthor.name,
          publicationsTogether: coauthor.publications_together,
        }))
      : [];

    // ✅ Transform papers with venue and coreRank
    const papers = Array.isArray(data.papers)
      ? data.papers.map((paper: any) => ({
          title: paper.title,
          year: paper.year,
          venue: paper.venue,
          coreRank: paper.core_rank, // ✅ Correctly included
          citations: paper.citations,
          topics: paper.topics,
          authors: paper.authors.map((author: any) => ({ name: author.name })),
          links: paper.links,
          abstract: paper.abstract,
          preprint: paper.preprint,
        }))
      : [];

    return {
      name: data.name,
      affiliations: data.affiliations,
      hIndex: data['h-index'],
      gIndex: data['g-index'],
      totalPapers: data.total_papers,
      totalCitations: data.total_citations,
      venues,
      topics,
      papers,
      coauthors,
    };
  } catch (error: any) {
    console.error(`❌ Error fetching researcher profile for: ${name}`, error);
    throw error.response?.data || new Error("Failed to fetch researcher profile.");
  }
};

// React Query hook for researcher profile
export const useResearcherProfileQuery = (name: string) => {
  return useQuery<ResearcherProfileResponse>({
    queryKey: ["researcherProfile", name],
    queryFn: () => fetchResearcherProfile(name),
    enabled: Boolean(name), // Only fetch if name is provided
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2, // Retry twice on failure
  });
};
