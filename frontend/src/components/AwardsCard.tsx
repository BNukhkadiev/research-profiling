import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"; // Award icon

const AwardsCard: React.FC = () => {
  return (
    <Box
      sx={{
        padding: 3,
        borderRadius: "8px",
        backgroundColor: "#FFFFFF", // Light background color
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          marginBottom: 2,
          color: "#333", // Darker color for title
        }}
      >
        Awards
      </Typography>
      <List>
        <ListItem>
          <ListItemIcon>
            <EmojiEventsIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="2021 Data Mining Most Influential Scholars" />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <EmojiEventsIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="2018 Database-10 Most Influential Scholars" />
        </ListItem>
      </List>
    </Box>
  );
};

export default AwardsCard;
