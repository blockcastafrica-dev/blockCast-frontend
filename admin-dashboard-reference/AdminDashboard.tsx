import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Users,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  Clock,
  DollarSign,
  Activity,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { marketsApi } from '@/utils/apiService';
import { toast } from 'sonner';

interface AdminOverviewProps {
  userProfile?: {
    walletAddress: string;
    displayName?: string;
  };
}

interface Stats {
  totalMarkets: number;
  activeMarkets: number;
  pendingMarkets: number;
  resolvedMarkets: number;
  totalVolume: number;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ userProfile }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingMarkets, setPendingMarkets] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load markets from API
      const [allMarkets, pending] = await Promise.all([
        marketsApi.getAll({}),
        marketsApi.getPending()
      ]);

      // Calculate stats
      const activeCount = allMarkets.filter(m => m.status === 'active').length;
      const resolvedCount = allMarkets.filter(m => m.status === 'resolved').length;

      setStats({
        totalMarkets: allMarkets.length,
        activeMarkets: activeCount,
        pendingMarkets: pending.length,
        resolvedMarkets: resolvedCount,
        totalVolume: 0 // Would need on-chain data
      });

      setPendingMarkets(pending.slice(0, 5)); // Show first 5 pending

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Admin Overview</h2>
          <p className="text-muted-foreground">
            Welcome back, {userProfile?.displayName || `Admin ${userProfile?.walletAddress?.slice(-6)}`}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Markets</p>
                <p className="text-3xl font-bold">{stats?.totalMarkets || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Markets</p>
                <p className="text-3xl font-bold text-green-500">{stats?.activeMarkets || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-500">{stats?.pendingMarkets || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-3xl font-bold text-blue-500">{stats?.resolvedMarkets || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Markets Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Recent Pending Markets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingMarkets.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No pending markets to review
            </p>
          ) : (
            <div className="space-y-4">
              {pendingMarkets.map((market) => (
                <div key={market.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{market.claim || market.question}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{market.category || 'General'}</Badge>
                      {market.country && (
                        <Badge variant="secondary">{market.country}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-green-500 border-green-500">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-500 border-red-500">
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileCheck className="h-6 w-6" />
              Review Markets
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              Manage Users
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <DollarSign className="h-6 w-6" />
              Treasury
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <AlertTriangle className="h-6 w-6" />
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
