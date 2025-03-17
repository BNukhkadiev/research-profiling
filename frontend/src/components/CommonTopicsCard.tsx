import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import TopicIcon from "@mui/icons-material/Topic";
import Button from "@mui/material/Button";

export interface CommonTopicStats {
  [topic: string]: number;
}

interface CommonTopicsCardProps {
  topics: CommonTopicStats[];
}

const CommonTopicsCard: React.FC<CommonTopicsCardProps> = ({ topics }) => {
  const LOAD_STEP = 10; // Show 10 topics at a time
  const [visibleCount, setVisibleCount] = useState(LOAD_STEP); // Start by showing 10

  // Show more topics on button click
  const handleLoadMore = () => {
    setVisibleCount((prevCount) => Math.min(prevCount + LOAD_STEP, topics.length));
  };

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
        <>
          <List>
            {topics.slice(0, visibleCount).map((topic, index) => (
              <ListItem key={index} sx={{ padding: 0 }}>
                <ListItemIcon>
                  <TopicIcon sx={{ color: "#1976d2" }} />
                </ListItemIcon>
                <ListItemText
                  primary={`${topic.name} (${topic.count})`} // Display topic name and count
                  sx={{ color: "#555" }}
                />
              </ListItem>
            ))}
          </List>

          {/* Load More Button */}
          {visibleCount < topics.length && (
            <Button
              variant="contained"
              onClick={handleLoadMore}
              sx={{ marginTop: 2, textTransform: "none" }}
              fullWidth
            >
              Show More
            </Button>
          )}
        </>
      ) : (
        <Typography variant="body2" color="textSecondary">
          No topics available.
        </Typography>
      )}
    </Box>
  );
};

export default CommonTopicsCard;
