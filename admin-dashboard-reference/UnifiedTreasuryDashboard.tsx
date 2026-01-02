import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface UnifiedTreasuryDashboardProps {
  isAdmin: boolean;
}

const UnifiedTreasuryDashboard: React.FC<UnifiedTreasuryDashboardProps> = ({ isAdmin }) => {
  // Mock treasury data - would be fetched from on-chain
  const treasuryData = {
    totalBalance: 125000,
    platformFees: 12500,
    pendingPayouts: 5000,
    monthlyRevenue: 8500
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Treasury Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <DollarSign className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold">${treasuryData.totalBalance.toLocaleString()}</p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Platform Fees</p>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">${treasuryData.platformFees.toLocaleString()}</p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Pending Payouts</p>
                <ArrowUpRight className="h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold">${treasuryData.pendingPayouts.toLocaleString()}</p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <ArrowDownRight className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold">${treasuryData.monthlyRevenue.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Transaction history coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedTreasuryDashboard;
