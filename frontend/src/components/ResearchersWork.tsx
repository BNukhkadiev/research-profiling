import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import PublicationsList from "./PublicationsList";

interface Repository {
  name: string;
  full_name: string;
  html_url: string;
  description: string;
}

interface GithubResponse {
  github_url: string;
  repositories: Repository[];
}

interface HuggingFaceResponse {
  huggingface_url: string;
  models: string[];
  datasets: string[];
}

interface ResearchersWorkProps {
  author: string;
  authorId: string;
  affiliations: string[];
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

const ResearchersWork: React.FC<ResearchersWorkProps> = ({
  author,
  authorId,
  affiliations,
  publications,
}) => {
  const [activeTab, setActiveTab] = useState("publications");

  // GitHub API states
  const [githubData, setGithubData] = useState<GithubResponse | null>(null);
  const [loadingGitHub, setLoadingGitHub] = useState(false);
  const [errorGitHub, setErrorGitHub] = useState("");

  // Hugging Face API states
  const [huggingfaceData, setHuggingfaceData] = useState<HuggingFaceResponse | null>(null);
  const [loadingHuggingface, setLoadingHuggingface] = useState(false);
  const [errorHuggingface, setErrorHuggingface] = useState("");

  const primaryAffiliation = affiliations.length > 0 ? affiliations[0] : "";

  // Function to fetch GitHub data
  const fetchGitHubData = () => {
    if (!author || !primaryAffiliation) return;

    setLoadingGitHub(true);
    setErrorGitHub("");

    fetch(
      `http://127.0.0.1:8000/api/github-profile?name=${encodeURIComponent(author)}&affiliation=${encodeURIComponent(
        primaryAffiliation
      )}`
    )
      .then((res) => res.json())
      .then((data: GithubResponse) => {
        setGithubData(data);
        setLoadingGitHub(false);
      })
      .catch((error) => {
        console.error("Error fetching GitHub data:", error);
        setErrorGitHub("Failed to fetch GitHub data.");
        setLoadingGitHub(false);
      });
  };

  // Function to fetch Hugging Face data
  const fetchHuggingFaceData = async () => {
    if (!author) return;
  
    setLoadingHuggingface(true);
    setErrorHuggingface("");
  
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/huggingfacedata?name=${encodeURIComponent(author)}`);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data: HuggingFaceResponse = await response.json();
  
      // Check if the API returned valid data
      if (!data || !data.huggingface_url || (data.models.length === 0 && data.datasets.length === 0)) {
        throw new Error("No Hugging Face data found.");
      }
  
      setHuggingfaceData(data);
    } catch (error) {
      console.error("Error fetching Hugging Face data:", error);
      setErrorHuggingface("Failed to fetch Hugging Face data.");
    } finally {
      setLoadingHuggingface(false);
    }
  };
  

  // Fetch data only when the corresponding tab is selected
  useEffect(() => {
    if (activeTab === "repositories" && !githubData) {
      fetchGitHubData();
    }
    if (activeTab === "huggingface" && !huggingfaceData) {
      fetchHuggingFaceData();
    }
  }, [activeTab]);

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
            <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: "bold" }}>
              Publications by {author}
            </Typography>
            {publications.length > 0 ? (
              <PublicationsList publications={publications} />
            ) : (
              <Typography variant="body2" color="textSecondary">
                No publications found for {author}.
              </Typography>
            )}
          </>
        )}

        {/* Repositories Tab (GitHub) */}
        {activeTab === "repositories" && (
          <Box>
            <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: "bold" }}>
              Repositories by {author}
            </Typography>

            {loadingGitHub ? (
              <Typography variant="body2">Loading GitHub data...</Typography>
            ) : errorGitHub ? (
              <Typography variant="body2" color="error">
                {errorGitHub}
              </Typography>
            ) : githubData && githubData.github_url !== "No GitHub user found" ? (
              <>
                <Typography variant="body1">
                  GitHub Profile:{" "}
                  <a href={githubData.github_url} target="_blank" rel="noopener noreferrer">
                    {githubData.github_url}
                  </a>
                </Typography>
                {githubData.repositories.length > 0 ? (
                  <ul>
                    {githubData.repositories.map((repo) => (
                      <li key={repo.full_name}>
                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                          {repo.name}
                        </a>
                        {repo.description && <div>{repo.description}</div>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Typography>No repositories found.</Typography>
                )}
              </>
            ) : (
              <Typography>No GitHub user or no repositories found.</Typography>
            )}
          </Box>
        )}

        {/* Hugging Face Models & Datasets Tab */}
        {activeTab === "huggingface" && (
          <Box>
            <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: "bold" }}>
              Models & Datasets by {author}
            </Typography>

            {loadingHuggingface ? (
              <Typography variant="body2">Loading Hugging Face data...</Typography>
            ) : errorHuggingface ? (
              <Typography variant="body2" color="error">
                {errorHuggingface}
              </Typography>
            ) : huggingfaceData && huggingfaceData.huggingface_url !== "No Hugging Face profile found" ? (
              <>
                <Typography variant="body1">
                  Hugging Face Profile:{" "}
                  <a href={huggingfaceData.huggingface_url} target="_blank" rel="noopener noreferrer">
                    {huggingfaceData.huggingface_url}
                  </a>
                </Typography>

                {/* Models List */}
                <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
                  Models
                </Typography>
                {huggingfaceData.models.length > 0 ? (
                  <ul>
                    {huggingfaceData.models.map((model) => (
                      <li key={model}>{model}</li>
                    ))}
                  </ul>
                ) : (
                  <Typography>No models found.</Typography>
                )}

                {/* Datasets List */}
                <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
                  Datasets
                </Typography>
                {huggingfaceData.datasets.length > 0 ? (
                  <ul>
                    {huggingfaceData.datasets.map((dataset) => (
                      <li key={dataset}>{dataset}</li>
                    ))}
                  </ul>
                ) : (
                  <Typography>No datasets found.</Typography>
                )}
              </>
            ) : (
              <Typography>No Hugging Face user found.</Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ResearchersWork;
