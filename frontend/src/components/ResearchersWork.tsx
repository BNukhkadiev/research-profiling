import React, { useState } from "react";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import PublicationsList from "./PublicationsList";
import { usePublicationsQuery } from "../react-query/usePublicationsQuery";

interface ResearchersWorkProps {
  author: string;
  authorId: string;
}

const ResearchersWork: React.FC<ResearchersWorkProps> = ({ author, authorId }) => {
  const [activeTab, setActiveTab] = useState("publications");

  const { data: publications = [], isLoading, isError } = usePublicationsQuery(authorId);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
          marginBottom: 3,
        }}
        variant="fullWidth"
      >
        <Tab value="publications" label="Publications" />
        <Tab value="repositories" label="Repositories" />
        <Tab value="huggingface" label="Models & Datasets" />
      </Tabs>

      {/* Tab Content */}
      <Box
        sx={{
          backgroundColor: "white",
          padding: 2,
          borderRadius: 2,
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Publications Tab */}
        {activeTab === "publications" && (
          <>
            <Typography
              variant="h6"
              sx={{ marginBottom: 2, fontWeight: "bold" }}
            >
              Publications by {author}
            </Typography>
            {isLoading ? (
              <Typography variant="body2">Loading publications...</Typography>
            ) : isError ? (
              <Typography variant="body2" color="error">
                Error fetching publications. Please try again later.
              </Typography>
            ) : publications.length > 0 ? (
              <PublicationsList authorId={authorId} />
            ) : (
              <Typography variant="body2" color="textSecondary">
                No publications found for {author}.
              </Typography>
            )}
          </>
        )}

        {/* Repositories Tab */}
        {activeTab === "repositories" && (
          <Box>
            <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: "bold" }}>
              Repositories by {author}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              This feature is under development.
            </Typography>
          </Box>
        )}

        {/* Hugging Face Models Tab */}
        {activeTab === "huggingface" && (
          <Box>
            <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: "bold" }}>
              Models & Datasets by {author}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              This feature is under development.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ResearchersWork;
