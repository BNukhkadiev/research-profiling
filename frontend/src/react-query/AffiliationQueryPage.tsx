import React, { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";import axios from "axios";

const AffiliationQueryPage: React.FC = () => {
  const [researcherId, setResearcherId] = useState("");
  const [affiliations, setAffiliations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetchAffiliations = async () => {
    if (!researcherId.trim()) {
      setError("Researcher ID is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await axios.get(`/api/researchers/${researcherId}/affiliations/`);
      setAffiliations(response.data.affiliations || []);
    } catch (err) {
      console.error("Error fetching affiliations:", err);
      setError("Failed to fetch affiliations. Please check the researcher ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 4, minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      <Typography variant="h4" sx={{ marginBottom: 3 }}>
        Query Researcher Affiliations
      </Typography>

      {/* Input Field */}
      <Box sx={{ display: "flex", gap: 2, marginBottom: 3 }}>
        <TextField
          label="Researcher ID"
          variant="outlined"
          value={researcherId}
          onChange={(e) => setResearcherId(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <Button variant="contained" onClick={handleFetchAffiliations} disabled={loading}>
          {loading ? "Loading..." : "Fetch"}
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Typography variant="body2" color="error" sx={{ marginBottom: 2 }}>
          {error}
        </Typography>
      )}

      {/* Timeline */}
      {affiliations.length > 0 ? (
        <Timeline>
          {affiliations.map((affiliation: { institution: string; position?: string; start_year: string; end_year?: string }, index) => (
            <TimelineItem key={index}>
              <TimelineSeparator>
                <TimelineDot />
                {index < affiliations.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      ) : (
        !loading && <Typography>No affiliations found.</Typography>
      )}
    </Box>
  );
};

export default AffiliationQueryPage;
