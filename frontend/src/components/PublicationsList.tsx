import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/bagas_branch

  if (publications.length === 0) {
    return (
      <Typography variant="body1" color="textSecondary">
        No publications available for {author}.
      </Typography>
    );
  }

  // Increment the number of visible publications
  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 5);
  };

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/bagas_branch

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
