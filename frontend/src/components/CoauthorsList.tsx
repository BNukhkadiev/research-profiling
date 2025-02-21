import React from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
<<<<<<< HEAD
import PersonIcon from "@mui/icons-material/Person"; // Import person icon

interface CoauthorsListProps {
  author: any;
=======
import PersonIcon from "@mui/icons-material/Person";
import { Link } from "react-router-dom";
import { Typography } from "@mui/material";

interface Coauthor {
  name: string;
  pid: string;
  publicationsTogether: number;
}

interface CoauthorsListProps {
  coauthors: Coauthor[];
>>>>>>> origin/bagas_branch
}

const CoauthorsList: React.FC<CoauthorsListProps> = ({ author }) => {
  const coauthors = ["Wolfgang Lehner", "Peter J. Haas"]; // Example coauthors

  return (
    <Box
      sx={{
        padding: 3,
        borderRadius: "8px",
        backgroundColor: "#FFF",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h3 style={{ fontWeight: "bold", marginBottom: "16px" }}>Coauthors</h3>
      <List>
<<<<<<< HEAD
        {coauthors.map((coauthor, index) => (
          <ListItem key={index} sx={{ padding: "8px 0" }}>
            <ListItemIcon>
              <PersonIcon sx={{ color: "#1976d2" }} /> {/* Icon color */}
            </ListItemIcon>
            <ListItemText primary={coauthor} />
          </ListItem>
        ))}
=======
        {coauthors.length > 0 ? (
          coauthors.map((coauthor, index) => {
            const encodedPid = encodeURIComponent(coauthor.pid);
            return (
              <ListItem key={index} sx={{ padding: "8px 0" }}>
                <ListItemIcon>
                  <PersonIcon sx={{ color: "#1976d2" }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <>
                      <Link
                        to={`/profile/${encodedPid}`}
                        style={{ textDecoration: "none", color: "#1976d2" }}
                      >
                        {coauthor.name}
                      </Link>
                      {" "}- {coauthor.publicationsTogether} papers
                    </>
                  }
                />
              </ListItem>
            );
          })
        ) : (
          <Typography variant="body2" color="textSecondary">
            No coauthors available.
          </Typography>
        )}
>>>>>>> origin/bagas_branch
      </List>
    </Box>
  );
};

export default CoauthorsList;
