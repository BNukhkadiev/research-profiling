import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

interface PublicationCardProps {
  title: string;
  authors: { name: string; pid: string }[]; // Array of authors with name and PID
  venue: string; // Venue name
  url?: string; // Primary publication URL
  links?: string[]; // Additional links
  citationCount?: number; // Citation count (optional)
  topics?: string[]; // Topics extracted from the publication
}

const PublicationCard: React.FC<PublicationCardProps> = ({
  title,
  authors,
  venue,
  url,
  links = [],
  citationCount,
  topics,
}) => {
  // Format authors into clickable links
  const formattedAuthors = authors.length > 0 ? (
    authors.map((author, index) => (
      <React.Fragment key={author.pid}>
        <Link href={`/profile/${encodeURIComponent(author.pid)}`} style={{ textDecoration: "none" }}>
          {author.name}
        </Link>
        {index < authors.length - 1 && ", "}
      </React.Fragment>
    ))
  ) : (
    "Unknown Authors"
  );

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
        {`Authors: `} {formattedAuthors}
      </Typography>

      {/* Venue */}
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {`Venue: ${venue || "Unknown Venue"}`}
      </Typography>

      {/* Citation Count */}
      {citationCount !== undefined && (
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {`Citations: ${citationCount}`}
        </Typography>
      )}

      {/* Topics */}
      {topics && topics.length > 0 && (
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {`Topics: ${topics.join(", ")}`}
        </Typography>
      )}

      {/* Links */}
      {links.length > 0 && (
        <List dense>
          {links.map((link, index) => (
            <ListItem key={index} sx={{ padding: 0 }}>
              <Link href={link} target="_blank" rel="noopener noreferrer">
                View Publication {index + 1}
              </Link>
            </ListItem>
          ))}
        </List>
      )}

      {/* Primary URL */}
      {url && links.length === 0 && (
        <Typography variant="body2">
          <Link href={url} target="_blank" rel="noopener noreferrer">
            View Publication
          </Link>
        </Typography>
      )}
    </Box>
  );
};

export default PublicationCard;
