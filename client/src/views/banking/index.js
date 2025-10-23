import { lazy } from 'react';

// Lazy load banking components
const BankingDashboard = lazy(() => import('./Dashboard'));
const BranchManagement = lazy(() => import('./BranchManagement'));
const CustomerManagement = lazy(() => import('./CustomerManagement'));
const AccountManagement = lazy(() => import('./AccountManagement'));
const TransactionManagement = lazy(() => import('./TransactionManagement'));
const LoanManagement = lazy(() => import('./LoanManagement'));

export {
  BankingDashboard,
  BranchManagement,
  CustomerManagement,
  AccountManagement,
  TransactionManagement,
  LoanManagement,
};
