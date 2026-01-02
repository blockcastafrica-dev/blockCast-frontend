import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  DollarSign,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Eye
} from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: Date;
  details: string;
  category: 'market' | 'user' | 'resolution' | 'system';
}

interface ComplianceAlert {
  id: string;
  type: 'suspicious_activity' | 'large_transaction' | 'rate_limit' | 'policy_violation';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: Date;
  status: 'new' | 'investigating' | 'resolved';
  affectedUser?: string;
}

const ReportsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'compliance' | 'audit'>('analytics');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock analytics data
  const analyticsData = {
    totalVolume: 458000,
    volumeChange: 15,
    totalUsers: 2847,
    userGrowth: 12,
    activeMarkets: 89,
    marketGrowth: 8,
    avgBetSize: 125,
    betSizeChange: -3,
    resolution: {
      yes: 156,
      no: 98,
      disputed: 12
    },
    topCategories: [
      { name: 'Crypto', volume: 145000, markets: 34 },
      { name: 'Finance', volume: 98000, markets: 28 },
      { name: 'Politics', volume: 76000, markets: 15 },
      { name: 'Sports', volume: 54000, markets: 22 },
      { name: 'Technology', volume: 45000, markets: 18 }
    ],
    dailyActivity: [
      { day: 'Mon', bets: 234, users: 156 },
      { day: 'Tue', bets: 287, users: 178 },
      { day: 'Wed', bets: 312, users: 195 },
      { day: 'Thu', bets: 298, users: 187 },
      { day: 'Fri', bets: 345, users: 212 },
      { day: 'Sat', bets: 267, users: 145 },
      { day: 'Sun', bets: 223, users: 134 }
    ]
  };

  const auditLogs: AuditLog[] = [
    {
      id: '1',
      action: 'Market Approved',
      actor: '0x7f3a...d4e5',
      target: 'Bitcoin $100K Market',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      details: 'Market ID: m123, Category: Crypto',
      category: 'market'
    },
    {
      id: '2',
      action: 'Resolution Executed',
      actor: '0x8a4b...e7f8',
      target: 'Fed Rate Decision Market',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      details: 'Resolved as YES, $12,500 distributed',
      category: 'resolution'
    },
    {
      id: '3',
      action: 'User Flagged',
      actor: 'System',
      target: '0x9c5d...a8b9',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      details: 'Suspicious trading pattern detected',
      category: 'user'
    },
    {
      id: '4',
      action: 'Market Rejected',
      actor: '0x7f3a...d4e5',
      target: 'Celebrity Death Prediction',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      details: 'Violates community guidelines',
      category: 'market'
    },
    {
      id: '5',
      action: 'Role Changed',
      actor: '0xdef0...3456',
      target: '0x1234...5678',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      details: 'Promoted from User to Creator',
      category: 'user'
    }
  ];

  const complianceAlerts: ComplianceAlert[] = [
    {
      id: '1',
      type: 'suspicious_activity',
      severity: 'high',
      description: 'Multiple rapid position changes detected for user 0x7f3...9a2',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      status: 'new',
      affectedUser: '0x7f3...9a2'
    },
    {
      id: '2',
      type: 'large_transaction',
      severity: 'medium',
      description: 'Single bet exceeding $5,000 threshold on Bitcoin market',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      status: 'investigating',
      affectedUser: '0x8a4...e7f'
    },
    {
      id: '3',
      type: 'rate_limit',
      severity: 'low',
      description: 'API rate limit exceeded by automated trading bot',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      status: 'resolved'
    },
    {
      id: '4',
      type: 'policy_violation',
      severity: 'high',
      description: 'Market submission contains prohibited content',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      status: 'resolved'
    }
  ];

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'market': return <Badge variant="outline" className="text-blue-500 border-blue-500/30">Market</Badge>;
      case 'user': return <Badge variant="outline" className="text-purple-500 border-purple-500/30">User</Badge>;
      case 'resolution': return <Badge variant="outline" className="text-green-500 border-green-500/30">Resolution</Badge>;
      case 'system': return <Badge variant="outline">System</Badge>;
      default: return <Badge variant="outline">{category}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return <Badge variant="destructive">High</Badge>;
      case 'medium': return <Badge className="bg-yellow-500 text-black">Medium</Badge>;
      case 'low': return <Badge variant="outline">Low</Badge>;
      default: return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <Badge variant="destructive">New</Badge>;
      case 'investigating': return <Badge className="bg-yellow-500 text-black">Investigating</Badge>;
      case 'resolved': return <Badge className="bg-green-600">Resolved</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const maxBets = Math.max(...analyticsData.dailyActivity.map(d => d.bets));

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        {[
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'compliance', label: 'Compliance', icon: AlertTriangle },
          { id: 'audit', label: 'Audit Trail', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              className={activeTab === tab.id ? 'bg-[#06f6ff] text-black' : ''}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          );
        })}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Period:</span>
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                size="sm"
                variant={dateRange === range ? 'default' : 'outline'}
                className={dateRange === range ? 'bg-[#06f6ff] text-black' : ''}
                onClick={() => setDateRange(range)}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </Button>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Volume</p>
                    <p className="text-2xl font-bold">${analyticsData.totalVolume.toLocaleString()}</p>
                    <div className={`flex items-center gap-1 mt-1 text-xs ${analyticsData.volumeChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {analyticsData.volumeChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      <span>{analyticsData.volumeChange >= 0 ? '+' : ''}{analyticsData.volumeChange}%</span>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-[#06f6ff]/50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-green-500">
                      <TrendingUp className="h-3 w-3" />
                      <span>+{analyticsData.userGrowth}%</span>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-purple-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Markets</p>
                    <p className="text-2xl font-bold">{analyticsData.activeMarkets}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-green-500">
                      <TrendingUp className="h-3 w-3" />
                      <span>+{analyticsData.marketGrowth}%</span>
                    </div>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Bet Size</p>
                    <p className="text-2xl font-bold">${analyticsData.avgBetSize}</p>
                    <div className={`flex items-center gap-1 mt-1 text-xs ${analyticsData.betSizeChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {analyticsData.betSizeChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      <span>{analyticsData.betSizeChange}%</span>
                    </div>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-500/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
                <CardDescription>Bets and active users by day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.dailyActivity.map((day, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="w-8 text-sm text-muted-foreground">{day.day}</span>
                      <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#06f6ff] to-[#0ea5e9] rounded-full transition-all"
                          style={{ width: `${(day.bets / maxBets) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-20 text-right">{day.bets} bets</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
                <CardDescription>Volume by market category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topCategories.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#06f6ff]/20 flex items-center justify-center text-xs font-bold text-[#06f6ff]">
                          {idx + 1}
                        </span>
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${cat.volume.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{cat.markets} markets</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resolution Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Resolution Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-500/10 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-500">{analyticsData.resolution.yes}</p>
                  <p className="text-sm text-muted-foreground">Resolved YES</p>
                </div>
                <div className="p-4 bg-red-500/10 rounded-lg text-center">
                  <p className="text-3xl font-bold text-red-500">{analyticsData.resolution.no}</p>
                  <p className="text-sm text-muted-foreground">Resolved NO</p>
                </div>
                <div className="p-4 bg-yellow-500/10 rounded-lg text-center">
                  <p className="text-3xl font-bold text-yellow-500">{analyticsData.resolution.disputed}</p>
                  <p className="text-sm text-muted-foreground">Disputed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Compliance Alerts
              </CardTitle>
              <CardDescription>Monitor suspicious activity and policy violations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${
                      alert.severity === 'high' ? 'border-red-500/30 bg-red-500/5' :
                      alert.severity === 'medium' ? 'border-yellow-500/30 bg-yellow-500/5' :
                      'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getSeverityBadge(alert.severity)}
                          {getStatusBadge(alert.status)}
                          <span className="text-xs text-muted-foreground">{formatTimeAgo(alert.timestamp)}</span>
                        </div>
                        <p className="text-sm">{alert.description}</p>
                        {alert.affectedUser && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Affected user: <span className="font-mono">{alert.affectedUser}</span>
                          </p>
                        )}
                      </div>
                      {alert.status !== 'resolved' && (
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Investigate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#06f6ff]" />
                    Audit Trail
                  </CardTitle>
                  <CardDescription>Complete log of admin actions</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Mobile View */}
              <div className="lg:hidden space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{log.action}</span>
                      {getCategoryBadge(log.category)}
                    </div>
                    <p className="text-sm text-muted-foreground">{log.target}</p>
                    <p className="text-xs text-muted-foreground">{log.details}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>By: <span className="font-mono">{log.actor}</span></span>
                      <span>{formatTimeAgo(log.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell>{getCategoryBadge(log.category)}</TableCell>
                        <TableCell className="max-w-xs truncate">{log.target}</TableCell>
                        <TableCell className="font-mono text-xs">{log.actor}</TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground text-sm">{log.details}</TableCell>
                        <TableCell>{formatTimeAgo(log.timestamp)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportsDashboard;
