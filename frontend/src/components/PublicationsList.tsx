import React, { useState } from "react";
import { Box, Typography, Button, Stack, Link, DialogContent, DialogActions, Dialog, DialogTitle } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Define the Publication interface
export interface Publication {
  id: string; // Unique identifier
  url: string;
  title: string;
  year: number;
  venue?: string;
  authors: { name: string; id?: string }[];
  citationCount?: number;
  topics?: string[];
  abstract?: string;
}

interface PublicationsListProps {
  publications: Publication[];
  filters: any; // Replace with your FilterState type if needed
  mainAuthorId?: string; // Optionally exclude main author from coauthors
}

/**
 * PublicationItem displays the publication details using data from the publication object.
 * It provides a "Go to Publication" button to open the URL.
 */
const PublicationItem: React.FC<{
  pub: Publication;
  mainAuthorId?: string;
  onViewDetails: (pub: Publication) => void;
}> = ({ pub, mainAuthorId, onViewDetails }) => {
  const citationCount = pub.citationCount ?? 0;
  const url = pub.url && pub.url !== "N/A" ? pub.url : "";

  const renderCoauthors = () => {
    if (!pub.authors || pub.authors.length === 0) return "Unknown Authors";
    const coauthors = mainAuthorId
      ? pub.authors.filter((a) => a.id !== mainAuthorId)
      : pub.authors;
    return coauthors.map((a) => a.name).join(", ");
  };

  return (
    <Box sx={{ padding: 2, border: "1px solid #ddd", marginBottom: 2 }}>
      <Typography variant="h6">{pub.title || "Untitled Publication"}</Typography>
      <Typography>{pub.venue || "Unknown Venue"}</Typography>
      <Typography>Year: {pub.year}</Typography>

      {/* Citation Count */}
      <Typography variant="body2" color="textSecondary">
        Citations: {citationCount}
      </Typography>

      {/* Topics */}
      {pub.topics && pub.topics.length > 0 && (
        <Typography variant="body2" color="textSecondary">
          Topics: {pub.topics.join(", ")}
        </Typography>
      )}

      {/* Coauthors */}
      <Typography variant="body2" color="textSecondary">
        Coauthors: {renderCoauthors()}
      </Typography>

      {/* Buttons */}
      <Box sx={{ marginTop: 1, display: "flex", gap: 1 }}>
        {url ? (
          <Button
            variant="outlined"
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
          >
            Go to Publication
          </Button>
        ) : (
          <Typography variant="body2">URL: N/A</Typography>
        )}
        <Button variant="contained" onClick={() => onViewDetails(pub)}>
          View Details
        </Button>
      </Box>
    </Box>
  );
};

const PublicationsList: React.FC<PublicationsListProps> = ({
  publications,
  filters,
  mainAuthorId,
}) => {
  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedPublication, setSelectedPublication] =
    useState<Publication | null>(null);

  const handleLoadMore = () => setVisibleCount((prev) => prev + 5);
  const handleViewDetails = (pub: Publication) => setSelectedPublication(pub);
  const handleCloseDetails = () => setSelectedPublication(null);

  return (
    <Box>
      {publications.slice(0, visibleCount).map((pub) => (
        <PublicationItem
          key={pub.id}
          pub={pub}
          mainAuthorId={mainAuthorId}
          onViewDetails={handleViewDetails}
        />
      ))}

      {visibleCount < publications.length && (
        <Button variant="contained" onClick={handleLoadMore}>
          Load More
        </Button>
      )}

      <Dialog open={Boolean(selectedPublication)} onClose={handleCloseDetails}>
        {selectedPublication && (
          <>
            <DialogTitle>{selectedPublication.title}</DialogTitle>
            <DialogContent>
              <Typography>
                <strong>Venue:</strong>{" "}
                {selectedPublication.venue || "Unknown Venue"}
              </Typography>
              <Typography>
                <strong>Year:</strong> {selectedPublication.year}
              </Typography>
              <Typography>
                <strong>Authors:</strong>{" "}
                {selectedPublication.authors.map((a) => a.name).join(", ")}
              </Typography>
              <Typography>
                <strong>Citations:</strong>{" "}
                {selectedPublication.citationCount ?? 0}
              </Typography>
              {selectedPublication.topics &&
                selectedPublication.topics.length > 0 && (
                  <Typography>
                    <strong>Topics:</strong>{" "}
                    {selectedPublication.topics.join(", ")}
                  </Typography>
                )}
              <Typography>
                <strong>Coauthors:</strong>{" "}
                {selectedPublication.authors
                  .filter((a) => a.id !== mainAuthorId)
                  .map((a) => a.name)
                  .join(", ") || "Unknown Authors"}
              </Typography>
              <Typography>
                <strong>URL:</strong>{" "}
                {selectedPublication.url && selectedPublication.url !== "N/A" ? (
                  <a
                    href={selectedPublication.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selectedPublication.url}
                  </a>
                ) : (
                  "N/A"
                )}
              </Typography>
              {selectedPublication.abstract && (
                <Typography>
                  <strong>Abstract:</strong> {selectedPublication.abstract}
                </Typography>
              )}
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
