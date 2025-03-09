import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Button } from '@mui/material';
import Login from './components/auth/Login';
import DonationForm from './components/donation/DonationForm';
import MemberDashboard from './components/dashboard/MemberDashboard';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Router>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              NGO Fund Manager
            </Typography>
            {user ? (
              <>
                <Button color="inherit" href="/dashboard">Dashboard</Button>
                <Button color="inherit" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <Button color="inherit" href="/login">Login</Button>
            )}
          </Toolbar>
        </AppBar>

        <Routes>
          <Route path="/" element={<DonationForm />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route
            path="/dashboard"
            element={
              user ? (
                <MemberDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </Box>
    </Router>
  );
};

export default App;
