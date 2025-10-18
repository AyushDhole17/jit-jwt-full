const Branch = require("../models/Branch");
const Customer = require("../models/Customer");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const Loan = require("../models/Loan");

exports.getSummary = async (req, res, next) => {
  try {
    // Parallel counts
    const [
      totalBranches,
      totalCustomers,
      totalAccounts,
      totalTransactions,
      totalDepositsAgg,
      loans
    ] = await Promise.all([
      Branch.countDocuments({ isActive: true }),
      Customer.countDocuments({ isActive: true }),
      Account.countDocuments({ status: "active" }),
      Transaction.countDocuments({}),
      Account.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: null, total: { $sum: "$balance" } } }
      ]),
      Loan.find({})
    ]);

    const totalDeposits = totalDepositsAgg?.[0]?.total || 0;
    const activeLoans = loans.filter((l) => l.status === "active");
    const totalLoanAmount = activeLoans.reduce((sum, l) => sum + (l.outstandingAmount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalBranches,
        totalCustomers,
        totalAccounts,
        totalTransactions,
        totalDeposits,
        totalLoans: loans.length,
        activeLoans: activeLoans.length,
        totalLoanAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};
