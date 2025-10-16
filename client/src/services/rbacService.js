import axiosInstance from '../utils/axiosInstance';

const rbacService = {
  // Role APIs
  getAllRoles: async () => {
    try {
      const response = await axiosInstance.get('/policy/roles');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getRoleById: async (roleId) => {
    try {
      const response = await axiosInstance.get(`/policy/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createRole: async (roleData) => {
    try {
      const response = await axiosInstance.post('/policy/roles', roleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateRole: async (roleId, roleData) => {
    try {
      const response = await axiosInstance.put(`/policy/roles/${roleId}`, roleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteRole: async (roleId) => {
    try {
      const response = await axiosInstance.delete(`/policy/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  assignPermissions: async (roleId, permissionIds) => {
    try {
      const response = await axiosInstance.post(`/policy/roles/${roleId}/permissions`, { permissionIds });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Permission APIs
  getAllPermissions: async () => {
    try {
      const response = await axiosInstance.get('/policy/permissions');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createPermission: async (permissionData) => {
    try {
      const response = await axiosInstance.post('/policy/permissions', permissionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updatePermission: async (permissionId, permissionData) => {
    try {
      const response = await axiosInstance.put(`/policy/permissions/${permissionId}`, permissionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deletePermission: async (permissionId) => {
    try {
      const response = await axiosInstance.delete(`/policy/permissions/${permissionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // User permission check
  checkPermission: async (resource, action) => {
    try {
      const response = await axiosInstance.post('/policy/check-permission', { resource, action });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getUserPermissions: async () => {
    try {
      const response = await axiosInstance.get('/policy/my-permissions');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Initialize RBAC
  initializeRBAC: async () => {
    try {
      const response = await axiosInstance.post('/policy/initialize', {});
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default rbacService;
