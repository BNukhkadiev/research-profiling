import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import TopicIcon from "@mui/icons-material/Topic";

export interface CommonTopicStats {
  [topic: string]: number;
}

interface CommonTopicsCardProps {
  topics: CommonTopicStats[];
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
      {topics.length > 0 ? (
        <List>
          {topics.map((topicObj, index) => {
            const topic = Object.keys(topicObj)[0];
            const count = topicObj[topic];
            return (
              <ListItem key={index} sx={{ padding: 0 }}>
                <ListItemIcon>
                  <TopicIcon sx={{ color: "#1976d2" }} />
                </ListItemIcon>
                <ListItemText
                  primary={`${topic} (${count})`}
                  sx={{ color: "#555" }}
                />
              </ListItem>
            );
          })}
        </List>
      ) : (
        <Typography variant="body2" color="textSecondary">
          No topics available.
        </Typography>
      )}
    </Box>
  );
};

export default CommonTopicsCard;
