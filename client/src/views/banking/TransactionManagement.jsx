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
  Tabs,
  Tab,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import MainCard from 'ui-component/cards/MainCard';
import { transactionAPI, accountAPI, formatIndianCurrency } from 'services/bankingService';

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    accountNumber: '',
    toAccountNumber: '',
    amount: 0,
    description: '',
    type: 'transfer',
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await transactionAPI.getAll({ limit: 100 });
      setTransactions(response.data?.data || []);
    } catch (error) {
      toast.error('Failed to load transactions');
    }
  };

  const handleSubmit = async () => {
    try {
      if (tabValue === 0) {
        await transactionAPI.deposit({
          accountNumber: formData.accountNumber,
          amount: parseFloat(formData.amount),
          description: formData.description,
        });
        toast.success('Deposit successful');
      } else if (tabValue === 1) {
        await transactionAPI.withdrawal({
          accountNumber: formData.accountNumber,
          amount: parseFloat(formData.amount),
          description: formData.description,
        });
        toast.success('Withdrawal successful');
      } else {
        await transactionAPI.transfer({
          fromAccountNumber: formData.accountNumber,
          toAccountNumber: formData.toAccountNumber,
          amount: parseFloat(formData.amount),
          description: formData.description,
          type: formData.type,
        });
        toast.success('Transfer successful');
      }
      setOpenDialog(false);
      loadTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transaction failed');
    }
  };

  return (
    <MainCard
      title="Transaction Management"
      secondary={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          New Transaction
        </Button>
      }
    >
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>From Account</TableCell>
              <TableCell>To Account</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((txn) => (
              <TableRow key={txn._id}>
                <TableCell>{txn.transactionId}</TableCell>
                <TableCell>
                  <Chip label={txn.type?.toUpperCase()} size="small" />
                </TableCell>
                <TableCell>{txn.fromAccount?.accountNumber || '-'}</TableCell>
                <TableCell>{txn.toAccount?.accountNumber || '-'}</TableCell>
                <TableCell>{formatIndianCurrency(txn.amount)}</TableCell>
                <TableCell>{new Date(txn.transactionDate).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip label={txn.status} color={txn.status === 'success' ? 'success' : 'error'} size="small" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Transaction</DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
            <Tab label="Deposit" />
            <Tab label="Withdrawal" />
            <Tab label="Transfer" />
          </Tabs>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={tabValue === 2 ? 'From Account Number' : 'Account Number'}
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              />
            </Grid>
            {tabValue === 2 && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="To Account Number"
                    value={formData.toAccountNumber}
                    onChange={(e) => setFormData({ ...formData, toAccountNumber: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Transfer Type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <MenuItem value="transfer">Internal Transfer</MenuItem>
                    <MenuItem value="neft">NEFT</MenuItem>
                    <MenuItem value="rtgs">RTGS</MenuItem>
                    <MenuItem value="imps">IMPS</MenuItem>
                    <MenuItem value="upi">UPI</MenuItem>
                  </TextField>
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Amount (₹)"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Process Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
