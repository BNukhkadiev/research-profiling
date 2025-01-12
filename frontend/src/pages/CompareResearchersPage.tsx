import React from "react";
import { Box, Typography, Grid, Button } from "@mui/material";
import ResearcherCard from "../components/ResearcherCard";
import LineChart from "../components/LineChart";
import { BarChart, PieChart } from "recharts";

const CompareResearchersPage: React.FC = () => {
  return (
    <Box sx={{ padding: 4 }}>
      {/* Header Section */}
      <Typography variant="h5" sx={{ marginBottom: 4 }}>
        Compare Researchers
      </Typography>
      <Grid container spacing={2} sx={{ marginBottom: 4 }}>
        {[1, 2, 3].map((_, index) => (
          <Grid item xs={4} key={index}>
            <ResearcherCard
              name={`Researcher ${index + 1}`}
              profileUrl=""
              affiliations={`Affiliation ${index + 1}`}
            />
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={4}>
        {/* Number of Publications */}
        <Grid item xs={6}>
          <Box
            sx={{
              padding: 2,
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              Number of publications per year
            </Typography>
            <LineChart />
            <Button variant="outlined" sx={{ marginTop: 2 }}>
              Download Report
            </Button>
          </Box>
        </Grid>

        {/* CORE Ranking */}
        <Grid item xs={6}>
          <Box
            sx={{
              padding: 2,
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              Number of CORE ranking publications
            </Typography>
            <BarChart />
            <Button variant="outlined" sx={{ marginTop: 2 }}>
              Download Report
            </Button>
          </Box>
        </Grid>

        {/* Researcher Areas */}
        <Grid item xs={12}>
          <Box
            sx={{
              padding: 2,
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              Researcher Areas
            </Typography>
            <Grid container spacing={2}>
              {[1, 2, 3].map((_, index) => (
                <Grid item xs={4} key={index}>
                  <PieChart />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CompareResearchersPage;