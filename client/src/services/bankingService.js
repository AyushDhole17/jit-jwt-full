import axios from '../utils/axiosInstance';

// Note: axiosInstance already sets baseURL to http://<host>/api/v1
// So this should be just '/banking' to avoid duplicating '/api/v1' in the final URL
const API_BASE_URL = '/banking';

// Branch Services
export const branchAPI = {
  getAll: (filters = {}) => axios.get(`${API_BASE_URL}/branches`, { params: filters }),
  getById: (id) => axios.get(`${API_BASE_URL}/branches/${id}`),
  getStats: (id) => axios.get(`${API_BASE_URL}/branches/${id}/stats`),
  create: (data) => axios.post(`${API_BASE_URL}/branches`, data),
  update: (id, data) => axios.put(`${API_BASE_URL}/branches/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE_URL}/branches/${id}`),
  assignManager: (id, managerId) => axios.post(`${API_BASE_URL}/branches/${id}/assign-manager`, { managerId }),
};

// Customer Services
export const customerAPI = {
  getAll: (filters = {}) => axios.get(`${API_BASE_URL}/customers`, { params: filters }),
  getById: (id) => axios.get(`${API_BASE_URL}/customers/${id}`),
  getAccounts: (id) => axios.get(`${API_BASE_URL}/customers/${id}/accounts`),
  search: (query) => axios.get(`${API_BASE_URL}/customers/search`, { params: { q: query } }),
  create: (data) => axios.post(`${API_BASE_URL}/customers`, data),
  update: (id, data) => axios.put(`${API_BASE_URL}/customers/${id}`, data),
  verifyKYC: (id, status, rejectionReason = null) => 
    axios.post(`${API_BASE_URL}/customers/${id}/verify-kyc`, { status, rejectionReason }),
  uploadKYC: (id, docType, docUrl) => 
    axios.post(`${API_BASE_URL}/customers/${id}/upload-kyc`, { docType, docUrl }),
};

// Account Services
export const accountAPI = {
  getAll: (filters = {}) => axios.get(`${API_BASE_URL}/accounts`, { params: filters }),
  getByNumber: (accountNumber) => axios.get(`${API_BASE_URL}/accounts/${accountNumber}`),
  getByCustomer: (customerId) => axios.get(`${API_BASE_URL}/accounts/customer/${customerId}`),
  checkBalance: (accountNumber) => axios.get(`${API_BASE_URL}/accounts/${accountNumber}/balance`),
  create: (data) => axios.post(`${API_BASE_URL}/accounts`, data),
  update: (id, data) => axios.put(`${API_BASE_URL}/accounts/${id}`, data),
  close: (accountNumber) => axios.post(`${API_BASE_URL}/accounts/${accountNumber}/close`),
  freeze: (accountNumber, reason) => axios.post(`${API_BASE_URL}/accounts/${accountNumber}/freeze`, { reason }),
  unfreeze: (accountNumber) => axios.post(`${API_BASE_URL}/accounts/${accountNumber}/unfreeze`),
  enableUPI: (accountNumber, upiId) => axios.post(`${API_BASE_URL}/accounts/${accountNumber}/enable-upi`, { upiId }),
};

// Transaction Services
export const transactionAPI = {
  getAll: (filters = {}) => axios.get(`${API_BASE_URL}/transactions`, { params: filters }),
  getById: (transactionId) => axios.get(`${API_BASE_URL}/transactions/${transactionId}`),
  getStatement: (accountNumber, startDate, endDate) => 
    axios.get(`${API_BASE_URL}/transactions/statement/${accountNumber}`, { params: { startDate, endDate } }),
  deposit: (data) => axios.post(`${API_BASE_URL}/transactions/deposit`, data),
  withdrawal: (data) => axios.post(`${API_BASE_URL}/transactions/withdrawal`, data),
  transfer: (data) => axios.post(`${API_BASE_URL}/transactions/transfer`, data),
  upiTransfer: (data) => axios.post(`${API_BASE_URL}/transactions/upi-transfer`, data),
  reverse: (transactionId, reason) => axios.post(`${API_BASE_URL}/transactions/${transactionId}/reverse`, { reason }),
};

