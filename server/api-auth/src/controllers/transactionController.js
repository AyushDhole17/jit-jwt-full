const transactionService = require("../services/transactionService");

exports.getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await transactionService.getAllTransactions(req.query);
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

exports.getTransactionById = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(req.params.transactionId);
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

exports.deposit = async (req, res, next) => {
  try {
    const transaction = await transactionService.deposit(req.body, req.user._id);
    res.status(201).json({ success: true, data: transaction, message: "Deposit successful" });
  } catch (error) {
    next(error);
  }
};

exports.withdrawal = async (req, res, next) => {
  try {
    const transaction = await transactionService.withdrawal(req.body, req.user._id);
    res.status(201).json({ success: true, data: transaction, message: "Withdrawal successful" });
  } catch (error) {
    next(error);
  }
};

exports.transfer = async (req, res, next) => {
  try {
    const transaction = await transactionService.transfer(req.body, req.user._id);
    res.status(201).json({ success: true, data: transaction, message: "Transfer successful" });
  } catch (error) {
    next(error);
  }
};

exports.upiTransfer = async (req, res, next) => {
  try {
    const transaction = await transactionService.upiTransfer(req.body, req.user._id);
    res.status(201).json({ success: true, data: transaction, message: "UPI transfer successful" });
  } catch (error) {
    next(error);
  }
};

exports.getAccountStatement = async (req, res, next) => {
  try {
    const { accountNumber } = req.params;
    const { startDate, endDate } = req.query;
    const statement = await transactionService.getAccountStatement(accountNumber, startDate, endDate);
    res.status(200).json({ success: true, data: statement });
  } catch (error) {
    next(error);
  }
};

exports.reverseTransaction = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const transaction = await transactionService.reverseTransaction(
      req.params.transactionId,
      reason,
      req.user._id
    );
    res.status(200).json({ success: true, data: transaction, message: "Transaction reversed successfully" });
  } catch (error) {
    next(error);
  }
};
