import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Table, TableBody, TableCell, TableRow, Button } from "@mui/material";
import { getCoreRanking } from "../utilities/coreRankings";

export interface VenueData {
  name: string;
  count: number;
  coreRank?: string;
}

interface VenuesCardProps {
  venues: VenueData[];
}

const VenuesCard: React.FC<VenuesCardProps> = ({ venues }) => {
  const [visibleCount, setVisibleCount] = useState(5);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5);
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
      <Table size="small" sx={{ "& td, & th": { border: "none", padding: "4px 8px" } }}>
        <TableBody>
          {venues.slice(0, visibleCount).map((venue) => (
            <TableRow key={venue.name}>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                {venue.name}
              </TableCell>
              <TableCell align="center" sx={{ color: "#555" }}>
                {venue.count}
              </TableCell>
              <TableCell align="right" sx={{ fontStyle: "italic", color: "#555" }}>
                {venue.coreRank ? venue.coreRank : getCoreRanking(venue.name) || "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {visibleCount < venues.length && (
        <Button
          variant="contained"
          onClick={handleLoadMore}
          sx={{
            marginTop: 2,
            textTransform: "none",
          }}
        >
          Load More
        </Button>
      )}
    </Box>
  );
};

export default VenuesCard;
