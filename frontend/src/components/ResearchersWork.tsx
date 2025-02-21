import React, { useState } from "react";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import PublicationsList from "./PublicationsList";

<<<<<<< HEAD
const ResearchersWork: React.FC<{ author: string }> = ({ author }) => {
=======
interface ResearchersWorkProps {
  author: string;
  authorId: string;
  publications: {
    title: string;
    year: number;
    type: string;
    venue: string;
    citations: number;
    topics: string[];
    authors: { name: string; pid: string }[];
    links: string[];
  }[];
}

const ResearchersWork: React.FC<ResearchersWorkProps> = ({ author, authorId, publications }) => {
>>>>>>> origin/bagas_branch
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
<<<<<<< HEAD
            <PublicationsList author={author} />
=======
            {publications.length > 0 ? (
              <PublicationsList publications={publications} />
            ) : (
              <Typography variant="body2" color="textSecondary">
                No publications found for {author}.
              </Typography>
            )}
>>>>>>> origin/bagas_branch
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
