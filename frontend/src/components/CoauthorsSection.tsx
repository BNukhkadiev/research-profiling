import React, { useState } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

interface Coauthor {
  name: string;
  pid: string;
  publicationsTogether: number;
}

interface CoauthorsSectionProps {
  coauthors: Coauthor[];
}

const CoauthorsSection: React.FC<CoauthorsSectionProps> = ({ coauthors }) => {
  const [visibleCount, setVisibleCount] = useState(5);

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 5);
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
      <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "16px" }}>
        Coauthors
      </Typography>
      <List>
        {coauthors.length > 0 ? (
          coauthors.slice(0, visibleCount).map((coauthor) => {
            const encodedPid = encodeURIComponent(coauthor.pid);
            return (
              <ListItem key={coauthor.pid} sx={{ padding: "8px 0" }}>
                <ListItemText
                  primary={
                    <>
                      <Link
                        to={`/profile/${encodedPid}`}
                        style={{ color: "#1976d2", textDecoration: "none" }}
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
      </List>
      {visibleCount < coauthors.length && (
        <Box sx={{ textAlign: "center", marginTop: 2 }}>
          <Button variant="contained" color="primary" onClick={handleLoadMore}>
            Load More
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CoauthorsSection;
