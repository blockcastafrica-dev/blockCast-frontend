import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Gavel,
  Flag,
  AlertTriangle,
  ArrowUpDown,
  Download,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Users,
  AlertCircle,
  Filter,
  Link,
  Scale,
  RotateCcw,
  Ban,
  ExternalLink,
  Calendar,
  User,
  Hash,
  Activity,
  Info,
  MessageSquare,
  FileQuestion,
  Tag,
  Plus,
  FilePlus2
} from 'lucide-react';
import { toast } from 'sonner';
import CreateMarketModal from '@/components/CreateMarketModal';

type MarketStatus = 'pending' | 'active' | 'expired' | 'disputable' | 'resolved';
type DisputeCategory = 'incorrect_resolution' | 'market_manipulation' | 'invalid_market' | 'other';
type RejectionCategory = 'violates_guidelines' | 'duplicate_market' | 'unclear_criteria' | 'spam' | 'other';

interface Dispute {
  id: string;
  filedBy: string;
  filedAt: Date;
  category: DisputeCategory;
  reason: string;
  evidence: string[];
  status: 'pending' | 'needs_evidence' | 'resolved';
  adminNotes?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: 'upheld' | 'overturned' | 'voided';
}

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
  resolutionSource?: string;
  disputeStatus?: 'none' | 'pending' | 'resolved';
  disputeCount?: number;
  disputes?: Dispute[];
}

const disputeCategoryLabels: Record<DisputeCategory, string> = {
  incorrect_resolution: 'Incorrect Resolution',
  market_manipulation: 'Market Manipulation',
  invalid_market: 'Invalid Market',
  other: 'Other',
};

