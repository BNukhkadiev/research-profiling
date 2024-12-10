import React, { useState } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { Link } from "react-router-dom";

interface Coauthor {
  name: string;
  id: string;
}

interface CoauthorsSectionProps {
  coauthors: Coauthor[];
}

const CoauthorsSection: React.FC<CoauthorsSectionProps> = ({ coauthors }) => {
  const [visibleCount, setVisibleCount] = useState(5); // Number of coauthors to display initially

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 5); // Increment by 5
  };

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
        {coauthors.slice(0, visibleCount).map((coauthor) => (
          <ListItem key={coauthor.id} sx={{ padding: "8px 0" }}>
            <ListItemText
              primary={
                <Link
                  to={`/profile/${coauthor.id}`}
                  style={{
                    color: "#1976d2",
                    textDecoration: "none",
                  }}
                >
                  {coauthor.name}
                </Link>
              }
            />
          </ListItem>
        ))}
      </List>
      {visibleCount < coauthors.length && (
        <Box sx={{ textAlign: "center", marginTop: 2 }}>
          <button
            onClick={handleLoadMore}
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            Load More
          </button>
        </Box>
      )}
    </Box>
  );
};

export default CoauthorsSection;
