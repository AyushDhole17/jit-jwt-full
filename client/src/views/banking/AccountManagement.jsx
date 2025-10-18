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
import { accountAPI, customerAPI, formatIndianCurrency } from 'services/bankingService';

export default function AccountManagement() {
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    accountType: 'savings',
    branchId: '',
    minimumBalance: 5000,
  });

  useEffect(() => {
    loadAccounts();
    loadCustomers();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await accountAPI.getAll();
      setAccounts(response.data?.data || []);
    } catch (error) {
      toast.error('Failed to load accounts');
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customerAPI.getAll();
      setCustomers(response.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      await accountAPI.create(formData);
      toast.success('Account created successfully');
      setOpenDialog(false);
      loadAccounts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create account');
    }
  };

  return (
    <MainCard
      title="Account Management"
      secondary={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          Open Account
        </Button>
      }
    >
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Account Number</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Account Type</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>IFSC Code</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account._id}>
                <TableCell>{account.accountNumber}</TableCell>
                <TableCell>{account.customerId?.name?.firstName || 'N/A'} {account.customerId?.name?.lastName || ''}</TableCell>
                <TableCell>
                  <Chip label={account.accountType} size="small" color="primary" />
                </TableCell>
                <TableCell>{formatIndianCurrency(account.balance)}</TableCell>
                <TableCell>{account.ifscCode}</TableCell>
                <TableCell>
                  <Chip label={account.status} color={account.status === 'active' ? 'success' : 'error'} size="small" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Open New Account</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Customer"
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              >
                {customers.map((customer) => (
                  <MenuItem key={customer._id} value={customer._id}>
                    {customer.customerId} - {customer.name?.firstName} {customer.name?.lastName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Account Type"
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
              >
                <MenuItem value="savings">Savings Account</MenuItem>
                <MenuItem value="current">Current Account</MenuItem>
                <MenuItem value="fixed_deposit">Fixed Deposit</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Create Account
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
