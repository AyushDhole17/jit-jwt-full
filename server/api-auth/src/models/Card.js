const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    cardNumber: {
      type: String,
      required: true,
      unique: true,
      // Stored in encrypted format, only last 4 digits visible
    },
    cardType: {
      type: String,
      enum: ["debit", "credit"],
      required: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
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
    cardHolderName: {
      type: String,
      required: true,
      uppercase: true,
    },
    cvv: {
      type: String,
      required: true,
      // Stored in encrypted format
    },
    pin: {
      type: String,
      // Stored in encrypted/hashed format
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "blocked", "expired", "lost", "stolen", "closed"],
      default: "active",
    },
    // Card variant
    variant: {
      type: String,
      enum: ["classic", "silver", "gold", "platinum", "titanium"],
      default: "classic",
    },
    // For Debit Cards
    dailyWithdrawalLimit: {
      type: Number,
      default: 50000, // ₹50,000
    },
    dailyPurchaseLimit: {
      type: Number,
      default: 200000, // ₹2,00,000
    },
    internationalTransactionsEnabled: {
      type: Boolean,
      default: false,
    },
    onlineTransactionsEnabled: {
      type: Boolean,
      default: true,
    },
    contactlessEnabled: {
      type: Boolean,
      default: true,
    },
    // For Credit Cards
    creditLimit: {
      type: Number,
      default: 0,
    },
    availableCredit: {
      type: Number,
      default: 0,
    },
    usedCredit: {
      type: Number,
      default: 0,
    },
    billingCycle: {
      startDate: Number, // Day of month (1-31)
      endDate: Number, // Day of month (1-31)
    },
    dueDate: {
      type: Number, // Day of month (1-31)
    },
    minimumAmountDue: {
      type: Number,
      default: 0,
    },
    totalAmountDue: {
      type: Number,
      default: 0,
    },
    lastStatementDate: {
      type: Date,
    },
    lastPaymentDate: {
      type: Date,
    },
    lastPaymentAmount: {
      type: Number,
    },
    interestRate: {
      type: Number,
      default: 36, // % per annum for credit cards
    },
    rewardPoints: {
      type: Number,
      default: 0,
    },
    cashbackEarned: {
      type: Number,
      default: 0,
    },
    // Annual fee
    annualFee: {
      type: Number,
      default: 0,
    },
    feeWaiverConditions: {
      type: String,
    },
    lastFeeChargedDate: {
      type: Date,
    },
    nextFeeDate: {
      type: Date,
    },
    // Delivery details
    deliveryAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "dispatched", "delivered", "returned"],
      default: "pending",
    },
    trackingNumber: {
      type: String,
    },
    deliveredDate: {
      type: Date,
    },
    // Activation
    isActivated: {
      type: Boolean,
      default: false,
    },
    activatedDate: {
      type: Date,
    },
    activatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Blocking/Unblocking
    blockedDate: {
      type: Date,
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    blockReason: {
      type: String,
    },
    // Workflow
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
cardSchema.index({ cardNumber: 1 });
cardSchema.index({ accountId: 1 });
cardSchema.index({ customerId: 1 });
cardSchema.index({ status: 1 });
cardSchema.index({ expiryDate: 1 });

// Virtual for masked card number
cardSchema.virtual("maskedCardNumber").get(function () {
  if (this.cardNumber && this.cardNumber.length >= 4) {
    const lastFour = this.cardNumber.slice(-4);
    return `****-****-****-${lastFour}`;
  }
  return "****-****-****-****";
});

// Pre-save middleware to set expiry date
cardSchema.pre("save", function (next) {
  if (this.isNew && !this.expiryDate) {
    // Set expiry to 5 years from issue date for debit cards
    // Set expiry to 3 years from issue date for credit cards
    const yearsToAdd = this.cardType === "debit" ? 5 : 3;
    this.expiryDate = new Date(
      this.issueDate.getFullYear() + yearsToAdd,
      this.issueDate.getMonth(),
      this.issueDate.getDate()
    );
  }
  
  // Set available credit for credit cards
  if (this.cardType === "credit" && this.isNew) {
    this.availableCredit = this.creditLimit;
  }
  
  next();
});

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
