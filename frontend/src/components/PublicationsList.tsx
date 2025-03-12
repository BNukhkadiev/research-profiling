import React, { useState } from "react";
import { Box, Typography, Button, Stack, Link } from "@mui/material";
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

const PublicationsList: React.FC<PublicationsListProps> = ({ publications = [] }) => {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(5); // Show 5 publications initially

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 5);
  };

  const handleViewDetails = (publicationUrl: string) => {
    if (!publicationUrl) return; // Safe guard
    const publicationId = publicationUrl.split("/").pop() || "";
    navigate(`/publication/${publicationId}`);
  };

  if (!publications.length) {
    return (
      <Typography variant="body1" color="textSecondary">
        No publications available for this author.
      </Typography>
    );
  }

  return (
    <Box>
      {publications.slice(0, visibleCount).map((pub, index) => {
        const {
          title = "Untitled Publication",
          authors = [],
          venue = "Unknown Venue",
          year = "Unknown Year",
          type = "Unknown Type",
          citations,
          topics = [],
          links = [],
        } = pub;

        return (
          <Box
            key={`${title}-${index}`} // More stable key
            sx={{
              p: 2,
              mb: 2,
              border: "1px solid #ddd",
              borderRadius: 2,
              backgroundColor: "#fafafa",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            {/* Title */}
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>

            {/* Authors */}
            <Typography variant="body2" color="textSecondary" gutterBottom>
              <strong>Authors:</strong>{" "}
              {authors.length > 0
                ? authors.map((author, idx) => (
                    <React.Fragment key={author.pid || `${author.name}-${idx}`}>
                      {author.pid ? (
                        <Link
                          href={`/profile/${encodeURIComponent(author.pid)}`}
                          style={{ textDecoration: "none" }}
                        >
                          {author.name}
                        </Link>
                      ) : (
                        author.name
                      )}
                      {idx < authors.length - 1 && ", "}
                    </React.Fragment>
                  ))
                : "Unknown Authors"}
            </Typography>

            {/* Venue & Year */}
            <Typography variant="body2" color="textSecondary" gutterBottom>
              <strong>Venue:</strong> {venue} | <strong>Year:</strong> {year}
            </Typography>

            {/* Type */}
            <Typography variant="body2" color="textSecondary" gutterBottom>
              <strong>Type:</strong> {type}
            </Typography>

            {/* Citations */}
            <Typography variant="body2" color="textSecondary" gutterBottom>
              <strong>Citations:</strong> {citations !== undefined ? citations : "N/A"}
            </Typography>

            {/* Topics */}
            {topics.length > 0 && (
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Topics:</strong> {topics.join(", ")}
              </Typography>
            )}

            {/* View Details Button */}
            {links.length > 0 && links[0] && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleViewDetails(links[0])}
                sx={{ textTransform: "none", mt: 1 }}
              >
                View Details
              </Button>
            )}
          </Box>
        );
      })}

      {/* Load More Button */}
      {visibleCount < publications.length && (
        <Stack alignItems="center" mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLoadMore}
            sx={{ textTransform: "none" }}
          >
            Load More
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default PublicationsList;
