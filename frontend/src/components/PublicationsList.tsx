import React, { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { usePublicationsQuery } from "../react-query/usePublicationsQuery";

interface PublicationsListProps {
  author: string;
  filters: {
    dateRange?: { startDate: Date; endDate: Date };
    venues?: string[];
    coreRanking?: string;
    sort?: string;
  };
}

const PublicationsList: React.FC<PublicationsListProps> = ({ author, filters }) => {
  const { data: publications = [], isLoading, error } = usePublicationsQuery(author);

  const [visibleCount, setVisibleCount] = useState(5);
  const [filteredPublications, setFilteredPublications] = useState<any[]>([]);

  useEffect(() => {
    let filtered = [...publications];
    console.log("Filters:", filters);
    console.log("publication", publications);
  
    // Apply Date Range Filter
    if (filters.dateRange) {
      const { startDate, endDate } = filters.dateRange;
      filtered = filtered.filter(
        (pub) =>
          new Date(pub.info.year).getTime() >= startDate.getTime() &&
          new Date(pub.info.year).getTime() <= endDate.getTime()
      );
    }
  
    // Apply Venue Filter
    if (filters.venues?.length) {
      filtered = filtered.filter((pub) =>
        filters.venues?.some((venue) => pub.info.venue?.toLowerCase().includes(venue.toLowerCase()))
      );
    }
  
    // Apply CORE Ranking Filter
    if (filters.coreRanking) {
      filtered = filtered.filter((pub) => pub.info.coreRanking === filters.coreRanking);
    }
  
    // Apply Sorting
    if (filters.sort) {
      filtered.sort((a, b) =>
        filters.sort === "Newest"
          ? parseInt(b.info.year) - parseInt(a.info.year)
          : parseInt(a.info.year) - parseInt(b.info.year)
      );
    }
  
    setFilteredPublications(filtered);
  }, [filters, publications]);
  

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 5);
  };

  if (isLoading) {
    return <Typography variant="body1" color="textSecondary">Loading publications...</Typography>;
  }

  if (error) {
    return <Typography variant="body1" color="error">Failed to load publications.</Typography>;
  }

  if (filteredPublications.length === 0) {
    return <Typography variant="body1" color="textSecondary">No publications match the applied filters.</Typography>;
  }

  return (
    <Box>
      {filteredPublications.slice(0, visibleCount).map((publication: any, index: number) => (
        <Box
          key={index}
          sx={{
            padding: 2,
            marginBottom: 2,
            border: "1px solid #ddd",
            borderRadius: 2,
            backgroundColor: "#f9f9f9",
          }}
        >
          <Typography variant="h6">{publication.info.title}</Typography>
          <Typography variant="body2" color="textSecondary">
            {Array.isArray(publication.info.authors.author)
              ? publication.info.authors.author.map((author: any) => author.text).join(", ")
              : publication.info.authors.author?.text || "Unknown Authors"}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Venue: {publication.info.venue || "Unknown Venue"}
          </Typography>
          <Typography variant="body2" color="primary">
            <a href={publication.info.url} target="_blank" rel="noopener noreferrer">
              View Publication
            </a>
          </Typography>
        </Box>
      ))}
      {visibleCount < filteredPublications.length && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleLoadMore}
          sx={{ textTransform: "none", marginTop: 2 }}
        >
          Load More
        </Button>
      )}
    </Box>
  );

}

export default PublicationsList;
