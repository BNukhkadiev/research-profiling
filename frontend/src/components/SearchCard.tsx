import React from "react";
import { Box, Typography, Button, Tooltip } from "@mui/material";

interface SearchCardProps {
  name: string;
  affiliations: string[];
  description: string;
  addToCompare: () => void;
  isSelected: boolean;
  onViewProfile: () => void; // Function to navigate to profile page
}

const SearchCard: React.FC<SearchCardProps> = ({
  name,
  affiliations,
  description,
  addToCompare,
  isSelected,
  onViewProfile,
}) => {
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
      {/* Researcher Name */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          wordWrap: "break-word",
        }}
      >
        {name}
      </Typography>

      {/* Affiliations */}
      <Tooltip
        title={
          affiliations.length > 0
            ? affiliations.join(", ")
            : "No affiliations available"
        }
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
          {affiliations.length > 0
            ? affiliations.join(", ")
            : "No affiliations available"}
        </Typography>
      </Tooltip>

      {/* Researcher Description */}
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
        {description || "No description available"}
      </Typography>

      {/* Action Buttons */}
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
          onClick={onViewProfile}
          sx={{ textTransform: "none" }}
        >
          View Profile
        </Button>

        {/* Add/Remove to/from Compare */}
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
