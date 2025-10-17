import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Avatar,
  Alert,
  Skeleton,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  PersonOff as PersonOffIcon,
  Shield as ShieldIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Project imports
import MainCard from 'ui-component/cards/MainCard';
import { userAPI, rbacAPI } from 'services/apiService';

// ==============================|| USERS MANAGEMENT ||============================== //

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialogs
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobile: ''
  });
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    company: '',
    roleId: ''
  });
  const [selectedRoleId, setSelectedRoleId] = useState('');

  // Load data
  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  // Filter users
  useEffect(() => {
    let filtered = [...users];

    // Search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.mobile?.includes(query) ||
          user.role?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((user) => (statusFilter === 'active' ? user.isActive : !user.isActive));
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter || user.roleRef?.name === roleFilter);
    }

    setFilteredUsers(filtered);
    setPage(0); // Reset to first page when filters change
  }, [searchQuery, statusFilter, roleFilter, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      const usersData = Array.isArray(response.data) ? response.data : response.data?.users || [];
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      toast.error(error.message || 'Failed to load users');
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await rbacAPI.getAllRoles();
      setRoles(response.data?.data || []);
    } catch (error) {
      console.error('Failed to load roles:', error);
      setRoles([]);
    }
  };

  // Edit user handlers
  const handleOpenEditDialog = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || ''
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedUser(null);
    setEditForm({ name: '', email: '', mobile: '' });
  };

  const handleSaveEdit = async () => {
    try {
      if (!editForm.name || !editForm.email) {
        toast.error('Name and email are required');
        return;
      }

      await userAPI.updateUser(selectedUser._id, editForm);
      toast.success('User updated successfully');
      handleCloseEditDialog();
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update user');
    }
  };

  // Role assignment handlers
  const handleOpenRoleDialog = (user) => {
    setSelectedUser(user);
    setSelectedRoleId(user.roleRef?._id || '');
    setOpenRoleDialog(true);
  };

  const handleCloseRoleDialog = () => {
    setOpenRoleDialog(false);
    setSelectedUser(null);
    setSelectedRoleId('');
  };

  const handleAssignRole = async () => {
    try {
      if (!selectedRoleId) {
        toast.error('Please select a role');
        return;
      }

      await userAPI.assignRole(selectedUser._id, selectedRoleId);
      toast.success('Role assigned successfully');
      handleCloseRoleDialog();
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to assign role');
    }
  };

  // Activate/Deactivate handlers
  const handleToggleStatus = async (user) => {
    try {
      if (user.isActive) {
        await userAPI.deactivateUser(user._id);
        toast.success('User deactivated successfully');
      } else {
        await userAPI.activateUser(user._id);
        toast.success('User activated successfully');
      }
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update user status');
    }
  };

  // Delete handler
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) return;

    try {
      await userAPI.deleteUser(user._id);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete user');
    }
  };

  // Add user handlers
  const handleOpenAddDialog = () => {
    setAddForm({
      name: '',
      email: '',
      password: '',
      mobile: '',
      company: '',
      roleId: ''
    });
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleAddUser = async () => {
    if (!addForm.name || !addForm.email || !addForm.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addForm.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate mobile number if provided
    if (addForm.mobile) {
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(addForm.mobile)) {
        toast.error('Mobile number must be exactly 10 digits');
        return;
      }
    }

    // Validate password length
    if (addForm.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      await userAPI.createUser(addForm);
      toast.success('User created successfully');
      handleCloseAddDialog();
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to create user');
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get user stats
  const getUserStats = () => {
    return {
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      inactive: users.filter((u) => !u.isActive).length,
      admins: users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length
    };
  };

  const stats = getUserStats();

  // Get role display
  const getRoleDisplay = (user) => {
    if (user.roleRef) {
      return {
        name: user.roleRef.displayName || user.roleRef.name,
        color: 'primary'
      };
    }
    const roleMap = {
      super_admin: { name: 'Super Admin', color: 'error' },
      admin: { name: 'Admin', color: 'warning' },
      manager: { name: 'Manager', color: 'info' },
      supervisor: { name: 'Supervisor', color: 'success' },
      operator: { name: 'Operator', color: 'default' }
    };
    return roleMap[user.role] || { name: user.role, color: 'default' };
  };

  // Get status color
  const getStatusColor = (isActive) => (isActive ? 'success' : 'error');

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <MainCard
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon />
            <Typography variant="h3">Users Management</Typography>
          </Box>
        }
        secondary={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={loadUsers} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddDialog} size="small">
              Add User
            </Button>
          </Stack>
        }
      >
        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h3">{stats.total}</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.dark' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Active Users</Typography>
              <Typography variant="h3">{stats.active}</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.light', color: 'error.dark' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Inactive Users</Typography>
              <Typography variant="h3">{stats.inactive}</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.dark' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Administrators</Typography>
              <Typography variant="h3">{stats.admins}</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search by name, email, mobile, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Status Filter</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status Filter">
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active Only</MenuItem>
              <MenuItem value="inactive">Inactive Only</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Role Filter</InputLabel>
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} label="Role Filter">
              <MenuItem value="all">All Roles</MenuItem>
              {Array.isArray(roles) && roles.map((role) => (
                <MenuItem key={role._id} value={role.name}>
                  {role.displayName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Users Table */}
      {loading ? (
        <Stack spacing={1}>
          {[1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} variant="rectangular" height={60} />
          ))}
        </Stack>
      ) : filteredUsers.length === 0 ? (
        <Alert severity="info">
          {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
            ? 'No users found matching your filters.'
            : 'No users found. Add your first user to get started.'}
        </Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => {
                  const roleDisplay = getRoleDisplay(user);
                  return (
                    <TableRow key={user._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: user.isActive ? 'primary.main' : 'grey.400' }}>
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {user._id?.slice(-8)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{user.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{user.mobile || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={roleDisplay.name} size="small" color={roleDisplay.color} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={getStatusColor(user.isActive)}
                          icon={user.isActive ? <CheckCircleIcon /> : <BlockIcon />}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Edit User">
                            <IconButton size="small" onClick={() => handleOpenEditDialog(user)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Assign Role">
                            <IconButton size="small" onClick={() => handleOpenRoleDialog(user)} color="primary">
                              <ShieldIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.isActive ? 'Deactivate' : 'Activate'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleStatus(user)}
                              color={user.isActive ? 'warning' : 'success'}
                            >
                              {user.isActive ? <PersonOffIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton size="small" onClick={() => handleDeleteUser(user)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon />
            Edit User
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Full Name"
              fullWidth
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
            <TextField
              label="Email Address"
              fullWidth
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              required
            />
            <TextField
              label="Mobile Number"
              fullWidth
              value={editForm.mobile}
              onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseEditDialog} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" startIcon={<SaveIcon />}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={openRoleDialog} onClose={handleCloseRoleDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShieldIcon />
            Assign Role to {selectedUser?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Alert severity="info">
              Assigning a role will grant the user all permissions associated with that role.
            </Alert>
            <FormControl fullWidth>
              <InputLabel>Select Role</InputLabel>
              <Select value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)} label="Select Role">
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {Array.isArray(roles) && roles.map((role) => (
                  <MenuItem key={role._id} value={role._id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <ShieldIcon fontSize="small" />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {role.displayName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {role.permissions?.length || 0} permissions • Priority: {role.priority}
                        </Typography>
                      </Box>
                      {role.isSystem && <Chip label="System" size="small" color="warning" />}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedRoleId && (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Role Details:
                </Typography>
                {(() => {
                  const selectedRole = roles.find((r) => r._id === selectedRoleId);
                  return selectedRole ? (
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>Name:</strong> {selectedRole.displayName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Description:</strong> {selectedRole.description || 'No description'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Permissions:</strong> {selectedRole.permissions?.length || 0}
                      </Typography>
                    </Stack>
                  ) : null;
                })()}
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseRoleDialog} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button onClick={handleAssignRole} variant="contained" startIcon={<SaveIcon />} disabled={!selectedRoleId}>
            Assign Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon />
            Add New User
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 2 }}>
            <TextField
              label="Full Name"
              fullWidth
              required
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              placeholder="Enter user's full name"
            />
            <TextField
              label="Email"
              fullWidth
              required
              type="email"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              placeholder="user@example.com"
              error={addForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email)}
              helperText={addForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email) ? "Invalid email format" : ""}
            />
            <TextField
              label="Password"
              fullWidth
              required
              type="password"
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              placeholder="Enter password"
              error={addForm.password && addForm.password.length < 6}
              helperText={addForm.password && addForm.password.length < 6 ? "Password must be at least 6 characters" : "Minimum 6 characters"}
            />
            <TextField
              label="Mobile"
              fullWidth
              value={addForm.mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                  setAddForm({ ...addForm, mobile: value });
                }
              }}
              placeholder="Enter 10-digit mobile number"
              error={addForm.mobile && !/^[0-9]{10}$/.test(addForm.mobile)}
              helperText={addForm.mobile && addForm.mobile.length > 0 && addForm.mobile.length < 10 ? `${addForm.mobile.length}/10 digits` : addForm.mobile && !/^[0-9]{10}$/.test(addForm.mobile) ? "Must be 10 digits" : "Optional"}
            />
            <TextField
              label="Company"
              fullWidth
              value={addForm.company}
              onChange={(e) => setAddForm({ ...addForm, company: e.target.value })}
              placeholder="Enter company name"
            />
            <FormControl fullWidth>
              <InputLabel>Assign Role</InputLabel>
              <Select 
                value={addForm.roleId} 
                onChange={(e) => setAddForm({ ...addForm, roleId: e.target.value })} 
                label="Assign Role"
              >
                <MenuItem value="">
                  <em>No Role (User will have default permissions)</em>
                </MenuItem>
                {Array.isArray(roles) && roles.map((role) => (
                  <MenuItem key={role._id} value={role._id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <ShieldIcon fontSize="small" />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {role.displayName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {role.permissions?.length || 0} permissions • Priority: {role.priority}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseAddDialog} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button onClick={handleAddUser} variant="contained" startIcon={<SaveIcon />}>
            Create User
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
    </Box>
  );
}
