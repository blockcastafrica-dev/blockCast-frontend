import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  TrendingUp,
  Gavel,
  Flag,
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

type MarketStatus = 'pending' | 'active' | 'expired' | 'disputable' | 'resolved';

interface Market {
  id: string;
  claim: string;
  description: string;
  category: string;
  creator: string;
  createdAt: Date;
  expiresAt: Date;
  status: MarketStatus;
  marketType: 'binary' | 'multiple_choice';
  totalVolume: number;
  participants: number;
  yesPool: number;
  noPool: number;
  resolution?: 'YES' | 'NO';
  resolvedAt?: Date;
  resolvedBy?: string;
  disputeStatus?: 'none' | 'pending' | 'resolved';
  disputeCount?: number;
}

const statusConfig: Record<MarketStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Approval Pending', color: 'bg-yellow-500 text-black', icon: Clock },
  active: { label: 'Active', color: 'bg-green-500 text-white', icon: TrendingUp },
  expired: { label: 'Expired', color: 'bg-orange-500 text-white', icon: Gavel },
  disputable: { label: 'Disputable', color: 'bg-purple-500 text-white', icon: Flag },
  resolved: { label: 'Resolved', color: 'bg-blue-500 text-white', icon: CheckCircle },
};

type SortColumn = 'volume' | 'participants' | 'expires' | 'status' | null;
type SortDirection = 'asc' | 'desc';

const MarketsDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MarketStatus | 'all'>('all');
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [viewMarket, setViewMarket] = useState<Market | null>(null);
  const [resolveMarket, setResolveMarket] = useState<Market | null>(null);
  const [disputeMarket, setDisputeMarket] = useState<Market | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject'; markets: string[] } | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Mock data - all markets in one place
  const allMarkets: Market[] = [
    // Pending markets
    {
      id: 'p1',
      claim: 'Will AI surpass human intelligence by 2030?',
      description: 'Market resolves YES if a generally recognized AI system demonstrates superhuman performance across all cognitive tasks.',
      category: 'Technology',
      creator: '0x7f3a...d4e5',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      expiresAt: new Date('2030-01-01'),
      status: 'pending',
      marketType: 'binary',
      totalVolume: 0,
      participants: 0,
      yesPool: 500,
      noPool: 500,
    },
    {
      id: 'p2',
      claim: 'Will Tesla stock reach $500 by Q2 2025?',
      description: 'Resolves YES if TSLA stock price reaches $500 at any point before June 30, 2025.',
      category: 'Finance',
      creator: '0x8a4b...e7f8',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      expiresAt: new Date('2025-06-30'),
      status: 'pending',
      marketType: 'binary',
      totalVolume: 0,
      participants: 0,
      yesPool: 250,
      noPool: 250,
    },
    // Active markets
    {
      id: 'a1',
      claim: 'Will Ethereum reach $5000 by March 2025?',
      description: 'Resolves YES if ETH price reaches $5000 at any point before March 31, 2025.',
      category: 'Crypto',
      creator: '0x9c5d...a8b9',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      expiresAt: new Date('2025-03-31'),
      status: 'active',
      marketType: 'binary',
      totalVolume: 12500,
      participants: 89,
      yesPool: 7500,
      noPool: 5000,
    },
    {
      id: 'a2',
      claim: 'Will the next iPhone have USB-C?',
      description: 'Resolves YES if Apple iPhone 17 series ships with USB-C connector.',
      category: 'Technology',
      creator: '0x1a2b...3c4d',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      expiresAt: new Date('2025-09-30'),
      status: 'active',
      marketType: 'binary',
      totalVolume: 8200,
      participants: 156,
      yesPool: 6500,
      noPool: 1700,
    },
    // Expired markets (awaiting resolution)
    {
      id: 'e1',
      claim: 'Will Bitcoin reach $100K in December 2024?',
      description: 'Resolves YES if BTC price reaches $100,000 at any point in December 2024.',
      category: 'Crypto',
      creator: '0x5e6f...7g8h',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      expiresAt: new Date('2024-12-31'),
      status: 'expired',
      marketType: 'binary',
      totalVolume: 15000,
      participants: 234,
      yesPool: 9000,
      noPool: 6000,
    },
    {
      id: 'e2',
      claim: 'Will the Fed cut rates in December 2024?',
      description: 'Resolves YES if Federal Reserve announces rate cut in December 2024 meeting.',
      category: 'Finance',
      creator: '0x9i0j...1k2l',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      expiresAt: new Date('2024-12-18'),
      status: 'expired',
      marketType: 'binary',
      totalVolume: 800,
      participants: 45,
      yesPool: 500,
      noPool: 300,
    },
    // Disputable markets (recently resolved, within dispute window)
    {
      id: 'd1',
      claim: 'Will Solana reach $300 by end of 2024?',
      description: 'Resolves YES if SOL price reaches $300 at any point before December 31, 2024.',
      category: 'Crypto',
      creator: '0x2b3c...4d5e',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      expiresAt: new Date('2024-12-31'),
      status: 'disputable',
      marketType: 'binary',
      totalVolume: 18500,
      participants: 178,
      yesPool: 8500,
      noPool: 10000,
      resolution: 'NO',
      resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      resolvedBy: '0x7f3a...d4e5',
      disputeStatus: 'none',
      disputeCount: 0,
    },
    {
      id: 'd2',
      claim: 'Will Netflix stock hit $800 in Q4 2024?',
      description: 'Resolves YES if NFLX stock price reaches $800 at any point in Q4 2024.',
      category: 'Finance',
      creator: '0x6f7g...8h9i',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      expiresAt: new Date('2024-12-31'),
      status: 'disputable',
      marketType: 'binary',
      totalVolume: 9200,
      participants: 67,
      yesPool: 6200,
      noPool: 3000,
      resolution: 'YES',
      resolvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      resolvedBy: '0x8a4b...e7f8',
      disputeStatus: 'pending',
      disputeCount: 1,
    },
    // Resolved markets
    {
      id: 'r1',
      claim: 'Will Trump win the 2024 US Election?',
      description: 'Resolves YES if Donald Trump wins the 2024 US Presidential Election.',
      category: 'Politics',
      creator: '0x3m4n...5o6p',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      expiresAt: new Date('2024-11-05'),
      status: 'resolved',
      marketType: 'binary',
      totalVolume: 45000,
      participants: 512,
      yesPool: 28000,
      noPool: 17000,
      resolution: 'YES',
      resolvedAt: new Date('2024-11-06'),
      resolvedBy: '0x7f3a...d4e5',
      disputeStatus: 'none',
      disputeCount: 0,
    },
    {
      id: 'r2',
      claim: 'Will Apple release Vision Pro in 2024?',
      description: 'Resolves YES if Apple Vision Pro ships to consumers in 2024.',
      category: 'Technology',
      creator: '0x7q8r...9s0t',
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      expiresAt: new Date('2024-12-31'),
      status: 'resolved',
      marketType: 'binary',
      totalVolume: 22000,
      participants: 287,
      yesPool: 18000,
      noPool: 4000,
      resolution: 'YES',
      resolvedAt: new Date('2024-02-02'),
      resolvedBy: '0x8a4b...e7f8',
      disputeStatus: 'resolved',
      disputeCount: 2,
    },
  ];

  const filteredMarkets = allMarkets.filter(market => {
    const matchesSearch = market.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || market.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort markets
  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    if (!sortColumn) return 0;

    let comparison = 0;
    switch (sortColumn) {
      case 'volume':
        comparison = a.totalVolume - b.totalVolume;
        break;
      case 'participants':
        comparison = a.participants - b.participants;
        break;
      case 'expires':
        comparison = a.expiresAt.getTime() - b.expiresAt.getTime();
        break;
      case 'status':
        const statusOrder = { pending: 0, active: 1, expired: 2, disputable: 3, resolved: 4 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const statusCounts = {
    all: allMarkets.length,
    pending: allMarkets.filter(m => m.status === 'pending').length,
    active: allMarkets.filter(m => m.status === 'active').length,
    expired: allMarkets.filter(m => m.status === 'expired').length,
    disputable: allMarkets.filter(m => m.status === 'disputable').length,
    resolved: allMarkets.filter(m => m.status === 'resolved').length,
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const selectableIds = sortedMarkets
        .filter(m => m.status === 'pending')
        .map(m => m.id);
      setSelectedMarkets(selectableIds);
    } else {
      setSelectedMarkets([]);
    }
  };

  const handleSelectMarket = (marketId: string, checked: boolean) => {
    if (checked) {
      setSelectedMarkets(prev => [...prev, marketId]);
    } else {
      setSelectedMarkets(prev => prev.filter(id => id !== marketId));
    }
  };

  const handleBatchAction = (action: 'approve' | 'reject') => {
    if (selectedMarkets.length === 0) {
      toast.error('No markets selected');
      return;
    }
    setConfirmAction({ type: action, markets: selectedMarkets });
  };

  const executeAction = () => {
    if (!confirmAction) return;
    toast.success(`${confirmAction.type === 'approve' ? 'Approved' : 'Rejected'} ${confirmAction.markets.length} market(s)`);
    setSelectedMarkets([]);
    setConfirmAction(null);
  };

  const executeResolution = (outcome: 'YES' | 'NO') => {
    if (!resolveMarket) return;
    toast.success(`Market resolved as ${outcome}`);
    setResolveMarket(null);
  };

  const handleInitiateDispute = () => {
    if (!disputeReason.trim()) {
      toast.error('Please provide a reason for the dispute');
      return;
    }
    toast.success('Dispute filed successfully');
    setDisputeMarket(null);
    setDisputeReason('');
  };

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${month}/${day.toString().padStart(2, '0')}/${year}`;
  };

  const getActionButton = (market: Market) => {
    switch (market.status) {
      case 'pending':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-7 px-4 cursor-pointer font-medium"
              style={{ backgroundColor: '#16a34a', color: 'white' }}
              onClick={() => setConfirmAction({ type: 'approve', markets: [market.id] })}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 px-4 cursor-pointer font-medium"
              onClick={() => setConfirmAction({ type: 'reject', markets: [market.id] })}
            >
              Reject
            </Button>
          </div>
        );
      case 'expired':
        return (
          <Button
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 h-7"
            onClick={() => setResolveMarket(market)}
          >
            <Gavel className="h-3 w-3 mr-1" />
            Resolve
          </Button>
        );
      case 'disputable':
        return market.disputeStatus === 'pending' ? (
          <Button size="sm" variant="outline" className="h-7 text-yellow-500 border-yellow-500/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Review
          </Button>
        ) : (
          <Button
            size="sm"
            className="bg-purple-500 hover:bg-purple-600 h-7"
            onClick={() => setDisputeMarket(market)}
          >
            <Flag className="h-3 w-3 mr-1" />
            Dispute
          </Button>
        );
      case 'resolved':
        return market.disputeStatus !== 'pending' ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-7"
            onClick={() => setDisputeMarket(market)}
          >
            <Flag className="h-3 w-3" />
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="h-7 text-yellow-500 border-yellow-500/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Review
          </Button>
        );
      default:
        return (
          <Button size="sm" variant="ghost" className="h-7" onClick={() => setViewMarket(market)}>
            <Eye className="h-3 w-3" />
          </Button>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <CardTitle>All Markets</CardTitle>

            {/* Status filter tabs */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'pending', 'active', 'expired', 'disputable', 'resolved'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-[#06f6ff]/10 text-[#06f6ff] border border-[#06f6ff]/30'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {status === 'all' ? 'All' : statusConfig[status].label}
                  <span className="ml-2 text-xs opacity-70">({statusCounts[status]})</span>
                </button>
              ))}
            </div>

            {/* Search, sort, and batch actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    Sort by: {sortColumn ? sortColumn.charAt(0).toUpperCase() + sortColumn.slice(1) : 'Default'}
                    {sortColumn && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setSortColumn(null); }}>
                    Default
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('status')}>
                    Status {sortColumn === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('volume')}>
                    Volume {sortColumn === 'volume' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('participants')}>
                    Participants {sortColumn === 'participants' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('expires')}>
                    Expires {sortColumn === 'expires' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {selectedMarkets.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedMarkets.length} selected</Badge>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleBatchAction('approve')}>
                    Approve All
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleBatchAction('reject')}>
                    Reject All
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {sortedMarkets.map((market) => {
              const StatusIcon = statusConfig[market.status].icon;
              return (
                <div key={market.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {market.status === 'pending' && (
                      <Checkbox
                        checked={selectedMarkets.includes(market.id)}
                        onCheckedChange={(checked) => handleSelectMarket(market.id, checked as boolean)}
                        className="mt-1"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{market.claim}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge className={statusConfig[market.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[market.status].label}
                        </Badge>
                        <Badge variant="outline">{market.category}</Badge>
                        {market.resolution && (
                          <Badge className={market.resolution === 'YES' ? 'bg-green-600' : 'bg-red-600'}>
                            {market.resolution}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Volume</p>
                      <p className="font-semibold">${market.totalVolume.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Participants</p>
                      <p className="font-semibold">{market.participants}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expires</p>
                      <p className="font-semibold">{formatDate(market.expiresAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      {market.status === 'resolved' ? `Resolved ${formatTimeAgo(market.resolvedAt!)}` : `Created ${formatTimeAgo(market.createdAt)}`}
                    </span>
                    {getActionButton(market)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    {statusFilter === 'pending' && (
                      <Checkbox
                        checked={selectedMarkets.length === sortedMarkets.filter(m => m.status === 'pending').length && selectedMarkets.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    )}
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="min-w-[300px]">Market</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>
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
                  <TableHead>
                    <button
                      onClick={() => handleSort('participants')}
                      className={`flex items-center gap-1 transition-colors hover:text-[#06f6ff] ${sortColumn === 'participants' ? 'text-[#06f6ff]' : ''}`}
                    >
                      Participants
                      <span className={sortColumn === 'participants' ? 'text-[#06f6ff]' : 'opacity-50'}>
                        {sortColumn === 'participants' ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
                      </span>
                    </button>
                  </TableHead>
                  <TableHead>YES/NO</TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('expires')}
                      className={`flex items-center gap-1 transition-colors hover:text-[#06f6ff] ${sortColumn === 'expires' ? 'text-[#06f6ff]' : ''}`}
                    >
                      Expires
                      <span className={sortColumn === 'expires' ? 'text-[#06f6ff]' : 'opacity-50'}>
                        {sortColumn === 'expires' ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
                      </span>
                    </button>
                  </TableHead>
                  <TableHead>Resolution</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMarkets.map((market) => {
                  const StatusIcon = statusConfig[market.status].icon;
                  const yesPercent = market.totalVolume > 0
                    ? Math.round((market.yesPool / (market.yesPool + market.noPool)) * 100)
                    : 50;

                  return (
                    <TableRow key={market.id}>
                      <TableCell>
                        {market.status === 'pending' && (
                          <Checkbox
                            checked={selectedMarkets.includes(market.id)}
                            onCheckedChange={(checked) => handleSelectMarket(market.id, checked as boolean)}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[market.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[market.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="font-medium text-sm truncate">{market.claim}</p>
                          <p className="text-xs text-muted-foreground truncate">{market.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{market.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${market.totalVolume.toLocaleString()}
                      </TableCell>
                      <TableCell>{market.participants}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${yesPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{yesPercent}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatDate(market.expiresAt)}</span>
                      </TableCell>
                      <TableCell>
                        {market.resolution ? (
                          <div className="flex flex-col gap-1">
                            <Badge className={market.resolution === 'YES' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                              {market.resolution}
                            </Badge>
                            {market.disputeStatus === 'pending' && (
                              <Badge className="bg-yellow-500 text-black text-xs">
                                {market.disputeCount} dispute(s)
                              </Badge>
                            )}
                            {market.resolvedAt && (
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(market.resolvedAt)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setViewMarket(market)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          {getActionButton(market)}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {sortedMarkets.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No markets found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Market Dialog */}
      <Dialog open={!!viewMarket} onOpenChange={() => setViewMarket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Market Details</DialogTitle>
          </DialogHeader>
          {viewMarket && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={statusConfig[viewMarket.status].color}>
                  {statusConfig[viewMarket.status].label}
                </Badge>
                <Badge variant="outline">{viewMarket.category}</Badge>
                {viewMarket.resolution && (
                  <Badge className={viewMarket.resolution === 'YES' ? 'bg-green-600' : 'bg-red-600'}>
                    Resolved: {viewMarket.resolution}
                  </Badge>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Claim</label>
                <p className="mt-1 font-medium">{viewMarket.claim}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1 text-sm">{viewMarket.description}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Volume</label>
                  <p className="mt-1 font-semibold">${viewMarket.totalVolume.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Participants</label>
                  <p className="mt-1 font-semibold">{viewMarket.participants}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">YES Pool</label>
                  <p className="mt-1 font-semibold text-green-500">${viewMarket.yesPool.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">NO Pool</label>
                  <p className="mt-1 font-semibold text-red-500">${viewMarket.noPool.toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Creator</label>
                  <p className="mt-1 font-mono text-sm">{viewMarket.creator}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expires</label>
                  <p className="mt-1">{formatDate(viewMarket.expiresAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewMarket(null)}>Close</Button>
            {viewMarket?.status === 'pending' && (
              <>
                <Button className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button variant="destructive">
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
            {viewMarket?.status === 'expired' && (
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => { setViewMarket(null); setResolveMarket(viewMarket); }}>
                <Gavel className="h-4 w-4 mr-1" />
                Resolve Market
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Market Dialog */}
      <Dialog open={!!resolveMarket} onOpenChange={() => setResolveMarket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-orange-500" />
              Resolve Market
            </DialogTitle>
            {resolveMarket && resolveMarket.totalVolume > 1000 && (
              <DialogDescription className="text-yellow-500">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                High-volume market (&gt;$1,000). Additional verification required.
              </DialogDescription>
            )}
          </DialogHeader>
          {resolveMarket && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Market</label>
                <p className="mt-1 font-medium">{resolveMarket.claim}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-muted-foreground text-sm">YES Pool</p>
                  <p className="text-xl font-bold text-green-500">${resolveMarket.yesPool.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-muted-foreground text-sm">NO Pool</p>
                  <p className="text-xl font-bold text-red-500">${resolveMarket.noPool.toLocaleString()}</p>
                </div>
              </div>
              {resolveMarket.totalVolume > 1000 && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-500">
                    This action will distribute ${resolveMarket.totalVolume.toLocaleString()} to {resolveMarket.participants} participants.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setResolveMarket(null)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => executeResolution('YES')}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Resolve YES
            </Button>
            <Button variant="destructive" onClick={() => executeResolution('NO')}>
              <XCircle className="h-4 w-4 mr-1" />
              Resolve NO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={!!disputeMarket} onOpenChange={() => { setDisputeMarket(null); setDisputeReason(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-yellow-500" />
              File Dispute
            </DialogTitle>
            <DialogDescription>
              Submit a dispute for review. Payouts will be paused until resolved.
            </DialogDescription>
          </DialogHeader>
          {disputeMarket && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">{disputeMarket.claim}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">Current Resolution:</span>
                  <Badge className={disputeMarket.resolution === 'YES' ? 'bg-green-600' : 'bg-red-600'}>
                    {disputeMarket.resolution}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Reason for Dispute</label>
                <Textarea
                  placeholder="Provide detailed reasoning..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDisputeMarket(null); setDisputeReason(''); }}>Cancel</Button>
            <Button className="bg-yellow-500 text-black hover:bg-yellow-600" onClick={handleInitiateDispute}>
              <Flag className="h-4 w-4 mr-1" />
              Submit Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Action Confirmation */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === 'approve' ? 'Approve' : 'Reject'} {confirmAction?.markets.length} Markets?
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === 'approve'
                ? 'These markets will be deployed and available for trading immediately.'
                : 'These markets will be rejected and creators notified.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button
              className={confirmAction?.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={confirmAction?.type === 'reject' ? 'destructive' : 'default'}
              onClick={executeAction}
            >
              Confirm {confirmAction?.type === 'approve' ? 'Approval' : 'Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketsDashboard;
