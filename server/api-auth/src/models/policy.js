const mongoose = require("mongoose");

// Permission Model - Represents individual permissions
const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    resource: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["create", "read", "update", "delete", "manage", "view", "execute"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for resource and action
permissionSchema.index({ resource: 1, action: 1 }, { unique: true });

// Role Model - Represents roles with associated permissions
const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
    isSystem: {
      type: Boolean,
      default: false, // System roles cannot be deleted
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0, // Higher priority roles have more access
    },
  },
  {
    timestamps: true,
  }
);

// RolePermission Model - Maps roles to permissions with conditions
const rolePermissionSchema = new mongoose.Schema(
  {
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    permission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Permission",
      required: true,
    },
    conditions: {
      type: mongoose.Schema.Types.Mixed, // For conditional access rules
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for role and permission
rolePermissionSchema.index({ role: 1, permission: 1 }, { unique: true });

const Permission = mongoose.model("Permission", permissionSchema);
const Role = mongoose.model("Role", roleSchema);
const RolePermission = mongoose.model("RolePermission", rolePermissionSchema);

module.exports = {
  Permission,
  Role,
  RolePermission,
};
