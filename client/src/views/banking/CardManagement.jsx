import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { IconPlus, IconCheck, IconX, IconLock, IconLockOpen, IconRefresh, IconCreditCard } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import MainCard from 'ui-component/cards/MainCard';
import { cardAPI, customerAPI, accountAPI } from '../../services/bankingService';

const CardManagement = () => {
  const [cards, setCards] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    customerId: '',
    accountId: '',
    cardType: 'debit',
    creditLimit: '',
    deliveryAddress: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCards();
    fetchCustomers();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await cardAPI.getAll();
      setCards(res.data?.data || []);
    } catch (error) {
      toast.error('Failed to fetch cards');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await customerAPI.getAll();
      const list = res.data?.data || [];
      setCustomers(list);
    } catch (error) {
      toast.error('Failed to fetch customers');
      console.error(error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({ customerId: '', accountId: '', cardType: 'debit', creditLimit: '', deliveryAddress: '' });
    setAccounts([]);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleIssueCard = async () => {
    try {
      setLoading(true);
      const payload = {
        customerId: form.customerId,
        accountId: form.accountId,
        cardType: form.cardType,
        creditLimit: form.cardType === 'credit' ? Number(form.creditLimit || 0) : 0,
        deliveryAddress: form.deliveryAddress
      };
      await cardAPI.issue(payload);
      toast.success('Card issued successfully');
      fetchCards();
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to issue card');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (cardId, action) => {
    try {
      setLoading(true);
      if (action === 'activate') await cardAPI.activate(cardId);
      else if (action === 'block') await cardAPI.block(cardId);
      else await cardAPI.unblock(cardId);
      toast.success(`Card ${action}d successfully`);
      fetchCards();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} card`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'blocked':
        return 'error';
      case 'issued':
        return 'warning';
      case 'expired':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <MainCard
      title={
        <Box display="flex" alignItems="center" gap={1}>
          <IconCreditCard size={28} />
          <Typography variant="h3" component="span">
            Card Management
          </Typography>
        </Box>
      }
      contentSX={{ p: { xs: 2, sm: 3 } }}
    >
      <Box>
        {/* Header Actions */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="body1" color="textSecondary">
            Manage debit and credit cards for customers
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh">
              <IconButton
                onClick={fetchCards}
                disabled={loading}
                sx={{
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <IconRefresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<IconPlus />}
              onClick={handleOpen}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3
              }}
            >
              Issue New Card
            </Button>
          </Box>
        </Box>

        {/* Issue Card Dialog */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <IconCreditCard />
              <Typography variant="h4">Issue New Card</Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Customer</InputLabel>
              <Select name="customerId" value={form.customerId} label="Customer" onChange={handleChange}>
                {customers.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name?.firstName} {c.name?.lastName} ({c.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {form.customerId && (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Linked Account</InputLabel>
                <Select
                  name="accountId"
                  value={form.accountId}
                  label="Linked Account"
                  onChange={handleChange}
                  onOpen={async () => {
                    if (accounts.length === 0) {
                      try {
                        const res = await accountAPI.getByCustomer(form.customerId);
                        setAccounts(res.data?.data || []);
                      } catch (error) {
                        toast.error('Failed to fetch accounts');
                      }
                    }
                  }}
                >
                  {accounts.map((a) => (
                    <MenuItem key={a._id} value={a._id}>
                      {a.accountNumber} · {a.accountType}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Card Type</InputLabel>
              <Select name="cardType" value={form.cardType} label="Card Type" onChange={handleChange}>
                <MenuItem value="debit">Debit Card</MenuItem>
                <MenuItem value="credit">Credit Card</MenuItem>
              </Select>
            </FormControl>
            {form.cardType === 'credit' && (
              <TextField
                name="creditLimit"
                label="Credit Limit (₹)"
                type="number"
                fullWidth
                sx={{ mt: 2 }}
                value={form.creditLimit}
                onChange={handleChange}
              />
            )}
            <TextField
              name="deliveryAddress"
              label="Delivery Address"
              fullWidth
              multiline
              rows={3}
              sx={{ mt: 2 }}
              value={form.deliveryAddress}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleIssueCard}
              disabled={loading || !form.customerId || !form.accountId || !form.deliveryAddress}
              sx={{ textTransform: 'none', px: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Issue Card'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Cards Table */}
        {loading && cards.length === 0 ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : cards.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No cards found. Click "Issue New Card" to get started.
          </Alert>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.lighter' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Card Number</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Limit (₹)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Expiry</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cards.map((card, index) => (
                  <TableRow
                    key={card._id}
                    sx={{
                      '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                      '&:hover': { bgcolor: 'action.selected' }
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconCreditCard size={20} color={card.cardType === 'credit' ? '#f44336' : '#2196f3'} />
                        <Typography variant="body2" fontFamily="monospace">
                          {card.cardNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {card.customerId?.name?.firstName} {card.customerId?.name?.lastName}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={card.cardType === 'debit' ? 'Debit' : 'Credit'}
                        size="small"
                        color={card.cardType === 'credit' ? 'secondary' : 'primary'}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      ₹{(card.cardType === 'credit' ? card.creditLimit : card.dailyWithdrawalLimit)?.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={card.status}
                        size="small"
                        color={getStatusColor(card.status)}
                        sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>{card.expiryDate ? new Date(card.expiryDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={0.5} justifyContent="center">
                        {card.status === 'issued' && (
                          <Tooltip title="Activate">
                            <IconButton
                              onClick={() => handleAction(card._id, 'activate')}
                              size="small"
                              sx={{
                                color: 'success.main',
                                '&:hover': { bgcolor: 'success.lighter' }
                              }}
                            >
                              <IconCheck size={20} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {card.status === 'blocked' ? (
                          <Tooltip title="Unblock">
                            <IconButton
                              onClick={() => handleAction(card._id, 'unblock')}
                              size="small"
                              sx={{
                                color: 'warning.main',
                                '&:hover': { bgcolor: 'warning.lighter' }
                              }}
                            >
                              <IconLockOpen size={20} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          card.status === 'active' && (
                            <Tooltip title="Block">
                              <IconButton
                                onClick={() => handleAction(card._id, 'block')}
                                size="small"
                                sx={{
                                  color: 'error.main',
                                  '&:hover': { bgcolor: 'error.lighter' }
                                }}
                              >
                                <IconLock size={20} />
                              </IconButton>
                            </Tooltip>
                          )
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </MainCard>
  );
};

export default CardManagement;
