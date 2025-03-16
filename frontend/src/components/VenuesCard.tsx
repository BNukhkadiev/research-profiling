import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";

interface VenueData {
  name: string;
  count: number;
  coreRank: string;
}

interface VenuesCardProps {
  venues: VenueData[];
}

const VenuesCard: React.FC<VenuesCardProps> = ({ venues }) => {
  const [visibleCount, setVisibleCount] = useState(5); // Number of venues to display initially

  // Load more venues by 5
  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 5);
  };

  // Sort venues by count descending (optional, but often makes sense)
  const sortedVenues = [...venues].sort((a, b) => b.count - a.count);

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
        Venues
      </Typography>

      {sortedVenues.length > 0 ? (
        <>
          <Table
            size="small"
            aria-label="List of venues with paper counts and CORE ranks"
            sx={{ "& td, & th": { border: "none", padding: "6px 8px" } }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Venue</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Count
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  CORE Rank
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedVenues.slice(0, visibleCount).map((venue) => (
                <TableRow key={venue.name || Math.random()}>
                  <TableCell sx={{ color: "#333" }}>
                    {venue.name || "Unknown Venue"}
                  </TableCell>
                  <TableCell align="center" sx={{ color: "#555" }}>
                    {venue.count}
                  </TableCell>
                  <TableCell align="right" sx={{ fontStyle: "italic", color: "#555" }}>
                    {venue.coreRank || "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Load More Button when more venues exist */}
          {visibleCount < sortedVenues.length && (
            <Button
              variant="contained"
              onClick={handleLoadMore}
              sx={{
                marginTop: 2,
                textTransform: "none",
              }}
              fullWidth
            >
              Load More
            </Button>
          )}
        </>
      ) : (
        // Graceful message if no venues available
        <Typography variant="body2" color="textSecondary">
          No venues available.
        </Typography>
      )}
    </Box>
  );
};

export default VenuesCard;
