import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Final structure of response including venues generated from papers
export interface ResearcherProfileResponse {
  name: string;
  affiliations: string[];
  hIndex: number;
  gIndex: number;
  totalPapers: number;
  totalCitations: number;
  topics: { name: string; count: number }[];
  venues: { name: string; count: number; coreRank: string }[];
  papers: {
    title: string;
    year: number;
    venue: string;
    coreRank: string;
    citations: number;
    topics: string[];
    authors: { name: string }[];
    links: string[];
    abstract: string;
    preprint: boolean;
  }[];
  coauthors: { name: string; publicationsTogether: number }[];
}

// Fetch function
const fetchResearcherProfile = async (name: string): Promise<ResearcherProfileResponse> => {
  const encodedName = encodeURIComponent(name);

  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/researcher-profile/?author_name=${encodedName}`);
    const data = response.data;

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

    // ✅ Transform papers (from backend "publications")
    const papers = Array.isArray(data.publications)
      ? data.publications.map((paper: any) => ({
          title: paper.title,
          year: paper.year,
          venue: paper.venue || "Unknown Venue",
          coreRank: paper.core_rank || "Unknown",
          citations: paper.citations || 0,
          topics: paper.topics || [],
          authors: (paper.coauthors || []).map((author: any) => ({ name: author })),
          links: paper.links || [],
          abstract: paper.abstract || "",
          preprint: paper.preprint || false,
        }))
      : [];

    // ✅ Dynamically generate venues from papers
    const venueMap: Record<string, { count: number; coreRank: string }> = {};
    for (const paper of papers) {
      if (paper.venue) {
        if (!venueMap[paper.venue]) {
          venueMap[paper.venue] = { count: 0, coreRank: paper.coreRank };
        }
        venueMap[paper.venue].count += 1;
      }
    }
    const venues = Object.entries(venueMap).map(([name, data]) => ({
      name,
      count: data.count,
      coreRank: data.coreRank,
    }));

    return {
      name: data.name,
      affiliations: data.affiliations || [],
      hIndex: data.h_index ?? -1,
      gIndex: data.g_index ?? -1,
      totalPapers: data.total_papers ?? papers.length,
      totalCitations: data.total_citations ?? 0,
      topics,
      venues,
      papers,
      coauthors,
    };
  } catch (error: any) {
    console.error(`❌ Error fetching researcher profile for: ${name}`, error);
    throw error.response?.data || new Error("Failed to fetch researcher profile.");
  }
};

// ✅ React Query hook
export const useResearcherProfileQuery = (name: string) => {
  return useQuery<ResearcherProfileResponse>({
    queryKey: ["researcherProfile", name],
    queryFn: () => fetchResearcherProfile(name),
    enabled: Boolean(name),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
