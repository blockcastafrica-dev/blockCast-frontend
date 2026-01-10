import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  treasuryService,
  marketPoolService,
  payoutService,
  multiSigService,
  treasuryTestHelper,
  getTreasuryStats,
  getTransactions,
  getFeeConfig,
  updateFeeConfig,
  getPendingPayouts,
  processPayout,
  processAllPendingPayouts,
  cancelPayout,
  getPoolStats,
  getMultiSigConfig,
  getPendingWithdrawalRequests,
  createWithdrawalRequest,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
  cancelWithdrawalRequest,
  getMultiSigStats,
  Transaction as TreasuryTransaction,
  TreasuryStats,
  FeeConfig,
  WithdrawalRequest,
  MultiSigConfig,
} from '@/services/treasury';

// Make test helper available in browser console
if (typeof window !== 'undefined') {
  (window as any).treasuryTest = treasuryTestHelper;
  (window as any).multiSigService = multiSigService;
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  Percent,
  ArrowUpDown,
  ExternalLink,
  Banknote,
  CreditCard,
  Eye,
  XCircle,
  FileText,
  Calendar,
  Settings,
  Play,
  MoreVertical,
  Copy,
  Check,
  Shield,
  Users,
  ThumbsUp,
  ThumbsDown,
  UserCheck,
  Timer,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'fee' | 'payout' | 'deposit' | 'withdrawal';
  amount: number;
  from?: string;
  to?: string;
  timestamp: Date;
  marketId?: string;
  marketClaim?: string;
  status: 'completed' | 'pending' | 'processing';
  txHash?: string;
}

type TransactionFilter = 'all' | 'fee' | 'payout' | 'deposit' | 'withdrawal';
type SortColumn = 'amount' | 'timestamp' | null;
type SortDirection = 'asc' | 'desc';

const TreasuryDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactionFilter, setTransactionFilter] = useState<TransactionFilter>('all');
  const [sortColumn, setSortColumn] = useState<SortColumn>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [processPayoutsDialog, setProcessPayoutsDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [processSinglePayout, setProcessSinglePayout] = useState<Transaction | null>(null);
  const [cancelPayoutDialog, setCancelPayoutDialog] = useState<Transaction | null>(null);
  const [reportDialog, setReportDialog] = useState(false);
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'tax'>('summary');
  const [reportDateRange, setReportDateRange] = useState<'7d' | '30d' | '90d' | 'year' | 'all'>('30d');
  const [adjustFeeDialog, setAdjustFeeDialog] = useState(false);
  const [newFeeRate, setNewFeeRate] = useState('2.5');
  const [refreshKey, setRefreshKey] = useState(0);
  const [tvlPeriod, setTvlPeriod] = useState<'7d' | '30d' | '90d' | 'all' | 'custom'>('all');
  const transactionsPerPage = 10;

  // Multi-sig state
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawDescription, setWithdrawDescription] = useState('');
  const [categoryDateRange, setCategoryDateRange] = useState<'7d' | '30d' | '90d' | 'all' | 'custom'>('all');
  const [categoryCustomDateFrom, setCategoryCustomDateFrom] = useState<Date | undefined>(undefined);
  const [categoryCustomDateTo, setCategoryCustomDateTo] = useState<Date | undefined>(undefined);
  const [categoryDatePopoverOpen, setCategoryDatePopoverOpen] = useState(false);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [multiSigConfig, setMultiSigConfig] = useState<MultiSigConfig | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [approveDialog, setApproveDialog] = useState<WithdrawalRequest | null>(null);
  const [rejectDialog, setRejectDialog] = useState<WithdrawalRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [currentSignerId, setCurrentSignerId] = useState('signer-1'); // In real app, get from auth

  // Get real data from treasury services
  const [treasuryStats, setTreasuryStats] = useState<TreasuryStats | null>(null);
  const [feeConfig, setFeeConfig] = useState<FeeConfig | null>(null);
  const [allTransactions, setAllTransactions] = useState<TreasuryTransaction[]>([]);

  // Load data on mount and when refreshKey changes
  useEffect(() => {
    const stats = getTreasuryStats();
    const config = getFeeConfig();
    const txs = getTransactions();
    const msConfig = getMultiSigConfig();
    const pendingWRs = getPendingWithdrawalRequests();

    setTreasuryStats(stats);
    setFeeConfig(config);
    setAllTransactions(txs);
    setMultiSigConfig(msConfig);
    setPendingWithdrawals(pendingWRs);
    setNewFeeRate((config.platformFeeRate * 100).toFixed(1));
  }, [refreshKey]);

  // Calculate treasury data from real services
  const poolStats = getPoolStats();

  // Calculate fees today and yesterday for comparison
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

  const feesToday = allTransactions
    .filter(tx => tx.type === 'fee' && new Date(tx.createdAt) >= todayStart)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const feesYesterday = allTransactions
    .filter(tx => {
      const txDate = new Date(tx.createdAt);
      return tx.type === 'fee' && txDate >= yesterdayStart && txDate < todayStart;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  const feesChangePercent = feesYesterday > 0
    ? ((feesToday - feesYesterday) / feesYesterday) * 100
    : feesToday > 0 ? 100 : 0;

  const treasuryData = {
    totalBalance: treasuryStats?.totalBalance || 0,
    feesToday,
    feesYesterday,
    feesChangePercent,
    pendingPayouts: treasuryStats?.pendingPayouts || 0,
    pendingPayoutsCount: treasuryStats?.pendingPayoutsCount || 0,
    monthlyRevenue: treasuryStats?.last24hFees ? treasuryStats.last24hFees * 30 : 0,
    weeklyVolume: treasuryStats?.last24hVolume ? treasuryStats.last24hVolume * 7 : 0,
    avgDailyVolume: treasuryStats?.last24hVolume || 0,
    totalUsers: JSON.parse(localStorage.getItem('blockcast_users') || '[]').length,
    activeMarkets: poolStats.activePools,
    feeRate: feeConfig ? feeConfig.platformFeeRate * 100 : 2.5,
    profitMargin: treasuryStats?.totalVolume && treasuryStats.totalVolume > 0
      ? (treasuryStats.totalFeesCollected / treasuryStats.totalVolume) * 100
      : 0,
    avgTransactionSize: allTransactions.length > 0
      ? allTransactions.reduce((sum, t) => sum + t.amount, 0) / allTransactions.length
      : 0,
    totalTransactions: treasuryStats?.totalTransactions || 0,
    totalMarketPoolValue: poolStats.totalValueLocked,
  };

  const revenueData = [
    { month: 'Jul', revenue: 5200, volume: 32000 },
    { month: 'Aug', revenue: 6100, volume: 38000 },
    { month: 'Sep', revenue: 7300, volume: 45000 },
    { month: 'Oct', revenue: 6800, volume: 42000 },
    { month: 'Nov', revenue: 8100, volume: 52000 },
    { month: 'Dec', revenue: 8500, volume: 58000 },
  ];

  // Convert treasury transactions to display format
  const transactions: Transaction[] = allTransactions.map(tx => ({
    id: tx.id,
    type: tx.type as Transaction['type'],
    amount: tx.amount,
    from: tx.from || undefined,
    to: tx.to || undefined,
    timestamp: new Date(tx.createdAt),
    marketId: tx.marketId || undefined,
    marketClaim: tx.description || undefined,
    status: tx.status as Transaction['status'],
    txHash: tx.txHash || undefined,
  }));

  // Calculate category breakdown from markets and pools
  const markets = JSON.parse(localStorage.getItem('blockcast_markets') || '[]');
  const marketPools = marketPoolService.getMarketPools();
  const allBets = marketPoolService.getAllBets();

  // Calculate date filter based on selected range
  const getCategoryDateFilter = () => {
    const now = new Date();
    switch (categoryDateRange) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case 'custom':
        return categoryCustomDateFrom || new Date(0);
      default:
        return new Date(0); // 'all' - no filter
    }
  };

  const getCategoryDateEnd = () => {
    if (categoryDateRange === 'custom' && categoryCustomDateTo) {
      return categoryCustomDateTo;
    }
    return new Date();
  };

  const categoryStartDate = getCategoryDateFilter();
  const categoryEndDate = getCategoryDateEnd();

  // Calculate stats per category from actual market data
  const categoryStats: Record<string, { volume: number; markets: number; bets: number; users: Set<string> }> = {};

  markets.forEach((market: any) => {
    const category = market.category || 'Other';
    if (!categoryStats[category]) {
      categoryStats[category] = { volume: 0, markets: 0, bets: 0, users: new Set() };
    }

    // Get pool and bets for this market
    const pool = marketPools.find(p => p.marketId === market.id);

    // Filter bets by date range
    const marketBets = allBets.filter((bet: any) => {
      if (bet.marketId !== market.id) return false;
      const betDate = new Date(bet.placedAt);
      return betDate >= categoryStartDate && betDate <= categoryEndDate;
    });

    // Only count if there are bets in the date range, or if showing 'all'
    if (categoryDateRange === 'all' || marketBets.length > 0) {
      // Count markets that have activity in the period
      if (categoryDateRange === 'all') {
        categoryStats[category].markets += 1;
        const volume = pool?.totalPool || market.totalPool || market.total_pool || 0;
        categoryStats[category].volume += volume;
      } else if (marketBets.length > 0) {
        categoryStats[category].markets += 1;
        // Calculate volume from bets in the period
        const periodVolume = marketBets.reduce((sum: number, bet: any) => sum + (bet.amount || 0), 0);
        categoryStats[category].volume += periodVolume;
      }

      // Count bets and unique users
      categoryStats[category].bets += marketBets.length;
      marketBets.forEach((bet: any) => {
        if (bet.userId) categoryStats[category].users.add(bet.userId);
      });
    }
  });

  const totalCategoryVolume = Object.values(categoryStats).reduce((sum, s) => sum + s.volume, 0);

  const categoryBreakdown = Object.entries(categoryStats)
    .filter(([_, stats]) => stats.markets > 0 || stats.bets > 0 || stats.volume > 0)
    .map(([category, stats]) => ({
      category,
      volume: stats.volume,
      markets: stats.markets,
      bets: stats.bets,
      users: stats.users.size,
      percentage: totalCategoryVolume > 0 ? Math.round((stats.volume / totalCategoryVolume) * 100) : 0,
    }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 6);

  // Get pending payouts from service
  const pendingPayoutTxs = getPendingPayouts();
  const pendingPayouts: Transaction[] = pendingPayoutTxs.map(tx => ({
    id: tx.id,
    type: 'payout' as const,
    amount: tx.amount,
    to: tx.to || undefined,
    timestamp: new Date(tx.createdAt),
    marketId: tx.marketId || undefined,
    marketClaim: tx.description,
    status: 'pending' as const,
  }));

  // Get recent fee collections
  const recentFeeTransactions = allTransactions
    .filter(tx => tx.type === 'fee')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Filter and sort transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch =
      tx.marketClaim?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.to?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.txHash?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = transactionFilter === 'all' || tx.type === transactionFilter;
    return matchesSearch && matchesFilter;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (!sortColumn) return 0;
    let comparison = 0;
    switch (sortColumn) {
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'timestamp':
        comparison = a.timestamp.getTime() - b.timestamp.getTime();
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedTransactions.length / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + transactionsPerPage);

  const transactionCounts = {
    all: transactions.length,
    fee: transactions.filter(t => t.type === 'fee').length,
    payout: transactions.filter(t => t.type === 'payout').length,
    deposit: transactions.filter(t => t.type === 'deposit').length,
    withdrawal: transactions.filter(t => t.type === 'withdrawal').length,
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-600 text-white text-xs">Completed</Badge>;
      case 'pending': return <Badge className="bg-yellow-500 text-black text-xs">Pending</Badge>;
      case 'processing': return <Badge className="bg-blue-500 text-white text-xs">Processing</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportToExcel = () => {
    const exportData = sortedTransactions.map(tx => ({
      'ID': tx.id,
      'Type': tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
      'Amount ($)': tx.amount,
      'Status': tx.status.charAt(0).toUpperCase() + tx.status.slice(1),
      'From': tx.from || '-',
      'To': tx.to || '-',
      'Market': tx.marketClaim || '-',
      'TX Hash': tx.txHash || '-',
      'Date': formatDate(tx.timestamp),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `treasury_transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Transactions exported to Excel');
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || !withdrawAddress || !withdrawReason) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!withdrawDescription || !withdrawDescription.trim()) {
      toast.error('Please provide a description for this withdrawal request');
      return;
    }

    const fullReason = `${withdrawReason}: ${withdrawDescription}`;

    const result = createWithdrawalRequest(
      parseFloat(withdrawAmount),
      withdrawAddress,
      fullReason,
      currentSignerId
    );

    if ('error' in result) {
      toast.error(result.error);
      return;
    }

    toast.success(`Withdrawal request created. Requires ${multiSigConfig?.threshold || 2} approvals.`);
    setWithdrawDialog(false);
    setWithdrawAmount('');
    setWithdrawAddress('');
    setWithdrawReason('');
    setWithdrawDescription('');
    setRefreshKey(k => k + 1);
  };

  const handleApproveWithdrawal = (request: WithdrawalRequest) => {
    const result = approveWithdrawalRequest(request.id, currentSignerId);

    if ('error' in result) {
      toast.error(result.error);
      return;
    }

    if (result.status === 'executed') {
      toast.success(`Withdrawal of $${request.amount.toLocaleString()} executed successfully!`);
    } else {
      toast.success(`Approval recorded. ${result.approvals.length}/${multiSigConfig?.threshold || 2} approvals.`);
    }

    setApproveDialog(null);
    setRefreshKey(k => k + 1);
  };

  const handleRejectWithdrawal = (request: WithdrawalRequest) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    const result = rejectWithdrawalRequest(request.id, currentSignerId, rejectReason);

    if ('error' in result) {
      toast.error(result.error);
      return;
    }

    toast.success('Withdrawal request rejected');
    setRejectDialog(null);
    setRejectReason('');
    setRefreshKey(k => k + 1);
  };

  const handleCancelWithdrawal = (request: WithdrawalRequest) => {
    const result = cancelWithdrawalRequest(request.id, currentSignerId);

    if ('error' in result) {
      toast.error(result.error);
      return;
    }

    toast.success('Withdrawal request cancelled');
    setSelectedWithdrawal(null);
    setRefreshKey(k => k + 1);
  };

  const getSignerName = (signerId: string) => {
    return multiSigConfig?.signers.find(s => s.id === signerId)?.name || signerId;
  };

  const hasCurrentSignerVoted = (request: WithdrawalRequest) => {
    return request.approvals.some(a => a.signerId === currentSignerId) ||
           request.rejections.some(r => r.signerId === currentSignerId);
  };

  const handleProcessPayouts = () => {
    const result = processAllPendingPayouts();

    if (result.successful.length > 0) {
      toast.success(`Processed ${result.successful.length} payouts totaling $${result.totalAmount.toLocaleString()}`);
    }

    if (result.failed.length > 0) {
      toast.error(`${result.failed.length} payouts failed to process`);
    }

    setProcessPayoutsDialog(false);
    setRefreshKey(k => k + 1);
  };

  const handleProcessSinglePayout = (tx: Transaction) => {
    const result = processPayout(tx.id);

    if ('error' in result) {
      toast.error(result.error);
      return;
    }

    toast.success(`Payout of $${tx.amount.toLocaleString()} processed successfully`);
    setProcessSinglePayout(null);
    setRefreshKey(k => k + 1);
  };

  const handleCancelPayout = (tx: Transaction) => {
    const result = cancelPayout(tx.id, 'Cancelled by admin');

    if ('error' in result) {
      toast.error(result.error);
      return;
    }

    toast.success(`Payout of $${tx.amount.toLocaleString()} cancelled`);
    setCancelPayoutDialog(null);
    setRefreshKey(k => k + 1);
  };

  const handleUpdateFeeRate = () => {
    const newRate = parseFloat(newFeeRate) / 100;

    if (isNaN(newRate) || newRate < 0 || newRate > 0.1) {
      toast.error('Fee rate must be between 0% and 10%');
      return;
    }

    updateFeeConfig({ platformFeeRate: newRate });
    toast.success(`Fee rate updated to ${newFeeRate}%`);
    setAdjustFeeDialog(false);
    setRefreshKey(k => k + 1);
  };

  const maxVolume = Math.max(...revenueData.map(d => d.volume));

  return (
    <div className="space-y-6">
      {/* Summary Stats Cards - All in one row */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {/* Total Balance */}
        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <Wallet className="h-4 w-4 text-green-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Total Balance</p>
                <p className="text-lg font-bold text-green-500 truncate">${treasuryData.totalBalance.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fees Today */}
        <Card className="bg-gradient-to-br from-[#06f6ff]/10 to-transparent border-[#06f6ff]/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[#06f6ff]/20 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4 text-[#06f6ff]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Fees Today</p>
                <p className="text-lg font-bold text-[#06f6ff] truncate">${treasuryData.feesToday.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TVL - Total Value Locked */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <Lock className="h-4 w-4 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">TVL</p>
                <p className="text-lg font-bold text-blue-500 truncate">${treasuryData.pendingPayouts.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Volume */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                <BarChart3 className="h-4 w-4 text-purple-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Weekly Volume</p>
                <p className="text-lg font-bold text-purple-500 truncate">${treasuryData.weeklyVolume.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fee Rate */}
        <Card
          className="cursor-pointer hover:border-[#06f6ff]/50 transition-colors"
          onClick={() => setAdjustFeeDialog(true)}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Percent className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Fee Rate</p>
                <p className="text-lg font-bold truncate">{treasuryData.feeRate}%</p>
              </div>
              <Settings className="h-3 w-3 text-muted-foreground shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Profit Margin */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Profit Margin</p>
                <p className="text-lg font-bold text-green-500 truncate">{treasuryData.profitMargin.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg Transaction */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Avg Transaction</p>
                <p className="text-lg font-bold truncate">${treasuryData.avgTransactionSize.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Transactions */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Total Txns</p>
                <p className="text-lg font-bold truncate">{treasuryData.totalTransactions.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Pending Payouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Recent Fee Collections Card */}
        <Card className="border-green-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Recent Fee Collections
              {recentFeeTransactions.length > 0 && (
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  Today: <span className="text-green-500 font-semibold">${treasuryData.feesToday.toFixed(2)}</span>
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentFeeTransactions.length > 0 ? (
              <div className="space-y-2">
                {recentFeeTransactions.map((fee) => (
                  <div
                    key={fee.id}
                    className="flex items-center justify-between p-2 bg-green-500/5 border border-green-500/20 rounded-lg animate-in fade-in slide-in-from-top-1 duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <ArrowDownRight className="h-3 w-3 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {fee.description?.replace('Platform fee from winning payout (bet ', '').replace(')', '') || 'Fee'}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(new Date(fee.createdAt))}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-green-500 text-sm">+${fee.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No fees collected yet</p>
                <p className="text-xs mt-1">Fees are collected when winners are paid</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Value Locked Card */}
        <Card className="border-blue-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-500" />
                Total Value Locked
              </CardTitle>
              <div className="flex items-center gap-1">
                {(['7d', '30d', '90d', 'all', 'custom'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTvlPeriod(period)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      tvlPeriod === period
                        ? 'bg-blue-500 text-white'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {period === 'all' ? 'All' : period === 'custom' ? 'Custom' : period.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-blue-500">${treasuryData.pendingPayouts.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {tvlPeriod === 'all' ? 'All time' : tvlPeriod === 'custom' ? 'Custom period' : `Last ${tvlPeriod}`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-lg font-semibold text-green-500">+12.5%</p>
                <p className="text-xs text-muted-foreground">vs previous period</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-lg font-semibold">{treasuryStats?.totalMarkets || 0}</p>
                <p className="text-xs text-muted-foreground">Active markets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Withdrawal Approvals Card */}
        <Card className="border-orange-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-500" />
              Pending Approvals
              {multiSigConfig && (
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  {multiSigConfig.threshold}/{multiSigConfig.totalSigners} required
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingWithdrawals.length > 0 ? (
              <div className="space-y-3">
                {pendingWithdrawals.slice(0, 3).map((request) => (
                  <div key={request.id} className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-orange-500">${request.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          To: {formatAddress(request.destinationAddress)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {request.approvals.length}/{multiSigConfig?.threshold || 2}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 truncate">{request.reason}</p>
                    <div className="flex items-center gap-2 mb-2">
                      {request.approvals.map((a, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs text-green-500">
                          <UserCheck className="h-3 w-3" />
                          <span>{a.signerName.split(' ')[0]}</span>
                        </div>
                      ))}
                      {request.rejections.map((r, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs text-red-500">
                          <XCircle className="h-3 w-3" />
                          <span>{r.signerName.split(' ')[0]}</span>
                        </div>
                      ))}
                    </div>
                    {!hasCurrentSignerVoted(request) ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 h-7 bg-green-600 hover:bg-green-700 text-xs"
                          onClick={() => setApproveDialog(request)}
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-7 text-red-500 border-red-500/30 text-xs"
                          onClick={() => setRejectDialog(request)}
                        >
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-center text-muted-foreground">You have voted on this request</p>
                    )}
                  </div>
                ))}
                {pendingWithdrawals.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{pendingWithdrawals.length - 3} more pending
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No pending approvals</p>
                <p className="text-xs mt-1">Withdrawal requests will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#06f6ff]" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setWithdrawDialog(true)}
            >
              <ArrowUpRight className="h-4 w-4 mr-2 text-orange-500" />
              Manual Withdrawal
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setReportDialog(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setAdjustFeeDialog(true)}
            >
              <Percent className="h-4 w-4 mr-2" />
              Adjust Fee Rate
            </Button>
          </CardContent>
        </Card>

        {/* Category Breakdown - Table Style */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-[#06f6ff]" />
                Market Categories
              </CardTitle>
              <div className="flex gap-1 items-center">
                {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                  <Button
                    key={range}
                    size="sm"
                    variant={categoryDateRange === range ? 'default' : 'ghost'}
                    className={categoryDateRange === range ? 'bg-[#06f6ff] text-black hover:bg-[#06f6ff]/90' : ''}
                    onClick={() => setCategoryDateRange(range)}
                  >
                    {range === 'all' ? 'All' : range}
                  </Button>
                ))}
                <Popover open={categoryDatePopoverOpen} onOpenChange={setCategoryDatePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      size="sm"
                      variant={categoryDateRange === 'custom' ? 'default' : 'ghost'}
                      className={categoryDateRange === 'custom' ? 'bg-[#06f6ff] text-black hover:bg-[#06f6ff]/90' : ''}
                    >
                      {categoryDateRange === 'custom' && categoryCustomDateFrom && categoryCustomDateTo
                        ? `${categoryCustomDateFrom.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${categoryCustomDateTo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                        : 'Custom'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-4 z-[10100]" align="end">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">From</label>
                        <Input
                          type="date"
                          value={categoryCustomDateFrom ? categoryCustomDateFrom.toISOString().split('T')[0] : ''}
                          onChange={(e) => setCategoryCustomDateFrom(e.target.value ? new Date(e.target.value) : undefined)}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">To</label>
                        <Input
                          type="date"
                          value={categoryCustomDateTo ? categoryCustomDateTo.toISOString().split('T')[0] : ''}
                          onChange={(e) => setCategoryCustomDateTo(e.target.value ? new Date(e.target.value) : undefined)}
                          className="w-full"
                        />
                      </div>
                      <Button
                        className="w-full bg-[#06f6ff] text-black hover:bg-[#06f6ff]/90"
                        onClick={() => {
                          if (categoryCustomDateFrom && categoryCustomDateTo) {
                            setCategoryDateRange('custom');
                            setCategoryDatePopoverOpen(false);
                          }
                        }}
                        disabled={!categoryCustomDateFrom || !categoryCustomDateTo}
                      >
                        Apply
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <div>Category</div>
                        <div className="text-xs font-normal text-muted-foreground">Market type</div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div>Volume</div>
                        <div className="text-xs font-normal text-muted-foreground">Total USD</div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div>Markets</div>
                        <div className="text-xs font-normal text-muted-foreground">Active count</div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div>Bets</div>
                        <div className="text-xs font-normal text-muted-foreground">Placed count</div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div>Users</div>
                        <div className="text-xs font-normal text-muted-foreground">Unique bettors</div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div>Share</div>
                        <div className="text-xs font-normal text-muted-foreground">% of total</div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryBreakdown.map((category, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{category.category}</TableCell>
                        <TableCell className="text-center font-semibold">${category.volume.toLocaleString()}</TableCell>
                        <TableCell className="text-center">{category.markets}</TableCell>
                        <TableCell className="text-center">{category.bets}</TableCell>
                        <TableCell className="text-center">{category.users}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{category.percentage}%</TableCell>
                      </TableRow>
                    ))}
                    {/* Total Row */}
                    <TableRow className="border-t-2 font-semibold bg-muted/30">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-center text-[#06f6ff]">${totalCategoryVolume.toLocaleString()}</TableCell>
                      <TableCell className="text-center">{categoryBreakdown.reduce((sum, c) => sum + c.markets, 0)}</TableCell>
                      <TableCell className="text-center">{categoryBreakdown.reduce((sum, c) => sum + c.bets, 0)}</TableCell>
                      <TableCell className="text-center">{categoryBreakdown.reduce((sum, c) => sum + c.users, 0)}</TableCell>
                      <TableCell className="text-center">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <PieChart className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No category data yet</p>
                <p className="text-sm mt-1">Categories will appear when markets have activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#06f6ff]" />
              Revenue & Volume
            </CardTitle>
            <div className="flex gap-1">
              {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                <Button
                  key={range}
                  size="sm"
                  variant={dateRange === range ? 'default' : 'ghost'}
                  className={dateRange === range ? 'bg-[#06f6ff] text-black hover:bg-[#06f6ff]/90' : ''}
                  onClick={() => setDateRange(range)}
                >
                  {range === 'all' ? 'All' : range}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                  <div className="text-right w-40">
                    <span className="font-medium">${data.volume.toLocaleString()}</span>
                    <span className="text-green-500 text-xs ml-2">(+${data.revenue})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#06f6ff]" />
              Transactions
            </CardTitle>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'fee', 'payout', 'deposit', 'withdrawal'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => { setTransactionFilter(filter); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    transactionFilter === filter
                      ? filter === 'fee' ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                      : filter === 'payout' ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                      : filter === 'deposit' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
                      : filter === 'withdrawal' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/30'
                      : 'bg-[#06f6ff]/10 text-[#06f6ff] border border-[#06f6ff]/30'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  <span className="ml-2 text-xs opacity-70">({transactionCounts[filter]})</span>
                </button>
              ))}
            </div>

            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    Sort: {sortColumn ? sortColumn.charAt(0).toUpperCase() + sortColumn.slice(1) : 'Default'}
                    {sortColumn && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSort('timestamp')}>
                    Date {sortColumn === 'timestamp' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('amount')}>
                    Amount {sortColumn === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className="h-9 gap-2" onClick={exportToExcel}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {paginatedTransactions.map((tx) => (
              <div key={tx.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      tx.type === 'fee' ? 'bg-green-500/10' :
                      tx.type === 'payout' ? 'bg-red-500/10' :
                      tx.type === 'deposit' ? 'bg-blue-500/10' :
                      'bg-orange-500/10'
                    }`}>
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{tx.type}</p>
                      {tx.marketClaim && <p className="text-xs text-muted-foreground">{tx.marketClaim}</p>}
                    </div>
                  </div>
                  {getStatusBadge(tx.status)}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{formatTimeAgo(tx.timestamp)}</p>
                  <p className={`font-semibold ${
                    tx.type === 'fee' || tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {tx.type === 'fee' || tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="w-[120px]">
                    <button
                      onClick={() => handleSort('amount')}
                      className={`flex items-center gap-1 transition-colors hover:text-[#06f6ff] ${sortColumn === 'amount' ? 'text-[#06f6ff]' : ''}`}
                    >
                      Amount
                      <span className={sortColumn === 'amount' ? 'text-[#06f6ff]' : 'opacity-50'}>
                        {sortColumn === 'amount' ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
                      </span>
                    </button>
                  </TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[140px]">
                    <button
                      onClick={() => handleSort('timestamp')}
                      className={`flex items-center gap-1 transition-colors hover:text-[#06f6ff] ${sortColumn === 'timestamp' ? 'text-[#06f6ff]' : ''}`}
                    >
                      Date
                      <span className={sortColumn === 'timestamp' ? 'text-[#06f6ff]' : 'opacity-50'}>
                        {sortColumn === 'timestamp' ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
                      </span>
                    </button>
                  </TableHead>
                  <TableHead className="w-[100px]">TX Hash</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.map((tx) => (
                  <TableRow key={tx.id} className="border-b border-border/30 hover:bg-muted/30">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-full ${
                          tx.type === 'fee' ? 'bg-green-500/10' :
                          tx.type === 'payout' ? 'bg-red-500/10' :
                          tx.type === 'deposit' ? 'bg-blue-500/10' :
                          'bg-orange-500/10'
                        }`}>
                          {getTransactionIcon(tx.type)}
                        </div>
                        <span className="font-medium capitalize text-sm">{tx.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div>
                        {tx.marketClaim && <p className="text-sm font-medium">{tx.marketClaim}</p>}
                        <p className="text-xs text-muted-foreground">
                          {tx.from && `From: ${formatAddress(tx.from)}`}
                          {tx.to && `To: ${formatAddress(tx.to)}`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className={`font-semibold ${
                        tx.type === 'fee' || tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {tx.type === 'fee' || tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      {getStatusBadge(tx.status)}
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm text-muted-foreground">{formatTimeAgo(tx.timestamp)}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      {tx.txHash ? (
                        <a href="#" className="text-xs text-[#06f6ff] hover:underline flex items-center gap-1">
                          {tx.txHash}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setSelectedTransaction(tx)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {tx.status === 'pending' && tx.type === 'payout' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="z-[100]">
                              <DropdownMenuItem onClick={() => setProcessSinglePayout(tx)}>
                                <Play className="h-4 w-4 mr-2 text-green-500" />
                                Process Now
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setCancelPayoutDialog(tx)} className="text-red-500">
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {sortedTransactions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {sortedTransactions.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(startIndex + transactionsPerPage, sortedTransactions.length)} of {sortedTransactions.length} transactions
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

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialog} onOpenChange={setWithdrawDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              Request Withdrawal
            </DialogTitle>
            <DialogDescription>
              Create a withdrawal request that requires multi-sig approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold text-green-500">${treasuryData.totalBalance.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Approval Required</p>
                <p className="text-lg font-semibold">{multiSigConfig?.threshold || 2} of {multiSigConfig?.totalSigners || 3}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Amount ($)</label>
              <Input
                type="number"
                placeholder="Enter amount..."
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Destination Address</label>
              <Input
                placeholder="0x..."
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                className="mt-2 font-mono"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Reason for Withdrawal</label>
              <Select value={withdrawReason} onValueChange={setWithdrawReason}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Operational expenses">Operational expenses</SelectItem>
                  <SelectItem value="Team payments">Team payments</SelectItem>
                  <SelectItem value="Marketing budget">Marketing budget</SelectItem>
                  <SelectItem value="Infrastructure costs">Infrastructure costs</SelectItem>
                  <SelectItem value="Legal/Compliance">Legal/Compliance</SelectItem>
                  <SelectItem value="Emergency fund">Emergency fund</SelectItem>
                  <SelectItem value="Partner payout">Partner payout</SelectItem>
                  <SelectItem value="Investor distribution">Investor distribution</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                placeholder="Add description for this withdrawal request..."
                value={withdrawDescription}
                onChange={(e) => setWithdrawDescription(e.target.value)}
                className="mt-2"
                rows={2}
              />
            </div>
            <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-orange-500 mt-0.5" />
                <div className="text-sm text-orange-500">
                  <p className="font-medium">Multi-Sig Required</p>
                  <p className="text-xs opacity-80">
                    This request will need {multiSigConfig?.threshold || 2} approvals from authorized signers before execution.
                    Request expires in {multiSigConfig?.expirationHours || 48} hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawDialog(false)}>Cancel</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleWithdraw}>
              <Send className="h-4 w-4 mr-2" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Withdrawal Dialog */}
      <Dialog open={!!approveDialog} onOpenChange={() => setApproveDialog(null)}>
        <DialogContent>
          {approveDialog && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-green-500" />
                  Approve Withdrawal
                </DialogTitle>
                <DialogDescription>
                  Confirm your approval for this withdrawal request.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold text-orange-500">${approveDialog.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Destination</span>
                    <span className="font-mono text-sm">{formatAddress(approveDialog.destinationAddress)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Requested By</span>
                    <span>{getSignerName(approveDialog.requestedBy)}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground text-sm">Reason</span>
                    <p className="text-sm mt-1">{approveDialog.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Current Approvals</p>
                    <div className="flex items-center gap-2">
                      {approveDialog.approvals.map((a, i) => (
                        <Badge key={i} className="bg-green-500/20 text-green-500">
                          <UserCheck className="h-3 w-3 mr-1" />
                          {a.signerName.split(' ')[0]}
                        </Badge>
                      ))}
                      {approveDialog.approvals.length === 0 && (
                        <span className="text-sm text-muted-foreground">None yet</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="font-semibold">{approveDialog.approvals.length}/{multiSigConfig?.threshold || 2}</p>
                  </div>
                </div>
                {approveDialog.approvals.length + 1 >= (multiSigConfig?.threshold || 2) && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-500 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Your approval will execute this withdrawal immediately.
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setApproveDialog(null)}>Cancel</Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApproveWithdrawal(approveDialog)}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Confirm Approval
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Withdrawal Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => { setRejectDialog(null); setRejectReason(''); }}>
        <DialogContent>
          {rejectDialog && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ThumbsDown className="h-5 w-5 text-red-500" />
                  Reject Withdrawal
                </DialogTitle>
                <DialogDescription>
                  Provide a reason for rejecting this withdrawal request.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">${rejectDialog.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reason</span>
                    <span className="text-sm">{rejectDialog.reason}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Rejection Reason *</label>
                  <Textarea
                    placeholder="Why are you rejecting this request?"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-500 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    If enough signers reject, this request will be permanently declined.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setRejectDialog(null); setRejectReason(''); }}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={() => handleRejectWithdrawal(rejectDialog)}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Confirm Rejection
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Process Payouts Dialog */}
      <Dialog open={processPayoutsDialog} onOpenChange={setProcessPayoutsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-yellow-500" />
              Process Pending Payouts
            </DialogTitle>
            <DialogDescription>
              Process all pending winner payouts in a batch transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Payouts</span>
                <span className="font-semibold">{pendingPayouts.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold text-red-500">
                  -${pendingPayouts.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {pendingPayouts.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm">
                  <div>
                    <p className="font-medium">{payout.marketClaim || 'Payout'}</p>
                    <p className="text-xs text-muted-foreground">{payout.to && formatAddress(payout.to)}</p>
                  </div>
                  <span className="font-semibold">-${payout.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessPayoutsDialog(false)}>Cancel</Button>
            <Button className="bg-yellow-500 text-black hover:bg-yellow-600 font-semibold" onClick={handleProcessPayouts}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Process All Payouts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Details Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent>
          {selectedTransaction && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getTransactionIcon(selectedTransaction.type)}
                  <span className="capitalize">{selectedTransaction.type} Details</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Amount</span>
                  <span className={`text-2xl font-bold ${
                    selectedTransaction.type === 'fee' || selectedTransaction.type === 'deposit' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {selectedTransaction.type === 'fee' || selectedTransaction.type === 'deposit' ? '+' : '-'}${selectedTransaction.amount.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDate(selectedTransaction.timestamp)}</p>
                  </div>
                  {selectedTransaction.from && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">From</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm">{selectedTransaction.from}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedTransaction.from!);
                            toast.success('Address copied');
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {selectedTransaction.to && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">To</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm">{selectedTransaction.to}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedTransaction.to!);
                            toast.success('Address copied');
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {selectedTransaction.marketClaim && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Market</p>
                      <p className="font-medium">{selectedTransaction.marketClaim}</p>
                    </div>
                  )}
                  {selectedTransaction.txHash && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Transaction Hash</p>
                      <a href="#" className="text-[#06f6ff] hover:underline flex items-center gap-1 text-sm">
                        {selectedTransaction.txHash}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedTransaction(null)}>Close</Button>
                {selectedTransaction.status === 'pending' && selectedTransaction.type === 'payout' && (
                  <>
                    <Button
                      variant="outline"
                      className="text-red-500 border-red-500/30"
                      onClick={() => {
                        setSelectedTransaction(null);
                        setCancelPayoutDialog(selectedTransaction);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setSelectedTransaction(null);
                        setProcessSinglePayout(selectedTransaction);
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Process Now
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Process Single Payout Dialog */}
      <Dialog open={!!processSinglePayout} onOpenChange={() => setProcessSinglePayout(null)}>
        <DialogContent>
          {processSinglePayout && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-green-500" />
                  Process Payout
                </DialogTitle>
                <DialogDescription>
                  Confirm processing this payout to the winner.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market</span>
                    <span className="font-medium">{processSinglePayout.marketClaim || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold text-red-500">-${processSinglePayout.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recipient</span>
                    <span className="font-mono text-sm">{processSinglePayout.to && formatAddress(processSinglePayout.to)}</span>
                  </div>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-green-500 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Funds will be sent immediately upon confirmation.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setProcessSinglePayout(null)}>Cancel</Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleProcessSinglePayout(processSinglePayout)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Confirm & Process
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Payout Dialog */}
      <Dialog open={!!cancelPayoutDialog} onOpenChange={() => setCancelPayoutDialog(null)}>
        <DialogContent>
          {cancelPayoutDialog && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Cancel Payout
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel this payout? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market</span>
                    <span className="font-medium">{cancelPayoutDialog.marketClaim || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">${cancelPayoutDialog.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recipient</span>
                    <span className="font-mono text-sm">{cancelPayoutDialog.to && formatAddress(cancelPayoutDialog.to)}</span>
                  </div>
                </div>
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-500 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    The recipient will need to be manually compensated if this is cancelled in error.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCancelPayoutDialog(null)}>Keep Payout</Button>
                <Button
                  variant="destructive"
                  onClick={() => handleCancelPayout(cancelPayoutDialog)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Payout
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Report Dialog */}
      <Dialog open={reportDialog} onOpenChange={setReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#06f6ff]" />
              Generate Report
            </DialogTitle>
            <DialogDescription>
              Generate a treasury report for your records.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Report Type</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {(['summary', 'detailed', 'tax'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setReportType(type)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      reportType === type
                        ? 'border-[#06f6ff] bg-[#06f6ff]/10 text-[#06f6ff]'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <p className="font-medium capitalize">{type}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {type === 'summary' && 'Overview'}
                      {type === 'detailed' && 'All transactions'}
                      {type === 'tax' && 'Tax-ready'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Date Range</label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {(['7d', '30d', '90d', 'year', 'all'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setReportDateRange(range)}
                    className={`py-2 px-3 rounded-lg border text-sm transition-all ${
                      reportDateRange === range
                        ? 'border-[#06f6ff] bg-[#06f6ff]/10 text-[#06f6ff]'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    {range === 'year' ? '1 Year' : range === 'all' ? 'All Time' : range}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Report will include: {reportType === 'summary' ? 'Revenue summary, volume breakdown, and key metrics' : reportType === 'detailed' ? 'All transactions with full details' : 'Tax-ready format with categorized income and expenses'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialog(false)}>Cancel</Button>
            <Button
              className="bg-[#06f6ff] text-black hover:bg-[#06f6ff]/90"
              onClick={() => {
                toast.success(`Generating ${reportType} report for ${reportDateRange === 'year' ? '1 year' : reportDateRange}...`);
                setReportDialog(false);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Fee Rate Dialog */}
      <Dialog open={adjustFeeDialog} onOpenChange={setAdjustFeeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-[#06f6ff]" />
              Adjust Platform Fee Rate
            </DialogTitle>
            <DialogDescription>
              Change the fee percentage charged on all market transactions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current Fee Rate</span>
                <span className="text-2xl font-bold">{treasuryData.feeRate}%</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">New Fee Rate (%)</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="Enter new fee rate..."
                value={newFeeRate}
                onChange={(e) => setNewFeeRate(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">Recommended range: 1% - 5%</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['1.0', '2.0', '2.5', '3.0'].map((rate) => (
                <Button
                  key={rate}
                  variant="outline"
                  size="sm"
                  onClick={() => setNewFeeRate(rate)}
                  className={newFeeRate === rate ? 'border-[#06f6ff] text-[#06f6ff]' : ''}
                >
                  {rate}%
                </Button>
              ))}
            </div>
            {parseFloat(newFeeRate) !== treasuryData.feeRate && (
              <div className={`p-3 rounded-lg ${parseFloat(newFeeRate) > treasuryData.feeRate ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
                <p className={`text-sm flex items-center gap-2 ${parseFloat(newFeeRate) > treasuryData.feeRate ? 'text-green-500' : 'text-yellow-500'}`}>
                  {parseFloat(newFeeRate) > treasuryData.feeRate ? (
                    <>
                      <TrendingUp className="h-4 w-4" />
                      Fee increase of {(parseFloat(newFeeRate) - treasuryData.feeRate).toFixed(1)}%
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4" />
                      Fee decrease of {(treasuryData.feeRate - parseFloat(newFeeRate)).toFixed(1)}%
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustFeeDialog(false)}>Cancel</Button>
            <Button
              className="bg-[#06f6ff] text-black hover:bg-[#06f6ff]/90"
              onClick={handleUpdateFeeRate}
              disabled={!newFeeRate || parseFloat(newFeeRate) === treasuryData.feeRate}
            >
              <Check className="h-4 w-4 mr-2" />
              Update Fee Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TreasuryDashboard;
