const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    loanNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    loanType: {
      type: String,
      enum: ["personal", "home", "car", "education", "business", "gold"],
      required: true,
    },
    principalAmount: {
      type: Number,
      required: true,
      min: 1000,
    },
    sanctionedAmount: {
      type: Number,
    },
    interestRate: {
      type: Number,
      required: true,
      min: 0,
    },
    tenure: {
      type: Number,
      required: true,
      min: 1, // months
    },
    emi: {
      type: Number,
      required: true,
    },
    processingFee: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    firstEmiDate: {
      type: Date,
    },
    lastEmiDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "disbursed",
        "active",
        "overdue",
        "closed",
        "written_off",
      ],
      default: "draft",
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    approvalDate: {
      type: Date,
    },
    disbursementDate: {
      type: Date,
    },
    closureDate: {
      type: Date,
    },
    disbursedAmount: {
      type: Number,
      default: 0,
    },
    outstandingAmount: {
      type: Number,
      default: 0,
    },
    principalOutstanding: {
      type: Number,
      default: 0,
    },
    interestOutstanding: {
      type: Number,
      default: 0,
    },
    totalAmountPaid: {
      type: Number,
      default: 0,
    },
    // EMI tracking
    totalEmis: {
      type: Number,
    },
    emisPaid: {
      type: Number,
      default: 0,
    },
    emisRemaining: {
      type: Number,
    },
    nextEmiDate: {
      type: Date,
    },
    lastEmiPaidDate: {
      type: Date,
    },
    // Overdue tracking
    overdueAmount: {
      type: Number,
      default: 0,
    },
    overdueDays: {
      type: Number,
      default: 0,
    },
    penaltyAmount: {
      type: Number,
      default: 0,
    },
    // Collateral (for secured loans)
    collateral: {
      type: {
        type: String,
        enum: ["property", "vehicle", "gold", "securities", "none"],
      },
      description: String,
      value: Number,
      documentUrl: String,
    },
    // Documents
    documents: [
      {
        type: {
          type: String,
          enum: [
            "application_form",
            "income_proof",
            "address_proof",
            "bank_statement",
            "property_papers",
            "vehicle_rc",
            "other",
          ],
        },
        documentName: String,
        documentUrl: String,
        uploadedAt: Date,
      },
    ],
    // Co-applicant
    coApplicant: {
      name: String,
      relation: String,
      panCard: String,
      aadhaar: String,
      income: Number,
    },
    // Purpose
    purpose: {
      type: String,
      required: true,
    },
    // Guarantor
    guarantor: {
      name: String,
      relation: String,
      panCard: String,
      aadhaar: String,
      address: String,
    },
    // Workflow
    appliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: {
      type: String,
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
loanSchema.index({ loanNumber: 1 });
loanSchema.index({ customerId: 1 });
loanSchema.index({ accountId: 1 });
loanSchema.index({ branchId: 1 });
loanSchema.index({ status: 1 });
loanSchema.index({ loanType: 1 });
loanSchema.index({ nextEmiDate: 1 });

// Virtual for loan status summary
loanSchema.virtual("statusSummary").get(function () {
  return {
    isActive: this.status === "active",
    isOverdue: this.overdueDays > 0,
    completionPercentage: (this.emisPaid / this.totalEmis) * 100,
  };
});

const Loan = mongoose.model("Loan", loanSchema);

module.exports = Loan;
