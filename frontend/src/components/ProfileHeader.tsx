import React from "react";
import { Box, Typography, Button, Tooltip } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import PeopleIcon from "@mui/icons-material/People";

interface ProfileHeaderProps {
  author: string;
  profileUrl?: string; // Profile URL is optional
  affiliations?: string; // Affiliations are optional
  addToCompare: () => void;
  isSelected: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  author,
  profileUrl,
  affiliations,
  addToCompare,
  isSelected,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 2,
        backgroundColor: "white",
        borderRadius: 2,
        boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
        marginBottom: 4,
      }}
    >
      {/* Left Section */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
        <img
          src={
            profileUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=random`
          } // Fallback to generated avatar
          alt={`${author}'s profile`}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        <Box>
          <Typography variant="h6" sx={{ marginBottom: 0.5, wordWrap: "break-word" }}>
            {author}
          </Typography>
          <Tooltip title={affiliations || "Affiliations not available"} arrow>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{
                wordWrap: "break-word",
                maxHeight: "4.5rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {affiliations || "Affiliations not available"}
            </Typography>
          </Tooltip>
          <Box sx={{ display: "flex", gap: 1, marginTop: 1 }}>
            <Tooltip title="Email" arrow>
              <EmailIcon
                sx={{ color: "#555", cursor: "pointer" }}
                onClick={() => window.open(`mailto:${author}@example.com`)} // Example email functionality
              />
            </Tooltip>
            <Tooltip title="GitHub" arrow>
              <GitHubIcon
                sx={{ color: "#555", cursor: "pointer" }}
                onClick={() => window.open("https://github.com", "_blank")} // Example GitHub link
              />
            </Tooltip>
            <Tooltip title="LinkedIn" arrow>
              <LinkedInIcon
                sx={{ color: "#555", cursor: "pointer" }}
                onClick={() => window.open("https://linkedin.com", "_blank")} // Example LinkedIn link
              />
            </Tooltip>
            <Tooltip title="Social Profile" arrow>
              <PeopleIcon
                sx={{ color: "#555", cursor: "pointer" }}
                onClick={() => window.open(profileUrl || "#", "_blank")} // Profile link
              />
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Add to Compare Button */}
      <Button
        variant="contained"
        onClick={addToCompare}
        color={isSelected ? "error" : "primary"}
        sx={{
          textTransform: "none",
        }}
      >
        {isSelected ? "Remove from Compare" : "Add to Compare"}
      </Button>
    </Box>
  );
};

export default ProfileHeader;
