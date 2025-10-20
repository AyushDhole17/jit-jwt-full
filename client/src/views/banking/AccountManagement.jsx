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
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import MainCard from 'ui-component/cards/MainCard';
import { accountAPI, customerAPI, branchAPI, formatIndianCurrency } from 'services/bankingService';

const getInitialFormData = () => ({
  customerId: '',
  accountType: 'savings',
  branchId: '',
  minimumBalance: 5000,
  initialDeposit: 5000
});

export default function AccountManagement() {
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    loadAccounts();
    loadCustomers();
    loadBranches();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await accountAPI.getAll();
      setAccounts(response.data?.data || []);
    } catch (error) {
      toast.error('Failed to load accounts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customerAPI.getAll();
      setCustomers(response.data?.data || []);
    } catch (error) {
      toast.error('Failed to load customers');
      console.error(error);
    }
  };

  const loadBranches = async () => {
    try {
      const response = await branchAPI.getAll();
      setBranches(response.data?.data || []);
    } catch (error) {
      toast.error('Failed to load branches');
      console.error(error);
    }
  };

  const handleCustomerChange = (customerId) => {
    const customer = customers.find((c) => c._id === customerId);
    setSelectedCustomer(customer);

    // Auto-fill branch from customer's home branch
    const branchId = customer?.homeBranch?._id || customer?.homeBranch || '';

    setFormData({
      ...formData,
      customerId,
      branchId
    });
  };

  const handleOpenDialog = () => {
    setFormData(getInitialFormData());
    setSelectedCustomer(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setFormData(getInitialFormData());
    setSelectedCustomer(null);
    setOpenDialog(false);
  };

  const validateForm = () => {
    if (!formData.customerId) {
      toast.error('Please select a customer');
      return false;
    }

    if (!formData.branchId) {
      toast.error('Please select a branch');
      return false;
    }

    if (!formData.accountType) {
      toast.error('Please select account type');
      return false;
    }

    if (formData.initialDeposit < formData.minimumBalance) {
      toast.error(`Initial deposit must be at least ₹${formData.minimumBalance}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const payload = {
        customerId: formData.customerId,
        accountType: formData.accountType,
        branchId: formData.branchId,
        balance: Number(formData.initialDeposit),
        minimumBalance: Number(formData.minimumBalance)
      };

      await accountAPI.create(payload);
      toast.success('Account created successfully');
      handleCloseDialog();
      loadAccounts();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create account';
      toast.error(errorMsg);
      console.error('Account creation error:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard
      title="Account Management"
      secondary={
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
          Open Account
        </Button>
      }
    >
      {loading && accounts.length === 0 ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : accounts.length === 0 ? (
        <Alert severity="info">No accounts found. Click "Open Account" to create the first account.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Account Number</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Account Type</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>IFSC Code</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account._id}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {account.accountNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {account.customerId?.name?.firstName || 'N/A'} {account.customerId?.name?.lastName || ''}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={account.accountType.replace('_', ' ').toUpperCase()}
                      size="small"
                      color="primary"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {formatIndianCurrency(account.balance)}
                    </Typography>
                  </TableCell>
                  <TableCell>{account.branchId?.branchName || 'N/A'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {account.ifscCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={account.status}
                      color={account.status === 'active' ? 'success' : 'error'}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Open New Account</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Customer</InputLabel>
                <Select value={formData.customerId} label="Customer" onChange={(e) => handleCustomerChange(e.target.value)}>
                  {customers.map((customer) => (
                    <MenuItem key={customer._id} value={customer._id}>
                      {customer.customerId} - {customer.name?.firstName} {customer.name?.lastName} ({customer.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {selectedCustomer && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ py: 0.5 }}>
                  <Typography variant="body2">
                    <strong>Customer:</strong> {selectedCustomer.name?.firstName} {selectedCustomer.name?.lastName}
                    <br />
                    <strong>KYC Status:</strong> {selectedCustomer.kyc?.verificationStatus || 'Pending'}
                    <br />
                    <strong>Home Branch:</strong> {selectedCustomer.homeBranch?.branchName || 'N/A'}
                  </Typography>
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Branch</InputLabel>
                <Select value={formData.branchId} label="Branch" onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}>
                  {branches.map((branch) => (
                    <MenuItem key={branch._id} value={branch._id}>
                      {branch.branchName} - {branch.branchCode} ({branch.ifscCode})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Account Type</InputLabel>
                <Select
                  value={formData.accountType}
                  label="Account Type"
                  onChange={(e) => {
                    const type = e.target.value;
                    let minBalance = 5000;
                    if (type === 'current') minBalance = 10000;
                    else if (type === 'fixed_deposit' || type === 'recurring_deposit') minBalance = 0;

                    setFormData({
                      ...formData,
                      accountType: type,
                      minimumBalance: minBalance,
                      initialDeposit: Math.max(minBalance, formData.initialDeposit)
                    });
                  }}
                >
                  <MenuItem value="savings">Savings Account</MenuItem>
                  <MenuItem value="current">Current Account</MenuItem>
                  <MenuItem value="fixed_deposit">Fixed Deposit</MenuItem>
                  <MenuItem value="recurring_deposit">Recurring Deposit</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Minimum Balance (₹)"
                type="number"
                value={formData.minimumBalance}
                InputProps={{ readOnly: true }}
                helperText="Auto-set based on account type"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Initial Deposit (₹)"
                type="number"
                value={formData.initialDeposit}
                onChange={(e) => setFormData({ ...formData, initialDeposit: e.target.value })}
                helperText={`Min: ₹${formData.minimumBalance}`}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Create Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
