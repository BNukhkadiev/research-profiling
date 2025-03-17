import React from "react";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  useComparisonResearchers,
  useRemoveResearcher,
} from "../react-query/useComparisonQuery";
import PublicationsLineChart from "../components/PublicationsLineChart";
import CoreRankingBarChart from "../components/CoreRankingBarChart";
import ResearchAreasPieChart from "../components/ResearchAreasPieChart";
import WordCloudChart from "../components/WordCloudChart";

const CompareResearchersPage = () => {
  const { researchers, isLoading } = useComparisonResearchers();
  const removeResearcherMutation = useRemoveResearcher();

  console.log("Researchers List:", researchers);

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
    return (
      <Typography variant="h6" sx={{ textAlign: "center", marginTop: 4 }}>
        No researchers selected for comparison.
      </Typography>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ marginBottom: 4 }}>
        Compare Researchers
      </Typography>

      {/* Researcher Info Cards */}
      <Grid container spacing={2}>
        {researchers.map(({ name, data, isLoading, isError }) => (
          <Grid item xs={12} sm={6} md={4} key={name}>
            <Box
              sx={{
                position: "relative",
                padding: 2,
                backgroundColor: "#fff",
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              <IconButton
                onClick={() => removeResearcherMutation.mutate(name)}
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  color: "gray",
                  "&:hover": { color: "black" },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>

              {isLoading ? (
                <CircularProgress />
              ) : isError || !data ? (
                <Typography color="error">
                  Failed to load researcher {name}
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
                    <strong>Total Citations:</strong> {data.totalCitations ?? "N/A"}
                  </Typography>
                </>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Charts for Comparison */}
      {researchers.length > 0 && (
        <>
          {/* Line and Bar Charts */}
          <Grid container spacing={2} sx={{ marginTop: 4 }}>
            <Grid item xs={12} md={6}>
              <PublicationsLineChart
                researchers={researchers.map(({ data }) => ({
                  name: data?.name || "Unknown",
                  papers: data?.publications || [],
                }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CoreRankingBarChart
                researchers={researchers.map(({ data }) => ({
                  name: data?.name || "Unknown",
                  papers: data?.publications || [],
                }))}
              />
            </Grid>
          </Grid>

          {/* Pie Chart */}
          <Box sx={{ marginTop: 4 }}>
            <ResearchAreasPieChart
              researchers={researchers.map(({ data }) => ({
                name: data?.name || "Unknown",
                papers: data?.publications || [],
              }))}
            />
          </Box>

          {/* Word Clouds */}
          <Grid container spacing={4} sx={{ marginTop: 4 }}>
            {researchers.map(({ data }) => (
              <Grid item xs={12} sm={6} md={4} key={data?.name || Math.random()}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: 1,
                  }}
                >
                  {data?.name || "Unknown"}'s Word Cloud
                </Typography>
                <WordCloudChart
                  topics={
                    data?.publications?.flatMap((p) => p.topics) || []
                  }
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default CompareResearchersPage;
