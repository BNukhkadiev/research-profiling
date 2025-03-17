import React, { useState } from "react";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import PublicationsList from "./PublicationsList";

interface Publication {
  id: string;
  url: string;
  title: string;
  year: number;
  venue?: string;
  authors: { name: string; id?: string }[];
  citationCount?: number; // Make sure we have a place for citation count
  topics?: string[];
  abstract?: string;
}

interface ResearchersWorkProps {
  author: string;
  authorId: string;
  filters: any; // Replace 'any' with your FilterState type if available
  publications: Publication[];
}

export const ResearchersWork: React.FC<ResearchersWorkProps> = ({
  author,
  authorId,
  filters,
  publications,
}) => {
  const [activeTab, setActiveTab] = useState("publications");

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
        {activeTab === "publications" && (
          <>
            <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: "bold" }}>
              Publications by {author}
            </Typography>
            {publications.length > 0 ? (
              <PublicationsList filters={filters} publications={publications} />
            ) : (
              <Typography variant="body2" color="textSecondary">
                No publications found for {author}.
              </Typography>
            )}
          </>
        )}

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

        {activeTab === "huggingface" && (
          <Box>
            <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: "bold" }}>
              Huggingface by {author}
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
