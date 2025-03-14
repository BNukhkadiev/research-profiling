import React from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"; // ✅ Import Close (X) icon
import {
  useComparisonResearchers,
  useRemoveResearcher,
} from "../react-query/useComparisonQuery";
import PublicationsLineChart from "../components/PublicationsLineChart";
import CoreRankingBarChart from "../components/CoreRankingBarChart";
import ResearchAreasPieChart from "../components/ResearchAreasPieChart";

const CompareResearchersPage = () => {
  const { researchers, isLoading } = useComparisonResearchers();
  const removeResearcherMutation = useRemoveResearcher();

  console.log(" Researchers List:", researchers); //  Debugging researchers list

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!researchers || researchers.length === 0) {
    return <Typography>No researchers selected for comparison.</Typography>;
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ marginBottom: 4 }}>
        Compare Researchers
      </Typography>

      {/* Researcher Info Cards */}
      <Grid container spacing={2}>
        {researchers.map(({ pid, data, isLoading, isError }) => (
          <Grid item xs={12} sm={6} md={4} key={pid}>
            <Box
              sx={{
                position: "relative", // ✅ Enable absolute positioning for the X button
                padding: 2,
                backgroundColor: "#fff",
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              {/* Small "X" button on top-right */}
              <IconButton
                onClick={() => removeResearcherMutation.mutate(pid)}
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  color: "gray",
                  "&:hover": { color: "black" }, // Make it darker on hover
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
              {isLoading ? (
                <CircularProgress />
              ) : isError || !data ? (
                <Typography color="error">
                  Failed to load researcher {pid}
                </Typography>
              ) : (
                <>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {data.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 1 }}
                  >
                    {data.affiliations?.join(", ") || "No affiliations"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>H-Index:</strong> {data.hIndex ?? "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Total Papers:</strong> {data.totalPapers ?? "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Total Citations:</strong>{" "}
                    {data.totalCitations ?? "N/A"}
                  </Typography>
                </>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Charts for comparison */}
      {researchers.length > 0 && (
        <>
          <Grid container spacing={2} sx={{ marginTop: 4 }}>
            <Grid item xs={12} md={6}>
              <PublicationsLineChart
                researchers={researchers.map(({ data }) => ({
                  name: data?.name || "Unknown",
                  papers: data?.papers || [],
                }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CoreRankingBarChart
                researchers={researchers.map(({ data }) => ({
                  name: data?.name || "Unknown",
                  papers: data?.papers || [], // Send `papers` instead of `venues`
                }))}
              />
            </Grid>
          </Grid>

          <Box sx={{ marginTop: 4 }}>
            <ResearchAreasPieChart
              researchers={researchers.map(({ data }) => ({
                name: data?.name || "Unknown",
                papers: data?.papers || [], // ✅ Ensure `papers` is always an array
              }))}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default CompareResearchersPage;
