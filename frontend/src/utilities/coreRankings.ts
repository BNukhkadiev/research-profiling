// src/utils/coreRankings.ts
import Fuse from "fuse.js";

/**
 * Hardcoded dictionary of normalized venue names => core rank
 * You can expand or parse a CSV if needed.
 */
const coreRankings: Record<string, string> = {
  "international conference on machine learning": "A*",
  "neural information processing systems": "A",
  "journal of web semantics": "B",
  "ieee computer": "C",
  // ... add more if needed
};

// Prepare an array of keys for fuzzy searching
const rankingKeys = Object.keys(coreRankings);

const fuse = new Fuse(rankingKeys, {
  includeScore: true,
  threshold: 0.3, // tweak for more or less strict matching
});

/**
 * Normalize the DBLP venue name by:
 *  - Lowercasing
 *  - Removing digits (like "2023", "Vol. 139")
 *  - Removing punctuation
 *  - Collapsing extra spaces
 */
function normalizeVenueName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[0-9]/g, "")            // remove digits
    .replace(/[^\p{L}\p{Zs}]/gu, "")  // remove punctuation
    .replace(/\s+/g, " ")            // collapse extra spaces
    .trim();
}

/**
 * getCoreRanking(venue?: string):
 *  - If venue is undefined or empty, returns undefined
 *  - Normalizes the string
 *  - Exact dictionary lookup
 *  - If not found, fuzzy match
 *  - Returns "A*", "A", "B", "C" or undefined if no match
 */
export function getCoreRanking(venue?: string): string | undefined {
  if (!venue) return undefined;

  const normalized = normalizeVenueName(venue);

  // 1) Exact dictionary lookup
  if (coreRankings[normalized]) {
    return coreRankings[normalized];
  }

  // 2) Fuzzy match if no exact match
  const results = fuse.search(normalized);
  if (results.length > 0) {
    const best = results[0];
    if (best.score !== undefined && best.score < 0.4) {
      const matchedKey = best.item;
      return coreRankings[matchedKey];
    }
  }

  // 3) No match
  return undefined;
}
