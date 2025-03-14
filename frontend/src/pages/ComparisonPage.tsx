import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { useResearcherProfileQuery } from "../react-query/useResearcherProfileQuery";
import {
  useComparisonResearchers,
  useCompareResearcher,
} from "../react-query/useComparisonQuery";

const ComparisonPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedPids = searchParams.get("authors")?.split(",") || [];
  const { data: selectedResearchers = [] } = useComparisonResearchers() ?? {
    data: [],
  };
  const compareResearcherMutation = useCompareResearcher();

  const handleRemoveFromComparison = (pid: string) => {
    compareResearcherMutation.mutate({ pid, action: "remove" });
    const updatedPids = selectedPids.filter((id) => id !== pid);
    setSearchParams({ authors: updatedPids.join(",") });
  };

  const handleClearAll = () => {
    selectedPids.forEach((pid) =>
      compareResearcherMutation.mutate({ pid, action: "remove" })
    );
    setSearchParams({ authors: "" });
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Researcher Comparison
      </Typography>

      {selectedPids.length === 0 ? (
        <Typography>No researchers selected for comparison.</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {selectedPids.map((pid) => {
            const { data: researcher, isLoading } =
              useResearcherProfileQuery(pid);

            if (isLoading)
              return (
                <Typography key={pid}>Loading researcher data...</Typography>
              );
            if (!researcher) return null;

            return (
              <Card
                key={researcher.pid}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 2,
                }}
              >
                <CardContent>
                  <Typography variant="h6">{researcher.name}</Typography>
                  <Typography variant="body2">
                    Affiliations: {researcher.affiliations.join(", ") || "N/A"}
                  </Typography>
                </CardContent>
                <IconButton
                  onClick={() => handleRemoveFromComparison(researcher.pid)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Card>
            );
          })}
        </Box>
      )}

      {selectedPids.length > 0 && (
        <Button
          variant="contained"
          color="secondary"
          onClick={handleClearAll}
          sx={{ marginTop: 3 }}
        >
          Clear All
        </Button>
      )}
    </Box>
  );
};

export default ComparisonPage;
