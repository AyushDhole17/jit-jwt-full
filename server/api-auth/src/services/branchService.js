const Branch = require("../models/Branch");
const {
  generateIFSCCode,
  generateMICRCode,
} = require("../utils/bankingUtils");

class BranchService {
  /**
   * Get all branches
   */
  async getAllBranches(filters = {}) {
    try {
      const query = {};
      
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }
      
      if (filters.city) {
        query["address.city"] = new RegExp(filters.city, "i");
      }
      
      if (filters.state) {
        query["address.state"] = new RegExp(filters.state, "i");
      }

      const branches = await Branch.find(query)
        .populate("manager", "name email mobile")
        .populate("employees", "name email role")
        .sort({ createdAt: -1 });

      return branches;
    } catch (error) {
      throw new Error(`Error fetching branches: ${error.message}`);
    }
  }

  /**
   * Get branch by ID
   */
  async getBranchById(branchId) {
    try {
      const branch = await Branch.findById(branchId)
        .populate("manager", "name email mobile image")
        .populate("employees", "name email role image");

      if (!branch) {
        throw new Error("Branch not found");
      }

      return branch;
    } catch (error) {
      throw new Error(`Error fetching branch: ${error.message}`);
    }
  }

  /**
   * Get branch by code
   */
  async getBranchByCode(branchCode) {
    try {
      const branch = await Branch.findOne({ branchCode })
        .populate("manager", "name email mobile")
        .populate("employees", "name email role");

      if (!branch) {
        throw new Error("Branch not found");
      }

      return branch;
    } catch (error) {
      throw new Error(`Error fetching branch: ${error.message}`);
    }
  }

  /**
   * Create new branch
   */
  async createBranch(branchData, createdBy) {
    try {
      // Check if branch code already exists
      const existingBranch = await Branch.findOne({
        branchCode: branchData.branchCode,
      });

      if (existingBranch) {
        throw new Error("Branch code already exists");
      }

      // Check if IFSC code already exists
      const existingIFSC = await Branch.findOne({
        ifscCode: branchData.ifscCode,
      });

      if (existingIFSC) {
        throw new Error("IFSC code already exists");
      }

      const branch = new Branch(branchData);
      await branch.save();

      return branch;
    } catch (error) {
      throw new Error(`Error creating branch: ${error.message}`);
    }
  }

  /**
   * Update branch
   */
  async updateBranch(branchId, updateData) {
    try {
      const branch = await Branch.findByIdAndUpdate(
        branchId,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate("manager", "name email mobile")
        .populate("employees", "name email role");

      if (!branch) {
        throw new Error("Branch not found");
      }

      return branch;
    } catch (error) {
      throw new Error(`Error updating branch: ${error.message}`);
    }
  }

  /**
   * Delete branch
   */
  async deleteBranch(branchId) {
    try {
      const branch = await Branch.findById(branchId);

      if (!branch) {
        throw new Error("Branch not found");
      }

      // Soft delete - mark as inactive
      branch.isActive = false;
      await branch.save();

      return branch;
    } catch (error) {
      throw new Error(`Error deleting branch: ${error.message}`);
    }
  }

  /**
   * Assign manager to branch
   */
  async assignManager(branchId, managerId) {
    try {
      const branch = await Branch.findByIdAndUpdate(
        branchId,
        { manager: managerId },
        { new: true }
      ).populate("manager", "name email mobile");

      if (!branch) {
        throw new Error("Branch not found");
      }

      return branch;
    } catch (error) {
      throw new Error(`Error assigning manager: ${error.message}`);
    }
  }

  /**
   * Add employee to branch
   */
  async addEmployee(branchId, employeeId) {
    try {
      const branch = await Branch.findById(branchId);

      if (!branch) {
        throw new Error("Branch not found");
      }

      if (!branch.employees.includes(employeeId)) {
        branch.employees.push(employeeId);
        await branch.save();
      }

      return branch;
    } catch (error) {
      throw new Error(`Error adding employee: ${error.message}`);
    }
  }

  /**
   * Remove employee from branch
   */
  async removeEmployee(branchId, employeeId) {
    try {
      const branch = await Branch.findById(branchId);

      if (!branch) {
        throw new Error("Branch not found");
      }

      branch.employees = branch.employees.filter(
        (emp) => emp.toString() !== employeeId.toString()
      );
      await branch.save();

      return branch;
    } catch (error) {
      throw new Error(`Error removing employee: ${error.message}`);
    }
  }

  /**
   * Get branch statistics
   */
  async getBranchStats(branchId) {
    try {
      const Account = require("../models/Account");
      const Customer = require("../models/Customer");
      const Transaction = require("../models/Transaction");

      const branch = await Branch.findById(branchId);
      if (!branch) {
        throw new Error("Branch not found");
      }

      const [accounts, customers, transactions] = await Promise.all([
        Account.countDocuments({ branchId, status: "active" }),
        Customer.countDocuments({ homeBranch: branchId, isActive: true }),
        Transaction.countDocuments({
          branchId,
          status: "success",
          transactionDate: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        }),
      ]);

      // Calculate total deposits
      const accountsData = await Account.find({ branchId, status: "active" });
      const totalDeposits = accountsData.reduce(
        (sum, acc) => sum + acc.balance,
        0
      );

      return {
        totalAccounts: accounts,
        totalCustomers: customers,
        totalTransactions: transactions,
        totalDeposits,
        totalEmployees: branch.employees.length,
      };
    } catch (error) {
      throw new Error(`Error fetching branch stats: ${error.message}`);
    }
  }
}

module.exports = new BranchService();
