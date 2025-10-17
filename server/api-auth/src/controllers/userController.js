const User = require("../models/User");
const Company = require("../models/Company");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id, "-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password")
      .populate("roleRef", "name displayName description priority permissions")
      .populate("company", "name"); // Populate roleRef with role details
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, mobile, company, roleId, role } = req.body;

    // Check if the user is an admin
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Only admins can create users." });
    }

    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate mobile number if provided
    if (mobile) {
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(mobile)) {
        return res
          .status(400)
          .json({ message: "Invalid mobile number. Must be 10 digits" });
      }
    }

    // Validate password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Check if mobile number already exists
    if (mobile) {
      const existingMobile = await User.findOne({ mobile });
      if (existingMobile) {
        return res
          .status(400)
          .json({ message: "User with this mobile number already exists" });
      }
    }

    // If roleId is provided, fetch the role to get the role name
    let roleName = role || "operator"; // Default role
    if (roleId) {
      const { Role } = require("../models/policy");
      const roleDoc = await Role.findById(roleId);
      if (roleDoc) {
        roleName = roleDoc.name;
      }
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      mobile,
      company,
      role: roleName,
      roleRef: roleId || null,
      isActive: true,
    });

    await newUser.save();

    // Return user without password
    const userResponse = await User.findById(newUser._id, "-password")
      .populate("roleRef", "name displayName description priority permissions")
      .populate("company", "name");

    res.status(201).json({
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role, company } = req.body;
    const image = req.file ? req.file.filename : null;

    // Check if the user is an admin or the user themselves
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Prevent non-admin users from changing roles
    if (req.user.role !== "admin" && role) {
      return res.status(403).json({ message: "Only admins can change roles" });
    }

    // Validate role if provided
    const validRoles = ["admin", "manager", "supervisor", "analyst"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid user role" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, role, image, company },
      { new: true, runValidators: true }
    ).select("-password"); // Exclude the password field

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId, "-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.activateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User activated successfully", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User deactivated successfully", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.managerGetUsers = async (req, res) => {
  try {
    const users = await User.find(
      { role: { $in: ["supervisor", "analyst"] } },
      "-password"
    );
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.managerGetUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne(
      { _id: userId, role: { $in: ["supervisor", "analyst"] } },
      "-password"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.managerUpdateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email } = req.body;
    const image = req.file ? req.file.filename : null;

    // Check if the user is a manager and not updating self or admin
    if (
      req.user.role !== "manager" ||
      req.user.id === userId ||
      req.user.role === "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, image },
      { new: true, runValidators: true }
    ).select("-password"); // Exclude the password field

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.managerActivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user is a manager and not updating self or admin
    if (
      req.user.role !== "manager" ||
      req.user.id === userId ||
      req.user.role === "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User activated successfully", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.managerDeactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user is a manager and not updating self or admin
    if (
      req.user.role !== "manager" ||
      req.user.id === userId ||
      req.user.role === "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User deactivated successfully", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.updateUserPicture = async (req, res) => {
  try {
    const { userId } = req.params;
    const image = req.file ? req.file.filename : null;

    // Check if the user is an admin or the user themselves
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image },
      { new: true, runValidators: true }
    ).select("-password"); // Exclude the password field

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User picture updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Assign RBAC role to user
exports.assignRoleToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;

    // Check if the user is an admin
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin privileges required." });
    }

    if (!roleId) {
      return res.status(400).json({ message: "Role ID is required" });
    }

    // Verify role exists
    const Role = require("../models/policy").Role;
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Update user's roleRef
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { roleRef: roleId },
      { new: true, runValidators: true }
    )
      .select("-password")
      .populate("roleRef", "name displayName description priority permissions");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Role assigned successfully",
      user: updatedUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
