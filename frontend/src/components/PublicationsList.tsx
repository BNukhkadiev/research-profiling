import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { usePublicationsQuery } from "../react-query/usePublicationsQuery";

interface PublicationsListProps {
  authorId: string;
}

const PublicationsList: React.FC<PublicationsListProps> = ({ authorId }) => {
  const {
    data: publications = [],
    isLoading,
    isError,
  } = usePublicationsQuery(authorId);

  const [visibleCount, setVisibleCount] = useState(5); // Number of publications to display initially

  if (isLoading) {
    return (
      <Typography variant="body1" color="textSecondary">
        Loading publications...
      </Typography>
    );
  }

  if (isError) {
    return (
      <Typography variant="body1" color="error">
        Failed to load publications.
      </Typography>
    );
  }

  if (publications.length === 0) {
    return (
      <Typography variant="body1" color="textSecondary">
        No publications available for this author.
      </Typography>
    );
  }

  // Increment the number of visible publications
  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 5); // Load 5 more publications
  };

  return (
    <Box>
      {publications.slice(0, visibleCount).map((publication, index) => (
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
          {/* Title */}
          <Typography variant="h6" gutterBottom>
            {publication.title || "Untitled Publication"}
          </Typography>

          {/* Authors */}
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {publication.authors.length > 0
              ? publication.authors.map((author) => author.name).join(", ")
              : "Unknown Authors"}
          </Typography>

          {/* Year */}
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Year: {publication.year || "Unknown Year"}
          </Typography>

          {/* URL */}
          <Typography variant="body2" color="primary">
            <a
              href={publication.url}
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
