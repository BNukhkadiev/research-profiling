import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface PublicationCardProps {
  title: string;
  authors: { text: string }[]; // Array of authors with a text field
  venue: string;
  url: string;
}

const PublicationCard: React.FC<PublicationCardProps> = ({
  title,
  authors,
  venue,
  url,
}) => {
  // Format authors into a single string
  const formattedAuthors = authors.map((author) => author.text).join(", ");

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
        {title}
      </Typography>

      {/* Authors */}
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {`Authors: ${formattedAuthors}`}
      </Typography>

      {/* Venue */}
      <Typography variant="body2" gutterBottom>
        {`Venue: ${venue}`}
      </Typography>

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
