import React from 'react';
import '../styles/login.css';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Container,
  Paper,
} from '@mui/material';

const Login = () => {
  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          borderRadius: 4,
          textAlign: 'center',
          width: '100%',
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Login
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          to get started
        </Typography>
        <Box component="form" noValidate sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            variant="outlined"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
          />
          <Link
            href="#"
            underline="none"
            sx={{
              display: 'block',
              textAlign: 'right',
              marginBottom: 2,
              color: 'primary.main',
            }}
          >
            Forgot Password?
          </Link>
          <Button
            fullWidth
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#002D62', // Navy blue as per your design
              textTransform: 'none',
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#001A40' },
            }}
          >
            Continue
          </Button>
          <Typography variant="body2" sx={{ mt: 2 }}>
            New User?{' '}
            <Link href="/signup" underline="hover">
              Register
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;