import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Award,
  Target,
  Users,
  Zap,
  Vote,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Minus,
  Eye,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

export interface UserBet {
  id: string;
  marketId: string;
  marketClaim?: string;
  position: "yes" | "no";
  amount: number;
  odds?: number;
  potentialWinning?: number;
  potentialReturn?: number;
  placedAt: Date;
  status: "active" | "won" | "lost" | "pending";
  resolvedAt?: Date;
  actualWinning?: number;
}

interface BettingPortfolioProps {
  userBalance: number;
  userBets: UserBet[];
  onAddFunds?: () => void;
  onWithdraw?: () => void;
}

export default function BettingPortfolio({
  userBalance,
  userBets,
  onAddFunds,
  onWithdraw,
}: BettingPortfolioProps) {
  // Default handlers if not provided
  const handleAddFunds =
    onAddFunds ||
    (() => {
      window.alert("Add funds functionality coming soon!");
    });
  const handleWithdraw =
    onWithdraw ||
    (() => {
      window.alert("Withdraw functionality coming soon!");
    });

  // Calculate portfolio stats
  const totalCastAmount = userBets.reduce((sum, cast) => sum + cast.amount, 0);
  const activeCasts = userBets.filter((cast) => cast.status === "active");
  const resolvedCasts = userBets.filter(
    (cast) => cast.status === "won" || cast.status === "lost"
  );
  const wonCasts = userBets.filter((cast) => cast.status === "won");
  const totalWinnings = wonCasts.reduce(
    (sum, cast) => sum + (cast.actualWinning || 0),
    0
  );
  const totalPotentialWinnings = activeCasts.reduce(
    (sum, cast) => sum + (cast.potentialWinning || cast.potentialReturn || 0),
    0
  );
  const winRate =
    resolvedCasts.length > 0
      ? (wonCasts.length / resolvedCasts.length) * 100
      : 0;
  const totalPnL =
    totalWinnings - resolvedCasts.reduce((sum, cast) => sum + cast.amount, 0);

  // Truth casting accuracy (simulated)
  const truthAccuracy = 87.3; // Percentage of correct truth predictions

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "won":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "lost":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "active":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "won":
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
            WON
          </Badge>
        );
      case "lost":
        return (
          <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
            LOST
          </Badge>
        );
      case "active":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
            ACTIVE
          </Badge>
        );
      default:
        return <Badge variant="outline">PENDING</Badge>;
    }
  };

  const getPositionBadge = (position: string) => {
    return position === "yes" ? (
      <Badge className="bg-primary/20 text-primary border-primary/30">
        TRUE
      </Badge>
    ) : (
      <Badge className="bg-secondary/20 text-secondary border-secondary/30">
        FALSE
      </Badge>
    );
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className="space-y-6 mx-auto">
          {/* Balance & Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-border rounded-xl bg-transparent">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-primary">
                    Available Balance
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {userBalance.toFixed(3)} USDT
                </p>
                <p className="text-sm text-muted-foreground">Ready for casting</p>
              </CardContent>
            </div>

            <div className="border border-border rounded-xl bg-transparent">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Vote className="h-5 w-5 text-secondary" />
                  <span className="font-semibold text-secondary">Total Cast</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {totalCastAmount.toFixed(3)} USDT
                </p>
                <p className="text-sm text-muted-foreground">
                  Across {userBets.length} positions
                </p>
              </CardContent>
            </div>

            <div className="border border-border rounded-xl bg-transparent">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <span className="font-semibold text-green-500">
                    Truth Accuracy
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {truthAccuracy}%
                </p>
                <p className="text-sm text-muted-foreground">
                  Verification success rate
                </p>
              </CardContent>
            </div>

            <div className="border border-border rounded-xl bg-transparent">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold text-yellow-500">P&L</span>
                </div>
                <p
                  className={`text-2xl font-bold ${
                    totalPnL >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {totalPnL >= 0 ? "+" : ""}
                  {totalPnL.toFixed(3)} USDT
                </p>
                <p className="text-sm text-muted-foreground">
                  {winRate.toFixed(1)}% win rate
                </p>
              </CardContent>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search predictions"
                className="w-full h-9 px-3 pl-10 py-2 bg-input-background dark:bg-input/30 dark:hover:bg-input/50 border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-[3px] focus:ring-ring/50 focus:border-ring transition-[color,box-shadow] hover:bg-input/50"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="All Topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                <SelectItem value="politics">Politics</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="newest">
              <SelectTrigger>
                <SelectValue placeholder="Newest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="highest">Highest Value</SelectItem>
                <SelectItem value="lowest">Lowest Value</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Portfolio/Positions Table */}
          <div className="border border-border rounded-xl overflow-hidden bg-transparent">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] bg-transparent">
                <thead className="bg-transparent">
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground w-[28%]">Market</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground w-[7%]">Token</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground w-[10%]">Outcome</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground w-[9%]">Invested</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground w-[13%]">Position</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground w-[10%]">Final value</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground w-[8%]">PNL</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground w-[10%]">Date</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground w-[5%]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-transparent">
                  {userBets.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-16 text-center">
                        <p className="text-muted-foreground">No markets found. Try changing the filters.</p>
                      </td>
                    </tr>
                  ) : (
                    userBets.map((bet) => (
                      <tr key={bet.id} className="transition-colors">
                        <td className="px-6 py-4 text-sm">
                          <p className="text-foreground font-medium line-clamp-2">{bet.marketClaim || "Market position"}</p>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className="text-muted-foreground">USDT</span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {getPositionBadge(bet.position)}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className="text-foreground">{bet.amount.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(bet.status)}
                            <span className="text-muted-foreground text-xs whitespace-nowrap">@ {bet.odds || 2.0}x</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className="text-foreground">
                            {bet.status === 'won'
                              ? (bet.actualWinning || 0).toFixed(2)
                              : bet.status === 'active'
                              ? (bet.potentialWinning || bet.potentialReturn || 0).toFixed(2)
                              : '0.00'
                            }
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className={`font-semibold whitespace-nowrap ${
                            bet.status === 'won' ? 'text-green-500' :
                            bet.status === 'lost' ? 'text-red-500' :
                            'text-yellow-500'
                          }`}>
                            {bet.status === 'won'
                              ? `+${((bet.actualWinning || 0) - bet.amount).toFixed(2)}`
                              : bet.status === 'lost'
                              ? `-${bet.amount.toFixed(2)}`
                              : '---'
                            }
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className="text-muted-foreground whitespace-nowrap">{formatTimeAgo(bet.placedAt)}</span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
    </div>
  );
}
