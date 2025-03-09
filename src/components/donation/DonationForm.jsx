import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Box, Button, Container, TextField, Typography, MenuItem, Paper, Snackbar } from '@mui/material';

const projects = [
  { id: 'education', label: 'Education Support' },
  { id: 'healthcare', label: 'Healthcare Initiative' },
  { id: 'environment', label: 'Environmental Conservation' },
  { id: 'community', label: 'Community Development' }
];

const DonationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    project: '',
    amount: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const donationRef = collection(db, 'donations');
      await addDoc(donationRef, {
        ...formData,
        amount: Number(formData.amount),
        timestamp: new Date().toISOString(),
        status: 'completed'
      });
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        project: '',
        amount: ''
      });
    } catch (err) {
      setError('Failed to submit donation. Please try again.');
      console.error(err);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
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
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom align="center">
            Make a Donation
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              required
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              required
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              required
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              required
              fullWidth
              select
              label="Project"
              name="project"
              value={formData.project}
              onChange={handleChange}
              margin="normal"
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              required
              fullWidth
              label="Donation Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                inputProps: { min: 0 }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Submit Donation
            </Button>
          </Box>
        </Paper>
      </Box>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        message="Thank you for your donation! A confirmation email will be sent shortly."
      />
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        message={error}
      />
    </Container>
  );
};

export default DonationForm;