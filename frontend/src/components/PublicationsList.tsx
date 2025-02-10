import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface PublicationsListProps {
  publications: {
    title: string;
    year: number;
    type: string;
    venue: string;
    citations: number;
    topics: string[];
    authors: { name: string; pid: string }[];
    links: string[];
  }[];
}

const PublicationsList: React.FC<PublicationsListProps> = ({ publications }) => {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(5); // Show 5 publications initially

  if (publications.length === 0) {
    return (
      <Typography variant="body1" color="textSecondary">
        No publications available for this author.
      </Typography>
    );
  }

  // Increment the number of visible publications
  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 5);
  };

  // Handle navigation to the publication details page
  const handleViewDetails = (publicationUrl: string) => {
    const publicationId = publicationUrl.split("/").pop() || "";
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

          {/* Venue & Year */}
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {`Venue: ${publication.venue || "Unknown Venue"} | Year: ${publication.year || "Unknown"}`}
          </Typography>

          {/* Citation Count */}
          {publication.citations !== undefined && (
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Citations: {publication.citations}
            </Typography>
          )}

          {/* Topics */}
          {publication.topics.length > 0 && (
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Topics: {publication.topics.join(", ")}
            </Typography>
          )}

          {/* View Details Button */}
          {publication.links.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleViewDetails(publication.links[0])}
              sx={{ textTransform: "none", marginTop: 1 }}
            >
              View Details
            </Button>
          )}
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
