import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import TopicIcon from "@mui/icons-material/Topic";

interface CommonTopicsCardProps {
  topics: string[];
}

const CommonTopicsCard: React.FC<CommonTopicsCardProps> = ({ topics }) => {
  return (
    <Box
      sx={{
        padding: 3,
        borderRadius: "8px",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          marginBottom: 2,
          color: "#333",
        }}
      >
        Common Topics
      </Typography>
      {topics.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
          No topics found for these filters.
        </Typography>
      ) : (
        <List>
          {topics.map((topic) => (
            <ListItem key={topic} sx={{ padding: 0 }}>
              <ListItemIcon>
                <TopicIcon sx={{ color: "#1976d2" }} />
              </ListItemIcon>
              <ListItemText primary={topic} sx={{ color: "#555" }} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default CommonTopicsCard;
