import React from "react";
import { useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import Topics from "../components/Topics";
import { usePublicationDetailsQuery } from "../react-query/usePublicationDetailsQuery";

const PublicationDetailsPage: React.FC = () => {
  const { paperId } = useParams<{ paperId: string }>(); // Extract paperId from URL
  const { data: publication, isLoading, isError } = usePublicationDetailsQuery(paperId || "");

  if (isLoading) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4">Loading publication details...</Typography>
      </Box>
    );
  }

  if (isError || !publication) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h4" color="error">
          Failed to fetch publication details.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: 2,
          padding: 3,
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
          marginBottom: 3,
        }}
      >
        {/* Title */}
        <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          {publication.title || "Untitled Publication"}
        </Typography>

        {/* Authors and Info */}
        <Typography variant="body1" sx={{ marginBottom: 1 }}>
          <strong>Authors:</strong>{" "}
          {publication.authors.map((author) => author.name).join(", ") || "Unknown Authors"}
        </Typography>
        <Typography variant="body1">
          <strong>URL:</strong>{" "}
          <a href={publication.url} target="_blank" rel="noopener noreferrer">
            {publication.url}
          </a>
        </Typography>
        <Typography variant="body1">
          <strong>Year of Publication:</strong> {publication.year || "N/A"}
        </Typography>
        <Typography variant="body1">
          <strong>Venue:</strong> {publication.venue || "Unknown Venue"}
        </Typography>
        {publication.citationCount !== undefined && (
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            <strong>Citations:</strong> {publication.citationCount}
          </Typography>
        )}

        {/* Topics Section */}
        {publication.fieldsOfStudy && publication.fieldsOfStudy.length > 0 && (
          <Topics topics={publication.fieldsOfStudy} />
        )}
      </Box>

      {/* Abstract Section */}
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: 2,
          padding: 3,
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          Abstract
        </Typography>
        <Typography variant="body1">
          {publication.abstract || "Abstract not available."}
        </Typography>
      </Box>
    </Box>
  );
};

export default PublicationDetailsPage;
