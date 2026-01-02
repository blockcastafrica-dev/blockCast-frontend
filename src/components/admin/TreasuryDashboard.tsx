import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'fee' | 'payout' | 'deposit' | 'withdrawal';
  amount: number;
  from?: string;
  to?: string;
  timestamp: Date;
  marketId?: string;
  marketClaim?: string;
  status: 'completed' | 'pending';
}

const TreasuryDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Mock data
  const treasuryData = {
    totalBalance: 125000,
    platformFees: 12500,
    pendingPayouts: 5000,
    monthlyRevenue: 8500,
    weeklyVolume: 45000,
    avgDailyVolume: 6500,
    totalUsers: 2847,
    activeMarkets: 89
  };

  const revenueData = [
    { month: 'Jul', revenue: 5200, volume: 32000 },
    { month: 'Aug', revenue: 6100, volume: 38000 },
    { month: 'Sep', revenue: 7300, volume: 45000 },
    { month: 'Oct', revenue: 6800, volume: 42000 },
    { month: 'Nov', revenue: 8100, volume: 52000 },
    { month: 'Dec', revenue: 8500, volume: 58000 },
  ];

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'fee',
      amount: 125,
      from: '0x7f3a...d4e5',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      marketId: 'm1',
      marketClaim: 'Bitcoin $100K Market',
      status: 'completed'
    },
    {
      id: '2',
      type: 'payout',
      amount: 2500,
      to: '0x8a4b...e7f8',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      marketId: 'm2',
      marketClaim: 'Fed Rate Decision',
      status: 'completed'
    },
    {
      id: '3',
      type: 'fee',
      amount: 89,
      from: '0x9c5d...a8b9',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      marketId: 'm3',
      marketClaim: 'SpaceX Launch Market',
      status: 'completed'
    },
    {
      id: '4',
      type: 'payout',
      amount: 1200,
      to: '0xdef0...3456',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      status: 'pending'
    }
  ];

  const categoryBreakdown = [
    { category: 'Crypto', volume: 45000, percentage: 35 },
    { category: 'Finance', volume: 32000, percentage: 25 },
    { category: 'Politics', volume: 25000, percentage: 19 },
    { category: 'Sports', volume: 15000, percentage: 12 },
    { category: 'Other', volume: 11500, percentage: 9 }
  ];

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'fee': return <ArrowDownRight className="h-4 w-4 text-green-500" />;
      case 'payout': return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'deposit': return <ArrowDownRight className="h-4 w-4 text-blue-500" />;
      case 'withdrawal': return <ArrowUpRight className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const maxVolume = Math.max(...revenueData.map(d => d.volume));

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold text-green-500">${treasuryData.totalBalance.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Platform treasury</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <Wallet className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Platform Fees</p>
                <p className="text-2xl font-bold">${treasuryData.platformFees.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12% this month</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#06f6ff]/10">
                <DollarSign className="h-5 w-5 text-[#06f6ff]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payouts</p>
                <p className="text-2xl font-bold text-yellow-500">${treasuryData.pendingPayouts.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Awaiting processing</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <RefreshCw className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekly Volume</p>
                <p className="text-2xl font-bold">${treasuryData.weeklyVolume.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  <span>+8% vs last week</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10">
                <BarChart3 className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#06f6ff]" />
                  Revenue & Volume
                </CardTitle>
                <CardDescription>Monthly platform performance</CardDescription>
              </div>
              <div className="flex gap-1">
                {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                  <Button
                    key={range}
                    size="sm"
                    variant={dateRange === range ? 'default' : 'ghost'}
                    className={dateRange === range ? 'bg-[#06f6ff] text-black' : ''}
                    onClick={() => setDateRange(range)}
                  >
                    {range === 'all' ? 'All' : range}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Simple Bar Chart */}
            <div className="space-y-4">
              {revenueData.map((data, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground w-12">{data.month}</span>
                    <div className="flex-1 mx-4">
                      <div className="h-6 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#06f6ff] to-[#0ea5e9] rounded-full transition-all duration-500"
                          style={{ width: `${(data.volume / maxVolume) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">${data.volume.toLocaleString()}</span>
                      <span className="text-muted-foreground text-xs ml-2">(${data.revenue} fees)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-[#06f6ff]" />
              Volume by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryBreakdown.map((category, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{category.category}</span>
                    <span className="font-medium">{category.percentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0 ? 'bg-[#06f6ff]' :
                        idx === 1 ? 'bg-blue-500' :
                        idx === 2 ? 'bg-purple-500' :
                        idx === 3 ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ${category.volume.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#06f6ff]" />
                Recent Transactions
              </CardTitle>
              <CardDescription>Platform fee collection and payouts</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-[#06f6ff]/30 transition-colors"
              >
                <div className={`p-2 rounded-full ${
                  tx.type === 'fee' ? 'bg-green-500/10' :
                  tx.type === 'payout' ? 'bg-red-500/10' :
                  'bg-muted'
                }`}>
                  {getTransactionIcon(tx.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{tx.type}</span>
                    {tx.status === 'pending' && (
                      <Badge className="bg-yellow-500 text-black text-xs">Pending</Badge>
                    )}
                  </div>
                  {tx.marketClaim && (
                    <p className="text-sm text-muted-foreground truncate">{tx.marketClaim}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {tx.from && `From: ${tx.from}`}
                    {tx.to && `To: ${tx.to}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    tx.type === 'fee' || tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {tx.type === 'fee' || tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatTimeAgo(tx.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TreasuryDashboard;
