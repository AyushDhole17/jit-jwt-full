/**
 * Banking Utility Functions for Indian Banking System
 */

/**
 * Format amount in Indian currency format (₹1,23,456.78)
 * @param {number} amount - Amount to format
 * @param {boolean} showSymbol - Whether to show ₹ symbol
 * @returns {string} Formatted amount
 */
const formatIndianCurrency = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? "₹0.00" : "0.00";
  }

  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);

  // Convert to string with 2 decimal places
  const parts = absoluteAmount.toFixed(2).split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Indian numbering system (lakhs and crores)
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);

  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }

  const formattedInteger =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  const formattedAmount = `${formattedInteger}.${decimalPart}`;

  const prefix = isNegative ? "-" : "";
  const symbol = showSymbol ? "₹" : "";

  return `${prefix}${symbol}${formattedAmount}`;
};

/**
 * Format amount in words (Indian style)
 * @param {number} amount - Amount to convert to words
 * @returns {string} Amount in words
 */
const amountToWords = (amount) => {
  if (amount === 0) return "Zero Rupees Only";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const convertLessThanThousand = (num) => {
    if (num === 0) return "";
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100)
      return tens[Math.floor(num / 10)] + " " + ones[num % 10];
    return (
      ones[Math.floor(num / 100)] +
      " Hundred " +
      convertLessThanThousand(num % 100)
    );
  };

  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) return "Zero Rupees Only";

  let words = "";

  // Crores
  if (integerPart >= 10000000) {
    words += convertLessThanThousand(Math.floor(integerPart / 10000000)) + " Crore ";
    integerPart %= 10000000;
  }

  // Lakhs
  if (integerPart >= 100000) {
    words += convertLessThanThousand(Math.floor(integerPart / 100000)) + " Lakh ";
    integerPart %= 100000;
  }

  // Thousands
  if (integerPart >= 1000) {
    words += convertLessThanThousand(Math.floor(integerPart / 1000)) + " Thousand ";
    integerPart %= 1000;
  }

  // Hundreds, tens, and ones
  if (integerPart > 0) {
    words += convertLessThanThousand(integerPart);
  }

  words = words.trim() + " Rupees";

  if (decimalPart > 0) {
    words += " and " + convertLessThanThousand(decimalPart) + " Paise";
  }

  return words.trim() + " Only";
};

/**
 * Generate unique account number (16 digits)
 * @returns {string} Account number
 */
const generateAccountNumber = () => {
  return Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
};

/**
 * Generate IFSC code
 * @param {string} bankCode - 4 letter bank code
 * @param {string} branchCode - 6 digit branch code
 * @returns {string} IFSC code
 */
const generateIFSCCode = (bankCode, branchCode) => {
  const bank = bankCode.toUpperCase().substring(0, 4).padEnd(4, "X");
  const branch = branchCode.toString().padStart(6, "0").substring(0, 6);
  return `${bank}0${branch}`;
};

/**
 * Generate MICR code
 * @param {string} city - City code (3 digits)
 * @param {string} bank - Bank code (3 digits)
 * @param {string} branch - Branch code (3 digits)
 * @returns {string} MICR code
 */
const generateMICRCode = (city, bank, branch) => {
  const cityCode = city.toString().padStart(3, "0").substring(0, 3);
  const bankCode = bank.toString().padStart(3, "0").substring(0, 3);
  const branchCode = branch.toString().padStart(3, "0").substring(0, 3);
  return `${cityCode}${bankCode}${branchCode}`;
};

/**
 * Generate unique transaction ID
 * @param {string} type - Transaction type (TXN, REF, etc.)
 * @returns {string} Transaction ID
 */