const rejectionCategoryLabels: Record<RejectionCategory, string> = {
  violates_guidelines: 'Violates Guidelines',
  duplicate_market: 'Duplicate Market',
  unclear_criteria: 'Unclear Resolution Criteria',
  spam: 'Spam / Low Quality',
  other: 'Other',
};

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
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [viewMarket, setViewMarket] = useState<Market | null>(null);
  const [resolveMarket, setResolveMarket] = useState<Market | null>(null);
  const [disputeMarket, setDisputeMarket] = useState<Market | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeCategory, setDisputeCategory] = useState<DisputeCategory>('incorrect_resolution');
  const [disputeEvidence, setDisputeEvidence] = useState('');
  const [reviewMarket, setReviewMarket] = useState<Market | null>(null);
  const [reviewAction, setReviewAction] = useState<'uphold' | 'request_evidence' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject'; markets: string[] } | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionCategory, setRejectionCategory] = useState<RejectionCategory>('violates_guidelines');
  const [rejectionReason, setRejectionReason] = useState('');
  const [allowResubmit, setAllowResubmit] = useState(true);
  const [resolutionEvidence, setResolutionEvidence] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [createMarketOpen, setCreateMarketOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [marketVisibility, setMarketVisibility] = useState<Record<string, boolean>>({});
  const marketsPerPage = 10;

  // Toggle market visibility (online/offline)
  const toggleMarketVisibility = (marketId: string) => {
    setMarketVisibility(prev => {
      const currentVisibility = prev[marketId] ?? true; // Default to visible
      const newVisibility = !currentVisibility;
      toast.success(`Market is now ${newVisibility ? 'online' : 'offline'}`);
      return { ...prev, [marketId]: newVisibility };
    });
  };

  // Get market visibility (defaults to true/online)
  const isMarketVisible = (marketId: string): boolean => {
    return marketVisibility[marketId] ?? true;
  };

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
      resolutionSource: 'AI Research Papers',
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
      resolutionSource: 'Yahoo Finance',
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
      resolutionSource: 'CoinGecko',
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
      resolutionSource: 'Apple Official',
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
      resolutionSource: 'CoinMarketCap',
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
      resolutionSource: 'Federal Reserve',
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
      resolutionSource: 'CoinGecko',
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
      resolutionSource: 'Yahoo Finance',
      resolvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      resolvedBy: '0x8a4b...e7f8',
      disputeStatus: 'pending',
      disputeCount: 1,
      disputes: [
        {
          id: 'disp1',
          filedBy: '0x9c5d...a8b9',
          filedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          category: 'incorrect_resolution',
          reason: 'Netflix stock never reached $800 in Q4 2024. The highest price was $785.50 on December 15th. The resolution should be NO, not YES.',
          evidence: [
            'https://finance.yahoo.com/quote/NFLX/history',
            'https://www.tradingview.com/chart/?symbol=NASDAQ:NFLX'
          ],
          status: 'pending',
        }
      ],
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
      resolutionSource: 'AP News',
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
      resolutionSource: 'Apple.com',
      resolvedAt: new Date('2024-02-02'),
      resolvedBy: '0x8a4b...e7f8',
      disputeStatus: 'resolved',
      disputeCount: 2,
    },
    // Additional markets for pagination testing
    {
      id: 'a3',
      claim: 'Will SpaceX land humans on Mars by 2030?',
      description: 'Resolves YES if SpaceX successfully lands humans on Mars before December 31, 2030.',
      category: 'Technology',
      creator: '0x4d5e...6f7g',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      expiresAt: new Date('2030-12-31'),
      status: 'active',
      marketType: 'binary',
      totalVolume: 35000,
      participants: 412,
      yesPool: 21000,
      noPool: 14000,
      resolutionSource: 'SpaceX Official',
    },
    {
      id: 'a4',
      claim: 'Will gold price exceed $3000/oz in 2025?',
      description: 'Resolves YES if gold spot price reaches $3000 per ounce at any point in 2025.',
      category: 'Finance',
      creator: '0x8h9i...0j1k',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      expiresAt: new Date('2025-12-31'),
      status: 'active',
      marketType: 'binary',
      totalVolume: 18700,
      participants: 203,
      yesPool: 11200,
      noPool: 7500,
      resolutionSource: 'Kitco',
    },
    {
      id: 'p3',
      claim: 'Will OpenAI release GPT-5 in 2025?',
      description: 'Resolves YES if OpenAI publicly releases GPT-5 before December 31, 2025.',
      category: 'Technology',
      creator: '0x2l3m...4n5o',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      expiresAt: new Date('2025-12-31'),
      status: 'pending',
      marketType: 'binary',
      totalVolume: 0,
      participants: 0,
      yesPool: 1000,
      noPool: 1000,
      resolutionSource: 'OpenAI Blog',
    },
    {
      id: 'r3',
      claim: 'Will Argentina win Copa America 2024?',
      description: 'Resolves YES if Argentina national team wins Copa America 2024.',
      category: 'Sports',
      creator: '0x6p7q...8r9s',
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      expiresAt: new Date('2024-07-15'),
      status: 'resolved',
      marketType: 'binary',
      totalVolume: 28000,
      participants: 345,
      yesPool: 19600,
      noPool: 8400,
      resolution: 'YES',
      resolutionSource: 'FIFA Official',
      resolvedAt: new Date('2024-07-14'),
      resolvedBy: '0x7f3a...d4e5',
      disputeStatus: 'none',
      disputeCount: 0,
    },
    {
      id: 'a5',
      claim: 'Will Apple stock split in 2025?',
      description: 'Resolves YES if Apple announces and executes a stock split in 2025.',
      category: 'Finance',
      creator: '0x0t1u...2v3w',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      expiresAt: new Date('2025-12-31'),
      status: 'active',
      marketType: 'binary',
      totalVolume: 9800,
      participants: 134,
      yesPool: 3920,
      noPool: 5880,
      resolutionSource: 'SEC Filings',
    },
    {
      id: 'e3',
      claim: 'Will Twitter/X reach 1B daily users by 2024?',
      description: 'Resolves YES if X (formerly Twitter) reports 1 billion daily active users by end of 2024.',
      category: 'Technology',
      creator: '0x4x5y...6z7a',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      expiresAt: new Date('2024-12-31'),
      status: 'expired',
      marketType: 'binary',
      totalVolume: 5200,
      participants: 89,
      yesPool: 1040,
      noPool: 4160,
      resolutionSource: 'X Official',
    },
    {
      id: 'd3',
      claim: 'Will Nvidia stock reach $200 by end of 2024?',
      description: 'Resolves YES if NVDA stock price reaches $200 at any point before December 31, 2024.',
      category: 'Finance',
      creator: '0x8b9c...0d1e',
      createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
      expiresAt: new Date('2024-12-31'),
      status: 'disputable',
      marketType: 'binary',
      totalVolume: 42000,
      participants: 523,
      yesPool: 29400,
      noPool: 12600,
      resolution: 'YES',
      resolutionSource: 'NASDAQ',
      resolvedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
      resolvedBy: '0x7f3a...d4e5',
      disputeStatus: 'none',
      disputeCount: 0,
    },
    {
      id: 'r4',
      claim: 'Will there be a major earthquake in California in 2024?',
      description: 'Resolves YES if a magnitude 7.0+ earthquake occurs in California in 2024.',
      category: 'Science',
      creator: '0x2f3g...4h5i',
      createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
      expiresAt: new Date('2024-12-31'),
      status: 'resolved',
      marketType: 'binary',
      totalVolume: 15500,
      participants: 198,
      yesPool: 3100,
      noPool: 12400,
      resolution: 'NO',
      resolutionSource: 'USGS',
      resolvedAt: new Date('2025-01-01'),
      resolvedBy: '0x8a4b...e7f8',
      disputeStatus: 'none',
      disputeCount: 0,
    },
    {
      id: 'p4',
      claim: 'Will Disney+ surpass Netflix subscribers in 2025?',
      description: 'Resolves YES if Disney+ total subscribers exceed Netflix at any point in 2025.',
      category: 'Entertainment',
      creator: '0x6j7k...8l9m',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      expiresAt: new Date('2025-12-31'),
      status: 'pending',
      marketType: 'binary',
      resolutionSource: 'Company Reports',
      totalVolume: 0,
      participants: 0,
      yesPool: 500,
      noPool: 500,
    },
    {
      id: 'a6',
      claim: 'Will quantum supremacy be achieved for practical problems by 2026?',
      description: 'Resolves YES if a quantum computer solves a commercially relevant problem faster than classical computers.',
      category: 'Technology',
      creator: '0x0n1o...2p3q',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      expiresAt: new Date('2026-12-31'),
      status: 'active',
      marketType: 'binary',
      totalVolume: 7300,
      participants: 95,
      yesPool: 2920,
      noPool: 4380,
    },
  ];

  // Get unique categories from all markets
  const categories = Array.from(new Set(allMarkets.map(m => m.category))).sort();

  // Calculate summary stats
  const summaryStats = {
    totalVolume: allMarkets.reduce((sum, m) => sum + m.totalVolume, 0),
    totalUsers: allMarkets.reduce((sum, m) => sum + m.participants, 0),
    needsAction: allMarkets.filter(m => m.status === 'pending' || m.status === 'expired').length,
    pendingDisputes: allMarkets.filter(m => m.disputeStatus === 'pending').length,
  };

  const filteredMarkets = allMarkets.filter(market => {
    const matchesSearch = market.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || market.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || market.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
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

  // Pagination calculations
  const totalPages = Math.ceil(sortedMarkets.length / marketsPerPage);
  const startIndex = (currentPage - 1) * marketsPerPage;
  const endIndex = startIndex + marketsPerPage;
  const paginatedMarkets = sortedMarkets.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = (status: MarketStatus | 'all') => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
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

  const exportToExcel = () => {
    const exportData = sortedMarkets.map(market => {
      const poolTotal = market.yesPool + market.noPool;
      const yesPercent = poolTotal > 0 ? Math.round((market.yesPool / poolTotal) * 100) : 50;
      const noPercent = poolTotal > 0 ? Math.round((market.noPool / poolTotal) * 100) : 50;
      return {
        'Status': statusConfig[market.status].label,
        'Market': market.claim,
        'Description': market.description,
        'Category': market.category,
        'Creator': market.creator,
        'Resolution Source': market.resolutionSource || '-',
        'Created': formatDate(market.createdAt),
        'Expires': formatDate(market.expiresAt),
        'Total Volume ($)': market.totalVolume,
        'Participants': market.participants,
        'YES Pool ($)': market.yesPool,
        'NO Pool ($)': market.noPool,
        'Pool Total ($)': poolTotal,
        'YES %': yesPercent,
        'NO %': noPercent,
        'Resolution': market.resolution || '-',
        'Resolved At': market.resolvedAt ? formatDate(market.resolvedAt) : '-',
        'Disputes': market.disputeCount || 0,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Markets');

    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `markets_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Markets exported to Excel');
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

    if (confirmAction.type === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    const count = confirmAction.markets.length;
    if (confirmAction.type === 'approve') {
      toast.success(`Approved ${count} market(s)${approvalNotes ? ' with notes' : ''}`);
    } else {
      toast.success(`Rejected ${count} market(s) - ${rejectionCategoryLabels[rejectionCategory]}${allowResubmit ? ' (resubmission allowed)' : ''}`);
    }

    setSelectedMarkets([]);
    setConfirmAction(null);
    setApprovalNotes('');
    setRejectionCategory('violates_guidelines');
    setRejectionReason('');
    setAllowResubmit(true);
  };

  const closeConfirmDialog = () => {
    setConfirmAction(null);
    setApprovalNotes('');
    setRejectionCategory('violates_guidelines');
    setRejectionReason('');
    setAllowResubmit(true);
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
    setDisputeCategory('incorrect_resolution');
    setDisputeEvidence('');
  };

  const handleResolveDispute = (resolution: 'upheld' | 'overturned' | 'voided') => {
    if (!reviewMarket) return;

    if (resolution === 'upheld' && !adminNotes.trim()) {
      toast.error('Please provide a reason for rejecting the dispute');
      return;
    }

    const messages = {
      upheld: 'Original resolution upheld. Dispute rejected with reason provided.',
      overturned: 'Resolution overturned. Payouts will be recalculated.',
      voided: 'Market voided. All participants will be refunded.',
    };
    toast.success(messages[resolution]);
    setReviewMarket(null);
    setReviewAction(null);
    setAdminNotes('');
  };

  const handleRequestMoreEvidence = () => {
    if (!reviewMarket) return;

    if (!adminNotes.trim()) {
      toast.error('Please specify what additional evidence is needed');
      return;
    }

    toast.success('Request for additional evidence sent to disputer');
    setReviewMarket(null);
    setReviewAction(null);
    setAdminNotes('');
  };

  const closeReviewDialog = () => {
    setReviewMarket(null);
    setReviewAction(null);
    setAdminNotes('');
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
              type="button"
              size="sm"
              className="h-8 px-3 cursor-pointer font-medium text-xs"
              style={{ backgroundColor: '#16a34a', color: 'white' }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setConfirmAction({ type: 'approve', markets: [market.id] });
              }}
            >
              Approve
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="h-8 px-3 cursor-pointer font-medium text-xs"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setConfirmAction({ type: 'reject', markets: [market.id] });
              }}
            >
              Reject
            </Button>
          </div>
        );
      case 'expired':
        return (
          <Button
            type="button"
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 h-8 px-3 text-xs font-medium"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setResolveMarket(market);
            }}
          >
            Resolve
          </Button>
        );
      case 'disputable':
        return market.disputeStatus === 'pending' ? (
          <Button
            type="button"
            size="sm"
            style={{ backgroundColor: '#eab308', color: 'black' }}
            className="h-8 px-3 text-xs font-semibold hover:opacity-90"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setReviewMarket(market);
            }}
          >
            Review
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            className="bg-purple-500 hover:bg-purple-600 h-8 px-3 text-xs font-medium"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDisputeMarket(market);
            }}
          >
            Dispute
          </Button>
        );
      case 'resolved':
        return market.disputeStatus !== 'pending' ? (
          <Button
            type="button"
            size="sm"
            className="bg-purple-500 hover:bg-purple-600 h-8 px-3 text-xs font-medium"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDisputeMarket(market);
            }}
          >
            Dispute
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            style={{ backgroundColor: '#eab308', color: 'black' }}
            className="h-8 px-3 text-xs font-semibold hover:opacity-90"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setReviewMarket(market);
            }}
          >
            Review
          </Button>
        );
      case 'active':
      default:
        return null;
    }
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
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-green-500">{summaryStats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Needs Action</p>
                <p className="text-2xl font-bold text-orange-500">{summaryStats.needsAction}</p>
                <p className="text-xs text-muted-foreground">Pending + Expired</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Disputes</p>
                <p className="text-2xl font-bold text-yellow-500">{summaryStats.pendingDisputes}</p>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Flag className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <CardTitle>All Markets</CardTitle>

            {/* Status filter tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'pending', 'active', 'disputable', 'resolved'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
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
              <button
                onClick={() => setCreateMarketOpen(true)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-muted text-muted-foreground hover:bg-muted/80 flex items-center gap-2"
              >
                <FilePlus2 className="h-4 w-4" />
                Create Market
              </button>
            </div>

            {/* Search, sort, and batch actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-64">
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
                  <Button variant="outline" size="sm" className={`h-9 gap-2 ${categoryFilter !== 'all' ? 'border-[#06f6ff]/50 text-[#06f6ff]' : ''}`}>
                    <Filter className="h-4 w-4" />
                    {categoryFilter === 'all' ? 'All Categories' : categoryFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleCategoryChange('all')}>
                    All Categories
                  </DropdownMenuItem>
                  {categories.map((category) => (
                    <DropdownMenuItem key={category} onClick={() => handleCategoryChange(category)}>
                      {category}
                      {categoryFilter === category && <span className="ml-2 text-[#06f6ff]">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2"
                onClick={exportToExcel}
              >
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
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
            {paginatedMarkets.map((market) => {
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
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={isMarketVisible(market.id)}
                        onCheckedChange={() => toggleMarketVisibility(market.id)}
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 w-9 h-5"
                      />
                      <span className={`text-xs font-medium ${isMarketVisible(market.id) ? 'text-green-500' : 'text-red-500'}`}>
                        {isMarketVisible(market.id) ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    {getActionButton(market)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View - Clean Modern Design */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="w-10">
                    {statusFilter === 'pending' && (
                      <Checkbox
                        checked={selectedMarkets.length === sortedMarkets.filter(m => m.status === 'pending').length && selectedMarkets.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    )}
                  </TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Market</TableHead>
                  <TableHead className="w-[90px]">
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
                  <TableHead className="w-[60px] text-center">Users</TableHead>
                  <TableHead className="w-[60px] text-center">Avg</TableHead>
                  <TableHead className="w-[80px] text-center">YES/NO</TableHead>
                  <TableHead className="w-[110px]">
                    <button
                      onClick={() => handleSort('expires')}
                      className={`flex items-center gap-1 transition-colors hover:text-[#06f6ff] ${sortColumn === 'expires' ? 'text-[#06f6ff]' : ''}`}
                    >
                      Timeline
                      <span className={sortColumn === 'expires' ? 'text-[#06f6ff]' : 'opacity-50'}>
                        {sortColumn === 'expires' ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
                      </span>
                    </button>
                  </TableHead>
                  <TableHead className="w-[100px] text-center">Result</TableHead>
                  <TableHead className="w-[280px] text-left">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMarkets.map((market) => {
                  const yesPercent = market.totalVolume > 0
                    ? Math.round((market.yesPool / (market.yesPool + market.noPool)) * 100)
                    : 50;

                  return (
                    <TableRow key={market.id} className="border-b border-border/30 hover:bg-muted/30">
                      <TableCell className="py-4">
                        {market.status === 'pending' && (
                          <Checkbox
                            checked={selectedMarkets.includes(market.id)}
                            onCheckedChange={(checked) => handleSelectMarket(market.id, checked as boolean)}
                          />
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge className={`${statusConfig[market.status].color} text-xs`}>
                          {statusConfig[market.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="font-medium text-sm leading-tight">{market.claim}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs px-1.5 py-0">{market.category}</Badge>
                            <span className="text-xs text-muted-foreground">by {market.creator}</span>
                            {market.resolutionSource ? (
                              <span className="text-xs text-[#06f6ff]">• {market.resolutionSource}</span>
                            ) : (
                              <span className="text-xs text-yellow-500">• No source</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <p className="font-semibold text-sm">${market.totalVolume.toLocaleString()}</p>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <span className="text-sm">{market.participants}</span>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <span className="text-sm">${market.participants > 0 ? Math.round(market.totalVolume / market.participants).toLocaleString() : 0}</span>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <div className="text-xs">
                          <span className="text-green-500">{yesPercent}%</span>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-red-500">{100 - yesPercent}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-xs space-y-1">
                          <div>
                            <span className="text-muted-foreground">Created: </span>
                            <span className="font-medium">{formatDate(market.createdAt)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Expires: </span>
                            <span className="font-medium">{formatDate(market.expiresAt)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        {market.resolution ? (
                          <Badge className={`${market.resolution === 'YES' ? 'bg-green-600' : 'bg-red-600'} text-white text-xs`}>
                            {market.resolution}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Visibility Toggle */}
                          <div className="flex items-center gap-1.5 shrink-0 mr-2">
                            <Switch
                              checked={isMarketVisible(market.id)}
                              onCheckedChange={() => toggleMarketVisibility(market.id)}
                              className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 shrink-0 w-9 h-5 border border-white/20"
                            />
                            <span className={`text-xs font-medium ${isMarketVisible(market.id) ? 'text-green-500' : 'text-red-500'}`}>
                              {isMarketVisible(market.id) ? 'Online' : 'Offline'}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs shrink-0"
                            onClick={() => setViewMarket(market)}
                          >
                            View
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

          {/* Pagination */}
          {sortedMarkets.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, sortedMarkets.length)} of {sortedMarkets.length} markets
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

      {/* View Market Dialog */}
      <Dialog open={!!viewMarket} onOpenChange={() => setViewMarket(null)}>
        <DialogContent className="max-w-md">
          {viewMarket && (
            <div className="space-y-4">
              {/* Header with badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={statusConfig[viewMarket.status].color}>
                  {statusConfig[viewMarket.status].label}
                </Badge>
                <Badge variant="outline">{viewMarket.category}</Badge>
                {viewMarket.resolution && (
                  <Badge className={viewMarket.resolution === 'YES' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                    {viewMarket.resolution}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <p className="font-semibold">{viewMarket.claim}</p>

              {/* Pool Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-500 font-medium">YES ${viewMarket.yesPool.toLocaleString()}</span>
                  <span className="text-red-500 font-medium">NO ${viewMarket.noPool.toLocaleString()}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                  <div className="bg-green-500 h-full" style={{ width: `${(viewMarket.yesPool / (viewMarket.yesPool + viewMarket.noPool)) * 100}%` }} />
                  <div className="bg-red-500 h-full" style={{ width: `${(viewMarket.noPool / (viewMarket.yesPool + viewMarket.noPool)) * 100}%` }} />
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Volume</p>
                  <p className="font-bold text-sm">${viewMarket.totalVolume.toLocaleString()}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Users</p>
                  <p className="font-bold text-sm">{viewMarket.participants}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Disputes</p>
                  <p className="font-bold text-sm">{viewMarket.disputeCount || 0}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Avg</p>
                  <p className="font-bold text-sm">${viewMarket.participants > 0 ? Math.round(viewMarket.totalVolume / viewMarket.participants) : 0}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Created</span>
                  <p>{formatDate(viewMarket.createdAt)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Expires</span>
                  <p className={new Date() > viewMarket.expiresAt ? 'text-red-500' : ''}>{formatDate(viewMarket.expiresAt)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Creator</span>
                  <p><code className="bg-muted px-1.5 py-0.5 rounded text-xs">{viewMarket.creator}</code></p>
                </div>
                {viewMarket.resolvedBy && (
                  <div>
                    <span className="text-muted-foreground">Resolver</span>
                    <p><code className="bg-muted px-1.5 py-0.5 rounded text-xs">{viewMarket.resolvedBy}</code></p>
                  </div>
                )}
              </div>

              {/* Dispute Info (if any) */}
              {viewMarket.disputes && viewMarket.disputes.length > 0 && (
                <div className="border-t border-yellow-500/30 pt-3">
                  <p className="text-sm text-yellow-500 font-medium mb-2">Dispute: {disputeCategoryLabels[viewMarket.disputes[0].category]}</p>
                  <p className="text-sm text-muted-foreground">{viewMarket.disputes[0].reason}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setViewMarket(null)}>Close</Button>
                {viewMarket.status === 'pending' && (
                  <>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => setConfirmAction({ type: 'approve', markets: [viewMarket.id] })}>Approve</Button>
                    <Button variant="destructive" className="flex-1" onClick={() => setConfirmAction({ type: 'reject', markets: [viewMarket.id] })}>Reject</Button>
                  </>
                )}
                {viewMarket.status === 'expired' && (
                  <Button className="flex-1 bg-orange-500 hover:bg-orange-600" onClick={() => { setViewMarket(null); setResolveMarket(viewMarket); }}>Resolve</Button>
                )}
                {viewMarket.status === 'disputable' && viewMarket.disputeStatus === 'pending' && (
                  <Button style={{ backgroundColor: '#eab308', color: 'black' }} className="flex-1 hover:opacity-90 font-semibold" onClick={() => { setViewMarket(null); setReviewMarket(viewMarket); }}>Review Dispute</Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resolve Market Dialog */}
      <Dialog open={!!resolveMarket} onOpenChange={() => { setResolveMarket(null); setResolutionEvidence(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-orange-500" />
              Resolve Market
            </DialogTitle>
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

              {/* Evidence Field */}
              <div>
                <label className="text-sm font-medium">Evidence / Source *</label>
                <Textarea
                  className="mt-2"
                  placeholder="Provide evidence or source for this resolution (e.g., official announcement, news article URL, data source)..."
                  value={resolutionEvidence}
                  onChange={(e) => setResolutionEvidence(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => { setResolveMarket(null); setResolutionEvidence(''); }}>Cancel</Button>
            <Button
              style={{ backgroundColor: '#16a34a', color: 'white' }}
              className="hover:opacity-90 font-semibold"
              onClick={() => {
                if (!resolutionEvidence.trim()) {
                  toast.error('Please provide evidence for the resolution');
                  return;
                }
                executeResolution('YES');
                setResolutionEvidence('');
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolve YES
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!resolutionEvidence.trim()) {
                  toast.error('Please provide evidence for the resolution');
                  return;
                }
                executeResolution('NO');
                setResolutionEvidence('');
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Resolve NO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Dispute Dialog */}
      <Dialog open={!!disputeMarket} onOpenChange={() => { setDisputeMarket(null); setDisputeReason(''); setDisputeCategory('incorrect_resolution'); setDisputeEvidence(''); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                  <Badge className={disputeMarket.resolution === 'YES' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                    {disputeMarket.resolution}
                  </Badge>
                </div>
              </div>

              {/* Dispute Category */}
              <div>
                <label className="text-sm font-medium">Dispute Category</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full mt-2 justify-between">
                      {disputeCategoryLabels[disputeCategory]}
                      <ArrowUpDown className="h-4 w-4 ml-2 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {(Object.keys(disputeCategoryLabels) as DisputeCategory[]).map((cat) => (
                      <DropdownMenuItem key={cat} onClick={() => setDisputeCategory(cat)}>
                        {disputeCategoryLabels[cat]}
                        {disputeCategory === cat && <span className="ml-auto text-[#06f6ff]">✓</span>}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Reason */}
              <div>
                <label className="text-sm font-medium">Reason for Dispute</label>
                <Textarea
                  placeholder="Provide detailed reasoning for why this resolution is incorrect..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>

              {/* Evidence Links */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Evidence Links
                </label>
                <Textarea
                  placeholder="Paste links to supporting evidence (one per line)&#10;e.g., https://finance.yahoo.com/quote/NFLX"
                  value={disputeEvidence}
                  onChange={(e) => setDisputeEvidence(e.target.value)}
                  className="mt-2 font-mono text-xs"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Add links to price charts, news articles, or other verifiable sources
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDisputeMarket(null); setDisputeReason(''); setDisputeCategory('incorrect_resolution'); setDisputeEvidence(''); }}>
              Cancel
            </Button>
            <Button className="bg-yellow-500 text-black hover:bg-yellow-600" onClick={handleInitiateDispute}>
              <Flag className="h-4 w-4 mr-1" />
              Submit Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dispute Dialog */}
      <Dialog open={!!reviewMarket} onOpenChange={closeReviewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-yellow-500" />
              Review Dispute
            </DialogTitle>
            <DialogDescription>
              Review the dispute details and decide on the resolution.
            </DialogDescription>
          </DialogHeader>
          {reviewMarket && (
            <div className="space-y-4">
              {/* Market Info */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{reviewMarket.claim}</p>
                <p className="text-sm text-muted-foreground mt-1">{reviewMarket.description}</p>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Current Resolution:</span>
                    <Badge className={reviewMarket.resolution === 'YES' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                      {reviewMarket.resolution}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Volume:</span>
                    <span className="font-semibold">${reviewMarket.totalVolume.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Dispute Details */}
              {reviewMarket.disputes && reviewMarket.disputes.length > 0 ? (
                <div className="border border-yellow-500/30 rounded-lg overflow-hidden">
                  <div className="bg-yellow-500/10 px-4 py-2 border-b border-yellow-500/30">
                    <p className="font-medium text-yellow-500 flex items-center gap-2">
                      <Flag className="h-4 w-4" />
                      Dispute #{reviewMarket.disputes.length}
                    </p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Filed by:</span>
                        <code className="bg-muted px-2 py-0.5 rounded text-xs">{reviewMarket.disputes[0].filedBy}</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Filed:</span>
                        <span>{formatTimeAgo(reviewMarket.disputes[0].filedAt)}</span>
                      </div>
                    </div>
                    <div>
                      <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                        {disputeCategoryLabels[reviewMarket.disputes[0].category]}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Reason:</p>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {reviewMarket.disputes[0].reason}
                      </p>
                    </div>
                    {reviewMarket.disputes[0].evidence && reviewMarket.disputes[0].evidence.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Link className="h-4 w-4" />
                          Evidence ({reviewMarket.disputes[0].evidence.length})
                        </p>
                        <div className="space-y-1">
                          {reviewMarket.disputes[0].evidence.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-[#06f6ff] hover:underline"
                            >
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{url}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">No dispute details available</p>
                </div>
              )}

              {/* Resolution Warning */}
              {reviewMarket.totalVolume > 5000 && !reviewAction && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <p className="text-sm text-orange-500 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    High-volume market. Resolution will affect {reviewMarket.participants} participants.
                  </p>
                </div>
              )}

              {/* Action Panel - Uphold with Reason */}
              {reviewAction === 'uphold' && (
                <div className="border border-green-500/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle className="h-5 w-5" />
                    <p className="font-medium">Uphold Original Resolution</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Explain why the dispute is being rejected. This will be visible to the disputer.
                  </p>
                  <div>
                    <label className="text-sm font-medium">Rejection Reason *</label>
                    <Textarea
                      placeholder="e.g., The evidence provided does not support the claim. The price data shows..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setReviewAction(null); setAdminNotes(''); }}>
                      Back
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleResolveDispute('upheld')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirm & Reject Dispute
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Panel - Request More Evidence */}
              {reviewAction === 'request_evidence' && (
                <div className="border border-blue-500/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-blue-500">
                    <FileQuestion className="h-5 w-5" />
                    <p className="font-medium">Request More Evidence</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Specify what additional evidence is needed from the disputer.
                  </p>
                  <div>
                    <label className="text-sm font-medium">Evidence Request *</label>
                    <Textarea
                      placeholder="e.g., Please provide official price data from a verified source showing the exact timestamp when the price was reached..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setReviewAction(null); setAdminNotes(''); }}>
                      Back
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={handleRequestMoreEvidence}
                    >
                      <FileQuestion className="h-4 w-4 mr-1" />
                      Send Request
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions - Only show when no action selected */}
          {!reviewAction && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10"
                  onClick={() => setReviewAction('request_evidence')}
                >
                  <FileQuestion className="h-4 w-4 mr-1" />
                  Request Info
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                  onClick={() => setReviewAction('uphold')}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Uphold
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                  onClick={() => handleResolveDispute('overturned')}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Overturn
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleResolveDispute('voided')}
                >
                  <Ban className="h-4 w-4 mr-1" />
                  Void
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { const market = reviewMarket; closeReviewDialog(); setViewMarket(market); }}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={closeReviewDialog}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Approve Dialog */}
      <Dialog open={confirmAction?.type === 'approve'} onOpenChange={closeConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Approve {confirmAction?.markets.length === 1 ? 'Market' : `${confirmAction?.markets.length} Markets`}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.markets.length === 1
                ? 'This market will be deployed and available for trading immediately.'
                : 'These markets will be deployed and available for trading immediately.'}
            </DialogDescription>
          </DialogHeader>

          {/* Market Preview - Show for single market */}
          {confirmAction?.markets.length === 1 && (() => {
            const market = allMarkets.find(m => m.id === confirmAction.markets[0]);
            return market ? (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div>
                  <p className="text-sm font-medium">{market.claim}</p>
                  <p className="text-xs text-muted-foreground mt-1">{market.description}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    <span>{market.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span>{market.creator}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>Expires {market.expiresAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          {/* Multiple Markets Summary */}
          {confirmAction && confirmAction.markets.length > 1 && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Selected markets:
              </p>
              <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                {confirmAction.markets.map(id => {
                  const market = allMarkets.find(m => m.id === id);
                  return market ? (
                    <li key={id} className="text-sm truncate">• {market.claim}</li>
                  ) : null;
                })}
              </ul>
            </div>
          )}

          {/* Admin Notes (optional) */}
          <div>
            <label className="text-sm font-medium">Admin Notes (optional)</label>
            <Textarea
              className="mt-2"
              placeholder="Add any internal notes for this approval..."
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeConfirmDialog}>Cancel</Button>
            <Button
              style={{ backgroundColor: '#16a34a', color: 'white' }}
              className="hover:opacity-90 font-semibold"
              onClick={executeAction}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Reject Dialog */}
      <Dialog open={confirmAction?.type === 'reject'} onOpenChange={closeConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Reject {confirmAction?.markets.length === 1 ? 'Market' : `${confirmAction?.markets.length} Markets`}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.markets.length === 1
                ? 'This market will be rejected and the creator will be notified.'
                : 'These markets will be rejected and creators will be notified.'}
            </DialogDescription>
          </DialogHeader>

          {/* Market Preview - Show for single market */}
          {confirmAction?.markets.length === 1 && (() => {
            const market = allMarkets.find(m => m.id === confirmAction.markets[0]);
            return market ? (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div>
                  <p className="text-sm font-medium">{market.claim}</p>
                  <p className="text-xs text-muted-foreground mt-1">{market.description}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    <span>{market.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span>{market.creator}</span>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          {/* Multiple Markets Summary */}
          {confirmAction && confirmAction.markets.length > 1 && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Selected markets:
              </p>
              <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                {confirmAction.markets.map(id => {
                  const market = allMarkets.find(m => m.id === id);
                  return market ? (
                    <li key={id} className="text-sm truncate">• {market.claim}</li>
                  ) : null;
                })}
              </ul>
            </div>
          )}

          {/* Rejection Category */}
          <div>
            <label className="text-sm font-medium">Rejection Category *</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full mt-2 justify-between">
                  {rejectionCategoryLabels[rejectionCategory]}
                  <ArrowUpDown className="h-4 w-4 ml-2 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[calc(100%-2rem)]">
                {(Object.keys(rejectionCategoryLabels) as RejectionCategory[]).map((cat) => (
                  <DropdownMenuItem
                    key={cat}
                    onClick={() => setRejectionCategory(cat)}
                    className={rejectionCategory === cat ? 'bg-accent' : ''}
                  >
                    {rejectionCategoryLabels[cat]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Rejection Reason */}
          <div>
            <label className="text-sm font-medium">Rejection Reason *</label>
            <Textarea
              className="mt-2"
              placeholder="Explain why this market is being rejected..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Allow Resubmit */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allow-resubmit"
              checked={allowResubmit}
              onCheckedChange={(checked) => setAllowResubmit(checked as boolean)}
            />
            <label htmlFor="allow-resubmit" className="text-sm cursor-pointer">
              Allow creator to re-submit with edits
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeConfirmDialog}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={executeAction}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Market Modal */}
      <CreateMarketModal
        isOpen={createMarketOpen}
        onClose={() => setCreateMarketOpen(false)}
        onCreateMarket={(marketData) => {
          console.log('New market:', marketData);
          toast.success('Market created successfully');
          setCreateMarketOpen(false);
        }}
      />
    </div>
  );
};

export default MarketsDashboard;
