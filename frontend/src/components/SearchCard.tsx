import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";

interface SearchCardProps {
  name: string;
  affiliations: string[];
  profileUrl: string;
  addToCompare: () => void;
  isSelected: boolean;
}

const SearchCard: React.FC<SearchCardProps> = ({
  name,
  affiliations,
  profileUrl,
  addToCompare,
  isSelected,
}) => {
  return (
    <Box
      sx={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "16px",
        backgroundColor: "#f9f9f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between", // Ensures proper alignment
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {/* Researcher Details */}
        <Typography variant="h6">{name}</Typography>
        <Typography variant="body2">{affiliations.join(", ")}</Typography>
        <Button
          variant="outlined"
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ marginTop: "8px", alignSelf: "flex-start" }}
        >
          View Profile
        </Button>
      </Box>

      {/* Add to Compare Checkbox */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Checkbox
          checked={isSelected}
          onChange={addToCompare}
          inputProps={{ "aria-label": "Add to compare" }}
        />
        <Typography>Add to compare</Typography>
      </Box>
    </Box>
  );
};

export default SearchCard;
