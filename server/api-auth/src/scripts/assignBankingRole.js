require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const { Role } = require("../models/policy");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const assignBankingRole = async () => {
  try {
    await connectDB();

    const userEmail = "elixir.iotproducts@gmail.com";

    console.log(`\n🔍 Looking for user: ${userEmail}\n`);

    // Find the user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log(`❌ User not found: ${userEmail}`);
      process.exit(1);
    }

    console.log(`✅ User found: ${user.name} (${user.email})`);
    console.log(`   Current role: ${user.role}`);
    console.log(`   Current roleRef: ${user.roleRef || "None"}\n`);

    // Find bank_admin role
    const bankAdminRole = await Role.findOne({ name: "bank_admin" });
    if (!bankAdminRole) {
      console.log(
        "❌ bank_admin role not found. Please run seedBankingRBAC.js first"
      );
      process.exit(1);
    }

    console.log(
      `✅ Found bank_admin role with ${bankAdminRole.permissions.length} permissions\n`
    );

    // Update user with bank_admin role
    user.roleRef = bankAdminRole._id;

    // Also update the role field to admin if not already
    if (user.role !== "admin" && user.role !== "super_admin") {
      user.role = "admin";
    }

    await user.save();

    console.log(`✅ Successfully assigned bank_admin role to ${user.email}`);
    console.log(`   Updated role: ${user.role}`);
    console.log(`   Updated roleRef: ${user.roleRef}`);
    console.log(`\n🎉 User can now access all banking features!\n`);

    // Verify permissions
    const updatedUser = await User.findById(user._id).populate({
      path: "roleRef",
      populate: {
        path: "permissions",
      },
    });

    if (updatedUser.roleRef && updatedUser.roleRef.permissions) {
      console.log(
        `📋 User now has ${updatedUser.roleRef.permissions.length} permissions:`
      );
      const permissionNames = updatedUser.roleRef.permissions
        .map((p) => p.name)
        .join(", ");
      console.log(`   ${permissionNames}\n`);
    }

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error assigning role:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

assignBankingRole();
