import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import TopicIcon from "@mui/icons-material/Topic"; // Add an icon for topics

const CommonTopicsCard: React.FC = () => {
  const topics = [
    "Machine Learning",
    "Data Mining",
    "Large Scale Computations",
  ];

  return (
    <Box
      sx={{
        padding: 3,
        borderRadius: "8px",
        backgroundColor: "#FFFFFF", // Light background
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          marginBottom: 2,
          color: "#333", // Darker title color
        }}
      >
        Common Topics
      </Typography>
      <List>
        {topics.map((topic) => (
          <ListItem key={topic} sx={{ padding: 0 }}>
            <ListItemIcon>
              <TopicIcon sx={{ color: "#1976d2" }} /> {/* Icon color */}
            </ListItemIcon>
            <ListItemText primary={topic} sx={{ color: "#555" }} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default CommonTopicsCard;
