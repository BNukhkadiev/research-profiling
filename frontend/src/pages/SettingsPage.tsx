import React, { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  IconButton,
} from "@mui/material";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import HistoryIcon from "@mui/icons-material/History";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import Brightness4Icon from "@mui/icons-material/Brightness4"; // For dark/light mode

const SettingsPage: React.FC = () => {
  // Dummy states for user data
  const [username, setUsername] = useState("john_doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  // Dialog states
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openSearchHistoryDialog, setOpenSearchHistoryDialog] = useState(false);
  const [openComparisonHistoryDialog, setOpenComparisonHistoryDialog] =
    useState(false);

  // Open/Close handlers
  const handleOpenProfile = () => {
    setMessage("");
    setOpenProfileDialog(true);
  };
  const handleCloseProfile = () => {
    setOpenProfileDialog(false);
  };

  const handleOpenPassword = () => {
    setMessage("");
    setOpenPasswordDialog(true);
  };
  const handleClosePassword = () => {
    setOpenPasswordDialog(false);
  };

  const handleOpenSearchHistory = () => {
    setMessage("");
    setOpenSearchHistoryDialog(true);
  };
  const handleCloseSearchHistory = () => {
    setOpenSearchHistoryDialog(false);
  };

  const handleOpenComparisonHistory = () => {
    setMessage("");
    setOpenComparisonHistoryDialog(true);
  };
  const handleCloseComparisonHistory = () => {
    setOpenComparisonHistoryDialog(false);
  };

  // Dummy “save” handlers
  const handleSaveProfile = () => {
    // TODO: Replace with a real API call
    setMessage("Profile updated successfully!");
    setOpenProfileDialog(false);
  };

  const handleChangePassword = () => {
    // TODO: Replace with a real API call
    if (!oldPassword || !newPassword) {
      setMessage("Please fill in both password fields.");
      return;
    }
    setMessage("Password changed successfully!");
    setOpenPasswordDialog(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {/* Display success/error messages */}
      {message && (
        <Typography variant="body1" color="primary" sx={{ mb: 2 }}>
          {message}
        </Typography>
      )}

      {/* 
        We stack Paper components vertically. 
        Each Paper wraps a Card to keep consistent spacing and design.
      */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Profile Settings Card */}
        <Paper>
          <Card elevation={0}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <PersonIcon fontSize="large" sx={{ mr: 1 }} />
                <Typography variant="h6">Profile Settings</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Manage your username and email address.
              </Typography>
            </CardContent>
            <CardActions>
              <Button variant="contained" onClick={handleOpenProfile}>
                Manage Profile
              </Button>
            </CardActions>
          </Card>
        </Paper>

        {/* Change Password Card */}
        <Paper>
          <Card elevation={0}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <LockIcon fontSize="large" sx={{ mr: 1 }} />
                <Typography variant="h6">Change Password</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Update your password by providing the old and new one.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="warning"
                onClick={handleOpenPassword}
              >
                Change Password
              </Button>
            </CardActions>
          </Card>
        </Paper>

        {/* Search History Card */}
        <Paper>
          <Card elevation={0}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <HistoryIcon fontSize="large" sx={{ mr: 1 }} />
                <Typography variant="h6">Search History</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                View your recent searches. 
              </Typography>
            </CardContent>
            <CardActions>
              <Button variant="outlined" onClick={handleOpenSearchHistory}>
                View History
              </Button>
            </CardActions>
          </Card>
        </Paper>

        {/* Comparison History Card */}
        <Paper>
          <Card elevation={0}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <CompareArrowsIcon fontSize="large" sx={{ mr: 1 }} />
                <Typography variant="h6">Comparison History</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                View past researcher comparisons. 
              </Typography>
            </CardContent>
            <CardActions>
              <Button variant="outlined" onClick={handleOpenComparisonHistory}>
                View Comparison
              </Button>
            </CardActions>
          </Card>
        </Paper>

        {/* Dark/Light Mode Card (Icon Only, No Functionality) */}
        <Paper>
          <Card elevation={0}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Brightness4Icon fontSize="large" sx={{ mr: 1 }} />
                <Typography variant="h6">Dark/Light Mode</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Toggle between dark and light themes.
              </Typography>
            </CardContent>
            <CardActions>
              {/* Placeholder for the future toggle */}
              <Button variant="outlined" disabled>
                Coming Soon
              </Button>
            </CardActions>
          </Card>
        </Paper>
      </Box>

      {/* ============ DIALOGS ============ */}

      {/* Profile Dialog */}
      <Dialog open={openProfileDialog} onClose={handleCloseProfile} fullWidth>
        <DialogTitle>Update Profile</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProfile}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProfile}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={openPasswordDialog} onClose={handleClosePassword} fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            label="Old Password"
            type="password"
            fullWidth
            margin="normal"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePassword}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleChangePassword}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Search History Dialog */}
      <Dialog
        open={openSearchHistoryDialog}
        onClose={handleCloseSearchHistory}
        fullWidth
      >
        <DialogTitle>Search History</DialogTitle>
        <DialogContent>
          {/* Placeholder for future dynamic data */}
          <Typography>
            This is where your search history would appear. 
            You could map through an array of recent searches.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSearchHistory}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Comparison History Dialog */}
      <Dialog
        open={openComparisonHistoryDialog}
        onClose={handleCloseComparisonHistory}
        fullWidth
      >
        <DialogTitle>Comparison History</DialogTitle>
        <DialogContent>
          {/* Placeholder for future dynamic data */}
          <Typography>
            This is where your comparison history would appear. 
            You could map through an array of past comparisons.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseComparisonHistory}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SettingsPage;
