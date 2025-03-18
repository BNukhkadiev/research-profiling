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
    authors?: { name: string; pid?: string }[]; // ✅ Made optional
    coauthors?: string[]; // ✅ New field for fallback
    links: string[];
  }[];
}

const PublicationsList: React.FC<PublicationsListProps> = ({ publications = [] }) => {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(5);

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 5);
  };

  const handleViewDetails = (publicationUrl: string) => {
    if (!publicationUrl) return;
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

  console.log("Publication Data:", publications);

  return (
    <Box>
      {publications.slice(0, visibleCount).map((pub, index) => {
        const {
          title = "Untitled Publication",
          authors = [],
          coauthors = [], // ✅ New fallback field
          venue = "Unknown Venue",
          year = "Unknown Year",
          type = "Unknown Type",
          citations,
          topics = [],
          links = [],
        } = pub;

        const displayAuthors =
          authors.length > 0
            ? authors.map((author, idx) => (
                <React.Fragment key={author.pid || `${author.name}-${idx}`}>
                  {author.pid ? (
                    <Link href={`/profile/${encodeURIComponent(author.pid)}`} style={{ textDecoration: "none" }}>
                      {author.name}
                    </Link>
                  ) : (
                    author.name
                  )}
                  {idx < authors.length - 1 && ", "}
                </React.Fragment>
              ))
            : coauthors.length > 0
            ? coauthors.join(", ") // ✅ Use coauthors if no authors
            : "Unknown Authors";

        return (
          <Box
            key={`${title}-${index}`}
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
              <strong>Authors:</strong> {displayAuthors}
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
          <Button variant="contained" color="primary" onClick={handleLoadMore} sx={{ textTransform: "none" }}>
            Load More
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default PublicationsList;
