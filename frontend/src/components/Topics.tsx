import React from "react";
import { Box, Typography, Chip } from "@mui/material";

const Topics: React.FC<{ topics?: string[] }> = ({ topics = [] }) => {
  // Example static topics if none are provided
  const staticTopics = [
    "Machine Learning",
    "Knowledge Graphs",
    "Deep Learning",
    "Natural Language Processing",
    "Semantic Web",
  ];

  const displayTopics = topics.length > 0 ? topics : staticTopics;

  return (
    <Box sx={{ marginBottom: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
        Topics
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {displayTopics.map((topic, index) => (
          <Chip
            key={index}
            label={topic}
            sx={{
              textTransform: "none",
              fontSize: "14px",
              backgroundColor: "#e3f2fd",
              color: "#1976d2",
              "&:hover": {
                backgroundColor: "#bbdefb",
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Topics;