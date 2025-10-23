require("dotenv").config();
const mongoose = require("mongoose");
const Branch = require("../models/Branch");
const Customer = require("../models/Customer");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const Loan = require("../models/Loan");
const Card = require("../models/Card");
const User = require("../models/User");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Helper function to generate random number
const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to generate random date
const randomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

// Nagpur Branches Data
const nagpurBranches = [
  {
    branchCode: "NGP001",
    branchName: "Sitabuldi Main Branch",
    address: {
      line1: "Central Avenue",
      line2: "Near Kasturchand Park",
      city: "Nagpur",
      state: "Maharashtra",
      pincode: "440012",
    },
    ifscCode: "BANK0NGP001",
    micrCode: "440002001",
    phone: "7122345001",
    email: "sitabuldi@nagpurbank.com",
    workingHours: {
      monday: { open: "10:00", close: "16:00" },
      tuesday: { open: "10:00", close: "16:00" },
      wednesday: { open: "10:00", close: "16:00" },
      thursday: { open: "10:00", close: "16:00" },
      friday: { open: "10:00", close: "16:00" },
      saturday: { open: "10:00", close: "13:00" },
      sunday: { open: "", close: "" },
    },
    isActive: true,
  },
  {
    branchCode: "NGP002",
    branchName: "Dharampeth Branch",
    address: {
      line1: "Ramdaspeth Road",
      line2: "Near Variety Square",
      city: "Nagpur",
      state: "Maharashtra",
      pincode: "440010",
    },
    ifscCode: "BANK0NGP002",
    micrCode: "440002002",
    phone: "7122345002",
    email: "dharampeth@nagpurbank.com",
    workingHours: {
      monday: { open: "10:00", close: "16:00" },
      tuesday: { open: "10:00", close: "16:00" },
      wednesday: { open: "10:00", close: "16:00" },
      thursday: { open: "10:00", close: "16:00" },
      friday: { open: "10:00", close: "16:00" },
      saturday: { open: "10:00", close: "13:00" },
      sunday: { open: "", close: "" },
    },
    isActive: true,
  },
  {
    branchCode: "NGP003",
    branchName: "Sadar Branch",
    address: {
      line1: "Residency Road",
      line2: "Near Railway Station",
      city: "Nagpur",
      state: "Maharashtra",
      pincode: "440001",
    },
    ifscCode: "BANK0NGP003",
    micrCode: "440002003",
    phone: "7122345003",
    email: "sadar@nagpurbank.com",
    workingHours: {
      monday: { open: "10:00", close: "16:00" },
      tuesday: { open: "10:00", close: "16:00" },
      wednesday: { open: "10:00", close: "16:00" },
      thursday: { open: "10:00", close: "16:00" },
      friday: { open: "10:00", close: "16:00" },
      saturday: { open: "10:00", close: "13:00" },
      sunday: { open: "", close: "" },
    },
    isActive: true,
  },
  {
    branchCode: "NGP004",
    branchName: "Wardha Road Branch",
    address: {
      line1: "Wardha Road",
      line2: "Near Panchsheel Square",
      city: "Nagpur",
      state: "Maharashtra",
      pincode: "440025",
    },
    ifscCode: "BANK0NGP004",
    micrCode: "440002004",
    phone: "7122345004",
    email: "wardharoad@nagpurbank.com",
    workingHours: {
      monday: { open: "10:00", close: "16:00" },
      tuesday: { open: "10:00", close: "16:00" },
      wednesday: { open: "10:00", close: "16:00" },
      thursday: { open: "10:00", close: "16:00" },
      friday: { open: "10:00", close: "16:00" },
      saturday: { open: "10:00", close: "13:00" },
      sunday: { open: "", close: "" },
    },
    isActive: true,
  },
  {
    branchCode: "NGP005",
    branchName: "Civil Lines Branch",
    address: {
      line1: "North Ambazari Road",
      line2: "Near Raj Bhavan",
      city: "Nagpur",
      state: "Maharashtra",
      pincode: "440001",
    },
    ifscCode: "BANK0NGP005",
    micrCode: "440002005",
    phone: "7122345005",
    email: "civillines@nagpurbank.com",
    workingHours: {
      monday: { open: "10:00", close: "16:00" },
      tuesday: { open: "10:00", close: "16:00" },
      wednesday: { open: "10:00", close: "16:00" },
      thursday: { open: "10:00", close: "16:00" },
      friday: { open: "10:00", close: "16:00" },
      saturday: { open: "10:00", close: "13:00" },
      sunday: { open: "", close: "" },
    },
    isActive: true,
  },
  {
    branchCode: "NGP006",
    branchName: "Pratap Nagar Branch",
    address: {
      line1: "Pratap Nagar",
      line2: "Near Manish Nagar",
      city: "Nagpur",
      state: "Maharashtra",
      pincode: "440022",
    },
    ifscCode: "BANK0NGP006",
    micrCode: "440002006",
    phone: "7122345006",
    email: "pratapnagar@nagpurbank.com",
    workingHours: {
      monday: { open: "10:00", close: "16:00" },
      tuesday: { open: "10:00", close: "16:00" },
      wednesday: { open: "10:00", close: "16:00" },
      thursday: { open: "10:00", close: "16:00" },
      friday: { open: "10:00", close: "16:00" },
      saturday: { open: "10:00", close: "13:00" },
      sunday: { open: "", close: "" },
    },
    isActive: true,
  },
  {
    branchCode: "NGP007",
    branchName: "Lakadganj Branch",
    address: {
      line1: "Cotton Market Road",
      line2: "Near Itwari Railway Station",
      city: "Nagpur",
      state: "Maharashtra",
      pincode: "440008",
    },
    ifscCode: "BANK0NGP007",
    micrCode: "440002007",
    phone: "7122345007",
    email: "lakadganj@nagpurbank.com",
    workingHours: {
      monday: { open: "10:00", close: "16:00" },
      tuesday: { open: "10:00", close: "16:00" },
      wednesday: { open: "10:00", close: "16:00" },
      thursday: { open: "10:00", close: "16:00" },
      friday: { open: "10:00", close: "16:00" },
      saturday: { open: "10:00", close: "13:00" },
      sunday: { open: "", close: "" },
    },
    isActive: true,
  },
  {
    branchCode: "NGP008",
    branchName: "MIDC Hingna Branch",
    address: {
      line1: "MIDC Hingna Industrial Area",
      line2: "Phase 2",
      city: "Nagpur",
      state: "Maharashtra",
      pincode: "440016",
    },
    ifscCode: "BANK0NGP008",
    micrCode: "440002008",
    phone: "7122345008",
    email: "hingna@nagpurbank.com",
    workingHours: {
      monday: { open: "10:00", close: "16:00" },
      tuesday: { open: "10:00", close: "16:00" },
      wednesday: { open: "10:00", close: "16:00" },
      thursday: { open: "10:00", close: "16:00" },
      friday: { open: "10:00", close: "16:00" },
      saturday: { open: "10:00", close: "13:00" },
      sunday: { open: "", close: "" },
    },
    isActive: true,
  },
  {
    branchCode: "NGP009",
    branchName: "Koradi Road Branch",
    address: {
      line1: "Koradi Road",
      line2: "Near MIHAN Junction",
      city: "Nagpur",
      state: "Maharashtra",
      pincode: "441111",
    },
    ifscCode: "BANK0NGP009",
    micrCode: "440002009",
    phone: "7122345009",
    email: "koradi@nagpurbank.com",
    workingHours: {
      monday: { open: "10:00", close: "16:00" },
      tuesday: { open: "10:00", close: "16:00" },
      wednesday: { open: "10:00", close: "16:00" },
      thursday: { open: "10:00", close: "16:00" },
      friday: { open: "10:00", close: "16:00" },
      saturday: { open: "10:00", close: "13:00" },
      sunday: { open: "", close: "" },
    },
    isActive: true,
  },
  {
    branchCode: "NGP010",
    branchName: "Trimurtee Nagar Branch",
    address: {
      line1: "Trimurtee Nagar",
      line2: "Near Nagpur University",
      city: "Nagpur",
      state: "Maharashtra",
      pincode: "440033",
    },
    ifscCode: "BANK0NGP010",
    micrCode: "440002010",
    phone: "7122345010",
    email: "trimurtee@nagpurbank.com",
    workingHours: {
      monday: { open: "10:00", close: "16:00" },
      tuesday: { open: "10:00", close: "16:00" },
      wednesday: { open: "10:00", close: "16:00" },
      thursday: { open: "10:00", close: "16:00" },
      friday: { open: "10:00", close: "16:00" },
      saturday: { open: "10:00", close: "13:00" },
      sunday: { open: "", close: "" },
    },
    isActive: true,
  },
];

