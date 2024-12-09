import React, { useState } from "react";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import PublicationsList from "./PublicationsList";

const ResearchersWork: React.FC<{ author: string }> = ({ author }) => {
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
            <Typography
              variant="h6"
              sx={{ marginBottom: 2, fontWeight: "bold" }}
            >
              Publications by {author}
            </Typography>
            <PublicationsList author={author} />
          </>
        )}
        {activeTab === "repositories" && (
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Repositories by {author} are not available at the moment.
          </Typography>
        )}
        {activeTab === "huggingface" && (
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Models & Datasets by {author} are not available at the moment.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ResearchersWork;
