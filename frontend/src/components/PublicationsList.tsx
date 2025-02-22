// src/components/PublicationsList.tsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

interface Publication {
  url: string;
  title: string;
  year: number;
  venue?: string;
  authors: { name: string; id?: string }[];
  // Add other fields if needed
}

interface PublicationsListProps {
  publications: Publication[];
}

const PublicationsList: React.FC<PublicationsListProps> = ({ publications }) => {
  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);

  if (publications.length === 0) {
    return <Typography>No publications available.</Typography>;
  }

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  const handleViewDetails = (publication: Publication) => {
    setSelectedPublication(publication);
  };

  const handleCloseDetails = () => {
    setSelectedPublication(null);
  };

  return (
    <Box>
      {publications.slice(0, visibleCount).map((pub) => (
        <Box key={pub.url} sx={{ padding: 2, border: "1px solid #ddd", marginBottom: 2 }}>
          <Typography variant="h6">{pub.title}</Typography>
          <Typography>{pub.venue || "Unknown Venue"}</Typography>
          <Typography>Year: {pub.year}</Typography>
          <Button variant="contained" onClick={() => handleViewDetails(pub)}>
            View Details
          </Button>
        </Box>
      ))}

      {visibleCount < publications.length && (
        <Button variant="contained" onClick={handleLoadMore}>
          Load More
        </Button>
      )}

      {/* Modal for publication details */}
      <Dialog open={Boolean(selectedPublication)} onClose={handleCloseDetails}>
        {selectedPublication && (
          <>
            <DialogTitle>{selectedPublication.title}</DialogTitle>
            <DialogContent>
              <Typography>
                <strong>Venue:</strong> {selectedPublication.venue || "Unknown Venue"}
              </Typography>
              <Typography>
                <strong>Year:</strong> {selectedPublication.year}
              </Typography>
              <Typography>
                <strong>Authors:</strong>{" "}
                {selectedPublication.authors.map((a) => a.name).join(", ")}
              </Typography>
              <Typography>
                <strong>URL:</strong>{" "}
                <a href={selectedPublication.url} target="_blank" rel="noopener noreferrer">
                  {selectedPublication.url}
                </a>
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default PublicationsList;
