import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import MainCard from 'ui-component/cards/MainCard';
import { loanAPI, customerAPI, formatIndianCurrency, calculateEMI } from 'services/bankingService';

export default function LoanManagement() {
  const [loans, setLoans] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    accountId: '',
    loanType: 'personal',
    principalAmount: 0,
    interestRate: 10.5,
    tenure: 12,
    purpose: '',
  });
  const [emi, setEmi] = useState(0);

  useEffect(() => {
    loadLoans();
  }, []);

  useEffect(() => {
    if (formData.principalAmount && formData.interestRate && formData.tenure) {
      const calculatedEMI = calculateEMI(
        parseFloat(formData.principalAmount),
        parseFloat(formData.interestRate),
        parseInt(formData.tenure)
      );
      setEmi(calculatedEMI);
    }
  }, [formData.principalAmount, formData.interestRate, formData.tenure]);

  const loadLoans = async () => {
    try {
      const response = await loanAPI.getAll();
      setLoans(response.data?.data || []);
    } catch (error) {
      toast.error('Failed to load loans');
    }
  };

  const handleSubmit = async () => {
    try {
      await loanAPI.apply(formData);
      toast.success('Loan application submitted');
      setOpenDialog(false);
      loadLoans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply for loan');
    }
  };

  const handleApprove = async (loanNumber) => {
    try {
      await loanAPI.approve(loanNumber);
      toast.success('Loan approved');
      loadLoans();
    } catch (error) {
      toast.error('Failed to approve loan');
    }
  };

  return (
    <MainCard
      title="Loan Management"
      secondary={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          Apply Loan
        </Button>
      }
    >
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Loan Number</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Loan Type</TableCell>
              <TableCell>Principal</TableCell>
              <TableCell>EMI</TableCell>
              <TableCell>Outstanding</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loans.map((loan) => (
              <TableRow key={loan._id}>
                <TableCell>{loan.loanNumber}</TableCell>
                <TableCell>{loan.customerId?.customerId || 'N/A'}</TableCell>
                <TableCell>
                  <Chip label={loan.loanType} size="small" />
                </TableCell>
                <TableCell>{formatIndianCurrency(loan.principalAmount)}</TableCell>
                <TableCell>{formatIndianCurrency(loan.emi)}</TableCell>
                <TableCell>{formatIndianCurrency(loan.outstandingAmount)}</TableCell>
                <TableCell>
                  <Chip
                    label={loan.status}
                    color={
                      loan.status === 'active' ? 'success' :
                      loan.status === 'approved' ? 'info' :
                      loan.status === 'submitted' ? 'warning' : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {loan.status === 'submitted' && (
                    <Button size="small" onClick={() => handleApprove(loan.loanNumber)}>
                      Approve
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for Loan</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Loan Type"
                value={formData.loanType}
                onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
              >
                <MenuItem value="personal">Personal Loan</MenuItem>
                <MenuItem value="home">Home Loan</MenuItem>
                <MenuItem value="car">Car Loan</MenuItem>
                <MenuItem value="education">Education Loan</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Loan Amount (₹)"
                value={formData.principalAmount}
                onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Interest Rate (%)"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Tenure (months)"
                value={formData.tenure}
                onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h4" color="primary">
                Monthly EMI: {formatIndianCurrency(emi)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Purpose"
                multiline
                rows={2}
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
