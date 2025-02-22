import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

interface UserCardProps {
  name: string;
  institution: string;
  onAddNewResearcher?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({
  name,
  institution,
  onAddNewResearcher,
}) => {
  return (
    <Card
      sx={{
        width: 300,
        padding: 2,
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        position: "relative", // Required for positioning the icon
      }}
    >
      <CardContent sx={{ textAlign: "center" }}>
        <Avatar sx={{ margin: "auto", marginBottom: 2 }}>
          {name.charAt(0)}
        </Avatar>
        <Typography variant="h6">{name}</Typography>
        <Typography variant="body2" color="textSecondary">
          {institution}
        </Typography>
      </CardContent>
      <Box
        sx={{
          position: "absolute",
          bottom: 8,
          right: 8, // Place the icon at the bottom-right corner
        }}
      ></Box>
    </Card>
  );
};

export default UserCard;
