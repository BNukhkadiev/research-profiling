import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface PublicationCardProps {
  title: string;
  authors: string[]; // Array of author names as strings
  venue: string; // Publication venue or year
  url: string; // URL for the publication
  abstract?: string; // Abstract of the publication (optional)
  citationCount?: number; // Citation count (optional)
  fieldsOfStudy?: string[]; // Fields of study (optional)
}

const PublicationCard: React.FC<PublicationCardProps> = ({
  title,
  authors,
  venue,
  url,
  abstract,
  citationCount,
  fieldsOfStudy,
}) => {
  // Format authors into a single string or a fallback if empty
  const formattedAuthors = authors.length > 0 ? authors.join(", ") : "Unknown Authors";

  return (
    <Box
      sx={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "16px",
        backgroundColor: "#f9f9f9",
      }}
    >
      {/* Title */}
      <Typography variant="h6" gutterBottom>
        {title || "Untitled Publication"}
      </Typography>

      {/* Authors */}
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {`Authors: ${formattedAuthors}`}
      </Typography>

      {/* Venue */}
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {`Venue: ${venue || "Unknown Venue"}`}
      </Typography>

      {/* Abstract */}
      {abstract && (
        <Typography variant="body2" gutterBottom>
          {`Abstract: ${abstract}`}
        </Typography>
      )}

      {/* Citation Count */}
      {citationCount !== undefined && (
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {`Citations: ${citationCount}`}
        </Typography>
      )}

      {/* Fields of Study */}
      {fieldsOfStudy && fieldsOfStudy.length > 0 && (
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {`Fields of Study: ${fieldsOfStudy.join(", ")}`}
        </Typography>
      )}

      {/* URL */}
      <Typography variant="body2">
        <a href={url} target="_blank" rel="noopener noreferrer">
          View Publication
        </a>
      </Typography>
    </Box>
  );
};

export default PublicationCard;