// Function to generate customers
const generateCustomers = (userId, branches) => {
  const firstNames = [
    "Rajesh",
    "Priya",
    "Amit",
    "Sneha",
    "Vikram",
    "Anita",
    "Suresh",
    "Meera",
    "Anil",
    "Kavita",
  ];
  const lastNames = [
    "Sharma",
    "Patel",
    "Deshmukh",
    "Kulkarni",
    "Joshi",
    "Verma",
    "Gupta",
    "Singh",
    "Kumar",
    "Reddy",
  ];
  const localities = [
    "Sitabuldi",
    "Dharampeth",
    "Sadar",
    "Civil Lines",
    "Pratap Nagar",
    "Lakadganj",
    "Hingna",
    "Koradi",
    "Trimurtee Nagar",
    "Manish Nagar",
  ];
  const occupations = [
    "salaried",
    "self_employed",
    "business",
    "salaried",
    "business",
    "salaried",
    "self_employed",
    "business",
    "salaried",
    "retired",
  ];

  return Array.from({ length: 10 }, (_, i) => ({
    customerId: `CUST${String(i + 1).padStart(6, "0")}`,
    userId: userId,
    name: {
      firstName: firstNames[i],
      middleName: i % 2 === 0 ? "Kumar" : "Devi",
      lastName: lastNames[i],
    },
    email: `${firstNames[i].toLowerCase()}.${lastNames[
      i
    ].toLowerCase()}@example.com`,
    mobile: `+91-${9000000000 + i * 111111}`,
    dateOfBirth: new Date(1980 + i, i % 12, (i + 1) * 2),
    gender: i % 2 === 0 ? "male" : "female",
    maritalStatus: i % 3 === 0 ? "single" : "married",
    address: {
      line1: `${i + 1} ${localities[i]} Road`,
      line2: `Building ${String.fromCharCode(65 + i)}`,
      city: "Nagpur",
      state: "Maharashtra",
      pincode: `44001${i}`,
    },
    kyc: {
      panCard: {
        number: `ABCDE${1000 + i}${String.fromCharCode(65 + i)}`,
        verified: true,
        documentUrl: `https://docs.example.com/pan/${i + 1}.pdf`,
      },
      aadhaar: {
        number: `${200000000000 + i * 111111111}`,
        verified: true,
        documentUrl: `https://docs.example.com/aadhaar/${i + 1}.pdf`,
      },
      photo: `https://docs.example.com/photos/${i + 1}.jpg`,
      signature: `https://docs.example.com/signatures/${i + 1}.jpg`,
      verificationStatus: "verified",
    },
    homeBranch: branches[i % branches.length]._id,
    occupation: occupations[i],
    annualIncome: randomNumber(300000, 1500000),
    kycStatus: "verified",
    creditScore: 650 + i * 15,
    isActive: true,
    registrationDate: randomDate(new Date(2022, 0, 1), new Date(2024, 11, 31)),
  }));
};

