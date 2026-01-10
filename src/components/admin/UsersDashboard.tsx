import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  ArrowUpDown,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserCheck,
  UserX,
  Calendar,
  Wallet,
  Target,
  Award
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
  role: 'user' | 'admin';
  flags: string[];
}

type SortColumn = 'volume' | 'winRate' | 'balance' | 'lastActive' | null;
type SortDirection = 'asc' | 'desc';

const UsersDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionDialog, setActionDialog] = useState<{ type: 'flag' | 'ban' | 'role'; user: User } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'flagged' | 'banned'>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

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
      role: 'user',
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

  // Calculate summary stats
  const summaryStats = {
    totalVolume: users.reduce((sum, u) => sum + u.totalVolume, 0),
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
    avgWinRate: Math.round(users.reduce((sum, u) => sum + u.winRate, 0) / users.length),
    activeToday: users.filter(u => u.lastActive > new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
  };

  const statusCounts = {
    all: users.length,
    active: users.filter(u => u.status === 'active').length,
    flagged: users.filter(u => u.status === 'flagged').length,
    banned: users.filter(u => u.status === 'banned').length,
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortColumn) return 0;

    let comparison = 0;
    switch (sortColumn) {
      case 'volume':
        comparison = a.totalVolume - b.totalVolume;
        break;
      case 'winRate':
        comparison = a.winRate - b.winRate;
        break;
      case 'balance':
        comparison = a.balance - b.balance;
        break;
      case 'lastActive':
        comparison = a.lastActive.getTime() - b.lastActive.getTime();
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

  const handleFilterChange = (status: 'all' | 'active' | 'flagged' | 'banned') => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(sortedUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const exportToExcel = () => {
    const exportData = sortedUsers.map(user => ({
      'Display Name': user.displayName || '-',
      'Wallet Address': user.walletAddress,
      'Status': user.status.charAt(0).toUpperCase() + user.status.slice(1),
      'Role': user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' '),
      'Total Bets': user.totalBets,
      'Total Volume ($)': user.totalVolume,
      'Win Rate (%)': user.winRate,
      'Balance ($)': user.balance,
      'Flags': user.flags.join(', ') || '-',
      'Joined': formatDate(user.joinedAt),
      'Last Active': formatDate(user.lastActive),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `users_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Users exported to Excel');
  };

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
      case 'admin': return <Badge className="bg-[#06f6ff] font-semibold" style={{ color: '#000000' }}>Admin</Badge>;
      case 'user': return <span className="text-muted-foreground text-sm">User</span>;
      default: return <span className="text-muted-foreground text-sm">User</span>;
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
      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#06f6ff]/10 to-transparent border-[#06f6ff]/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold text-[#06f6ff]">${summaryStats.totalVolume.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#06f6ff]/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-[#06f6ff]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Today</p>
                <p className="text-2xl font-bold text-green-500">{summaryStats.activeToday}</p>
                <p className="text-xs text-muted-foreground">of {users.length} users</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Flagged Users</p>
                <p className="text-2xl font-bold text-yellow-500">{statusCounts.flagged}</p>
                <p className="text-xs text-muted-foreground">Needs review</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Flag className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Banned</p>
                <p className="text-2xl font-bold text-red-500">{statusCounts.banned}</p>
                <p className="text-xs text-muted-foreground">Suspended accounts</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Ban className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <CardTitle>User Management</CardTitle>

            {/* Status filter tabs */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'active', 'flagged', 'banned'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === status
                      ? status === 'flagged' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                      : status === 'banned' ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                      : status === 'active' ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                      : 'bg-[#06f6ff]/10 text-[#06f6ff] border border-[#06f6ff]/30'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {status === 'all' ? 'All Users' : status.charAt(0).toUpperCase() + status.slice(1)}
                  <span className="ml-2 text-xs opacity-70">({statusCounts[status]})</span>
                </button>
              ))}
            </div>

            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className={`h-9 gap-2 ${filterRole !== 'all' ? 'border-[#06f6ff]/50 text-[#06f6ff]' : ''}`}>
                    <Filter className="h-4 w-4" />
                    {filterRole === 'all' ? 'All Roles' : filterRole.charAt(0).toUpperCase() + filterRole.slice(1).replace('_', ' ')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterRole('all')}>All Roles</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRole('user')}>User</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRole('admin')}>Admin</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    Sort: {sortColumn ? sortColumn.charAt(0).toUpperCase() + sortColumn.slice(1).replace(/([A-Z])/g, ' $1') : 'Default'}
                    {sortColumn && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortColumn(null)}>Default</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('volume')}>
                    Volume {sortColumn === 'volume' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('winRate')}>
                    Win Rate {sortColumn === 'winRate' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('balance')}>
                    Balance {sortColumn === 'balance' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('lastActive')}>
                    Last Active {sortColumn === 'lastActive' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2"
                onClick={exportToExcel}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              {selectedUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedUsers.length} selected</Badge>
                  <Button size="sm" variant="destructive" onClick={() => toast.success(`Banned ${selectedUsers.length} user(s)`)}>
                    Ban Selected
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {paginatedUsers.map((user) => (
              <div key={user.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#06f6ff] to-[#0ea5e9] flex items-center justify-center text-sm font-bold text-black flex-shrink-0">
                    {(user.displayName || user.walletAddress)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
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
                  <div className="p-2 bg-yellow-500/10 rounded border border-yellow-500/30">
                    <p className="text-xs text-yellow-500 font-medium mb-1">{user.flags.length} Flag(s):</p>
                    <div className="flex flex-wrap gap-1">
                      {user.flags.map((flag, idx) => (
                        <Badge key={idx} variant="outline" className="text-yellow-500 border-yellow-500/30 text-xs">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <p className="text-muted-foreground">Volume</p>
                    <p className="font-semibold">${user.totalVolume.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <p className="text-muted-foreground">Win Rate</p>
                    <p className={`font-semibold ${user.winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>{user.winRate}%</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <p className="text-muted-foreground">Balance</p>
                    <p className="font-semibold">${user.balance.toLocaleString()}</p>
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActionDialog({ type: 'role', user })}
                  >
                    <Shield className="h-3 w-3" />
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
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedUsers.length === sortedUsers.length && sortedUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px]">Role</TableHead>
                  <TableHead className="w-[100px]">
                    <button
                      onClick={() => handleSort('volume')}
                      className={`flex items-center gap-1 transition-colors hover:text-[#06f6ff] ${sortColumn === 'volume' ? 'text-[#06f6ff]' : ''}`}
                    >
                      Volume
                      <span className={sortColumn === 'volume' ? 'text-[#06f6ff]' : 'opacity-50'}>
                        {sortColumn === 'volume' ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
                      </span>
                    </button>
                  </TableHead>
                  <TableHead className="w-[80px]">
                    <button
                      onClick={() => handleSort('winRate')}
                      className={`flex items-center gap-1 transition-colors hover:text-[#06f6ff] ${sortColumn === 'winRate' ? 'text-[#06f6ff]' : ''}`}
                    >
                      Win Rate
                      <span className={sortColumn === 'winRate' ? 'text-[#06f6ff]' : 'opacity-50'}>
                        {sortColumn === 'winRate' ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
                      </span>
                    </button>
                  </TableHead>
                  <TableHead className="w-[100px]">
                    <button
                      onClick={() => handleSort('balance')}
                      className={`flex items-center gap-1 transition-colors hover:text-[#06f6ff] ${sortColumn === 'balance' ? 'text-[#06f6ff]' : ''}`}
                    >
                      Balance
                      <span className={sortColumn === 'balance' ? 'text-[#06f6ff]' : 'opacity-50'}>
                        {sortColumn === 'balance' ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
                      </span>
                    </button>
                  </TableHead>
                  <TableHead className="w-[60px]">Bets</TableHead>
                  <TableHead className="w-[80px]">Avg Bet</TableHead>
                  <TableHead className="w-[100px]">
                    <button
                      onClick={() => handleSort('lastActive')}
                      className={`flex items-center gap-1 transition-colors hover:text-[#06f6ff] ${sortColumn === 'lastActive' ? 'text-[#06f6ff]' : ''}`}
                    >
                      Last Active
                      <span className={sortColumn === 'lastActive' ? 'text-[#06f6ff]' : 'opacity-50'}>
                        {sortColumn === 'lastActive' ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
                      </span>
                    </button>
                  </TableHead>
                  <TableHead className="w-[140px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="border-b border-border/30 hover:bg-muted/30">
                    <TableCell className="py-4">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#06f6ff] to-[#0ea5e9] flex items-center justify-center text-sm font-bold text-black flex-shrink-0">
                          {(user.displayName || user.walletAddress)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {user.displayName || formatAddress(user.walletAddress)}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {formatAddress(user.walletAddress)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        {getStatusBadge(user.status)}
                        {user.flags.length > 0 && (
                          <p className="text-xs text-yellow-500 cursor-pointer hover:underline" onClick={() => setSelectedUser(user)}>
                            {user.flags.length} flag(s)
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">{getRoleBadge(user.role) || <span className="text-muted-foreground text-sm">User</span>}</TableCell>
                    <TableCell className="py-4">
                      <span className="font-semibold text-sm">${user.totalVolume.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className={`font-semibold text-sm ${user.winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                        {user.winRate}%
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="font-semibold text-sm">${user.balance.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm">{user.totalBets}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm">${user.totalBets > 0 ? Math.round(user.totalVolume / user.totalBets).toLocaleString() : 0}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm text-muted-foreground">{formatTimeAgo(user.lastActive)}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={() => setSelectedUser(user)}>
                          View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="z-[100]">
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
                            {user.status === 'flagged' && (
                              <DropdownMenuItem
                                className="text-green-500"
                                onClick={() => toast.success(`Cleared flags for ${formatAddress(user.walletAddress)}`)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Clear Flags
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
                            {user.status === 'banned' && (
                              <DropdownMenuItem
                                className="text-green-500"
                                onClick={() => toast.success(`Unbanned ${formatAddress(user.walletAddress)}`)}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Unban User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {sortedUsers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {sortedUsers.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, sortedUsers.length)} of {sortedUsers.length} users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 p-0 ${currentPage === page ? 'bg-[#06f6ff] text-black hover:bg-[#06f6ff]/90' : ''}`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          {selectedUser && (
            <div className="space-y-4">
              {/* Header with avatar and badges */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#06f6ff] to-[#0ea5e9] flex items-center justify-center text-xl font-bold text-black flex-shrink-0">
                  {(selectedUser.displayName || selectedUser.walletAddress)[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold truncate">
                    {selectedUser.displayName || 'Anonymous User'}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono truncate">{selectedUser.walletAddress}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(selectedUser.status)}
                    {getRoleBadge(selectedUser.role)}
                  </div>
                </div>
              </div>

              {/* Flags Section */}
              {selectedUser.flags.length > 0 && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-500 font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Active Flags ({selectedUser.flags.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.flags.map((flag, idx) => (
                      <Badge key={idx} variant="outline" className="text-yellow-500 border-yellow-500/30 text-xs">
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Bets</p>
                  <p className="font-bold text-sm">{selectedUser.totalBets}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Volume</p>
                  <p className="font-bold text-sm">${selectedUser.totalVolume.toLocaleString()}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                  <p className={`font-bold text-sm ${selectedUser.winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedUser.winRate}%
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Balance</p>
                  <p className="font-bold text-sm">${selectedUser.balance.toLocaleString()}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Joined</span>
                  <p className="font-medium">{formatDate(selectedUser.joinedAt)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Active</span>
                  <p className="font-medium">{formatTimeAgo(selectedUser.lastActive)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg Bet Size</span>
                  <p className="font-medium">${selectedUser.totalBets > 0 ? Math.round(selectedUser.totalVolume / selectedUser.totalBets).toLocaleString() : 0}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Profit/Loss</span>
                  <p className={`font-medium ${selectedUser.winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedUser.winRate >= 50 ? '+' : '-'}${Math.abs(Math.round(selectedUser.totalVolume * (selectedUser.winRate - 50) / 100)).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedUser(null)}>Close</Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setSelectedUser(null); setActionDialog({ type: 'role', user: selectedUser }); }}
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Role
                </Button>
                {selectedUser.status !== 'banned' && (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => { setSelectedUser(null); setActionDialog({ type: 'ban', user: selectedUser }); }}
                  >
                    <Ban className="h-4 w-4 mr-1" />
                    Ban
                  </Button>
                )}
                {selectedUser.status === 'banned' && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => { toast.success(`Unbanned ${formatAddress(selectedUser.walletAddress)}`); setSelectedUser(null); }}
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    Unban
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => { setActionDialog(null); setActionReason(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionDialog?.type === 'flag' && <Flag className="h-5 w-5 text-yellow-500" />}
              {actionDialog?.type === 'ban' && <Ban className="h-5 w-5 text-red-500" />}
              {actionDialog?.type === 'role' && <Shield className="h-5 w-5 text-[#06f6ff]" />}
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
              {/* User Info Card */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#06f6ff] to-[#0ea5e9] flex items-center justify-center text-sm font-bold text-black">
                    {(actionDialog.user.displayName || actionDialog.user.walletAddress)[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {actionDialog.user.displayName || formatAddress(actionDialog.user.walletAddress)}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">{formatAddress(actionDialog.user.walletAddress)}</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span>Volume: ${actionDialog.user.totalVolume.toLocaleString()}</span>
                  <span>Win Rate: {actionDialog.user.winRate}%</span>
                </div>
              </div>

              {actionDialog.type === 'role' ? (
                <div>
                  <label className="text-sm font-medium">Select Role</label>
                  <select
                    className="w-full mt-2 h-10 px-3 rounded-md border border-input bg-background text-sm"
                    defaultValue={actionDialog.user.role}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-2">
                    Current role: {actionDialog.user.role.charAt(0).toUpperCase() + actionDialog.user.role.slice(1).replace('_', ' ')}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium">Reason *</label>
                  <Textarea
                    placeholder={
                      actionDialog.type === 'flag'
                        ? 'e.g., Suspicious trading pattern, multiple rapid trades...'
                        : 'e.g., Terms violation, market manipulation...'
                    }
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>
              )}

              {actionDialog.type === 'ban' && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-500 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    This user will be immediately logged out and blocked from the platform.
                  </p>
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
                actionDialog?.type === 'flag' ? 'bg-yellow-500 text-black hover:bg-yellow-600 font-semibold' :
                'bg-[#06f6ff] text-black hover:bg-[#06f6ff]/90 font-semibold'
              }
              variant={actionDialog?.type === 'ban' ? 'destructive' : 'default'}
              onClick={handleAction}
            >
              {actionDialog?.type === 'flag' && (
                <>
                  <Flag className="h-4 w-4 mr-1" />
                  Flag User
                </>
              )}
              {actionDialog?.type === 'ban' && (
                <>
                  <Ban className="h-4 w-4 mr-1" />
                  Ban User
                </>
              )}
              {actionDialog?.type === 'role' && (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Update Role
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersDashboard;
