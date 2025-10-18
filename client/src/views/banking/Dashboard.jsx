import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  IconBuilding,
  IconUsers,
  IconWallet,
  IconReceipt,
  IconCoin,
  IconTrendingUp,
} from '@tabler/icons-react';
import { toast } from 'react-toastify';
import MainCard from 'ui-component/cards/MainCard';
import { bankingAPI, formatIndianCurrency } from 'services/bankingService';

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color = '#1976d2', loading }) => (
  <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`, color: 'white' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
            {title}
          </Typography>
          {loading ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : (
            <Typography variant="h3" fontWeight="bold">
              {value}
            </Typography>
          )}
        </Box>
        <Icon size={48} style={{ opacity: 0.3 }} />
      </Box>
    </CardContent>
  </Card>
);

export default function BankingDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalCustomers: 0,
    totalAccounts: 0,
    totalDeposits: 0,
    totalTransactions: 0,
    totalLoans: 0,
    activeLoans: 0,
    totalLoanAmount: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await bankingAPI.getSummary();
      const data = response.data?.data || {};
      setStats({
        totalBranches: data.totalBranches || 0,
        totalCustomers: data.totalCustomers || 0,
        totalAccounts: data.totalAccounts || 0,
        totalDeposits: data.totalDeposits || 0,
        totalTransactions: data.totalTransactions || 0,
        totalLoans: data.totalLoans || 0,
        activeLoans: data.activeLoans || 0,
        totalLoanAmount: data.totalLoanAmount || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      const msg = error.response?.data?.message || 'Failed to load dashboard data';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard title="Banking Dashboard">
      <Box>
        <Grid container spacing={3}>
          {/* Top Stats */}
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Branches"
              value={stats.totalBranches}
              icon={IconBuilding}
              color="#1976d2"
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Customers"
              value={stats.totalCustomers.toLocaleString()}
              icon={IconUsers}
              color="#4caf50"
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Accounts"
              value={stats.totalAccounts.toLocaleString()}
              icon={IconWallet}
              color="#ff9800"
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Transactions"
              value={stats.totalTransactions.toLocaleString()}
              icon={IconReceipt}
              color="#9c27b0"
              loading={loading}
            />
          </Grid>

          {/* Financial Stats */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconTrendingUp /> Total Deposits
                </Typography>
                {loading ? (
                  <CircularProgress />
                ) : (
                  <Typography variant="h2" color="primary" fontWeight="bold">
                    {formatIndianCurrency(stats.totalDeposits)}
                  </Typography>
                )}
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Across all active accounts
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconCoin /> Loan Portfolio
                </Typography>
                {loading ? (
                  <CircularProgress />
                ) : (
                  <>
                    <Typography variant="h2" color="secondary" fontWeight="bold">
                      {formatIndianCurrency(stats.totalLoanAmount)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      {stats.activeLoans} active loans out of {stats.totalLoans} total
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Info */}
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="h5" gutterBottom>
                Welcome to the Banking Dashboard
              </Typography>
              <Typography variant="body2">
                This dashboard provides an overview of your banking operations. Navigate through the menu to manage branches,
                customers, accounts, transactions, loans, and cards.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Box>
    </MainCard>
  );
}
