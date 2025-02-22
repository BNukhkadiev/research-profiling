import React from "react";
import { Box, Typography, Button, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";

interface SearchCardProps {
  name: string;
  affiliations: string[];
  pid: string;
  dblp_url: string;
  abstract: string;
  addToCompare: () => void;
  isSelected: boolean;
  onViewProfile: () => void; // Function to navigate to profile page
}

const SearchCard: React.FC<SearchCardProps> = ({
  name,
  affiliations,
  pid,
  dblp_url,
  abstract,
  addToCompare,
  isSelected,
  onViewProfile,
}) => {
  const encodedPid = encodeURIComponent(pid); // Encode PID properly for URL

  return (
    <Box
      sx={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: 3,
        marginBottom: 2,
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "scale(1.02)",
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          wordWrap: "break-word",
        }}
      >
        {name}
      </Typography>

      <Tooltip
        title={affiliations.length > 0 ? affiliations.join(", ") : "No affiliations available"}
        placement="bottom-start"
        arrow
      >
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{
            marginTop: 1,
            wordWrap: "break-word",
            maxHeight: "4.5rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {affiliations.length > 0 ? affiliations.join(", ") : "No affiliations available"}
        </Typography>
      </Tooltip>

      {/* Researcher abstract */}
      <Typography
        variant="body2"
        color="textPrimary"
        sx={{
          marginTop: 1.5,
          fontStyle: "italic",
          maxHeight: "4.5rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {abstract}
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 2,
        }}
      >
        {/* Navigate to Researcher Profile Page */}
        <Button
          variant="outlined"
          component={Link}
          to={`/profile/${encodedPid}`} // Navigate to researcher profile
          sx={{ textTransform: "none" }}
        >
          View Profile
        </Button>

        {/* Open DBLP Profile */}
        <Button
          variant="outlined"
          href={dblp_url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textTransform: "none" }}
        >
          View on DBLP
        </Button>

        <Button
          variant="contained"
          onClick={addToCompare}
          color={isSelected ? "error" : "primary"}
          sx={{
            textTransform: "none",
          }}
        >
          {isSelected ? "Remove from Compare" : "Add to Compare"}
        </Button>
      </Box>
    </Box>
  );
};

export default SearchCard;
