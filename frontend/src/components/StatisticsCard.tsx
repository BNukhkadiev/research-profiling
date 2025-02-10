import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InsightsIcon from "@mui/icons-material/Insights"; // Icon for statistics

interface StatisticsCardProps {
  author: {
    papers?: number;
    citations?: number;
    hIndex?: number;
    gIndex?: number;
  };
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ author }) => {
  const stats = [
    { label: "Total Papers", value: author.papers ?? "N/A" },
    { label: "Total Citations", value: author.citations ?? "N/A" },
    { label: "H-Index", value: author.hIndex ?? "N/A" },
    { label: "G-Index", value: author.gIndex ?? "N/A" },
  ];

  return (
    <Box
      sx={{
        padding: 3,
        borderRadius: "8px",
        backgroundColor: "#FFF", // Light background
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          marginBottom: 2,
          color: "#333", // Title color
        }}
      >
        Researcher Statistics
      </Typography>
      <List>
        {stats.map((stat, index) => (
          <ListItem key={index} sx={{ padding: "6px 0" }}>
            <ListItemIcon>
              <InsightsIcon sx={{ color: "#1976d2" }} />
            </ListItemIcon>
            <ListItemText
              primary={stat.label}
              secondary={stat.value.toString()}
              sx={{ color: "#555" }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default StatisticsCard;
