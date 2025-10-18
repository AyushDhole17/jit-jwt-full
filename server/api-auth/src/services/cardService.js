const Card = require("../models/Card");
const Account = require("../models/Account");
const Customer = require("../models/Customer");
const { generateCardNumber, generateCVV } = require("../utils/bankingUtils");

class CardService {
  async getAllCards(filters = {}) {
    const query = {};
    if (filters.customerId) query.customerId = filters.customerId;
    if (filters.accountId) query.accountId = filters.accountId;
    if (filters.status) query.status = filters.status;

    return await Card.find(query)
      .populate("customerId", "name email")
      .populate("accountId", "accountNumber accountType")
      .populate("branchId", "branchName");
  }

  async issueCard(data, issuedBy) {
    const { accountId, customerId, branchId, cardType, creditLimit = 0, deliveryAddress } = data;
    const account = await Account.findById(accountId);
    if (!account) throw new Error("Account not found");
    const customer = await Customer.findById(customerId);
    if (!customer) throw new Error("Customer not found");

    const cardNumber = generateCardNumber();
    const cvv = generateCVV();

    const card = new Card({
      accountId,
      customerId,
      branchId: branchId || account.branchId,
      cardType,
      cardHolderName: `${customer.name.firstName} ${customer.name.lastName}`.toUpperCase(),
      cardNumber,
      cvv,
      status: "issued",
      creditLimit: cardType === "credit" ? creditLimit : 0,
      availableCredit: cardType === "credit" ? creditLimit : 0,
      deliveryAddress,
      issuedBy,
    });

    await card.save();
    return card;
  }

  async updateStatus(cardId, status, reason, userId) {
    const card = await Card.findById(cardId);
    if (!card) throw new Error("Card not found");

    switch (status) {
      case "active":
        card.isActivated = true;
        card.activatedDate = new Date();
        card.activatedBy = userId;
        card.status = "active";
        break;
      case "blocked":
        card.status = "blocked";
        card.blockedDate = new Date();
        card.blockedBy = userId;
        card.blockReason = reason || "User initiated";
        break;
      case "unblock":
        card.status = "active";
        card.blockReason = undefined;
        card.blockedDate = undefined;
        break;
      default:
        throw new Error("Invalid status");
    }

    await card.save();
    return card;
  }
}

module.exports = new CardService();
