// assets
import { IconDashboard, IconShieldLock } from '@tabler/icons-react';

// constant
const icons = { IconDashboard, IconShieldLock };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const dashboard = {
  id: 'dashboard',
  title: '',
  type: 'group',
  children: [
    {
      id: 'default',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: false
    },
    {
      id: 'energy-analysis',
      title: 'Energy Analysis',
      type: 'item',
      url: '/realtime-dashboard2?did=E_AA_Z_B_X_P0023_D2',
      icon: icons.IconDashboard,
      breadcrumbs: false
    },
    {
      id: 'rbac-management',
      title: 'RBAC Management',
      type: 'item',
      url: '/rbac-management',
      icon: icons.IconShieldLock,
      breadcrumbs: false
    },
    {
      id: 'h-s',
      title: 'Help & Support',
      type: 'item',
      url: '/help',
      icon: icons.IconDashboard,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