const generateTransactionId = (type = "TXN") => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${type}${timestamp}${random}`;
};

/**
 * Generate unique loan number
 * @returns {string} Loan number
 */
const generateLoanNumber = () => {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return `LN${year}${month}${random}`;
};

/**
 * Generate unique customer ID
 * @returns {string} Customer ID
 */
const generateCustomerId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return `CUST${year}${random}`;
};

/**
 * Generate card number (16 digits)
 * @param {string} cardType - 'debit' or 'credit'
 * @returns {string} Card number
 */
const generateCardNumber = (cardType) => {
  // First digit: 4 for debit, 5 for credit
  const firstDigit = cardType === "debit" ? "4" : "5";
  const remainingDigits = Math.floor(Math.random() * 1000000000000000)
    .toString()
    .padStart(15, "0");
  return firstDigit + remainingDigits;
};

/**
 * Generate CVV (3 digits)
 * @returns {string} CVV
 */
const generateCVV = () => {
  return Math.floor(100 + Math.random() * 900).toString();
};

/**
 * Validate PAN card number
 * @param {string} pan - PAN number
 * @returns {boolean} Is valid
 */
const validatePAN = (pan) => {
  if (!pan) return false;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
};

/**
 * Validate Aadhaar number
 * @param {string} aadhaar - Aadhaar number
 * @returns {boolean} Is valid
 */
const validateAadhaar = (aadhaar) => {
  if (!aadhaar) return false;
  const aadhaarRegex = /^\d{12}$/;
  return aadhaarRegex.test(aadhaar.replace(/\s/g, ""));
};

/**
 * Validate IFSC code
 * @param {string} ifsc - IFSC code
 * @returns {boolean} Is valid
 */
const validateIFSC = (ifsc) => {
  if (!ifsc) return false;
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc.toUpperCase());
};

/**
 * Validate Indian mobile number
 * @param {string} mobile - Mobile number
 * @returns {boolean} Is valid
 */
const validateMobile = (mobile) => {
  if (!mobile) return false;
  const mobileRegex = /^[+]?91[-\s]?[6-9]\d{9}$/;
  return mobileRegex.test(mobile.replace(/\s/g, ""));
};

/**
 * Validate Indian pincode
 * @param {string} pincode - Pincode
 * @returns {boolean} Is valid
 */
const validatePincode = (pincode) => {
  if (!pincode) return false;
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
};

/**
 * Calculate EMI
 * @param {number} principal - Principal amount
 * @param {number} ratePerAnnum - Interest rate per annum (%)
 * @param {number} tenureMonths - Tenure in months
 * @returns {number} EMI amount
 */
const calculateEMI = (principal, ratePerAnnum, tenureMonths) => {
  const monthlyRate = ratePerAnnum / (12 * 100);
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi * 100) / 100;
};

/**
 * Calculate simple interest
 * @param {number} principal - Principal amount
 * @param {number} ratePerAnnum - Interest rate per annum (%)
 * @param {number} timePeriod - Time period in years
 * @returns {number} Interest amount
 */
const calculateSimpleInterest = (principal, ratePerAnnum, timePeriod) => {
  return (principal * ratePerAnnum * timePeriod) / 100;
};

/**
 * Calculate compound interest
 * @param {number} principal - Principal amount
 * @param {number} ratePerAnnum - Interest rate per annum (%)
 * @param {number} timePeriod - Time period in years
 * @param {number} compoundingFrequency - Compounding frequency per year (default: 4 quarterly)
 * @returns {number} Maturity amount
 */
const calculateCompoundInterest = (
  principal,
  ratePerAnnum,
  timePeriod,
  compoundingFrequency = 4
) => {
  const rate = ratePerAnnum / 100;
  const n = compoundingFrequency;
  const t = timePeriod;
  const amount = principal * Math.pow(1 + rate / n, n * t);
  return Math.round(amount * 100) / 100;
};

/**
 * Mask account number
 * @param {string} accountNumber - Account number
 * @returns {string} Masked account number
 */
const maskAccountNumber = (accountNumber) => {
  if (!accountNumber || accountNumber.length < 4) return "****";
  const lastFour = accountNumber.slice(-4);
  const masked = "*".repeat(accountNumber.length - 4);
  return masked + lastFour;
};

/**
 * Mask card number
 * @param {string} cardNumber - Card number
 * @returns {string} Masked card number
 */
const maskCardNumber = (cardNumber) => {
  if (!cardNumber || cardNumber.length < 4) return "****-****-****-****";
  const lastFour = cardNumber.slice(-4);
  return `****-****-****-${lastFour}`;
};

/**
 * Format mobile number for display
 * @param {string} mobile - Mobile number
 * @returns {string} Formatted mobile
 */
const formatMobileNumber = (mobile) => {
  if (!mobile) return "";
  const cleaned = mobile.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+91-${cleaned}`;
  }
  return mobile;
};

