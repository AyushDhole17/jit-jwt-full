const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    referenceNumber: {
      type: String,
      unique: true,
      uppercase: true,
      sparse: true, // For external transactions (NEFT/RTGS/IMPS)
    },
    type: {
      type: String,
      enum: [
        "deposit",
        "withdrawal",
        "transfer",
        "upi",
        "neft",
        "rtgs",
        "imps",
        "loan_disbursement",
        "loan_repayment",
        "interest_credit",
        "charges_debit",
        "reversal",
      ],
      required: true,
    },
    fromAccount: {
      accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
      accountNumber: String,
      ifsc: String,
      holderName: String,
    },
    toAccount: {
      accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
      accountNumber: String,
      ifsc: String,
      holderName: String,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    charges: {
      type: Number,
      default: 0,
    },
    gst: {
      type: Number,
      default: 0, // 18% GST on charges
    },
    totalDebit: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    valueDate: {
      type: Date, // For future-dated transactions
    },
    status: {
      type: String,
      enum: ["pending", "processing", "success", "failed", "reversed"],
      default: "pending",
    },
    failureReason: {
      type: String,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    // UPI specific fields
    upiId: {
      type: String,
      lowercase: true,
    },
    upiTransactionId: {
      type: String,
    },
    // NEFT/RTGS/IMPS specific fields
    beneficiaryName: {
      type: String,
    },
    beneficiaryBank: {
      type: String,
    },
    beneficiaryIFSC: {
      type: String,
      uppercase: true,
    },
    // Cheque specific fields
    chequeNumber: {
      type: String,
    },
    chequeDate: {
      type: Date,
    },
    chequeClearanceDate: {
      type: Date,
    },
    // Balance tracking
    balanceAfter: {
      type: Number,
    },
    // Metadata
    ipAddress: {
      type: String,
    },
    deviceInfo: {
      type: String,
    },
    location: {
      latitude: Number,
      longitude: Number,
      city: String,
    },
    // Approval for high-value transactions
    requiresApproval: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    // Receipt
    receiptNumber: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ referenceNumber: 1 });
transactionSchema.index({ "fromAccount.accountId": 1 });
transactionSchema.index({ "toAccount.accountId": 1 });
transactionSchema.index({ transactionDate: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });

// Pre-save middleware to calculate total debit
transactionSchema.pre("save", function (next) {
  if (this.isNew) {
    this.totalDebit = this.amount + this.charges + this.gst;
  }
  next();
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
