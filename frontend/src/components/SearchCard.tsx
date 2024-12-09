import React from "react";
import { Box, Typography, Button } from "@mui/material";

interface SearchCardProps {
  name: string;
  affiliations: string[];
  profileUrl: string;
  addToCompare: () => void;
  isSelected: boolean;
  onViewProfile: () => void; // Prop for navigation
}

const SearchCard: React.FC<SearchCardProps> = ({
  name,
  affiliations,
  profileUrl,
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
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        {name}
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1 }}>
        {affiliations.length > 0
          ? affiliations.join(", ")
          : "No affiliations available"}
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={onViewProfile}
          sx={{ textTransform: "none" }}
        >
          View Profile
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
