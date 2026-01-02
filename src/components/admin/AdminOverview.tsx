import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  DollarSign,
  Activity,
  ArrowRight,
  Gavel,
  Flag,
  Eye
} from 'lucide-react';

interface AdminOverviewProps {
  onNavigate: (tab: string) => void;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeLabel, icon, trend }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
            }`}>
              {trend === 'up' ? <TrendingUp className="h-3 w-3" /> :
               trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
              <span>{change > 0 ? '+' : ''}{change}%</span>
              {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-[#06f6ff]/10">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

interface PriorityItem {
  id: string;
  type: 'expired_market' | 'flagged_user' | 'pending_approval' | 'dispute';
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  timestamp: Date;
  actionLabel: string;
  actionTab: string;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigate }) => {
  // Mock data - would be fetched from API/blockchain
  const stats = {
    totalMarkets: 156,
    activeMarkets: 89,
    pendingApprovals: 12,
    resolvedToday: 5,
    totalUsers: 2847,
    activeUsers: 1234,
    totalVolume: 125000,
    dailyVolume: 8500,
    platformFees: 12500
  };

  const priorityQueue: PriorityItem[] = [
    {
      id: '1',
      type: 'expired_market',
      title: 'Market Expired: Will Bitcoin reach $100K by Jan 2025?',
      description: 'Expired 2 hours ago, 45 participants, $12,500 volume',
      urgency: 'high',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      actionLabel: 'Resolve',
      actionTab: 'markets'
    },
    {
      id: '2',
      type: 'dispute',
      title: 'Dispute Filed: US Election Outcome Market',
      description: '3 users disputed the resolution, evidence submitted',
      urgency: 'high',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      actionLabel: 'Review',
      actionTab: 'evidence'
    },
    {
      id: '3',
      type: 'pending_approval',
      title: 'New Market: Will AI pass the Turing test in 2025?',
      description: 'Submitted by verified creator, technology category',
      urgency: 'medium',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      actionLabel: 'Review',
      actionTab: 'markets'
    },
    {
      id: '4',
      type: 'flagged_user',
      title: 'Flagged Account: Suspicious trading pattern detected',
      description: 'User 0x7f3...9a2 - Multiple rapid position changes',
      urgency: 'medium',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      actionLabel: 'Investigate',
      actionTab: 'users'
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'expired_market': return <Gavel className="h-4 w-4 text-orange-500" />;
      case 'dispute': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending_approval': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'flagged_user': return <Flag className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Markets"
          value={stats.totalMarkets}
          change={12}
          changeLabel="this week"
          trend="up"
          icon={<Activity className="h-5 w-5 text-[#06f6ff]" />}
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon={<Clock className="h-5 w-5 text-[#06f6ff]" />}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          change={8}
          changeLabel="this month"
          trend="up"
          icon={<Users className="h-5 w-5 text-[#06f6ff]" />}
        />
        <StatCard
          title="Platform Revenue"
          value={`$${stats.platformFees.toLocaleString()}`}
          change={15}
          changeLabel="this month"
          trend="up"
          icon={<DollarSign className="h-5 w-5 text-[#06f6ff]" />}
        />
      </div>

      {/* Priority Queue */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#06f6ff]" />
                Priority Queue
              </CardTitle>
              <CardDescription>Items requiring immediate attention</CardDescription>
            </div>
            <Badge variant="outline" className="text-red-500 border-red-500/30">
              {priorityQueue.filter(p => p.urgency === 'high').length} urgent
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {priorityQueue.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-[#06f6ff]/30 transition-colors"
              >
                <div className={`w-2 h-2 mt-2 rounded-full ${getUrgencyColor(item.urgency)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getTypeIcon(item.type)}
                    <span className="font-medium text-sm truncate">{item.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(item.timestamp)}</p>
                </div>
                <Button
                  size="sm"
                  className="bg-[#06f6ff] text-black hover:bg-[#06f6ff]/90 shrink-0"
                  onClick={() => onNavigate(item.actionTab)}
                >
                  {item.actionLabel}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => onNavigate('markets')}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#06f6ff]" />
                <span>Review Pending Markets</span>
              </div>
              <Badge className="bg-[#06f6ff]/10 text-[#06f6ff]">{stats.pendingApprovals}</Badge>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => onNavigate('markets')}
            >
              <div className="flex items-center gap-2">
                <Gavel className="h-4 w-4 text-orange-500" />
                <span>Resolve Expired Markets</span>
              </div>
              <Badge className="bg-orange-500/10 text-orange-500">3</Badge>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => onNavigate('evidence')}
            >
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-500" />
                <span>Review Disputes</span>
              </div>
              <Badge className="bg-purple-500/10 text-purple-500">2</Badge>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => onNavigate('users')}
            >
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-red-500" />
                <span>Flagged Accounts</span>
              </div>
              <Badge className="bg-red-500/10 text-red-500">1</Badge>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Admin Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'Market approved', target: 'Bitcoin ETF Approval', by: '0x7f3...', time: '5m ago' },
                { action: 'Resolution executed', target: 'Fed Rate Decision', by: '0x8a2...', time: '15m ago' },
                { action: 'User flagged', target: '0x9b4...c2d', by: 'System', time: '1h ago' },
                { action: 'Market rejected', target: 'Celebrity Death Prediction', by: '0x7f3...', time: '2h ago' },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p>
                      <span className="font-medium">{activity.action}</span>
                      <span className="text-muted-foreground"> - {activity.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">by {activity.by} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
