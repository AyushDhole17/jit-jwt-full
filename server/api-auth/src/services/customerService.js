const Customer = require("../models/Customer");
const Account = require("../models/Account");
const { generateCustomerId } = require("../utils/bankingUtils");

class CustomerService {
  async getAllCustomers(filters = {}) {
    const query = {};
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.homeBranch) query.homeBranch = filters.homeBranch;
    if (filters.verificationStatus)
      query["kyc.verificationStatus"] = filters.verificationStatus;

    return await Customer.find(query)
      .populate("userId", "name email")
      .populate("homeBranch", "branchName branchCode")
      .populate("accounts")
      .sort({ createdAt: -1 });
  }

  async getCustomerById(customerId) {
    const customer = await Customer.findById(customerId)
      .populate("userId", "name email mobile image")
      .populate("homeBranch", "branchName branchCode ifscCode address")
      .populate("accounts")
      .populate("relationshipManager", "name email");

    if (!customer) throw new Error("Customer not found");
    return customer;
  }

  async createCustomer(customerData, createdBy) {
    // Generate unique customer ID
    customerData.customerId = generateCustomerId();

    // Set userId (the logged-in user who is creating this customer)
    customerData.userId = createdBy;

    // Check if PAN or Aadhaar already exists
    const existingPAN = await Customer.findOne({
      "kyc.panCard.number": customerData.kyc.panCard.number,
    });
    if (existingPAN) throw new Error("PAN card already registered");

    const existingAadhaar = await Customer.findOne({
      "kyc.aadhaar.number": customerData.kyc.aadhaar.number,
    });
    if (existingAadhaar) throw new Error("Aadhaar already registered");

    const customer = new Customer(customerData);
    await customer.save();
    return customer.populate("homeBranch");
  }

  async updateCustomer(customerId, updateData) {
    const customer = await Customer.findByIdAndUpdate(
      customerId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("homeBranch accounts");

    if (!customer) throw new Error("Customer not found");
    return customer;
  }

  async verifyKYC(customerId, verifiedBy, status, rejectionReason = null) {
    const customer = await Customer.findById(customerId);
    if (!customer) throw new Error("Customer not found");

    customer.kyc.verificationStatus = status;
    customer.kyc.verifiedBy = verifiedBy;
    customer.kyc.verifiedAt = new Date();
    if (rejectionReason) customer.kyc.rejectionReason = rejectionReason;

    if (status === "verified") {
      customer.kyc.panCard.verified = true;
      customer.kyc.aadhaar.verified = true;
    }

    await customer.save();
    return customer;
  }

  async uploadKYCDocument(customerId, docType, docUrl) {
    const customer = await Customer.findById(customerId);
    if (!customer) throw new Error("Customer not found");

    if (docType === "pan") customer.kyc.panCard.documentUrl = docUrl;
    else if (docType === "aadhaar") customer.kyc.aadhaar.documentUrl = docUrl;
    else if (docType === "voterId") customer.kyc.voterId.documentUrl = docUrl;
    else if (docType === "photo") customer.kyc.photo = docUrl;
    else if (docType === "signature") customer.kyc.signature = docUrl;

    await customer.save();
    return customer;
  }

  async getCustomerAccounts(customerId) {
    const customer = await Customer.findById(customerId).populate("accounts");
    if (!customer) throw new Error("Customer not found");
    return customer.accounts;
  }

  async searchCustomers(searchTerm) {
    const regex = new RegExp(searchTerm, "i");
    return await Customer.find({
      $or: [
        { customerId: regex },
        { "name.firstName": regex },
        { "name.lastName": regex },
        { email: regex },
        { mobile: regex },
        { "kyc.panCard.number": regex },
      ],
    })
      .populate("homeBranch", "branchName")
      .limit(20);
  }
}

module.exports = new CustomerService();
