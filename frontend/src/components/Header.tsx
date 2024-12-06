import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import AccountMenu from "./Menu"; // Corrected import path
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate(); // React Router navigation hook

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#232E58", // Define AppBar background color here
      }}
    >
      <Toolbar>
        {/* Application Title */}
        <Typography
          variant="h5"
          sx={{
            flexGrow: 1,
            cursor: "pointer", // Push other content to the right
          }}
          onClick={() => navigate("/")} // Navigate to home page on click
        >
          Mannheim View
        </Typography>

        {/* Spacer to Align Menu to the Right */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Account Menu */}
        <AccountMenu />
      </Toolbar>
    </AppBar>
  );
}

export default Header;
