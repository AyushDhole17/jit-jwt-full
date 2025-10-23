const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const accountService = require("./accountService");
const {
  generateTransactionId,
  getTransactionCharges,
  checkTransactionLimit,
} = require("../utils/bankingUtils");

class TransactionService {
  async getAllTransactions(filters = {}) {
    const query = {};

    if (filters.accountId) {
      query.$or = [
        { "fromAccount.accountId": filters.accountId },
        { "toAccount.accountId": filters.accountId },
      ];
    }
    if (filters.type) query.type = filters.type;
    if (filters.status) query.status = filters.status;
    if (filters.startDate || filters.endDate) {
      query.transactionDate = {};
      if (filters.startDate)
        query.transactionDate.$gte = new Date(filters.startDate);
      if (filters.endDate)
        query.transactionDate.$lte = new Date(filters.endDate);
    }

    return await Transaction.find(query)
      .populate("fromAccount.accountId")
      .populate("toAccount.accountId")
      .populate("processedBy", "name")
      .sort({ transactionDate: -1 })
      .limit(filters.limit || 100);
  }

  async getTransactionById(transactionId) {
    const transaction = await Transaction.findOne({ transactionId })
      .populate("fromAccount.accountId")
      .populate("toAccount.accountId")
      .populate("processedBy", "name email")
      .populate("branchId", "branchName");

    if (!transaction) throw new Error("Transaction not found");
    return transaction;
  }

  async deposit(data, processedBy) {
    const { accountNumber, amount, description, branchId } = data;

    // Validate account
    const account = await Account.findOne({ accountNumber });
    if (!account) throw new Error("Account not found");
    if (account.status !== "active") throw new Error("Account is not active");

    // Create transaction
    const transactionId = generateTransactionId("TXN");
    const transaction = new Transaction({
      transactionId,
      type: "deposit",
      toAccount: {
        accountId: account._id,
        accountNumber: account.accountNumber,
        ifsc: account.ifscCode,
        holderName: await this.getAccountHolderName(account),
      },
      amount,
      currency: "INR",
      charges: 0,
      gst: 0,
      totalDebit: amount,
      description: description || "Cash Deposit",
      transactionDate: new Date(),
      status: "success",
      processedBy,
      branchId,
    });

    // Update account balance
    await accountService.updateBalance(accountNumber, amount, "add");
    transaction.balanceAfter = (await accountService.checkBalance(accountNumber))
      .balance;

    await transaction.save();
    return transaction;
  }

  async withdrawal(data, processedBy) {
    const { accountNumber, amount, description, branchId } = data;

    // Validate account
    const account = await Account.findOne({ accountNumber });
    if (!account) throw new Error("Account not found");
    if (account.status !== "active") throw new Error("Account is not active");

    // Check balance
    if (account.balance < amount) {
      throw new Error("Insufficient balance");
    }

    // Check minimum balance
    if (
      account.accountType === "savings" &&
      account.balance - amount < account.minimumBalance
    ) {
      throw new Error(
        `Cannot withdraw. Minimum balance of ₹${account.minimumBalance} must be maintained`
      );
    }

    // Check daily limit
    if (amount > account.dailyTransactionLimit) {
      throw new Error(`Daily withdrawal limit is ₹${account.dailyTransactionLimit}`);
    }

    // Create transaction
    const transactionId = generateTransactionId("TXN");
    const transaction = new Transaction({
      transactionId,
      type: "withdrawal",
      fromAccount: {
        accountId: account._id,
        accountNumber: account.accountNumber,
        ifsc: account.ifscCode,
        holderName: await this.getAccountHolderName(account),
      },
      amount,
      currency: "INR",
      charges: 0,
      gst: 0,
      totalDebit: amount,
      description: description || "Cash Withdrawal",
      transactionDate: new Date(),
      status: "success",
      processedBy,
      branchId,
    });

    // Update account balance
    await accountService.updateBalance(accountNumber, amount, "subtract");
    transaction.balanceAfter = (await accountService.checkBalance(accountNumber))
      .balance;

    await transaction.save();
    return transaction;
  }

