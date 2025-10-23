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
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  CheckCircle as VerifyIcon,
  Cancel as RejectIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import MainCard from 'ui-component/cards/MainCard';
import { customerAPI, branchAPI } from 'services/bankingService';

const getInitialFormData = () => ({
  name: { firstName: '', middleName: '', lastName: '' },
  email: '',
  mobile: '',
  dateOfBirth: '',
  gender: 'male',
  maritalStatus: 'single',
  address: { line1: '', line2: '', city: '', state: '', pincode: '' },
  kyc: {
    panCard: { number: '', documentUrl: '' },
    aadhaar: { number: '', documentUrl: '' },
    photo: 'https://via.placeholder.com/150',
    signature: 'https://via.placeholder.com/150'
  },
  homeBranch: '',
  occupation: 'salaried',
  annualIncome: ''
});

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openKYCDialog, setOpenKYCDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [kycAction, setKycAction] = useState('verify'); // 'verify' or 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    loadCustomers();
    loadBranches();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getAll();
      setCustomers(response.data?.data || []);
    } catch (error) {
      toast.error('Failed to load customers');
      console.error(error);
    } finally {
      setLoading(false);
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

  const handleOpenDialog = (customer = null) => {
    if (customer) {
      setSelectedCustomer(customer);
      setFormData({
        name: customer.name || { firstName: '', middleName: '', lastName: '' },
        email: customer.email || '',
        mobile: customer.mobile || '',
        dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.split('T')[0] : '',
        gender: customer.gender || 'male',
        maritalStatus: customer.maritalStatus || 'single',
        address: customer.address || { line1: '', line2: '', city: '', state: '', pincode: '' },
        kyc: customer.kyc || {
          panCard: { number: '', documentUrl: '' },
          aadhaar: { number: '', documentUrl: '' },
          photo: 'https://via.placeholder.com/150',
          signature: 'https://via.placeholder.com/150'
        },
        homeBranch: customer.homeBranch?._id || customer.homeBranch || '',
        occupation: customer.occupation || 'salaried',
        annualIncome: customer.annualIncome || ''
      });
    } else {
      setSelectedCustomer(null);
      setFormData(getInitialFormData());
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCustomer(null);
    setFormData(getInitialFormData());
  };

  const validateForm = () => {
    // Validate mobile format
    const mobileRegex = /^[+]?91[-]?[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      toast.error('Mobile number must be in format +91-XXXXXXXXXX or 91XXXXXXXXXX');
      return false;
    }

    // Validate PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(formData.kyc.panCard.number)) {
      toast.error('PAN must be in format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)');
      return false;
    }

    // Validate Aadhaar format
    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(formData.kyc.aadhaar.number)) {
      toast.error('Aadhaar must be exactly 12 digits');
      return false;
    }

    // Validate pincode
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(formData.address.pincode)) {
      toast.error('Pincode must be exactly 6 digits');
      return false;
    }

    // Check required fields
    if (!formData.name.firstName || !formData.name.lastName) {
      toast.error('First name and last name are required');
      return false;
    }

    if (!formData.email || !formData.dateOfBirth) {
      toast.error('Email and date of birth are required');
      return false;
    }

    if (!formData.address.line1 || !formData.address.city || !formData.address.state) {
      toast.error('Complete address is required');
      return false;
    }

    if (!formData.homeBranch) {
      toast.error('Please select a home branch');
      return false;
    }

    if (!formData.annualIncome || formData.annualIncome <= 0) {
      toast.error('Annual income must be greater than 0');
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
        ...formData,
        annualIncome: Number(formData.annualIncome)
      };

      if (selectedCustomer) {
        await customerAPI.update(selectedCustomer._id, payload);
        toast.success('Customer updated successfully');
      } else {
        await customerAPI.create(payload);
        toast.success('Customer created successfully');
      }
      handleCloseDialog();
      loadCustomers();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Operation failed';
      toast.error(errorMsg);
      console.error('Customer operation error:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenKYCDialog = (customer, action) => {
    setSelectedCustomer(customer);
    setKycAction(action);
    setRejectionReason('');
    setOpenKYCDialog(true);
  };

  const handleCloseKYCDialog = () => {
    setOpenKYCDialog(false);
    setSelectedCustomer(null);
    setKycAction('verify');
    setRejectionReason('');
  };

  const handleKYCVerification = async () => {
    try {
      setLoading(true);
      const status = kycAction === 'verify' ? 'verified' : 'rejected';

      await customerAPI.verifyKYC(selectedCustomer._id, status, kycAction === 'reject' ? rejectionReason : null);

      toast.success(`KYC ${status} successfully`);
      handleCloseKYCDialog();
      loadCustomers();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'KYC verification failed';
      toast.error(errorMsg);
      console.error('KYC verification error:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard
      title="Customer Management"
      secondary={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Customer
        </Button>
      }
    >
      {loading && customers.length === 0 ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
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
                      label={customer.kyc?.verificationStatus || 'pending'}
                      color={
                        customer.kyc?.verificationStatus === 'verified'
                          ? 'success'
                          : customer.kyc?.verificationStatus === 'rejected'
                            ? 'error'
                            : customer.kyc?.verificationStatus === 'in_review'
                              ? 'info'
                              : 'warning'
                      }
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={customer.isActive ? 'Active' : 'Inactive'} color={customer.isActive ? 'success' : 'error'} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" gap={0.5} justifyContent="flex-end">
                      <Tooltip title="View Details">
                        <IconButton onClick={() => handleOpenDialog(customer)} size="small">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>

                      {/* Show verify/reject buttons only if KYC is pending or in_review */}
                      {(customer.kyc?.verificationStatus === 'pending' || customer.kyc?.verificationStatus === 'in_review') && (
                        <>
                          <Tooltip title="Verify KYC">
                            <IconButton onClick={() => handleOpenKYCDialog(customer, 'verify')} size="small" sx={{ color: 'success.main' }}>
                              <VerifyIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject KYC">
                            <IconButton onClick={() => handleOpenKYCDialog(customer, 'reject')} size="small" sx={{ color: 'error.main' }}>
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary">
                Personal Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
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
                required
                label="Last Name"
                value={formData.name?.lastName || ''}
                onChange={(e) => setFormData({ ...formData, name: { ...formData.name, lastName: e.target.value } })}
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Mobile"
                placeholder="+91-9876543210"
                helperText="Format: +91-XXXXXXXXXX"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select value={formData.gender} label="Gender" onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Marital Status</InputLabel>
                <Select
                  value={formData.maritalStatus}
                  label="Marital Status"
                  onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                >
                  <MenuItem value="single">Single</MenuItem>
                  <MenuItem value="married">Married</MenuItem>
                  <MenuItem value="divorced">Divorced</MenuItem>
                  <MenuItem value="widowed">Widowed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 1 }}>
                Address
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Address Line 1"
                value={formData.address?.line1 || ''}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, line1: e.target.value } })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address Line 2"
                value={formData.address?.line2 || ''}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, line2: e.target.value } })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="City"
                value={formData.address?.city || ''}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="State"
                value={formData.address?.state || ''}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Pincode"
                placeholder="400001"
                helperText="6 digits"
                value={formData.address?.pincode || ''}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
              />
            </Grid>

            {/* KYC Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 1 }}>
                KYC Documents
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="PAN Card Number"
                placeholder="ABCDE1234F"
                helperText="Format: 5 letters, 4 digits, 1 letter"
                value={formData.kyc?.panCard?.number || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kyc: { ...formData.kyc, panCard: { ...formData.kyc?.panCard, number: e.target.value.toUpperCase() } }
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Aadhaar Number"
                placeholder="123456789012"
                helperText="12 digits only"
                value={formData.kyc?.aadhaar?.number || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kyc: { ...formData.kyc, aadhaar: { ...formData.kyc?.aadhaar, number: e.target.value } }
                  })
                }
              />
            </Grid>

            {/* Banking Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 1 }}>
                Banking Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Home Branch</InputLabel>
                <Select
                  value={formData.homeBranch}
                  label="Home Branch"
                  onChange={(e) => setFormData({ ...formData, homeBranch: e.target.value })}
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch._id} value={branch._id}>
                      {branch.branchName} - {branch.branchCode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Occupation</InputLabel>
                <Select
                  value={formData.occupation}
                  label="Occupation"
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                >
                  <MenuItem value="salaried">Salaried</MenuItem>
                  <MenuItem value="self_employed">Self Employed</MenuItem>
                  <MenuItem value="business">Business</MenuItem>
                  <MenuItem value="retired">Retired</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="homemaker">Homemaker</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Annual Income (₹)"
                type="number"
                placeholder="500000"
                value={formData.annualIncome}
                onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : selectedCustomer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* KYC Verification Dialog */}
      <Dialog open={openKYCDialog} onClose={handleCloseKYCDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{kycAction === 'verify' ? 'Verify KYC' : 'Reject KYC'}</DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <Box sx={{ mt: 1 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Customer:</strong> {selectedCustomer.name?.firstName} {selectedCustomer.name?.lastName}
                  <br />
                  <strong>Customer ID:</strong> {selectedCustomer.customerId}
                  <br />
                  <strong>Email:</strong> {selectedCustomer.email}
                  <br />
                  <strong>Mobile:</strong> {selectedCustomer.mobile}
                </Typography>
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    KYC Documents
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="PAN Card Number"
                    value={selectedCustomer.kyc?.panCard?.number || 'N/A'}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Aadhaar Number"
                    value={selectedCustomer.kyc?.aadhaar?.number || 'N/A'}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    value={selectedCustomer.dateOfBirth ? new Date(selectedCustomer.dateOfBirth).toLocaleDateString() : 'N/A'}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Occupation"
                    value={selectedCustomer.occupation || 'N/A'}
                    InputProps={{ readOnly: true }}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={`${selectedCustomer.address?.line1 || ''}, ${selectedCustomer.address?.city || ''}, ${selectedCustomer.address?.state || ''} - ${selectedCustomer.address?.pincode || ''}`}
                    InputProps={{ readOnly: true }}
                    multiline
                    rows={2}
                  />
                </Grid>

                {kycAction === 'reject' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Rejection Reason"
                      multiline
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a reason for rejection..."
                      helperText="This will be sent to the customer"
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Alert severity={kycAction === 'verify' ? 'success' : 'warning'} sx={{ mt: 1 }}>
                    {kycAction === 'verify' ? (
                      <Typography variant="body2">
                        Are you sure you want to <strong>verify</strong> this customer's KYC? Once verified, the customer will be able to
                        open accounts and perform transactions.
                      </Typography>
                    ) : (
                      <Typography variant="body2">
                        Are you sure you want to <strong>reject</strong> this customer's KYC? The customer will be notified with the
                        rejection reason.
                      </Typography>
                    )}
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseKYCDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleKYCVerification}
            variant="contained"
            color={kycAction === 'verify' ? 'success' : 'error'}
            disabled={loading || (kycAction === 'reject' && !rejectionReason.trim())}
            startIcon={kycAction === 'verify' ? <VerifyIcon /> : <RejectIcon />}
          >
            {loading ? <CircularProgress size={24} /> : kycAction === 'verify' ? 'Verify KYC' : 'Reject KYC'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
