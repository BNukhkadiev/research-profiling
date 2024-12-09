import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { usePublicationsQuery } from "../react-query/usePublicationsQuery";

interface PublicationsListProps {
  author: string;
}

const PublicationsList: React.FC<PublicationsListProps> = ({ author }) => {
  const {
    data: publications = [],
    isLoading,
    error,
  } = usePublicationsQuery(author);
  const [visibleCount, setVisibleCount] = useState(5); // Number of publications to display initially

  if (isLoading) {
    return (
      <Typography variant="body1" color="textSecondary">
        Loading publications...
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography variant="body1" color="error">
        Failed to load publications.
      </Typography>
    );
  }

  if (publications.length === 0) {
    return (
      <Typography variant="body1" color="textSecondary">
        No publications available for {author}.
      </Typography>
    );
  }

  // Increment the number of visible publications
  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 5); // Load 5 more publications
  };

  return (
    <Box>
      {publications
        .slice(0, visibleCount)
        .map((publication: any, index: number) => (
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
                ? publication.info.authors.author
                    .map((author: any) => author.text)
                    .join(", ")
                : publication.info.authors.author?.text || "Unknown Authors"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Venue: {publication.info.venue || "Unknown Venue"}
            </Typography>
            <Typography variant="body2" color="primary">
              <a
                href={publication.info.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Publication
              </a>
            </Typography>
          </Box>
        ))}

      {/* Load More Button */}
      {visibleCount < publications.length && (
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
};

export default PublicationsList;
