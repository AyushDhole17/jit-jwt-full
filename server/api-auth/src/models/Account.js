const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{16}$/, // 16-digit account number
    },
    accountType: {
      type: String,
      enum: ["savings", "current", "fixed_deposit", "recurring_deposit"],
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    ifscCode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "frozen", "dormant", "closed"],
      default: "active",
    },
    openingDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    closingDate: {
      type: Date,
    },
    minimumBalance: {
      type: Number,
      default: 5000, // Default for savings
    },
    interestRate: {
      type: Number,
      default: 3.5, // % per annum
    },
    lastInterestCredited: {
      type: Date,
    },
    // For Fixed Deposit
    fdDetails: {
      depositAmount: Number,
      maturityAmount: Number,
      maturityDate: Date,
      tenure: Number, // in months
      prematureWithdrawalPenalty: {
        type: Number,
        default: 1, // 1% penalty
      },
    },
    // For Recurring Deposit
    rdDetails: {
      monthlyDeposit: Number,
      tenure: Number, // in months
      maturityAmount: Number,
      maturityDate: Date,
      lastDepositDate: Date,
    },
    nominee: {
      name: String,
      relation: String,
      dateOfBirth: Date,
      aadhaar: String,
      address: String,
    },
    linkedAccounts: [
      {
        accountId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
        },
        linkType: {
          type: String,
          enum: ["overdraft", "sweep", "auto_transfer"],
        },
      },
    ],
    // Transaction limits
    dailyTransactionLimit: {
      type: Number,
      default: 50000, // ₹50,000
    },
    monthlyTransactionLimit: {
      type: Number,
      default: 500000, // ₹5,00,000
    },
    // Cheque book
    chequeBookIssued: {
      type: Boolean,
      default: false,
    },
    lastChequeNumber: {
      type: String,
    },
    // Debit card
    debitCardIssued: {
      type: Boolean,
      default: false,
    },
    // Internet banking
    internetBankingEnabled: {
      type: Boolean,
      default: false,
    },
    // Mobile banking
    mobileBankingEnabled: {
      type: Boolean,
      default: false,
    },
    // UPI
    upiEnabled: {
      type: Boolean,
      default: false,
    },
    upiId: {
      type: String,
      lowercase: true,
    },
    openedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastTransactionDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
accountSchema.index({ accountNumber: 1 });
accountSchema.index({ customerId: 1 });
accountSchema.index({ branchId: 1 });
accountSchema.index({ status: 1 });
accountSchema.index({ accountType: 1 });

// Pre-save middleware to set minimum balance based on account type
accountSchema.pre("save", function (next) {
  if (this.isNew) {
    switch (this.accountType) {
      case "savings":
        this.minimumBalance = 5000;
        this.interestRate = 3.5;
        break;
      case "current":
        this.minimumBalance = 10000;
        this.interestRate = 0;
        break;
      case "fixed_deposit":
        this.minimumBalance = 0;
        this.interestRate = 6.5;
        break;
      case "recurring_deposit":
        this.minimumBalance = 0;
        this.interestRate = 6.0;
        break;
    }
  }
  next();
});

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
