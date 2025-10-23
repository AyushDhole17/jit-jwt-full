const Loan = require("../models/Loan");
const Account = require("../models/Account");
const Customer = require("../models/Customer");
const { generateLoanNumber, calculateEMI } = require("../utils/bankingUtils");
const transactionService = require("./transactionService");

class LoanService {
  async getAllLoans(filters = {}) {
    const query = {};
    if (filters.customerId) query.customerId = filters.customerId;
    if (filters.branchId) query.branchId = filters.branchId;
    if (filters.loanType) query.loanType = filters.loanType;
    if (filters.status) query.status = filters.status;

    return await Loan.find(query)
      .populate("customerId", "name email mobile customerId")
      .populate("accountId", "accountNumber accountType")
      .populate("branchId", "branchName")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 });
  }

  async getLoanByNumber(loanNumber) {
    const loan = await Loan.findOne({ loanNumber })
      .populate("customerId")
      .populate("accountId")
      .populate("branchId")
      .populate("approvedBy", "name email")
      .populate("appliedBy", "name");

    if (!loan) throw new Error("Loan not found");
    return loan;
  }

  async applyLoan(loanData, appliedBy) {
    // Generate loan number
    loanData.loanNumber = generateLoanNumber();

    // Validate customer
    const customer = await Customer.findById(loanData.customerId);
    if (!customer) throw new Error("Customer not found");
    if (customer.kyc.verificationStatus !== "verified") {
      throw new Error("Customer KYC not verified");
    }

    // Validate account
    const account = await Account.findById(loanData.accountId);
    if (!account) throw new Error("Account not found");
    if (account.status !== "active") throw new Error("Account not active");

    // Calculate EMI
    const emi = calculateEMI(
      loanData.principalAmount,
      loanData.interestRate,
      loanData.tenure
    );
    loanData.emi = emi;
    loanData.totalEmis = loanData.tenure;
    loanData.emisRemaining = loanData.tenure;
    loanData.appliedBy = appliedBy;
    loanData.status = "submitted";
    loanData.applicationDate = new Date();

    const loan = new Loan(loanData);
    await loan.save();

    return loan;
  }

  async approveLoan(loanNumber, approvedBy, sanctionedAmount = null) {
    const loan = await Loan.findOne({ loanNumber });
    if (!loan) throw new Error("Loan not found");
    if (loan.status !== "submitted" && loan.status !== "under_review") {
      throw new Error("Loan cannot be approved at this stage");
    }

    loan.status = "approved";
    loan.approvedBy = approvedBy;
    loan.approvalDate = new Date();
    loan.sanctionedAmount = sanctionedAmount || loan.principalAmount;

    // Recalculate EMI if sanctioned amount is different
    if (sanctionedAmount && sanctionedAmount !== loan.principalAmount) {
      loan.emi = calculateEMI(
        sanctionedAmount,
        loan.interestRate,
        loan.tenure
      );
    }

    await loan.save();
    return loan;
  }

  async rejectLoan(loanNumber, rejectedBy, reason) {
    const loan = await Loan.findOne({ loanNumber });
    if (!loan) throw new Error("Loan not found");

    loan.status = "rejected";
    loan.rejectedBy = rejectedBy;
    loan.rejectionReason = reason;

    await loan.save();
    return loan;
  }

  async disburseLoan(loanNumber, disbursedBy) {
    const loan = await Loan.findOne({ loanNumber }).populate("accountId");
    if (!loan) throw new Error("Loan not found");
    if (loan.status !== "approved") {
      throw new Error("Loan must be approved before disbursement");
    }

    const amount = loan.sanctionedAmount || loan.principalAmount;

    // Create deposit transaction
    const transaction = await transactionService.deposit(
      {
        accountNumber: loan.accountId.accountNumber,
        amount,
        description: `Loan disbursement - ${loanNumber}`,
        branchId: loan.branchId,
      },
      disbursedBy
    );

    // Update loan
    loan.status = "disbursed";
    loan.disbursementDate = new Date();
    loan.disbursedAmount = amount;
    loan.outstandingAmount = amount;
    loan.principalOutstanding = amount;
    loan.startDate = new Date();

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + loan.tenure);
    loan.endDate = endDate;

    const firstEmiDate = new Date();
    firstEmiDate.setMonth(firstEmiDate.getMonth() + 1);
    loan.firstEmiDate = firstEmiDate;
    loan.nextEmiDate = firstEmiDate;

    await loan.save();

    // Mark as active after 1 day
    setTimeout(async () => {
      loan.status = "active";
      await loan.save();
    }, 24 * 60 * 60 * 1000);

    return loan;
  }

  async repayEMI(loanNumber, amount, paidBy) {
    const loan = await Loan.findOne({ loanNumber }).populate("accountId");
    if (!loan) throw new Error("Loan not found");
    if (loan.status !== "active" && loan.status !== "overdue") {
      throw new Error("Loan is not active");
    }

    // Create withdrawal transaction
    const transaction = await transactionService.withdrawal(
      {
        accountNumber: loan.accountId.accountNumber,
        amount,
        description: `EMI payment for ${loanNumber}`,
        branchId: loan.branchId,
      },
      paidBy
    );

    // Update loan
    loan.totalAmountPaid += amount;
    loan.outstandingAmount -= amount;

    // Calculate interest and principal components
    const interestComponent =
      (loan.principalOutstanding * loan.interestRate) / (12 * 100);
    const principalComponent = amount - interestComponent;

    loan.interestOutstanding =
      (loan.interestOutstanding || 0) - interestComponent;
    loan.principalOutstanding -= principalComponent;
    loan.emisPaid += 1;
    loan.emisRemaining -= 1;
    loan.lastEmiPaidDate = new Date();

    // Calculate next EMI date
    const nextDate = new Date(loan.nextEmiDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    loan.nextEmiDate = nextDate;

    // Check if loan is fully paid
    if (loan.outstandingAmount <= 0 || loan.emisRemaining <= 0) {
      loan.status = "closed";
      loan.closureDate = new Date();
    }

    // Reset overdue if applicable
    if (loan.status === "overdue") {
      loan.status = "active";
      loan.overdueAmount = 0;
      loan.overdueDays = 0;
    }

    await loan.save();
    return loan;
  }

  async markOverdue() {
    const today = new Date();
    const loans = await Loan.find({
      status: "active",
      nextEmiDate: { $lt: today },
    });

    for (const loan of loans) {
      const daysDiff = Math.floor(
        (today - loan.nextEmiDate) / (1000 * 60 * 60 * 24)
      );
      loan.status = "overdue";
      loan.overdueDays = daysDiff;
      loan.overdueAmount = loan.emi;
      loan.penaltyAmount = (loan.emi * 2 * daysDiff) / 100; // 2% per day penalty

      await loan.save();
    }

    return loans.length;
  }

  async foreclose(loanNumber, foreClosedBy) {
    const loan = await Loan.findOne({ loanNumber }).populate("accountId");
    if (!loan) throw new Error("Loan not found");
    if (loan.status !== "active") {
      throw new Error("Only active loans can be foreclosed");
    }

    const foreclosureAmount =
      loan.outstandingAmount + loan.principalOutstanding * 0.02; // 2% foreclosure charges

    // Create withdrawal transaction
    await transactionService.withdrawal(
      {
        accountNumber: loan.accountId.accountNumber,
        amount: foreclosureAmount,
        description: `Loan foreclosure for ${loanNumber}`,
        branchId: loan.branchId,
      },
      foreClosedBy
    );

    loan.status = "closed";
    loan.closureDate = new Date();
    loan.totalAmountPaid += foreclosureAmount;
    loan.outstandingAmount = 0;
    loan.principalOutstanding = 0;
    loan.remarks = "Foreclosed";

    await loan.save();
    return loan;
  }

  async getLoanStats(customerId) {
    const loans = await Loan.find({ customerId });

    return {
      totalLoans: loans.length,
      activeLoans: loans.filter((l) => l.status === "active").length,
      closedLoans: loans.filter((l) => l.status === "closed").length,
      overdueLoans: loans.filter((l) => l.status === "overdue").length,
      totalDisbursed: loans.reduce((sum, l) => sum + l.disbursedAmount, 0),
      totalOutstanding: loans.reduce((sum, l) => sum + l.outstandingAmount, 0),
      totalPaid: loans.reduce((sum, l) => sum + l.totalAmountPaid, 0),
    };
  }
}

module.exports = new LoanService();
