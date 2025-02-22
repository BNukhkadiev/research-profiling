import React from "react";
import { Box, Typography } from "@mui/material";

interface StatisticsProps {
  author: {
    papers?: number;
    citations?: number;
    hIndex?: number;
    gIndex?: number;
  };
}

const StatisticsCard: React.FC<StatisticsProps> = ({ author }) => {
  return (
    <Box
      sx={{
        padding: 3,
        borderRadius: "8px",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
        Researcher Statistics
      </Typography>
      <Typography># Papers: {author?.papers ?? 0}</Typography>
      <Typography># Citations: {author?.citations ?? 0}</Typography>
      <Typography>H-Index: {author?.hIndex ?? 0}</Typography>
      <Typography>G-Index: {author?.gIndex ?? 0}</Typography>
    </Box>
  );
};

export default StatisticsCard;
