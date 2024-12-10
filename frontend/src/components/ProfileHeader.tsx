import React from "react";
import { Box, Typography, Button } from "@mui/material";
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
          <Typography variant="h6" sx={{ marginBottom: 0.5 }}>
            {author}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {affiliations || "Affiliations not available"}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, marginTop: 1 }}>
            <EmailIcon
              sx={{ color: "#555", cursor: "pointer" }}
              titleAccess="Email"
            />
            <GitHubIcon
              sx={{ color: "#555", cursor: "pointer" }}
              titleAccess="GitHub"
            />
            <LinkedInIcon
              sx={{ color: "#555", cursor: "pointer" }}
              titleAccess="LinkedIn"
            />
            <PeopleIcon
              sx={{ color: "#555", cursor: "pointer" }}
              titleAccess="Social Profile"
            />
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