// Function to generate accounts
const generateAccounts = (customers, branches, userId) => {
  const accountTypes = [
    "savings",
    "current",
    "savings",
    "current",
    "fixed_deposit",
    "savings",
    "current",
    "savings",
    "recurring_deposit",
    "savings",
  ];

  return customers.map((customer, i) => ({
    accountNumber: `${5000000000000000 + i * 1111}`,
    accountType: accountTypes[i],
    customerId: customer._id,
    branchId: branches[i % branches.length]._id,
    balance: randomNumber(10000, 500000),
    currency: "INR",
    ifscCode: branches[i % branches.length].ifscCode,
    status: "active",
    openingDate: randomDate(new Date(2023, 0, 1), new Date()),
    minimumBalance:
      accountTypes[i] === "savings"
        ? 5000
        : accountTypes[i] === "current"
        ? 10000
        : 0,
    interestRate:
      accountTypes[i] === "savings"
        ? 3.5
        : accountTypes[i] === "fixed_deposit"
        ? 6.5
        : 0,
    lastInterestCredited: accountTypes[i] === "savings" ? new Date() : null,
    nominee: {
      name: `${customer.name.firstName} Nominee`,
      relation: "spouse",
      dateOfBirth: new Date(1985 + i, i % 12, 15),
      aadhaar: `${300000000000 + i * 111111111}`,
      address: customer.address.line1,
    },
    openedBy: userId,
    upiId: i % 3 === 0 ? `${customer.email.split("@")[0]}@upi` : null,
    isUPIEnabled: i % 3 === 0,
  }));
};

