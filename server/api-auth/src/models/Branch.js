const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    branchCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    branchName: {
      type: String,
      required: true,
      trim: true,
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
        match: /^\d{6}$/, // Indian pincode format
      },
    },
    ifscCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      match: /^[A-Z]{4}0[A-Z0-9]{6}$/, // Indian IFSC format
    },
    micrCode: {
      type: String,
      required: true,
      match: /^\d{9}$/, // MICR code format
    },
    phone: {
      type: String,
      required: true,
      match: /^[0-9]{10}$|^[0-9]{3}-[0-9]{8}$/, // Indian phone format
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    openingDate: {
      type: Date,
      default: Date.now,
    },
    workingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
branchSchema.index({ branchCode: 1 });
branchSchema.index({ ifscCode: 1 });
branchSchema.index({ isActive: 1 });

const Branch = mongoose.model("Branch", branchSchema);

module.exports = Branch;
