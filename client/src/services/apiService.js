/**
 * Centralized API Service
 * All API calls should use axiosInstance which handles:
 * - Automatic token attachment
 * - Token refresh on 401 errors
 * - Request/response interceptors
 */

import axiosInstance from '../utils/axiosInstance';

// Auth APIs
export const authAPI = {
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  register: (userData) => axiosInstance.post('/auth/register', userData),
  logout: () => axiosInstance.post('/auth/logout'),
  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: (data) => axiosInstance.post('/auth/reset-password', data)
  // Note: refresh token is handled automatically by interceptor
};

// User APIs
export const userAPI = {
  getProfile: () => axiosInstance.get('/user/profile'),
  getAllUsers: () => axiosInstance.get('/user/getAllUsers'),
  getUserById: (userId) => axiosInstance.get(`/user/getUserById/${userId}`),
  updateUser: (userId, userData) => axiosInstance.put(`/user/updateUser/${userId}`, userData),
  updateUserPicture: (userId, formData) =>
    axiosInstance.put(`/user/updateUserPicture/${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteUser: (userId) => axiosInstance.delete(`/user/deleteUser/${userId}`),
  activateUser: (userId) => axiosInstance.put(`/user/activateUser/${userId}`),
  deactivateUser: (userId) => axiosInstance.put(`/user/deactivateUser/${userId}`),

  // Manager APIs
  managerGetUsers: () => axiosInstance.get('/user/manager/getUsers'),
  managerGetUserById: (userId) => axiosInstance.get(`/user/manager/getUserById/${userId}`),
  managerUpdateUser: (userId, userData) => axiosInstance.put(`/user/manager/updateUser/${userId}`, userData),
  managerActivateUser: (userId) => axiosInstance.put(`/user/manager/activateUser/${userId}`),
  managerDeactivateUser: (userId) => axiosInstance.put(`/user/manager/deactivateUser/${userId}`)
};

// RBAC APIs
export const rbacAPI = {
  // Roles
  getAllRoles: () => axiosInstance.get('/policy/roles'),
  getRoleById: (roleId) => axiosInstance.get(`/policy/roles/${roleId}`),
  createRole: (roleData) => axiosInstance.post('/policy/roles', roleData),
  updateRole: (roleId, roleData) => axiosInstance.put(`/policy/roles/${roleId}`, roleData),
  deleteRole: (roleId) => axiosInstance.delete(`/policy/roles/${roleId}`),
  assignPermissions: (roleId, permissionIds) => axiosInstance.post(`/policy/roles/${roleId}/permissions`, { permissionIds }),

  // Permissions
  getAllPermissions: () => axiosInstance.get('/policy/permissions'),
  createPermission: (permissionData) => axiosInstance.post('/policy/permissions', permissionData),
  updatePermission: (permissionId, permissionData) => axiosInstance.put(`/policy/permissions/${permissionId}`, permissionData),
  deletePermission: (permissionId) => axiosInstance.delete(`/policy/permissions/${permissionId}`),

  // User permissions
  checkPermission: (resource, action) => axiosInstance.post('/policy/check-permission', { resource, action }),
  getUserPermissions: () => axiosInstance.get('/policy/my-permissions'),

  // System
  initializeRBAC: () => axiosInstance.post('/policy/initialize', {})
};

// Default export for backward compatibility
export default axiosInstance;