// Function to generate transactions
const generateTransactions = (accounts, branches) => {
  const transactionTypes = [
    "deposit",
    "withdrawal",
    "transfer",
    "upi",
    "neft",
    "deposit",
    "withdrawal",
    "transfer",
    "imps",
    "rtgs",
  ];
  const transactions = [];

  accounts.forEach((account, i) => {
    const txnType = transactionTypes[i];
    const amount = randomNumber(1000, 50000);
    const charges =
      txnType === "neft"
        ? 5
        : txnType === "rtgs"
        ? 30
        : txnType === "imps"
        ? 10
        : 0;
    const gst = charges * 0.18;

    transactions.push({
      transactionId: `TXN${Date.now()}${String(i + 1).padStart(4, "0")}`,
      referenceNumber:
        txnType !== "deposit" && txnType !== "withdrawal"
          ? `REF${Date.now()}${i}`
          : undefined,
      type: txnType,
      fromAccount:
        txnType !== "deposit"
          ? {
              accountId: account._id,
              accountNumber: account.accountNumber,
              ifsc: account.ifscCode,
              holderName: `${accounts[i % accounts.length].customerId}`,
            }
          : undefined,
      toAccount: {
        accountId: account._id,
        accountNumber: account.accountNumber,
        ifsc: account.ifscCode,
        holderName: `${accounts[i % accounts.length].customerId}`,
      },
      amount: amount,
      currency: "INR",
      charges: charges,
      gst: gst,
      totalDebit: amount + charges + gst,
      description: `${txnType.toUpperCase()} transaction for account ${
        account.accountNumber
      }`,
      transactionDate: randomDate(new Date(2024, 0, 1), new Date()),
      status: "success",
      branchId: branches[i % branches.length]._id,
    });
  });

  return transactions;
};

