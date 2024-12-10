import React from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PersonIcon from "@mui/icons-material/Person";
import { Link } from "react-router-dom";
import { Typography } from "@mui/material";

interface Coauthor {
  name: string;
  id: string;
}

interface CoauthorsListProps {
  coauthors: Coauthor[]; // Accept an array of coauthors as props
}

const CoauthorsList: React.FC<CoauthorsListProps> = ({ coauthors }) => {
  return (
    <Box
      sx={{
        padding: 3,
        borderRadius: "8px",
        backgroundColor: "#FFFF", // Light background
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", marginBottom: "16px", color: "#333" }}
      >
        Coauthors
      </Typography>
      <List>
        {coauthors.length > 0 ? (
          coauthors.map((coauthor, index) => (
            <ListItem key={index} sx={{ padding: "8px 0" }}>
              <ListItemIcon>
                <PersonIcon sx={{ color: "#1976d2" }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Link
                    to={`/profile/${coauthor.id}`}
                    style={{ textDecoration: "none", color: "#1976d2" }}
                  >
                    {coauthor.name}
                  </Link>
                }
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No coauthors available.
          </Typography>
        )}
      </List>
    </Box>
  );
};

export default CoauthorsList;
