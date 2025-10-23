const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      middleName: {
        type: String,
        trim: true,
        default: "",
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      match: /^[+]?91[-]?[0-9]{10}$/, // Indian mobile format
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    maritalStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed"],
      default: "single",
    },
    address: {
      line1: {
        type: String,
        required: true,
      },
      line2: {
        type: String,
        default: "",
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
        match: /^\d{6}$/,
      },
    },
    kyc: {
      panCard: {
        number: {
          type: String,
          required: true,
          unique: true,
          uppercase: true,
          match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, // PAN format
        },
        verified: {
          type: Boolean,
          default: false,
        },
        documentUrl: String,
      },
      aadhaar: {
        number: {
          type: String,
          required: true,
          unique: true,
          match: /^\d{12}$/, // Aadhaar format
        },
        verified: {
          type: Boolean,
          default: false,
        },
        documentUrl: String,
      },
      voterId: {
        number: String,
        documentUrl: String,
      },
      photo: {
        type: String,
        required: true,
      },
      signature: {
        type: String,
      },
      verificationStatus: {
        type: String,
        enum: ["pending", "in_review", "verified", "rejected"],
        default: "pending",
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      verifiedAt: Date,
      rejectionReason: String,
    },
    homeBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    accounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
    ],
    occupation: {
      type: String,
      enum: [
        "salaried",
        "self_employed",
        "business",
        "retired",
        "student",
        "homemaker",
        "other",
      ],
      required: true,
    },
    annualIncome: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    relationshipManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
customerSchema.index({ customerId: 1 });
customerSchema.index({ userId: 1 });
customerSchema.index({ "kyc.panCard.number": 1 });
customerSchema.index({ "kyc.aadhaar.number": 1 });
customerSchema.index({ homeBranch: 1 });

// Virtual for full name
customerSchema.virtual("fullName").get(function () {
  return `${this.name.firstName} ${this.name.middleName ? this.name.middleName + " " : ""}${this.name.lastName}`;
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
