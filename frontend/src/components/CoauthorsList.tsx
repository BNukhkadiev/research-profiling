import React, { useState } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PersonIcon from "@mui/icons-material/Person";
import { Link } from "react-router-dom";
import { Typography, Button } from "@mui/material";

interface Coauthor {
  name: string;
  publicationsTogether: number;
}

interface CoauthorsListProps {
  coauthors: Coauthor[];
}

const CoauthorsList: React.FC<CoauthorsListProps> = ({ coauthors }) => {
  const LOAD_STEP = 10; // ✅ Number of coauthors to load per step
  const [visibleCount, setVisibleCount] = useState(LOAD_STEP); // Show first 'LOAD_STEP' coauthors

  // Show more coauthors (next step)
  const handleLoadMore = () => {
    setVisibleCount((prevCount) => Math.min(prevCount + LOAD_STEP, coauthors.length));
  };

  return (
    <Box
      sx={{
        padding: 3,
        borderRadius: "8px",
        backgroundColor: "#FFF",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", marginBottom: "16px", color: "#333" }}
      >
        Coauthors
      </Typography>
      {coauthors.length > 0 ? (
        <>
          <List>
            {coauthors.slice(0, visibleCount).map((coauthor) => {
              const encodedName = encodeURIComponent(coauthor.name);
              return (
                <ListItem key={coauthor.name} sx={{ padding: "8px 0" }}>
                  <ListItemIcon>
                    <PersonIcon sx={{ color: "#1976d2" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <>
                        <Link
                          to={`/profile/${encodedName}`}
                          style={{ textDecoration: "none", color: "#1976d2" }}
                        >
                          {coauthor.name}
                        </Link>{" "}
                        – {coauthor.publicationsTogether} papers
                      </>
                    }
                  />
                </ListItem>
              );
            })}
          </List>

          {/* Load More Button */}
          {visibleCount < coauthors.length && (
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
          No coauthors available.
        </Typography>
      )}
    </Box>
  );
};

export default CoauthorsList;
