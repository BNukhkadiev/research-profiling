import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

interface PublicationCardProps {
  title: string;
<<<<<<< HEAD
  authors: { text: string }[]; // Array of authors with a text field
  venue: string;
  url: string;
=======
  authors: { name: string; pid: string }[]; // Array of authors with name and PID
  venue: string; // Venue name
  url?: string; // Primary publication URL
  links?: string[]; // Additional links
  citationCount?: number; // Citation count (optional)
  topics?: string[]; // Topics extracted from the publication
>>>>>>> origin/bagas_branch
}

const PublicationCard: React.FC<PublicationCardProps> = ({
  title,
  authors,
  venue,
  url,
<<<<<<< HEAD
}) => {
  // Format authors into a single string
  const formattedAuthors = authors.map((author) => author.text).join(", ");
=======
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
>>>>>>> origin/bagas_branch

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
        {`Authors: `} {formattedAuthors}
      </Typography>

      {/* Venue */}
      <Typography variant="body2" gutterBottom>
        {`Venue: ${venue}`}
      </Typography>

<<<<<<< HEAD
      {/* URL */}
      <Typography variant="body2">
        <a href={url} target="_blank" rel="noopener noreferrer">
          View Publication
        </a>
      </Typography>
=======
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
>>>>>>> origin/bagas_branch
    </Box>
  );
};

export default PublicationCard;
