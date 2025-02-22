import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Table, TableBody, TableCell, TableRow, Button } from "@mui/material";

export interface VenueData {
  name: string;
  count: number;
  coreRank: string;
}

interface VenuesCardProps {
  venues: VenueData[];
}

const VenuesCard: React.FC<VenuesCardProps> = ({ venues }) => {
  const [visibleCount, setVisibleCount] = useState(5); // Initial number of venues to display

  // Function to load more venues
  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 5); // Show 5 more venues
  };

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
      <Table
        size="small"
        sx={{ "& td": { border: "none", padding: "4px 8px" } }}
      >
        <TableBody>
          {venues.slice(0, visibleCount).map((venue) => (
            <TableRow key={venue.name}>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                {venue.name}
              </TableCell>
              <TableCell align="center" sx={{ color: "#555" }}>
                {venue.count}
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontStyle: "italic", color: "#555" }}
              >
                {venue.coreRank || "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Load More Button */}
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
