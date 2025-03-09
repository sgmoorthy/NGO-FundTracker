import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError('Failed to sign in with Google');
      console.error(err);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            NGO Fund Manager Login
          </Typography>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleGoogleLogin}
            startIcon={<GoogleIcon />}
          >
            Sign in with Google
          </Button>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;