const Account = require("../models/Account");
const Customer = require("../models/Customer");
const Branch = require("../models/Branch");
const {
  generateAccountNumber,
  calculateCompoundInterest,
} = require("../utils/bankingUtils");

class AccountService {
  async getAllAccounts(filters = {}) {
    const query = {};
    if (filters.customerId) query.customerId = filters.customerId;
    if (filters.branchId) query.branchId = filters.branchId;
    if (filters.accountType) query.accountType = filters.accountType;
    if (filters.status) query.status = filters.status;

    return await Account.find(query)
      .populate("customerId", "name email mobile customerId")
      .populate("branchId", "branchName branchCode")
      .sort({ createdAt: -1 });
  }

  async getAccountByNumber(accountNumber) {
    const account = await Account.findOne({ accountNumber })
      .populate("customerId")
      .populate("branchId")
      .populate("openedBy", "name");

    if (!account) throw new Error("Account not found");
    return account;
  }

  async createAccount(accountData, openedBy) {
    // Generate unique account number
    let accountNumber;
    let isUnique = false;

    while (!isUnique) {
      accountNumber = generateAccountNumber();
      const existing = await Account.findOne({ accountNumber });
      if (!existing) isUnique = true;
    }

    // Get branch IFSC code
    const branch = await Branch.findById(accountData.branchId);
    if (!branch) throw new Error("Branch not found");

    // Verify customer exists
    const customer = await Customer.findById(accountData.customerId);
    if (!customer) throw new Error("Customer not found");

    // Check KYC status
    if (customer.kyc.verificationStatus !== "verified") {
      throw new Error("Customer KYC not verified");
    }

    accountData.accountNumber = accountNumber;
    accountData.ifscCode = branch.ifscCode;
    accountData.openedBy = openedBy;
    accountData.openingDate = new Date();

    // For FD accounts, calculate maturity
    if (accountData.accountType === "fixed_deposit" && accountData.fdDetails) {
      const { depositAmount, tenure, interestRate } = accountData.fdDetails;
      const maturityAmount = calculateCompoundInterest(
        depositAmount,
        interestRate || accountData.interestRate,
        tenure / 12,
        4
      );
      accountData.fdDetails.maturityAmount = maturityAmount;
      const maturityDate = new Date();
      maturityDate.setMonth(maturityDate.getMonth() + tenure);
      accountData.fdDetails.maturityDate = maturityDate;
      accountData.balance = depositAmount;
    }

    const account = new Account(accountData);
    await account.save();

    // Add account to customer's accounts array
    customer.accounts.push(account._id);
    await customer.save();

    return await account.populate("customerId branchId");
  }

  async updateAccount(accountId, updateData) {
    const account = await Account.findByIdAndUpdate(
      accountId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("customerId branchId");

    if (!account) throw new Error("Account not found");
    return account;
  }

  async closeAccount(accountNumber, closedBy) {
    const account = await Account.findOne({ accountNumber });
    if (!account) throw new Error("Account not found");

    if (account.balance > 0) {
      throw new Error("Cannot close account with non-zero balance");
    }

    account.status = "closed";
    account.closingDate = new Date();
    await account.save();

    return account;
  }

  async checkBalance(accountNumber) {
    const account = await Account.findOne({ accountNumber });
    if (!account) throw new Error("Account not found");
    if (account.status !== "active") throw new Error("Account is not active");

    return {
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: account.balance,
      currency: account.currency,
      minimumBalance: account.minimumBalance,
      status: account.status,
    };
  }

  async updateBalance(accountNumber, amount, operation = "add") {
    const account = await Account.findOne({ accountNumber });
    if (!account) throw new Error("Account not found");
    if (account.status !== "active") throw new Error("Account is not active");

    if (operation === "add") {
      account.balance += amount;
    } else if (operation === "subtract") {
      if (account.balance < amount) {
        throw new Error("Insufficient balance");
      }
      account.balance -= amount;
    }

    account.lastTransactionDate = new Date();
    await account.save();

    return account;
  }

  async freezeAccount(accountNumber, reason) {
    const account = await Account.findOne({ accountNumber });
    if (!account) throw new Error("Account not found");

    account.status = "frozen";
    await account.save();

    return account;
  }

  async unfreezeAccount(accountNumber) {
    const account = await Account.findOne({ accountNumber });
    if (!account) throw new Error("Account not found");

    account.status = "active";
    await account.save();

    return account;
  }

  async enableUPI(accountNumber, upiId) {
    const account = await Account.findOne({ accountNumber });
    if (!account) throw new Error("Account not found");

    // Check if UPI ID already exists
    const existing = await Account.findOne({ upiId });
    if (existing) throw new Error("UPI ID already in use");

    account.upiEnabled = true;
    account.upiId = upiId.toLowerCase();
    await account.save();

    return account;
  }

  async getAccountsByCustomer(customerId) {
    return await Account.find({ customerId, status: { $ne: "closed" } })
      .populate("branchId", "branchName ifscCode")
      .sort({ createdAt: -1 });
  }
}

module.exports = new AccountService();