// Function to generate loans
const generateLoans = (customers, accounts, branches) => {
  const loanTypes = [
    "personal",
    "home",
    "car",
    "education",
    "business",
    "personal",
    "home",
    "car",
    "gold",
    "personal",
  ];

  return customers.map((customer, i) => {
    const principalAmount = randomNumber(100000, 5000000);
    const interestRate = 8.5 + i * 0.5;
    const tenure = randomNumber(12, 240); // months
    const emi = Math.round(
      (((principalAmount * interestRate) / 100 / 12) *
        Math.pow(1 + interestRate / 100 / 12, tenure)) /
        (Math.pow(1 + interestRate / 100 / 12, tenure) - 1)
    );

    return {
      loanNumber: `LOAN${Date.now()}${String(i + 1).padStart(4, "0")}`,
      customerId: customer._id,
      accountId: accounts[i]._id,
      branchId: branches[i % branches.length]._id,
      loanType: loanTypes[i],
      principalAmount: principalAmount,
      sanctionedAmount: principalAmount,
      interestRate: interestRate,
      tenure: tenure,
      emi: emi,
      processingFee: Math.round(principalAmount * 0.01),
      startDate: randomDate(new Date(2023, 0, 1), new Date()),
      status: i % 3 === 0 ? "active" : i % 3 === 1 ? "approved" : "disbursed",
      applicationDate: randomDate(new Date(2022, 6, 1), new Date(2023, 11, 31)),
      approvalDate: randomDate(new Date(2023, 0, 1), new Date()),
      disbursementDate:
        i % 3 !== 1 ? randomDate(new Date(2023, 0, 1), new Date()) : null,
      disbursedAmount: i % 3 !== 1 ? principalAmount : 0,
      outstandingAmount:
        i % 3 !== 1
          ? principalAmount - randomNumber(10000, 100000)
          : principalAmount,
      paidAmount: i % 3 !== 1 ? randomNumber(10000, 100000) : 0,
      overdueAmount: i % 5 === 0 ? randomNumber(0, 10000) : 0,
      nextEmiDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      purpose: `${loanTypes[i]} loan for ${customer.name.firstName}`,
      employmentType: i % 2 === 0 ? "salaried" : "self_employed",
      annualIncome: randomNumber(300000, 1500000),
      collateral:
        loanTypes[i] === "home" ||
        loanTypes[i] === "car" ||
        loanTypes[i] === "gold"
          ? {
              type:
                loanTypes[i] === "gold"
                  ? "gold"
                  : loanTypes[i] === "car"
                  ? "vehicle"
                  : "property",
              description: `${loanTypes[i]} collateral`,
              estimatedValue: principalAmount * 1.5,
              documentUrl: `https://docs.example.com/collateral/${i + 1}.pdf`,
            }
          : undefined,
    };
  });
};

// Function to generate cards
const generateCards = (customers, accounts, branches, userId) => {
  const cardTypes = [
    "debit",
    "credit",
    "debit",
    "credit",
    "debit",
    "debit",
    "credit",
    "debit",
    "credit",
    "debit",
  ];
  const variants = [
    "classic",
    "silver",
    "gold",
    "platinum",
    "classic",
    "silver",
    "gold",
    "platinum",
    "titanium",
    "silver",
  ];

  return customers.map((customer, i) => {
    const isCredit = cardTypes[i] === "credit";
    const creditLimit = isCredit ? randomNumber(50000, 500000) : 0;
    const usedCredit = isCredit ? randomNumber(0, creditLimit * 0.5) : 0;

    return {
      cardNumber: `${4000 + i}${String(Date.now()).slice(-12)}`,
      cardType: cardTypes[i],
      accountId: accounts[i]._id,
      customerId: customer._id,
      branchId: branches[i % branches.length]._id,
      cardHolderName:
        `${customer.name.firstName} ${customer.name.lastName}`.toUpperCase(),
      cvv: String(randomNumber(100, 999)),
      pin: String(randomNumber(1000, 9999)),
      expiryDate: new Date(
        new Date().setFullYear(new Date().getFullYear() + 5)
      ),
      issueDate: randomDate(new Date(2022, 0, 1), new Date()),
      status: "active",
      variant: variants[i],
      dailyWithdrawalLimit: isCredit ? 0 : 50000,
      dailyPurchaseLimit: isCredit ? creditLimit : 200000,
      internationalTransactionsEnabled: i % 2 === 0,
      onlineTransactionsEnabled: true,
      contactlessEnabled: true,
      creditLimit: creditLimit,
      availableCredit: creditLimit - usedCredit,
      usedCredit: usedCredit,
      billingCycle: isCredit
        ? {
            startDate: 1,
            endDate: 30,
            dueDate: 5,
          }
        : undefined,
      minAmountDue: isCredit ? Math.round(usedCredit * 0.05) : undefined,
      totalAmountDue: isCredit ? usedCredit : undefined,
      rewardPoints: i % 3 === 0 ? randomNumber(100, 5000) : 0,
      annualFee: isCredit
        ? variants[i] === "platinum" || variants[i] === "titanium"
          ? 5000
          : variants[i] === "gold"
          ? 3000
          : 1000
        : 0,
      issuedBy: userId,
    };
  });
};

