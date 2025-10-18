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
  Tooltip
} from '@mui/material';
import { IconPlus, IconCheck, IconBlock, IconRefresh } from '@tabler/icons-react';
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
    setLoading(true);
  const res = await cardAPI.getAll();
  setCards(res.data?.data || []);
    setLoading(false);
  };

  const fetchCustomers = async () => {
  const res = await customerAPI.getAll();
  const list = res.data?.data || [];
  setCustomers(list);
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
    setLoading(true);
    const payload = {
      customerId: form.customerId,
      accountId: form.accountId,
      cardType: form.cardType,
      creditLimit: form.cardType === 'credit' ? Number(form.creditLimit || 0) : 0,
      deliveryAddress: form.deliveryAddress
    };
    await cardAPI.issue(payload);
    fetchCards();
    handleClose();
    setLoading(false);
  };

  const handleAction = async (cardId, action) => {
    setLoading(true);
  if (action === 'activate') await cardAPI.activate(cardId);
  else if (action === 'block') await cardAPI.block(cardId);
  else await cardAPI.unblock(cardId);
    fetchCards();
    setLoading(false);
  };

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>Card Management</Typography>
      <Button variant="contained" startIcon={<IconPlus />} onClick={handleOpen} sx={{ mb: 2 }}>
        Issue New Card
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Issue New Card</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Customer</InputLabel>
            <Select
              name="customerId"
              value={form.customerId}
              label="Customer"
              onChange={handleChange}
            >
              {customers.map((c) => (
                <MenuItem key={c._id} value={c._id}>{c.name?.firstName} {c.name?.lastName} ({c.email})</MenuItem>
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
                    const res = await accountAPI.getByCustomer(form.customerId);
                    setAccounts(res.data?.data || []);
                  }
                }}
              >
                {accounts.map((a) => (
                  <MenuItem key={a._id} value={a._id}>{a.accountNumber} · {a.accountType}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Card Type</InputLabel>
            <Select
              name="cardType"
              value={form.cardType}
              label="Card Type"
              onChange={handleChange}
            >
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
            sx={{ mt: 2 }}
            value={form.deliveryAddress}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleIssueCard} disabled={loading || !form.customerId || !form.accountId || !form.deliveryAddress}>
            Issue Card
          </Button>
        </DialogActions>
      </Dialog>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Card Number</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Limit (₹)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Expiry</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cards.map((card) => (
              <TableRow key={card._id}>
                <TableCell>{card.cardNumber}</TableCell>
                <TableCell>{card.customerId?.name?.firstName} {card.customerId?.name?.lastName}</TableCell>
                <TableCell>{card.cardType === 'debit' ? 'Debit' : 'Credit'}</TableCell>
                <TableCell>
                  ₹{(card.cardType === 'credit' ? card.creditLimit : card.dailyWithdrawalLimit)?.toLocaleString('en-IN')}
                </TableCell>
                <TableCell>{card.status}</TableCell>
                <TableCell>{card.expiryDate?.slice(0,10)}</TableCell>
                <TableCell>
                  <Tooltip title="Activate">
                    <span>
                      <IconButton disabled={card.status !== 'issued'} onClick={() => handleAction(card._id, 'activate')}>
                        <IconCheck color="green" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={card.status === 'blocked' ? 'Unblock' : 'Block'}>
                    <span>
                      <IconButton onClick={() => handleAction(card._id, card.status === 'blocked' ? 'unblock' : 'block')}>
                        <IconBlock color={card.status === 'blocked' ? 'orange' : 'red'} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Refresh">
                    <span>
                      <IconButton onClick={fetchCards}>
                        <IconRefresh />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CardManagement;
