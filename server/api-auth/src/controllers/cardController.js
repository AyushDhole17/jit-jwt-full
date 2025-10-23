const cardService = require("../services/cardService");

exports.getAllCards = async (req, res, next) => {
  try {
    const cards = await cardService.getAllCards(req.query);
    res.status(200).json({ success: true, data: cards });
  } catch (error) {
    next(error);
  }
};

exports.issueCard = async (req, res, next) => {
  try {
    const card = await cardService.issueCard(req.body, req.user._id);
    res.status(201).json({ success: true, data: card, message: "Card issued successfully" });
  } catch (error) {
    next(error);
  }
};

exports.activateCard = async (req, res, next) => {
  try {
    const card = await cardService.updateStatus(req.params.id, 'active', null, req.user._id);
    res.status(200).json({ success: true, data: card, message: "Card activated" });
  } catch (error) {
    next(error);
  }
};

exports.blockCard = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const card = await cardService.updateStatus(req.params.id, 'blocked', reason, req.user._id);
    res.status(200).json({ success: true, data: card, message: "Card blocked" });
  } catch (error) {
    next(error);
  }
};

exports.unblockCard = async (req, res, next) => {
  try {
    const card = await cardService.updateStatus(req.params.id, 'unblock', null, req.user._id);
    res.status(200).json({ success: true, data: card, message: "Card unblocked" });
  } catch (error) {
    next(error);
  }
};