// Main seeding function
const seedNagpurBankingData = async () => {
  try {
    await connectDB();

    console.log("\n🌱 Starting Nagpur Banking Data Seeder...\n");

    // Get a user to associate with customers
    console.log("🔍 Finding user for customer association...");
    const user = await User.findOne({ email: "elixir.iotproducts@gmail.com" });
    if (!user) {
      console.error("❌ User not found. Please ensure user exists.");
      process.exit(1);
    }
    console.log(`✅ Found user: ${user.name}\n`);

    // Clear existing Nagpur data
    console.log("🗑️  Clearing existing Nagpur data...");
    await Branch.deleteMany({ branchCode: /^NGP/ });
    await Customer.deleteMany({ customerId: /^CUST/ });
    await Account.deleteMany({ accountNumber: /^5000/ });
    await Transaction.deleteMany({ transactionId: /^TXN/ });
    await Loan.deleteMany({ loanNumber: /^LOAN/ });
    await Card.deleteMany({ cardNumber: /^40/ });
    console.log("✅ Cleared existing data\n");

    // Seed Branches
    console.log("🏢 Creating branches...");
    const branches = await Branch.insertMany(nagpurBranches);
    console.log(`✅ Created ${branches.length} branches\n`);

    // Seed Customers
    console.log("👥 Creating customers...");
    const customerData = generateCustomers(user._id, branches);
    const customers = await Customer.insertMany(customerData);
    console.log(`✅ Created ${customers.length} customers\n`);

    // Seed Accounts
    console.log("💳 Creating accounts...");
    const accountData = generateAccounts(customers, branches, user._id);
    const accounts = await Account.insertMany(accountData);
    console.log(`✅ Created ${accounts.length} accounts\n`);

    // Seed Transactions
    console.log("💸 Creating transactions...");
    const transactionData = generateTransactions(accounts, branches);
    const transactions = await Transaction.insertMany(transactionData);
    console.log(`✅ Created ${transactions.length} transactions\n`);

    // Seed Loans
    console.log("🏦 Creating loans...");
    const loanData = generateLoans(customers, accounts, branches);
    const loans = await Loan.insertMany(loanData);
    console.log(`✅ Created ${loans.length} loans\n`);

    // Seed Cards
    console.log("💳 Creating cards...");
    const cardData = generateCards(customers, accounts, branches, user._id);
    const cards = await Card.insertMany(cardData);
    console.log(`✅ Created ${cards.length} cards\n`);

    // Summary
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 NAGPUR BANKING DATA SEEDING SUMMARY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ Branches:      ${branches.length}`);
    console.log(`✅ Customers:     ${customers.length}`);
    console.log(`✅ Accounts:      ${accounts.length}`);
    console.log(`✅ Transactions:  ${transactions.length}`);
    console.log(`✅ Loans:         ${loans.length}`);
    console.log(`✅ Cards:         ${cards.length}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("🎉 Nagpur banking data seeding completed successfully!\n");
    console.log("🚀 You can now test the banking system with this data.\n");
    console.log("📍 Region: Nagpur, Maharashtra");
    console.log("🏢 Branches: From Sitabuldi to Trimurtee Nagar");
    console.log("👥 Customers: 10 verified customers with KYC");
    console.log(
      "💰 Total Deposits: ₹" +
        accounts
          .reduce((sum, acc) => sum + acc.balance, 0)
          .toLocaleString("en-IN")
    );
    console.log(
      "🏦 Total Loans: ₹" +
        loans
          .reduce((sum, loan) => sum + loan.outstandingAmount, 0)
          .toLocaleString("en-IN")
    );
    console.log("\n✨ Happy Testing! ✨\n");

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding Nagpur banking data:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seeder
seedNagpurBankingData();
