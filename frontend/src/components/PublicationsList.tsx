import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { usePublicationsQuery } from "../react-query/usePublicationsQuery";

interface PublicationsListProps {
  authorId: string;
}

const PublicationsList: React.FC<PublicationsListProps> = ({ authorId }) => {
  const navigate = useNavigate(); // Initialize navigate
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

  // Handle navigation to the PublicationDetails page
  const handleViewDetails = (publicationId: string) => {
    navigate(`/publication/${publicationId}`);
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

          {/* Citation Count */}
          {publication.citationCount !== undefined && (
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Citations: {publication.citationCount}
            </Typography>
          )}

          {/* Fields of Study */}
          {publication.fieldsOfStudy && publication.fieldsOfStudy.length > 0 && (
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Fields of Study: {publication.fieldsOfStudy.join(", ")}
            </Typography>
          )}

          {/* View Details Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleViewDetails(publication.url.split("/").pop() || "")}
            sx={{ textTransform: "none", marginTop: 1 }}
          >
            View Details
          </Button>
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
