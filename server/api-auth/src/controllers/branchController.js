const branchService = require("../services/branchService");

exports.getAllBranches = async (req, res, next) => {
  try {
    const branches = await branchService.getAllBranches(req.query);
    res.status(200).json({ success: true, data: branches });
  } catch (error) {
    next(error);
  }
};

exports.getBranchById = async (req, res, next) => {
  try {
    const branch = await branchService.getBranchById(req.params.id);
    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
};

exports.createBranch = async (req, res, next) => {
  try {
    const branch = await branchService.createBranch(req.body, req.user._id);
    res.status(201).json({ success: true, data: branch, message: "Branch created successfully" });
  } catch (error) {
    next(error);
  }
};

exports.updateBranch = async (req, res, next) => {
  try {
    const branch = await branchService.updateBranch(req.params.id, req.body);
    res.status(200).json({ success: true, data: branch, message: "Branch updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.deleteBranch = async (req, res, next) => {
  try {
    const branch = await branchService.deleteBranch(req.params.id);
    res.status(200).json({ success: true, data: branch, message: "Branch deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.assignManager = async (req, res, next) => {
  try {
    const { managerId } = req.body;
    const branch = await branchService.assignManager(req.params.id, managerId);
    res.status(200).json({ success: true, data: branch, message: "Manager assigned successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getBranchStats = async (req, res, next) => {
  try {
    const stats = await branchService.getBranchStats(req.params.id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
