import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Divider,
  Skeleton,
  Alert,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  VpnKey as VpnKeyIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Shield as ShieldIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Project imports
import MainCard from 'ui-component/cards/MainCard';
import rbacService from 'services/rbacService';

// ==============================|| ROLES MANAGEMENT ||============================== //

export default function RolesManagement() {
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Form states
  const [roleForm, setRoleForm] = useState({
    name: '',
    displayName: '',
    description: '',
    priority: 0
  });

  // Load data
  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  // Filter roles based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRoles(roles);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredRoles(
        roles.filter(
          (role) =>
            role.displayName.toLowerCase().includes(query) ||
            role.name.toLowerCase().includes(query) ||
            role.description?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, roles]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await rbacService.getAllRoles();
      const rolesData = response.data || [];
      setRoles(rolesData);
      setFilteredRoles(rolesData);
    } catch (error) {
      toast.error(error.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await rbacService.getAllPermissions();
      setPermissions(response.data || []);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
  };

  // Role handlers
  const handleOpenRoleDialog = (role = null) => {
    if (role) {
      setSelectedRole(role);
      setRoleForm({
        name: role.name,
        displayName: role.displayName,
        description: role.description || '',
        priority: role.priority || 0
      });
    } else {
      setSelectedRole(null);
      setRoleForm({
        name: '',
        displayName: '',
        description: '',
        priority: 0
      });
    }
    setOpenRoleDialog(true);
  };

  const handleCloseRoleDialog = () => {
    setOpenRoleDialog(false);
    setSelectedRole(null);
    setRoleForm({
      name: '',
      displayName: '',
      description: '',
      priority: 0
    });
  };

  const handleSaveRole = async () => {
    try {
      if (!roleForm.name || !roleForm.displayName) {
        toast.error('Role name and display name are required');
        return;
      }

      if (selectedRole) {
        await rbacService.updateRole(selectedRole._id, roleForm);
        toast.success('Role updated successfully');
      } else {
        await rbacService.createRole(roleForm);
        toast.success('Role created successfully');
      }
      handleCloseRoleDialog();
      loadRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to save role');
    }
  };

  const handleDeleteRole = async (role) => {
    if (!window.confirm(`Are you sure you want to delete the role "${role.displayName}"? This action cannot be undone.`)) return;

    try {
      await rbacService.deleteRole(role._id);
      toast.success('Role deleted successfully');
      loadRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete role');
    }
  };

  // Assign permissions to role
  const handleOpenAssignDialog = (role) => {
    setSelectedRoleForPermissions(role);
    setSelectedPermissions(role.permissions?.map((p) => p._id) || []);
    setOpenAssignDialog(true);
  };

  const handleCloseAssignDialog = () => {
    setOpenAssignDialog(false);
    setSelectedRoleForPermissions(null);
    setSelectedPermissions([]);
  };

  const handleTogglePermission = (permissionId) => {
    setSelectedPermissions((prev) => (prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId]));
  };

  const handleSelectAllPermissions = (resource) => {
    const resourcePerms = permissions.filter((p) => p.resource === resource).map((p) => p._id);
    const allSelected = resourcePerms.every((id) => selectedPermissions.includes(id));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((id) => !resourcePerms.includes(id)));
    } else {
      setSelectedPermissions((prev) => [...new Set([...prev, ...resourcePerms])]);
    }
  };

  const handleSaveAssignments = async () => {
    try {
      await rbacService.assignPermissions(selectedRoleForPermissions._id, selectedPermissions);
      toast.success('Permissions assigned successfully');
      handleCloseAssignDialog();
      loadRoles();
    } catch (error) {
      toast.error(error.message || 'Failed to assign permissions');
    }
  };

  const groupPermissionsByResource = () => {
    const grouped = {};
    permissions.forEach((permission) => {
      if (!grouped[permission.resource]) {
        grouped[permission.resource] = [];
      }
      grouped[permission.resource].push(permission);
    });
    return grouped;
  };

  const getPriorityColor = (priority) => {
    if (priority >= 90) return 'error';
    if (priority >= 70) return 'warning';
    if (priority >= 50) return 'info';
    return 'default';
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <MainCard
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShieldIcon />
            <Typography variant="h3">Roles Management</Typography>
          </Box>
        }
        secondary={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenRoleDialog()} size="small">
            Create Role
          </Button>
        }
      >
        {/* Search and Filters */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search roles by name, display name, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: 2,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Total Roles
                    </Typography>
                    <Typography variant="h3" fontWeight={600}>
                      {roles.length}
                    </Typography>
                  </Box>
                  <ShieldIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                bgcolor: 'success.main',
                color: 'success.contrastText',
                borderRadius: 2,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Active Roles
                    </Typography>
                    <Typography variant="h3" fontWeight={600}>
                      {roles.filter((r) => r.isActive).length}
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                bgcolor: 'warning.main',
                color: 'warning.contrastText',
                borderRadius: 2,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      System Roles
                    </Typography>
                    <Typography variant="h3" fontWeight={600}>
                      {roles.filter((r) => r.isSystem).length}
                    </Typography>
                  </Box>
                  <VpnKeyIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                borderRadius: 2,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Custom Roles
                    </Typography>
                    <Typography variant="h3" fontWeight={600}>
                      {roles.filter((r) => !r.isSystem).length}
                    </Typography>
                  </Box>
                  <AddIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Roles Grid */}
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} md={6} lg={4} key={item}>
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : filteredRoles.length === 0 ? (
          <Alert
            severity="info"
            sx={{
              mt: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'info.main'
            }}
          >
            {searchQuery ? 'No roles found matching your search criteria.' : 'No roles found. Create your first role to get started.'}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredRoles.map((role) => (
              <Grid item xs={12} md={6} lg={4} key={role._id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    transition: 'all 0.3s',
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-4px)',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  {/* Priority Badge */}
                  <Chip
                    label={`Priority ${role.priority}`}
                    size="small"
                    color={getPriorityColor(role.priority)}
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      fontWeight: 600
                    }}
                  />

                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2.5}>
                      {/* Header */}
                      <Box sx={{ pr: 10 }}>
                        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <Box
                            sx={{
                              bgcolor: 'primary.light',
                              borderRadius: 1.5,
                              p: 0.75,
                              display: 'flex'
                            }}
                          >
                            <ShieldIcon fontSize="small" color="primary" />
                          </Box>
                          {role.displayName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={role.name}
                            size="small"
                            sx={{
                              bgcolor: 'primary.lighter',
                              color: 'primary.dark',
                              fontFamily: 'monospace',
                              fontWeight: 500
                            }}
                          />
                          {role.isSystem && <Chip label="System" size="small" color="warning" />}
                          <Chip
                            label={role.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={role.isActive ? 'success' : 'default'}
                            icon={role.isActive ? <CheckCircleIcon /> : undefined}
                          />
                        </Box>
                      </Box>

                      {/* Description */}
                      <Box
                        sx={{
                          bgcolor: 'grey.50',
                          borderRadius: 1.5,
                          p: 2,
                          minHeight: 70
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {role.description || 'No description provided'}
                        </Typography>
                      </Box>

                      {/* Permissions */}
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Permissions
                          </Typography>
                          <Chip label={`${role.permissions?.length || 0} assigned`} size="small" color="primary" variant="outlined" />
                        </Box>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleOpenAssignDialog(role)}
                          fullWidth
                          startIcon={<VpnKeyIcon />}
                          sx={{ borderRadius: 1.5 }}
                        >
                          Manage Permissions
                        </Button>
                      </Box>

                      <Divider />

                      {/* Actions */}
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenRoleDialog(role)}
                          disabled={role.isSystem}
                          startIcon={<EditIcon />}
                          fullWidth
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteRole(role)}
                          disabled={role.isSystem}
                          startIcon={<DeleteIcon />}
                          fullWidth
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Role Dialog */}
        <Dialog open={openRoleDialog} onClose={handleCloseRoleDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShieldIcon />
              {selectedRole ? 'Edit Role' : 'Create New Role'}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Role Name (Identifier)"
                fullWidth
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                placeholder="e.g., custom_manager"
                disabled={!!selectedRole}
                helperText="Unique identifier for the role (lowercase, underscores only)"
                required
              />
              <TextField
                label="Display Name"
                fullWidth
                value={roleForm.displayName}
                onChange={(e) => setRoleForm({ ...roleForm, displayName: e.target.value })}
                placeholder="e.g., Custom Manager"
                helperText="Human-readable name shown in the UI"
                required
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                placeholder="Describe the responsibilities and access level of this role"
                helperText="Optional: Provide details about this role's purpose"
              />
              <TextField
                label="Priority Level"
                fullWidth
                type="number"
                value={roleForm.priority}
                onChange={(e) => setRoleForm({ ...roleForm, priority: parseInt(e.target.value) || 0 })}
                helperText="Higher numbers = higher authority (0-100)"
                inputProps={{ min: 0, max: 100 }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseRoleDialog} startIcon={<CloseIcon />}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole} variant="contained" startIcon={<SaveIcon />}>
              {selectedRole ? 'Update Role' : 'Create Role'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Assign Permissions Dialog */}
        <Dialog open={openAssignDialog} onClose={handleCloseAssignDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VpnKeyIcon />
              Assign Permissions to {selectedRoleForPermissions?.displayName}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Selected: {selectedPermissions.length} of {permissions.length} permissions
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {Object.entries(groupPermissionsByResource()).map(([resource, perms]) => {
                const resourcePermIds = perms.map((p) => p._id);
                const allSelected = resourcePermIds.every((id) => selectedPermissions.includes(id));
                const someSelected = resourcePermIds.some((id) => selectedPermissions.includes(id));

                return (
                  <Card key={resource} sx={{ mb: 2 }} variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" sx={{ textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ShieldIcon fontSize="small" color="primary" />
                          {resource}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleSelectAllPermissions(resource)}
                          color={allSelected ? 'error' : 'primary'}
                        >
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </Button>
                      </Box>
                      <Stack spacing={1}>
                        {perms.map((permission) => (
                          <Box
                            key={permission._id}
                            sx={{
                              p: 1.5,
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: selectedPermissions.includes(permission._id) ? 'primary.main' : 'divider',
                              bgcolor: selectedPermissions.includes(permission._id) ? 'primary.lighter' : 'transparent',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: 'primary.lighter'
                              }
                            }}
                            onClick={() => handleTogglePermission(permission._id)}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box
                                sx={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: 1,
                                  border: '2px solid',
                                  borderColor: selectedPermissions.includes(permission._id) ? 'primary.main' : 'grey.400',
                                  bgcolor: selectedPermissions.includes(permission._id) ? 'primary.main' : 'transparent',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white'
                                }}
                              >
                                {selectedPermissions.includes(permission._id) && '✓'}
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" fontWeight={500}>
                                  {permission.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {permission.description || 'No description'}
                                </Typography>
                              </Box>
                              <Chip label={permission.action} size="small" color="primary" variant="outlined" />
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseAssignDialog} startIcon={<CloseIcon />}>
              Cancel
            </Button>
            <Button onClick={handleSaveAssignments} variant="contained" startIcon={<SaveIcon />}>
              Save Permissions ({selectedPermissions.length})
            </Button>
          </DialogActions>
        </Dialog>
      </MainCard>
    </Box>
  );
}
