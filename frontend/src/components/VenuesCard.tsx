import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Table, TableBody, TableCell, TableRow } from "@mui/material";

const VenuesCard: React.FC = () => {
  const data = [
    { name: "ICML 2024", papers: 2, ranking: "A*" },
    { name: "NeurIPS 2024", papers: 1, ranking: "A" },
    { name: "Journal of Web Semantics", papers: 1, ranking: "B" },
    { name: "IEEE Computer", papers: 19, ranking: "C" },
  ];

  return (
    <Box
      sx={{
        padding: 3,
        borderRadius: "8px",
        backgroundColor: "#FFFFFF", // Light background
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          marginBottom: 2,
          color: "#333", // Darker title color
        }}
      >
        Venues
      </Typography>
      <Table
        size="small"
        sx={{ "& td": { border: "none", padding: "4px 8px" } }}
      >
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.name}>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                {item.name}
              </TableCell>
              <TableCell align="center" sx={{ color: "#555" }}>
                {item.papers}
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontStyle: "italic", color: "#555" }}
              >
                {item.ranking}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default VenuesCard;