import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Box, Container, Grid, Paper, Typography, TextField, Button, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BarChart } from '@mui/x-charts';

const projects = [
  { id: 'education', label: 'Education Support' },
  { id: 'healthcare', label: 'Healthcare Initiative' },
  { id: 'environment', label: 'Environmental Conservation' },
  { id: 'community', label: 'Community Development' }
];

const MemberDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [fundSummary, setFundSummary] = useState({
    totalInflow: 0,
    totalOutflow: 0,
    balance: 0
  });
  const [outflowData, setOutflowData] = useState({
    name: '',
    email: '',
    phone: '',
    project: '',
    amount: '',
    transactionNumber: '',
    mode: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const donationsQuery = query(collection(db, 'donations'), orderBy('timestamp', 'desc'), limit(10));
      const outflowQuery = query(collection(db, 'outflow'), orderBy('timestamp', 'desc'), limit(10));

      const [donationsSnapshot, outflowSnapshot] = await Promise.all([
        getDocs(donationsQuery),
        getDocs(outflowQuery)
      ]);

      const donations = donationsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'inflow' }));
      const outflows = outflowSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'outflow' }));

      const allTransactions = [...donations, ...outflows]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

      setTransactions(allTransactions);

      const totalInflow = donations.reduce((sum, donation) => sum + donation.amount, 0);
      const totalOutflow = outflows.reduce((sum, outflow) => sum + outflow.amount, 0);

      setFundSummary({
        totalInflow,
        totalOutflow,
        balance: totalInflow - totalOutflow
      });
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
    }
  };

  const handleOutflowSubmit = async (e) => {
    e.preventDefault();
    try {
      const outflowRef = collection(db, 'outflow');
      await addDoc(outflowRef, {
        ...outflowData,
        amount: Number(outflowData.amount),
        timestamp: new Date().toISOString()
      });

      setOutflowData({
        name: '',
        email: '',
        phone: '',
        project: '',
        amount: '',
        transactionNumber: '',
        mode: ''
      });

      fetchTransactions();
    } catch (err) {
      setError('Failed to record outflow transaction');
      console.error(err);
    }
  };

  const handleOutflowChange = (e) => {
    const { name, value } = e.target;
    setOutflowData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Fund Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Fund Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="h4" color="success.main">
                  ${fundSummary.totalInflow.toFixed(2)}
                </Typography>
                <Typography color="textSecondary">Total Inflow</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h4" color="error.main">
                  ${fundSummary.totalOutflow.toFixed(2)}
                </Typography>
                <Typography color="textSecondary">Total Outflow</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h4" color="info.main">
                  ${fundSummary.balance.toFixed(2)}
                </Typography>
                <Typography color="textSecondary">Current Balance</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Fund Distribution Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Fund Distribution by Project
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <BarChart
                series={[{
                  data: projects.map(project => {
                    const projectDonations = transactions
                      .filter(t => t.type === 'inflow' && t.project === project.id)
                      .reduce((sum, t) => sum + t.amount, 0);
                    return projectDonations;
                  })
                }]}
                xAxis={[{ scaleType: 'band', data: projects.map(p => p.label) }]}
                height={250}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Recent Transactions
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.timestamp).toLocaleDateString()}</TableCell>
                      <TableCell>{transaction.type === 'inflow' ? 'Donation' : 'Expense'}</TableCell>
                      <TableCell>{transaction.name}</TableCell>
                      <TableCell>
                        {projects.find(p => p.id === transaction.project)?.label || transaction.project}
                      </TableCell>
                      <TableCell align="right" sx={{ color: transaction.type === 'inflow' ? 'success.main' : 'error.main' }}>
                        ${transaction.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Outflow Transaction Form */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Record Outflow Transaction
            </Typography>
            <Box component="form" onSubmit={handleOutflowSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Recipient Name"
                    name="name"
                    value={outflowData.name}
                    onChange={handleOutflowChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={outflowData.email}
                    onChange={handleOutflowChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={outflowData.phone}
                    onChange={handleOutflowChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    select
                    label="Project"
                    name="project"
                    value={outflowData.project}
                    onChange={handleOutflowChange}
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    label="Amount"
                    name="amount"
                    type="number"
                    value={outflowData.amount}
                    onChange={handleOutflowChange}
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    label="Transaction Number"
                    name="transactionNumber"
                    value={outflowData.transactionNumber}
                    onChange={handleOutflowChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    select
                    label="Payment Mode"
                    name="mode"
                    value={outflowData.mode}
                    onChange={handleOutflowChange}
                  >
                    <MenuItem value="bank">Bank Transfer</MenuItem>
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="check">Check</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                  >
                    Record Transaction
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MemberDashboard;