/**
 * Get transaction charges based on type and amount
 * @param {string} type - Transaction type
 * @param {number} amount - Transaction amount
 * @returns {object} {charges, gst, total}
 */
const getTransactionCharges = (type, amount) => {
  let charges = 0;

  switch (type) {
    case "neft":
      if (amount <= 10000) charges = 2.5;
      else if (amount <= 100000) charges = 5;
      else if (amount <= 200000) charges = 15;
      else charges = 25;
      break;
    case "rtgs":
      if (amount <= 200000) charges = 0; // First transaction free
      else if (amount <= 500000) charges = 30;
      else charges = 55;
      break;
    case "imps":
      if (amount <= 1000) charges = 5;
      else if (amount <= 10000) charges = 5;
      else if (amount <= 100000) charges = 15;
      else charges = 25;
      break;
    case "upi":
      charges = 0; // UPI is free
      break;
    default:
      charges = 0;
  }

  const gst = Math.round(charges * 0.18 * 100) / 100; // 18% GST
  const total = Math.round((charges + gst) * 100) / 100;

  return { charges, gst, total };
};

/**
 * Check if amount is within transaction limits
 * @param {string} type - Transaction type
 * @param {number} amount - Transaction amount
 * @returns {object} {isValid, message, limit}
 */
const checkTransactionLimit = (type, amount) => {
  const limits = {
    upi: { max: 100000, min: 1 },
    imps: { max: 500000, min: 1 },
    neft: { max: Infinity, min: 1 },
    rtgs: { max: Infinity, min: 200000 },
  };

  const limit = limits[type];
  if (!limit) {
    return { isValid: true, message: "", limit: null };
  }

  if (amount < limit.min) {
    return {
      isValid: false,
      message: `Minimum amount for ${type.toUpperCase()} is ${formatIndianCurrency(
        limit.min
      )}`,
      limit: limit.min,
    };
  }

  if (amount > limit.max) {
    return {
      isValid: false,
      message: `Maximum amount for ${type.toUpperCase()} is ${formatIndianCurrency(
        limit.max
      )}`,
      limit: limit.max,
    };
  }

  return { isValid: true, message: "Valid transaction amount", limit };
};

/**
 * Calculate age from date of birth
 * @param {Date} dob - Date of birth
 * @returns {number} Age in years
 */
const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Format date to Indian format (DD/MM/YYYY)
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
const formatIndianDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format date and time
 * @param {Date} date - Date to format
 * @returns {string} Formatted date and time
 */
const formatDateTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

module.exports = {
  formatIndianCurrency,
  amountToWords,
  generateAccountNumber,
  generateIFSCCode,
  generateMICRCode,
  generateTransactionId,
  generateLoanNumber,
  generateCustomerId,
  generateCardNumber,
  generateCVV,
  validatePAN,
  validateAadhaar,
  validateIFSC,
  validateMobile,
  validatePincode,
  calculateEMI,
  calculateSimpleInterest,
  calculateCompoundInterest,
  maskAccountNumber,
  maskCardNumber,
  formatMobileNumber,
  getTransactionCharges,
  checkTransactionLimit,
  calculateAge,
  formatIndianDate,
  formatDateTime,
};
