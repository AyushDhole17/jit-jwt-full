const customerService = require("../services/customerService");

exports.getAllCustomers = async (req, res, next) => {
  try {
    const customers = await customerService.getAllCustomers(req.query);
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};

exports.getCustomerById = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body, req.user._id);
    res.status(201).json({ success: true, data: customer, message: "Customer created successfully" });
  } catch (error) {
    next(error);
  }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    res.status(200).json({ success: true, data: customer, message: "Customer updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.verifyKYC = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const customer = await customerService.verifyKYC(
      req.params.id,
      req.user._id,
      status,
      rejectionReason
    );
    res.status(200).json({ success: true, data: customer, message: `KYC ${status} successfully` });
  } catch (error) {
    next(error);
  }
};

exports.uploadKYCDocument = async (req, res, next) => {
  try {
    const { docType, docUrl } = req.body;
    const customer = await customerService.uploadKYCDocument(req.params.id, docType, docUrl);
    res.status(200).json({ success: true, data: customer, message: "Document uploaded successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getCustomerAccounts = async (req, res, next) => {
  try {
    const accounts = await customerService.getCustomerAccounts(req.params.id);
    res.status(200).json({ success: true, data: accounts });
  } catch (error) {
    next(error);
  }
};

exports.searchCustomers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const customers = await customerService.searchCustomers(q);
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};
