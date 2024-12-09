import React from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PersonIcon from "@mui/icons-material/Person"; // Import person icon

interface CoauthorsListProps {
  author: any;
}

const CoauthorsList: React.FC<CoauthorsListProps> = ({ author }) => {
  const coauthors = ["Wolfgang Lehner", "Peter J. Haas"]; // Example coauthors

  return (
    <Box
      sx={{
        padding: 3,
        borderRadius: "8px",
        backgroundColor: "#FFFF", // Light background
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h3 style={{ fontWeight: "bold", marginBottom: "16px" }}>Coauthors</h3>
      <List>
        {coauthors.map((coauthor, index) => (
          <ListItem key={index} sx={{ padding: "8px 0" }}>
            <ListItemIcon>
              <PersonIcon sx={{ color: "#1976d2" }} /> {/* Icon color */}
            </ListItemIcon>
            <ListItemText primary={coauthor} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default CoauthorsList;