// Loan Services
export const loanAPI = {
  getAll: (filters = {}) => axios.get(`${API_BASE_URL}/loans`, { params: filters }),
  getByNumber: (loanNumber) => axios.get(`${API_BASE_URL}/loans/${loanNumber}`),
  getStats: (customerId) => axios.get(`${API_BASE_URL}/loans/stats/${customerId}`),
  apply: (data) => axios.post(`${API_BASE_URL}/loans/apply`, data),
  approve: (loanNumber, sanctionedAmount = null) => 
    axios.post(`${API_BASE_URL}/loans/${loanNumber}/approve`, { sanctionedAmount }),
  reject: (loanNumber, reason) => axios.post(`${API_BASE_URL}/loans/${loanNumber}/reject`, { reason }),
  disburse: (loanNumber) => axios.post(`${API_BASE_URL}/loans/${loanNumber}/disburse`),
  repay: (loanNumber, amount) => axios.post(`${API_BASE_URL}/loans/${loanNumber}/repay`, { amount }),
  foreclose: (loanNumber) => axios.post(`${API_BASE_URL}/loans/${loanNumber}/foreclose`),
};

// Banking summary
export const bankingAPI = {
  getSummary: () => axios.get(`${API_BASE_URL}/summary`),
};

// Card Services
export const cardAPI = {
  getAll: (filters = {}) => axios.get(`${API_BASE_URL}/cards`, { params: filters }),
  issue: (data) => axios.post(`${API_BASE_URL}/cards`, data),
  activate: (id) => axios.post(`${API_BASE_URL}/cards/${id}/activate`),
  block: (id, reason) => axios.post(`${API_BASE_URL}/cards/${id}/block`, { reason }),
  unblock: (id) => axios.post(`${API_BASE_URL}/cards/${id}/unblock`),
};

// Utility functions
export const formatIndianCurrency = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '₹0.00' : '0.00';
  }

  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);
  const parts = absoluteAmount.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);

  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }

  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  const formattedAmount = `${formattedInteger}.${decimalPart}`;

  const prefix = isNegative ? '-' : '';
  const symbol = showSymbol ? '₹' : '';

  return `${prefix}${symbol}${formattedAmount}`;
};

export const calculateEMI = (principal, ratePerAnnum, tenureMonths) => {
  const monthlyRate = ratePerAnnum / (12 * 100);
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
              (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi * 100) / 100;
};

export const maskAccountNumber = (accountNumber) => {
  if (!accountNumber || accountNumber.length < 4) return '****';
  const lastFour = accountNumber.slice(-4);
  const masked = '*'.repeat(accountNumber.length - 4);
  return masked + lastFour;
};

export const validatePAN = (pan) => {
  if (!pan) return false;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
};

export const validateAadhaar = (aadhaar) => {
  if (!aadhaar) return false;
  const aadhaarRegex = /^\d{12}$/;
  return aadhaarRegex.test(aadhaar.replace(/\s/g, ''));
};

export const validateIFSC = (ifsc) => {
  if (!ifsc) return false;
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc.toUpperCase());
};

export const getTransactionCharges = (type, amount) => {
  let charges = 0;

  switch (type) {
    case 'neft':
      if (amount <= 10000) charges = 2.5;
      else if (amount <= 100000) charges = 5;
      else if (amount <= 200000) charges = 15;
      else charges = 25;
      break;
    case 'rtgs':
      if (amount <= 200000) charges = 0;
      else if (amount <= 500000) charges = 30;
      else charges = 55;
      break;
    case 'imps':
      if (amount <= 1000) charges = 5;
      else if (amount <= 10000) charges = 5;
      else if (amount <= 100000) charges = 15;
      else charges = 25;
      break;
    case 'upi':
      charges = 0;
      break;
    default:
      charges = 0;
  }

  const gst = Math.round(charges * 0.18 * 100) / 100;
  const total = Math.round((charges + gst) * 100) / 100;

  return { charges, gst, total };
};

export default {
  branchAPI,
  customerAPI,
  accountAPI,
  transactionAPI,
  loanAPI,
  formatIndianCurrency,
  calculateEMI,
  maskAccountNumber,
  validatePAN,
  validateAadhaar,
  validateIFSC,
  getTransactionCharges,
  bankingAPI,
  cardAPI,
};
