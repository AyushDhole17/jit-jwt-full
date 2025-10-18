import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import MainCard from 'ui-component/cards/MainCard';
import { customerAPI } from 'services/bankingService';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    name: { firstName: '', middleName: '', lastName: '' },
    email: '',
    mobile: '',
    dateOfBirth: '',
    gender: 'male',
    address: { line1: '', line2: '', city: '', state: '', pincode: '' },
    kyc: {
      panCard: { number: '' },
      aadhaar: { number: '' },
      photo: '',
    },
    homeBranch: '',
    occupation: 'salaried',
    annualIncome: 0,
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customerAPI.getAll();
      setCustomers(response.data?.data || []);
    } catch (error) {
      toast.error('Failed to load customers');
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedCustomer) {
        await customerAPI.update(selectedCustomer._id, formData);
        toast.success('Customer updated');
      } else {
        await customerAPI.create(formData);
        toast.success('Customer created');
      }
      setOpenDialog(false);
      loadCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  return (
    <MainCard
      title="Customer Management"
      secondary={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          Add Customer
        </Button>
      }
    >
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>KYC Status</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer._id}>
                <TableCell>{customer.customerId}</TableCell>
                <TableCell>{`${customer.name.firstName} ${customer.name.lastName}`}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.mobile}</TableCell>
                <TableCell>
                  <Chip
                    label={customer.kyc?.verificationStatus || 'Pending'}
                    color={customer.kyc?.verificationStatus === 'verified' ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip label={customer.isActive ? 'Active' : 'Inactive'} color={customer.isActive ? 'success' : 'error'} size="small" />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => {
                    setSelectedCustomer(customer);
                    setFormData(customer);
                    setOpenDialog(true);
                  }}>
                    <ViewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.name?.firstName || ''}
                onChange={(e) => setFormData({ ...formData, name: { ...formData.name, firstName: e.target.value } })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Middle Name"
                value={formData.name?.middleName || ''}
                onChange={(e) => setFormData({ ...formData, name: { ...formData.name, middleName: e.target.value } })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.name?.lastName || ''}
                onChange={(e) => setFormData({ ...formData, name: { ...formData.name, lastName: e.target.value } })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Mobile" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="PAN Card"
                value={formData.kyc?.panCard?.number || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kyc: { ...formData.kyc, panCard: { ...formData.kyc?.panCard, number: e.target.value.toUpperCase() } },
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Aadhaar Number"
                value={formData.kyc?.aadhaar?.number || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kyc: { ...formData.kyc, aadhaar: { ...formData.kyc?.aadhaar, number: e.target.value } },
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedCustomer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
