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
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  VpnKey as VpnKeyIcon,
  People as PeopleIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Project imports
import MainCard from 'ui-component/cards/MainCard';
import rbacService from 'services/rbacService';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// ==============================|| RBAC MANAGEMENT PAGE ||============================== //

export default function RBACManagementPage() {
  const [tabValue, setTabValue] = useState(0);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openPermissionDialog, setOpenPermissionDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Form states
  const [roleForm, setRoleForm] = useState({
    name: '',
    displayName: '',
    description: '',
    priority: 0
  });

  const [permissionForm, setPermissionForm] = useState({
    name: '',
    resource: '',
    action: 'read',
    description: ''
  });

  // Load data
  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await rbacService.getAllRoles();
      setRoles(response.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const response = await rbacService.getAllPermissions();
      setPermissions(response.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load permissions');
    } finally {
      setLoading(false);
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
      toast.error(error.message || 'Failed to save role');
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    try {
      await rbacService.deleteRole(roleId);
      toast.success('Role deleted successfully');
      loadRoles();
    } catch (error) {
      toast.error(error.message || 'Failed to delete role');
    }
  };

  // Permission handlers
  const handleOpenPermissionDialog = (permission = null) => {
    if (permission) {
      setSelectedPermission(permission);
      setPermissionForm({
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
        description: permission.description || ''
      });
    } else {
      setSelectedPermission(null);
      setPermissionForm({
        name: '',
        resource: '',
        action: 'read',
        description: ''
      });
    }
    setOpenPermissionDialog(true);
  };

  const handleClosePermissionDialog = () => {
    setOpenPermissionDialog(false);
    setSelectedPermission(null);
    setPermissionForm({
      name: '',
      resource: '',
      action: 'read',
      description: ''
    });
  };

  const handleSavePermission = async () => {
    try {
      if (selectedPermission) {
        await rbacService.updatePermission(selectedPermission._id, permissionForm);
        toast.success('Permission updated successfully');
      } else {
        await rbacService.createPermission(permissionForm);
        toast.success('Permission created successfully');
      }
      handleClosePermissionDialog();
      loadPermissions();
    } catch (error) {
      toast.error(error.message || 'Failed to save permission');
    }
  };

  const handleDeletePermission = async (permissionId) => {
    if (!window.confirm('Are you sure you want to delete this permission?')) return;

    try {
      await rbacService.deletePermission(permissionId);
      toast.success('Permission deleted successfully');
      loadPermissions();
    } catch (error) {
      toast.error(error.message || 'Failed to delete permission');
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

  return (
    <MainCard title="RBAC Management">
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab icon={<PeopleIcon />} label="Roles" iconPosition="start" />
            <Tab icon={<VpnKeyIcon />} label="Permissions" iconPosition="start" />
          </Tabs>
        </Box>

        {/* Roles Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenRoleDialog()}>
              Add Role
            </Button>
          </Box>

          <Grid container spacing={2}>
            {roles.map((role) => (
              <Grid item xs={12} md={6} lg={4} key={role._id}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box>
                          <Typography variant="h4" gutterBottom>
                            {role.displayName}
                          </Typography>
                          <Chip label={role.name} size="small" color="primary" variant="outlined" />
                          {role.isSystem && <Chip label="System" size="small" color="warning" variant="outlined" sx={{ ml: 1 }} />}
                        </Box>
                        <Box>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleOpenRoleDialog(role)} disabled={role.isSystem}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDeleteRole(role._id)} disabled={role.isSystem}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        {role.description || 'No description'}
                      </Typography>

                      <Divider />

                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Permissions: {role.permissions?.length || 0}
                        </Typography>
                        <Button size="small" variant="outlined" onClick={() => handleOpenAssignDialog(role)} fullWidth>
                          Manage Permissions
                        </Button>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Priority: {role.priority}
                        </Typography>
                        <Chip label={role.isActive ? 'Active' : 'Inactive'} size="small" color={role.isActive ? 'success' : 'default'} />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Permissions Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenPermissionDialog()}>
              Add Permission
            </Button>
          </Box>

          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Resource</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Action</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Description</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e0e0e0' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e0e0e0' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((permission) => (
                    <tr key={permission._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '12px' }}>
                        <Typography variant="body2" fontWeight={500}>
                          {permission.name}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Chip label={permission.resource} size="small" color="primary" variant="outlined" />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Chip label={permission.action} size="small" />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Typography variant="body2" color="text.secondary">
                          {permission.description || '-'}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <Chip
                          label={permission.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={permission.isActive ? 'success' : 'default'}
                        />
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenPermissionDialog(permission)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDeletePermission(permission._id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        </TabPanel>
      </Box>

      {/* Role Dialog */}
      <Dialog open={openRoleDialog} onClose={handleCloseRoleDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedRole ? 'Edit Role' : 'Create Role'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Role Name (ID)"
              fullWidth
              value={roleForm.name}
              onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
              placeholder="e.g., super_admin"
              disabled={!!selectedRole}
            />
            <TextField
              label="Display Name"
              fullWidth
              value={roleForm.displayName}
              onChange={(e) => setRoleForm({ ...roleForm, displayName: e.target.value })}
              placeholder="e.g., Super Admin"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={roleForm.description}
              onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
            />
            <TextField
              label="Priority"
              fullWidth
              type="number"
              value={roleForm.priority}
              onChange={(e) => setRoleForm({ ...roleForm, priority: parseInt(e.target.value) || 0 })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button onClick={handleSaveRole} variant="contained" startIcon={<SaveIcon />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permission Dialog */}
      <Dialog open={openPermissionDialog} onClose={handleClosePermissionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedPermission ? 'Edit Permission' : 'Create Permission'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Permission Name"
              fullWidth
              value={permissionForm.name}
              onChange={(e) => setPermissionForm({ ...permissionForm, name: e.target.value })}
              placeholder="e.g., create_user"
              disabled={!!selectedPermission}
            />
            <TextField
              label="Resource"
              fullWidth
              value={permissionForm.resource}
              onChange={(e) => setPermissionForm({ ...permissionForm, resource: e.target.value })}
              placeholder="e.g., user, role, dashboard"
            />
            <FormControl fullWidth>
              <InputLabel>Action</InputLabel>
              <Select
                value={permissionForm.action}
                onChange={(e) => setPermissionForm({ ...permissionForm, action: e.target.value })}
                label="Action"
              >
                <MenuItem value="create">Create</MenuItem>
                <MenuItem value="read">Read</MenuItem>
                <MenuItem value="update">Update</MenuItem>
                <MenuItem value="delete">Delete</MenuItem>
                <MenuItem value="manage">Manage</MenuItem>
                <MenuItem value="view">View</MenuItem>
                <MenuItem value="execute">Execute</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={permissionForm.description}
              onChange={(e) => setPermissionForm({ ...permissionForm, description: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePermissionDialog} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button onClick={handleSavePermission} variant="contained" startIcon={<SaveIcon />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Permissions Dialog */}
      <Dialog open={openAssignDialog} onClose={handleCloseAssignDialog} maxWidth="md" fullWidth>
        <DialogTitle>Assign Permissions to {selectedRoleForPermissions?.displayName}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {Object.entries(groupPermissionsByResource()).map(([resource, perms]) => (
              <Box key={resource} sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ textTransform: 'capitalize', color: 'primary.main' }}>
                  {resource}
                </Typography>
                <FormGroup>
                  {perms.map((permission) => (
                    <FormControlLabel
                      key={permission._id}
                      control={
                        <Checkbox
                          checked={selectedPermissions.includes(permission._id)}
                          onChange={() => handleTogglePermission(permission._id)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {permission.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {permission.description}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </FormGroup>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button onClick={handleSaveAssignments} variant="contained" startIcon={<SaveIcon />}>
            Save Assignments
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
