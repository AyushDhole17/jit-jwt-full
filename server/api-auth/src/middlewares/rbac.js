const rbacService = require("../services/rbacService");

/**
 * Middleware to check if user has required permission
 * @param {String} resource - Resource name
 * @param {String} action - Action type
 */
const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const hasPermission = await rbacService.checkPermission(
        req.user._id,
        resource,
        action
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to perform this action",
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error checking permissions",
      });
    }
  };
};

/**
 * Legacy middleware - authorize by role names
 * @param {Array} allowedRoles - Array of allowed role names
 */
const authorizeRoles = (allowedRoles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  next();
};

module.exports = {
  checkPermission,
  authorizeRoles,
};
