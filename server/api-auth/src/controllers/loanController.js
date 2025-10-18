const loanService = require("../services/loanService");

exports.getAllLoans = async (req, res, next) => {
  try {
    const loans = await loanService.getAllLoans(req.query);
    res.status(200).json({ success: true, data: loans });
  } catch (error) {
    next(error);
  }
};

exports.getLoanByNumber = async (req, res, next) => {
  try {
    const loan = await loanService.getLoanByNumber(req.params.loanNumber);
    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

exports.applyLoan = async (req, res, next) => {
  try {
    const loan = await loanService.applyLoan(req.body, req.user._id);
    res.status(201).json({ success: true, data: loan, message: "Loan application submitted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.approveLoan = async (req, res, next) => {
  try {
    const { sanctionedAmount } = req.body;
    const loan = await loanService.approveLoan(req.params.loanNumber, req.user._id, sanctionedAmount);
    res.status(200).json({ success: true, data: loan, message: "Loan approved successfully" });
  } catch (error) {
    next(error);
  }
};

exports.rejectLoan = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const loan = await loanService.rejectLoan(req.params.loanNumber, req.user._id, reason);
    res.status(200).json({ success: true, data: loan, message: "Loan rejected" });
  } catch (error) {
    next(error);
  }
};

exports.disburseLoan = async (req, res, next) => {
  try {
    const loan = await loanService.disburseLoan(req.params.loanNumber, req.user._id);
    res.status(200).json({ success: true, data: loan, message: "Loan disbursed successfully" });
  } catch (error) {
    next(error);
  }
};

exports.repayEMI = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const loan = await loanService.repayEMI(req.params.loanNumber, amount, req.user._id);
    res.status(200).json({ success: true, data: loan, message: "EMI paid successfully" });
  } catch (error) {
    next(error);
  }
};

exports.foreclose = async (req, res, next) => {
  try {
    const loan = await loanService.foreclose(req.params.loanNumber, req.user._id);
    res.status(200).json({ success: true, data: loan, message: "Loan foreclosed successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getLoanStats = async (req, res, next) => {
  try {
    const stats = await loanService.getLoanStats(req.params.customerId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
