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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  Search,
  Shield,
  Flag,
  Ban,
  Eye,
  Activity,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface User {
  id: string;
  walletAddress: string;
  displayName?: string;
  joinedAt: Date;
  lastActive: Date;
  totalBets: number;
  totalVolume: number;
  winRate: number;
  balance: number;
  status: 'active' | 'flagged' | 'banned';
  role: 'user' | 'creator' | 'admin' | 'super_admin';
  flags: string[];
}

const UsersDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionDialog, setActionDialog] = useState<{ type: 'flag' | 'ban' | 'role'; user: User } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'flagged' | 'banned'>('all');

  // Mock data
  const users: User[] = [
    {
      id: '1',
      walletAddress: '0x7f3a9b2cd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9',
      displayName: 'CryptoWhale',
      joinedAt: new Date('2024-01-15'),
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      totalBets: 156,
      totalVolume: 45000,
      winRate: 62,
      balance: 12500,
      status: 'active',
      role: 'creator',
      flags: []
    },
    {
      id: '2',
      walletAddress: '0x8a4b6c3de7f89012345678901234567890abcdef',
      displayName: 'TruthSeeker',
      joinedAt: new Date('2024-03-20'),
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
      totalBets: 89,
      totalVolume: 15000,
      winRate: 55,
      balance: 3200,
      status: 'flagged',
      role: 'user',
      flags: ['Suspicious trading pattern', 'Multiple rapid trades']
    },
    {
      id: '3',
      walletAddress: '0x9c5d7e4fa8b9012345678901234567890123456',
      joinedAt: new Date('2024-06-10'),
      lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      totalBets: 23,
      totalVolume: 500,
      winRate: 45,
      balance: 0,
      status: 'banned',
      role: 'user',
      flags: ['Market manipulation', 'Terms violation']
    },
    {
      id: '4',
      walletAddress: '0xdef012345678901234567890123456789012345',
      displayName: 'VerifyPro',
      joinedAt: new Date('2024-02-01'),
      lastActive: new Date(Date.now() - 30 * 60 * 1000),
      totalBets: 234,
      totalVolume: 78000,
      winRate: 71,
      balance: 25000,
      status: 'active',
      role: 'admin',
      flags: []
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-600">Active</Badge>;
      case 'flagged': return <Badge className="bg-yellow-500 text-black">Flagged</Badge>;
      case 'banned': return <Badge variant="destructive">Banned</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin': return <Badge className="bg-purple-600">Super Admin</Badge>;
      case 'admin': return <Badge className="bg-[#06f6ff] text-black">Admin</Badge>;
      case 'creator': return <Badge variant="outline" className="text-blue-500 border-blue-500/30">Creator</Badge>;
      default: return null;
    }
  };

  const handleAction = () => {
    if (!actionDialog) return;

    switch (actionDialog.type) {
      case 'flag':
        toast.success(`User ${formatAddress(actionDialog.user.walletAddress)} flagged`);
        break;
      case 'ban':
        toast.success(`User ${formatAddress(actionDialog.user.walletAddress)} banned`);
        break;
      case 'role':
        toast.success(`Role updated for ${formatAddress(actionDialog.user.walletAddress)}`);
        break;
    }

    setActionDialog(null);
    setActionReason('');
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-[#06f6ff]/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Today</p>
                <p className="text-2xl font-bold">{users.filter(u => u.lastActive > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Flagged</p>
                <p className="text-2xl font-bold">{users.filter(u => u.status === 'flagged').length}</p>
              </div>
              <Flag className="h-8 w-8 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Banned</p>
                <p className="text-2xl font-bold">{users.filter(u => u.status === 'banned').length}</p>
              </div>
              <Ban className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#06f6ff]" />
                User Management
              </CardTitle>
              <CardDescription>View and manage platform users</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="flagged">Flagged</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      {user.displayName || formatAddress(user.walletAddress)}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {formatAddress(user.walletAddress)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(user.status)}
                    {getRoleBadge(user.role)}
                  </div>
                </div>

                {user.flags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {user.flags.map((flag, idx) => (
                      <Badge key={idx} variant="outline" className="text-yellow-500 border-yellow-500/30 text-xs">
                        {flag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Volume</p>
                    <p className="font-semibold">${user.totalVolume.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Win Rate</p>
                    <p className="font-semibold">{user.winRate}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last active: {formatTimeAgo(user.lastActive)}</span>
                  <span>Joined: {formatDate(user.joinedAt)}</span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setSelectedUser(user)}>
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  {user.status !== 'flagged' && user.status !== 'banned' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-yellow-500 border-yellow-500/30"
                      onClick={() => setActionDialog({ type: 'flag', user })}
                    >
                      <Flag className="h-3 w-3" />
                    </Button>
                  )}
                  {user.status !== 'banned' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setActionDialog({ type: 'ban', user })}
                    >
                      <Ban className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Win Rate</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {user.displayName || formatAddress(user.walletAddress)}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {formatAddress(user.walletAddress)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(user.status)}
                        {user.flags.length > 0 && (
                          <p className="text-xs text-yellow-500">{user.flags.length} flag(s)</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role) || <span className="text-muted-foreground">User</span>}</TableCell>
                    <TableCell>${user.totalVolume.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={user.winRate >= 50 ? 'text-green-500' : 'text-red-500'}>
                        {user.winRate}%
                      </span>
                    </TableCell>
                    <TableCell>${user.balance.toLocaleString()}</TableCell>
                    <TableCell>{formatTimeAgo(user.lastActive)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setActionDialog({ type: 'role', user })}>
                            <Shield className="h-4 w-4 mr-2" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status !== 'flagged' && user.status !== 'banned' && (
                            <DropdownMenuItem
                              className="text-yellow-500"
                              onClick={() => setActionDialog({ type: 'flag', user })}
                            >
                              <Flag className="h-4 w-4 mr-2" />
                              Flag User
                            </DropdownMenuItem>
                          )}
                          {user.status !== 'banned' && (
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={() => setActionDialog({ type: 'ban', user })}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Ban User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#06f6ff] to-[#0ea5e9] flex items-center justify-center text-2xl font-bold text-black">
                  {(selectedUser.displayName || selectedUser.walletAddress)[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {selectedUser.displayName || 'Anonymous User'}
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono">{selectedUser.walletAddress}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(selectedUser.status)}
                    {getRoleBadge(selectedUser.role)}
                  </div>
                </div>
              </div>

              {selectedUser.flags.length > 0 && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <h4 className="font-medium text-yellow-500 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Active Flags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.flags.map((flag, idx) => (
                      <Badge key={idx} variant="outline" className="text-yellow-500 border-yellow-500/30">
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Bets</p>
                  <p className="text-2xl font-bold">{selectedUser.totalBets}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Volume</p>
                  <p className="text-2xl font-bold">${selectedUser.totalVolume.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className={`text-2xl font-bold ${selectedUser.winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedUser.winRate}%
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="text-2xl font-bold">${selectedUser.balance.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p className="font-medium">{formatDate(selectedUser.joinedAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Active</p>
                  <p className="font-medium">{formatTimeAgo(selectedUser.lastActive)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => { setActionDialog(null); setActionReason(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionDialog?.type === 'flag' && <Flag className="h-5 w-5 text-yellow-500" />}
              {actionDialog?.type === 'ban' && <Ban className="h-5 w-5 text-red-500" />}
              {actionDialog?.type === 'role' && <Shield className="h-5 w-5 text-purple-500" />}
              {actionDialog?.type === 'flag' && 'Flag User'}
              {actionDialog?.type === 'ban' && 'Ban User'}
              {actionDialog?.type === 'role' && 'Change Role'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog?.type === 'flag' && 'Flag this user for suspicious activity. They will be reviewed.'}
              {actionDialog?.type === 'ban' && 'Ban this user from the platform. This action can be reversed.'}
              {actionDialog?.type === 'role' && 'Change the role and permissions for this user.'}
            </DialogDescription>
          </DialogHeader>
          {actionDialog && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  {actionDialog.user.displayName || formatAddress(actionDialog.user.walletAddress)}
                </p>
                <p className="text-xs text-muted-foreground font-mono">{actionDialog.user.walletAddress}</p>
              </div>

              {actionDialog.type === 'role' ? (
                <div>
                  <label className="text-sm font-medium">Select Role</label>
                  <select className="w-full mt-2 h-10 px-3 rounded-md border border-input bg-background text-sm">
                    <option value="user">User</option>
                    <option value="creator">Creator</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium">Reason</label>
                  <Textarea
                    placeholder={`Enter reason for ${actionDialog.type}...`}
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionDialog(null); setActionReason(''); }}>
              Cancel
            </Button>
            <Button
              className={
                actionDialog?.type === 'ban' ? '' :
                actionDialog?.type === 'flag' ? 'bg-yellow-500 text-black hover:bg-yellow-600' :
                'bg-purple-600 hover:bg-purple-700'
              }
              variant={actionDialog?.type === 'ban' ? 'destructive' : 'default'}
              onClick={handleAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersDashboard;
