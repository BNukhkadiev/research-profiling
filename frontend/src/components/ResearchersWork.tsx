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

  // ---------- GITHUB STATES ----------
  const [githubData, setGithubData] = useState<GithubResponse | null>(null);
  const [loadingGitHub, setLoadingGitHub] = useState(false);
  const [errorGitHub, setErrorGitHub] = useState("");

  // ---------- HUGGINGFACE STATES ----------
  const [huggingfaceData, setHuggingfaceData] = useState<HuggingFaceResponse | null>(null);
  const [loadingHuggingface, setLoadingHuggingface] = useState(false);
  const [errorHuggingface, setErrorHuggingface] = useState("");

  // Example: Just use the first affiliation for GitHub
  const primaryAffiliation = affiliations.length > 0 ? affiliations[0] : "";

  // ----------------------------
  // GITHUB FETCH
  // ----------------------------
  useEffect(() => {
    if (author && primaryAffiliation) {
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
    }
  }, [author, primaryAffiliation]);

  // ----------------------------
  // HUGGING FACE FETCH
  // ----------------------------
  useEffect(() => {
    if (author) {
      setLoadingHuggingface(true);
      setErrorHuggingface("");
      fetch(`http://127.0.0.1:8000/api/huggingfacedata?name=${encodeURIComponent(author)}`)
        .then((res) => res.json())
        .then((data: HuggingFaceResponse) => {
          setHuggingfaceData(data);
          setLoadingHuggingface(false);
        })
        .catch((error) => {
          console.error("Error fetching Hugging Face data:", error);
          setErrorHuggingface("Failed to fetch Hugging Face data.");
          setLoadingHuggingface(false);
        });
    }
  }, [author]);

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

            {loadingGitHub && (
              <Typography variant="body2">Loading GitHub data...</Typography>
            )}
            {errorGitHub && (
              <Typography variant="body2" color="error">
                {errorGitHub}
              </Typography>
            )}

            {githubData && githubData.github_url !== "No GitHub user found" ? (
              <>
                <Typography variant="body1">
                  GitHub Profile:{" "}
                  <a
                    href={githubData.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {githubData.github_url}
                  </a>
                </Typography>
                {/* Repositories list */}
                {githubData.repositories && githubData.repositories.length > 0 ? (
                  <ul>
                    {githubData.repositories.map((repo) => (
                      <li key={repo.full_name}>
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
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
              !loadingGitHub &&
              !errorGitHub && (
                <Typography>No GitHub user or no repositories found.</Typography>
              )
            )}
          </Box>
        )}

        {/* Hugging Face Models & Datasets Tab */}
        {activeTab === "huggingface" && (
          <Box>
            <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: "bold" }}>
              Models & Datasets by {author}
            </Typography>

            {loadingHuggingface && (
              <Typography variant="body2">Loading Hugging Face data...</Typography>
            )}
            {errorHuggingface && (
              <Typography variant="body2" color="error">
                {errorHuggingface}
              </Typography>
            )}

            {huggingfaceData && huggingfaceData.huggingface_url !== "No Hugging Face profile found" ? (
              <>
                <Typography variant="body1">
                  Hugging Face Profile:{" "}
                  <a
                    href={huggingfaceData.huggingface_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {huggingfaceData.huggingface_url}
                  </a>
                </Typography>

                {/* List of Models */}
                <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
                  Models
                </Typography>
                {huggingfaceData.models && huggingfaceData.models.length > 0 ? (
                  <ul>
                    {huggingfaceData.models.map((modelLink) => (
                      <li key={modelLink}>
                        <a href={modelLink} target="_blank" rel="noopener noreferrer">
                          {modelLink}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Typography>No models found.</Typography>
                )}

                {/* List of Datasets */}
                <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
                  Datasets
                </Typography>
                {huggingfaceData.datasets && huggingfaceData.datasets.length > 0 ? (
                  <ul>
                    {huggingfaceData.datasets.map((datasetLink) => (
                      <li key={datasetLink}>
                        <a href={datasetLink} target="_blank" rel="noopener noreferrer">
                          {datasetLink}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Typography>No datasets found.</Typography>
                )}
              </>
            ) : (
              !loadingHuggingface &&
              !errorHuggingface && (
                <Typography>No Hugging Face user found.</Typography>
              )
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ResearchersWork;