  async transfer(data, processedBy) {
    const {
      fromAccountNumber,
      toAccountNumber,
      amount,
      description,
      type = "transfer",
      branchId,
    } = data;

    // Validate from account
    const fromAccount = await Account.findOne({
      accountNumber: fromAccountNumber,
    });
    if (!fromAccount) throw new Error("Source account not found");
    if (fromAccount.status !== "active")
      throw new Error("Source account is not active");

    // Validate to account
    const toAccount = await Account.findOne({ accountNumber: toAccountNumber });
    if (!toAccount) throw new Error("Destination account not found");
    if (toAccount.status !== "active")
      throw new Error("Destination account is not active");

    // Check balance
    const charges = getTransactionCharges(type, amount);
    const totalAmount = amount + charges.total;

    if (fromAccount.balance < totalAmount) {
      throw new Error("Insufficient balance");
    }

    // Check transaction limits
    const limitCheck = checkTransactionLimit(type, amount);
    if (!limitCheck.isValid) {
      throw new Error(limitCheck.message);
    }

    // Create transaction
    const transactionId = generateTransactionId("TXN");
    const referenceNumber =
      type !== "transfer" ? generateTransactionId("REF") : null;

    const transaction = new Transaction({
      transactionId,
      referenceNumber,
      type,
      fromAccount: {
        accountId: fromAccount._id,
        accountNumber: fromAccount.accountNumber,
        ifsc: fromAccount.ifscCode,
        holderName: await this.getAccountHolderName(fromAccount),
      },
      toAccount: {
        accountId: toAccount._id,
        accountNumber: toAccount.accountNumber,
        ifsc: toAccount.ifscCode,
        holderName: await this.getAccountHolderName(toAccount),
      },
      amount,
      currency: "INR",
      charges: charges.charges,
      gst: charges.gst,
      totalDebit: totalAmount,
      description: description || `Fund Transfer to ${toAccountNumber}`,
      transactionDate: new Date(),
      status: "success",
      processedBy,
      branchId,
    });

    // Update balances
    await accountService.updateBalance(fromAccountNumber, totalAmount, "subtract");
    await accountService.updateBalance(toAccountNumber, amount, "add");

    transaction.balanceAfter = (
      await accountService.checkBalance(fromAccountNumber)
    ).balance;

    await transaction.save();
    return transaction;
  }

  async upiTransfer(data, processedBy) {
    const { fromAccountNumber, toUpiId, amount, description, branchId } = data;

    // Find account by UPI ID
    const toAccount = await Account.findOne({ upiId: toUpiId.toLowerCase() });
    if (!toAccount) throw new Error("UPI ID not found");

    return await this.transfer(
      {
        fromAccountNumber,
        toAccountNumber: toAccount.accountNumber,
        amount,
        description: description || `UPI Payment to ${toUpiId}`,
        type: "upi",
        branchId,
      },
      processedBy
    );
  }

  async getAccountStatement(accountNumber, startDate, endDate) {
    const account = await Account.findOne({ accountNumber });
    if (!account) throw new Error("Account not found");

    const query = {
      $or: [
        { "fromAccount.accountNumber": accountNumber },
        { "toAccount.accountNumber": accountNumber },
      ],
      status: "success",
      transactionDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    const transactions = await Transaction.find(query).sort({
      transactionDate: -1,
    });

    return {
      account: {
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        holderName: await this.getAccountHolderName(account),
        ifscCode: account.ifscCode,
        currentBalance: account.balance,
      },
      startDate,
      endDate,
      transactions,
      openingBalance: await this.calculateOpeningBalance(
        accountNumber,
        startDate
      ),
      closingBalance: account.balance,
    };
  }

  async calculateOpeningBalance(accountNumber, date) {
    const account = await Account.findOne({ accountNumber });
    if (!account) return 0;

    const transactions = await Transaction.find({
      $or: [
        { "fromAccount.accountNumber": accountNumber },
        { "toAccount.accountNumber": accountNumber },
      ],
      status: "success",
      transactionDate: { $lt: new Date(date) },
    }).sort({ transactionDate: 1 });

    let balance = 0;
    transactions.forEach((txn) => {
      if (txn.fromAccount.accountNumber === accountNumber) {
        balance -= txn.totalDebit;
      }
      if (txn.toAccount.accountNumber === accountNumber) {
        balance += txn.amount;
      }
    });

    return balance;
  }

  async getAccountHolderName(account) {
    const Customer = require("../models/Customer");
    const customer = await Customer.findById(account.customerId);
    if (!customer) return "Unknown";
    return `${customer.name.firstName} ${customer.name.lastName}`;
  }

  async reverseTransaction(transactionId, reason, reversedBy) {
    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction) throw new Error("Transaction not found");
    if (transaction.status === "reversed")
      throw new Error("Transaction already reversed");

    // Create reversal transaction
    const reversalTxn = new Transaction({
      transactionId: generateTransactionId("REV"),
      type: "reversal",
      fromAccount: transaction.toAccount,
      toAccount: transaction.fromAccount,
      amount: transaction.amount,
      currency: transaction.currency,
      charges: 0,
      gst: 0,
      totalDebit: transaction.amount,
      description: `Reversal of ${transactionId}: ${reason}`,
      transactionDate: new Date(),
      status: "success",
      processedBy: reversedBy,
      branchId: transaction.branchId,
    });

    // Update balances
    if (transaction.fromAccount.accountNumber) {
      await accountService.updateBalance(
        transaction.fromAccount.accountNumber,
        transaction.totalDebit,
        "add"
      );
    }
    if (transaction.toAccount.accountNumber) {
      await accountService.updateBalance(
        transaction.toAccount.accountNumber,
        transaction.amount,
        "subtract"
      );
    }

    // Mark original as reversed
    transaction.status = "reversed";
    await transaction.save();

    await reversalTxn.save();
    return reversalTxn;
  }
}

module.exports = new TransactionService();
