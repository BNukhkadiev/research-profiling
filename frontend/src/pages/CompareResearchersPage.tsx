import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast, ToastContainer } from "react-toastify";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import "react-toastify/dist/ReactToastify.css";
import {
  useComparisonResearchers,
  useRemoveResearcher,
} from "../react-query/useComparisonQuery";
import PublicationsLineChart from "../components/PublicationsLineChart";
import CoreRankingBarChart from "../components/CoreRankingBarChart";
import ResearchAreasPieChart from "../components/ResearchAreasPieChart";
import WordCloudChart from "../components/WordCloudChart";
import NetworkGraph from "../components/NetworkGraph";
import PreprintFinalizedBarChart from "../components/PreprintFinalizedBarChart";


const computeHIndex = (publications: { citations?: number }[]) => {
  const sortedCitations = publications
    .map((pub) => pub.citations ?? 0)
    .sort((a, b) => b - a);

  let h = 0;
  for (let i = 0; i < sortedCitations.length; i++) {
    if (sortedCitations[i] >= i + 1) {
      h = i + 1;
    } else {
      break;
    }
  }
  return h;
};

const computeGIndex = (publications: { citations?: number }[]) => {
  const sortedCitations = publications
    .map((pub) => pub.citations ?? 0)
    .sort((a, b) => b - a);

  let g = 0,
    citationSum = 0;
  for (let i = 0; i < sortedCitations.length; i++) {
    citationSum += sortedCitations[i];
    if (citationSum >= (i + 1) ** 2) {
      g = i + 1;
    } else {
      break;
    }
  }
  return g;
};

const CompareResearchersPage = () => {
  const { researchers, isLoading } = useComparisonResearchers();
  const removeResearcherMutation = useRemoveResearcher();
  const navigate = useNavigate();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedResearcher, setSelectedResearcher] = useState<string | null>(
    null
  );

  const handleOpenDialog = (name: string) => {
    setSelectedResearcher(name);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedResearcher(null);
  };

  const handleConfirmRemove = () => {
    if (selectedResearcher) {
      removeResearcherMutation.mutate(selectedResearcher, {
        onSuccess: () => {
          toast.success(`Removed ${selectedResearcher} from comparison list`);
          handleCloseDialog();
        },
      });
    }
  };

  const networkGraphData = researchers.map(({ data }) => {
    const totalPapers = data?.publications?.length || 0;
    const totalCitations = data?.publications?.reduce(
      (sum, pub) => sum + (pub.citations ?? 0),
      0
    );

    return {
      name: data?.name || "Unknown",
      totalPapers,
      totalCitations,
      coauthors: data?.coauthors || [],
    };
  });
  
  const preprintFinalizedData = researchers.map(({ data }) => ({
    name: data?.name || "Unknown",
    papers: data?.publications?.map((pub) => ({
      is_preprint: pub.is_preprint ?? false,
    })) || [],
  }));

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
      {/* Title + Plus Button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <Typography variant="h4">Compare Researchers</Typography>
      </Box>

      {/* Researcher Info Cards */}
      <Grid container spacing={2}>
        {researchers.map(({ name, data, isLoading, isError }) => {
          const totalPapers = data?.publications?.length || 0;
          const totalCitations = data?.publications?.reduce(
            (sum, pub) => sum + (pub.citations ?? 0),
            0
          );
          const hIndex = computeHIndex(data?.publications || []);
          const gIndex = computeGIndex(data?.publications || []);

          return (
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
                  onClick={() => handleOpenDialog(name)}
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
                      <strong>H-Index:</strong> {hIndex ?? "N/A"}
                    </Typography>
                    <Typography variant="body1">
                      <strong>G-Index:</strong> {gIndex ?? "N/A"}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Total Papers:</strong> {totalPapers ?? "N/A"}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Total Citations:</strong>{" "}
                      {totalCitations ?? "N/A"}
                    </Typography>
                  </>
                )}
              </Box>
            </Grid>
          );
        })}
        {/* ✅ Plus Button to go back and search more researchers */}
        <IconButton
          onClick={() => navigate("/")}
          sx={{
            color: "#232E58 !important", // Ensures it stays blue
            transition: "transform 0.2s, color 0.2s",
            "&:hover": {
              backgroundColor: "#F4F4F4 !important", // Ensures hover color stays blue
              transform: "scale(1.3)", // Makes the icon slightly larger on hover
            },
          }}
        >
          <AddCircleOutlineIcon sx={{ fontSize: 32 }} />{" "}
          {/* Bigger default size */}
        </IconButton>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Remove Researcher</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove{" "}
            <strong>{selectedResearcher}</strong> from the comparison list?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            No
          </Button>
          <Button
            onClick={handleConfirmRemove}
            color="primary"
            variant="contained"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

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
          {/* Network Graph */}
          <Box sx={{ marginTop: 4 }}>
              <Typography variant="h5" sx={{ textAlign: "center", marginBottom: 2 }}>
                Co-authorship Network
              </Typography>
              <NetworkGraph researchers={networkGraphData} />
          </Box>
          {/* Preprint vs Finalized Bar Chart */}
          <Box sx={{ marginTop: 4 }}>
            <PreprintFinalizedBarChart researchers={preprintFinalizedData} />
          </Box>
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
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={data?.name || Math.random()}
              >
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
                  topics={data?.publications?.flatMap((p) => p.topics) || []}
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
