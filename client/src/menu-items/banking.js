// assets
import {
  IconBuilding,
  IconUsers,
  IconWallet,
  IconReceipt,
  IconCoin,
  IconCreditCard,
} from '@tabler/icons-react';

// constant
const icons = {
  IconBuilding,
  IconUsers,
  IconWallet,
  IconReceipt,
  IconCoin,
  IconCreditCard,
};

// ==============================|| BANKING MENU ITEMS ||============================== //

const banking = {
  id: 'banking',
  title: 'Banking',
  type: 'group',
  children: [
    {
      id: 'banking-dashboard',
      title: 'Banking Dashboard',
      type: 'item',
      url: '/banking/dashboard',
      icon: icons.IconWallet,
      breadcrumbs: false,
    },
    {
      id: 'branches',
      title: 'Branches',
      type: 'item',
      url: '/banking/branches',
      icon: icons.IconBuilding,
      breadcrumbs: false,
    },
    {
      id: 'customers',
      title: 'Customers',
      type: 'item',
      url: '/banking/customers',
      icon: icons.IconUsers,
      breadcrumbs: false,
    },
    {
      id: 'accounts',
      title: 'Accounts',
      type: 'item',
      url: '/banking/accounts',
      icon: icons.IconWallet,
      breadcrumbs: false,
    },
    {
      id: 'transactions',
      title: 'Transactions',
      type: 'item',
      url: '/banking/transactions',
      icon: icons.IconReceipt,
      breadcrumbs: false,
    },
    {
      id: 'loans',
      title: 'Loans',
      type: 'item',
      url: '/banking/loans',
      icon: icons.IconCoin,
      breadcrumbs: false,
    },
    {
      id: 'cards',
      title: 'Cards',
      type: 'item',
      url: '/banking/cards',
      icon: icons.IconCreditCard,
      breadcrumbs: false,
    },
  ],
};

export default banking;
