import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import UserCard from "../components/UserCard";
import PublicationsPerYearChart from "../components/PublicationsPerYearChart";
import CoreRankingChart from "../components/CoreRankingChart";

const ComparisonPage: React.FC = () => {
  const [researchers, setResearchers] = useState([
    { name: "Rainer Gemulla", institution: "University of Mannheim" },
    { name: "Daniel Ruffinelli", institution: "University of Stuttgart" },
    { name: "Alexander Renz-Wieland", institution: "ETH Zurich" },
  ]);

  const [open, setOpen] = useState(false); // State to manage dialog visibility
  const [newResearcherName, setNewResearcherName] = useState(""); // State to hold new researcher name

  // Handle opening the dialog
  const handleOpenDialog = () => {
    setOpen(true);
  };

  // Handle closing the dialog
  const handleCloseDialog = () => {
    setOpen(false);
    setNewResearcherName(""); // Clear input
  };

  // Handle adding a new researcher
  const handleAddResearcher = () => {
    if (newResearcherName.trim()) {
      setResearchers((prev) => [
        ...prev,
        { name: newResearcherName, institution: "Unknown Institution" },
      ]);
    }
    handleCloseDialog();
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      {/* Title */}
      <Typography variant="h4" sx={{ marginBottom: 4, fontWeight: "bold" }}>
        Compare Researchers
      </Typography>

      {/* User Cards */}
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        {researchers.map((researcher, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <UserCard
              name={researcher.name}
              institution={researcher.institution}
            />
          </Grid>
        ))}
      </Grid>

      {/* Add New Researcher Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <IconButton
          color="primary"
          onClick={handleOpenDialog}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <AddCircleOutlineIcon fontSize="large" />
          <Typography variant="body2" color="primary">
            Add Researcher
          </Typography>
        </IconButton>
      </Box>

      {/* Charts Section */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              backgroundColor: "white",
              padding: 2,
              borderRadius: 2,
              boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography
              variant="h6"
              sx={{ marginBottom: 2, fontWeight: "bold" }}
            >
              Number of Publications Per Year
            </Typography>
            <PublicationsPerYearChart />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              backgroundColor: "white",
              padding: 2,
              borderRadius: 2,
              boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography
              variant="h6"
              sx={{ marginBottom: 2, fontWeight: "bold" }}
            >
              Number of CORE Ranking Publications
            </Typography>
            <CoreRankingChart />
          </Box>
        </Grid>
      </Grid>

      {/* Dialog for Searching New Researcher */}
      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Search for New Author</DialogTitle>
        <DialogContent>
          <TextField
            label="Researcher Name"
            fullWidth
            value={newResearcherName}
            onChange={(e) => setNewResearcherName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddResearcher} variant="contained">
            Add Researcher
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComparisonPage;
