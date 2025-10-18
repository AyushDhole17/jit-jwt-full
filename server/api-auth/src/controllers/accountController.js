const accountService = require("../services/accountService");

exports.getAllAccounts = async (req, res, next) => {
  try {
    const accounts = await accountService.getAllAccounts(req.query);
    res.status(200).json({ success: true, data: accounts });
  } catch (error) {
    next(error);
  }
};

exports.getAccountByNumber = async (req, res, next) => {
  try {
    const account = await accountService.getAccountByNumber(req.params.accountNumber);
    res.status(200).json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
};

exports.createAccount = async (req, res, next) => {
  try {
    const account = await accountService.createAccount(req.body, req.user._id);
    res.status(201).json({ success: true, data: account, message: "Account created successfully" });
  } catch (error) {
    next(error);
  }
};

exports.updateAccount = async (req, res, next) => {
  try {
    const account = await accountService.updateAccount(req.params.id, req.body);
    res.status(200).json({ success: true, data: account, message: "Account updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.closeAccount = async (req, res, next) => {
  try {
    const account = await accountService.closeAccount(req.params.accountNumber, req.user._id);
    res.status(200).json({ success: true, data: account, message: "Account closed successfully" });
  } catch (error) {
    next(error);
  }
};

exports.checkBalance = async (req, res, next) => {
  try {
    const balance = await accountService.checkBalance(req.params.accountNumber);
    res.status(200).json({ success: true, data: balance });
  } catch (error) {
    next(error);
  }
};

exports.freezeAccount = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const account = await accountService.freezeAccount(req.params.accountNumber, reason);
    res.status(200).json({ success: true, data: account, message: "Account frozen successfully" });
  } catch (error) {
    next(error);
  }
};

exports.unfreezeAccount = async (req, res, next) => {
  try {
    const account = await accountService.unfreezeAccount(req.params.accountNumber);
    res.status(200).json({ success: true, data: account, message: "Account unfrozen successfully" });
  } catch (error) {
    next(error);
  }
};

exports.enableUPI = async (req, res, next) => {
  try {
    const { upiId } = req.body;
    const account = await accountService.enableUPI(req.params.accountNumber, upiId);
    res.status(200).json({ success: true, data: account, message: "UPI enabled successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getAccountsByCustomer = async (req, res, next) => {
  try {
    const accounts = await accountService.getAccountsByCustomer(req.params.customerId);
    res.status(200).json({ success: true, data: accounts });
  } catch (error) {
    next(error);
  }
};
