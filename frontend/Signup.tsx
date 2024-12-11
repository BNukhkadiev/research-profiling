import React from 'react';
import '../styles/signup.css';
import { Box, TextField, Typography, Button, Checkbox, FormControlLabel } from '@mui/material';

const Signup: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#F5F5F5', // Background color matching Figma design
        padding: 2,
      }}
    >
      <Box
        sx={{
          width: 400,
          backgroundColor: '#FFFFFF', // White background for the form box
          borderRadius: '10px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          padding: 4,
        }}
      >
        {/* Header Section */}
        <Typography variant="h4" fontWeight="bold" color="textPrimary" gutterBottom>
          Signup
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          to get started
        </Typography>

        {/* Name Fields */}
        <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
          <TextField
            label="Lastname"
            variant="outlined"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
        </Box>

        {/* Email Field */}
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          sx={{
            marginTop: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />

        {/* Password Fields */}
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          sx={{
            marginTop: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />
        <TextField
          label="Confirm Password"
          type="password"
          variant="outlined"
          fullWidth
          sx={{
            marginTop: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />

        {/* Terms and Conditions */}
        <FormControlLabel
          control={<Checkbox />}
          label="Agree to our Terms and Conditions"
          sx={{ marginTop: 2 }}
        />

        {/* Continue Button */}
        <Button
          variant="contained"
          fullWidth
          sx={{
            marginTop: 2,
            backgroundColor: '#001E6C', // Dark blue from the Figma design
            color: '#FFFFFF',
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: '16px',
            '&:hover': {
              backgroundColor: '#003580',
            },
          }}
        >
          Continue
        </Button>

        {/* Footer Section */}
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{
            textAlign: 'center',
            marginTop: 2,
          }}
        >
          Already registered?{' '}
          <Typography
            component="span"
            color="primary"
            sx={{ cursor: 'pointer', textDecoration: 'underline' }}
          >
            Login
          </Typography>
        </Typography>
      </Box>
    </Box>
  );
};

export default Signup;


