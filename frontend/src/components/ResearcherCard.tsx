import React from "react";
import { Box, Typography, Avatar, IconButton } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

interface ResearcherCardProps {
  name: string;
  profileUrl: string;
  affiliations: string;
}

const ResearcherCard: React.FC<ResearcherCardProps> = ({
  name,
  profileUrl,
  affiliations,
}) => {
  return (
    <Box
      sx={{
        padding: 2,
        backgroundColor: "white",
        borderRadius: 2,
        boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Avatar
        src={profileUrl}
        alt={name}
        sx={{ width: 60, height: 60, marginBottom: 1 }}
      />
      <Typography variant="h6">{name}</Typography>
      <Typography variant="body2" color="textSecondary">
        {affiliations}
      </Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <IconButton>
          <EmailIcon />
        </IconButton>
        <IconButton>
          <GitHubIcon />
        </IconButton>
        <IconButton>
          <LinkedInIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ResearcherCard;
