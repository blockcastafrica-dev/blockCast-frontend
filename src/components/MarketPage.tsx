import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import textCounter from "@/components/ui/text-counter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  Star,
  MessageCircle,
  ArrowLeft,
  Share2,
  Zap,
  Globe,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Send,
  Filter,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  Scale,
  MessagesSquare,
  Clock4,
  Activity,
  X,
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/components/LanguageContext";
import { BettingMarket } from "@/components/BettingMarkets";
import {
  generateMockComments,
  getMarketRules,
  formatTimeAgo,
  MarketComment,
  MarketRule,
} from "@/utils/marketData";
import TextCounter from "./TextCounter";
import Thumbnail from "./Thumbnail";
import ShareModal from "./ShareModal";
import ProbabilityChart from "./ProbabilityChart";
// import dispute from "../assets/dispute.svg";

interface MarketPageProps {
  market: BettingMarket;
  onPlaceBet: (
    marketId: string,
    position: "yes" | "no",
    amount: number
  ) => void;
  userBalance: number;
  onBack: () => void;
}

// Define the type for profit calculation
interface ProfitCalculation {
  amount: number;
  potential: number;
  profit: number;
  grossPayout: number;
  fee: number;
  shares: number;
  pricePerShare: number;
  odds: number;
}

// Define the type for sell calculation
interface SellCalculation {
  sharesToSell: number;
  currentPrice: number;
  grossProceeds: number;
  fee: number;
  netProceeds: number;
  profitLoss: number;
  profitLossPercent: number;
  avgCostBasis: number;
}

// Mock user positions - shares owned by the user
interface UserPosition {
  outcomeId: string;
  shares: number;
  avgCostBasis: number; // Average price paid per share
}

const SELL_FEE_PERCENTAGE = 0.03; // 3% fee on sell proceeds

const quickCastAmounts = [0.01, 0.05, 0.1, 0.5, 1.0];

export default function MarketPage({
  market,
  onPlaceBet,
  userBalance,
  onBack,
}: MarketPageProps) {
  const { t, language } = useLanguage();
  const [castPosition, setCastPosition] = useState<"yes" | "no" | null>(null);
  const [castAmount, setCastAmount] = useState<string>("");
  const [profitCalculation, setProfitCalculation] =
    useState<ProfitCalculation | null>(null);
  const [newComment, setNewComment] = useState<string>("");
  const [commentPosition, setCommentPosition] = useState<
    "yes" | "no" | "neutral"
  >("neutral");
  const [comments] = useState<MarketComment[]>(generateMockComments(market.id));
  const [rules] = useState<MarketRule[]>(getMarketRules(market.id));
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showMobileBetModal, setShowMobileBetModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "dispute" | "overview" | "comments" | "analysis" | "activity"
  >("overview");
  const [claim, setClaim] = useState<string>("");
  const [isTrue, setIsTrue] = useState<string>("");
  const [hoveredPill, setHoveredPill] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [evidenceLink, setEvidenceLink] = useState("");
  const [castInterface, setCastInterface] = useState<"buy" | "sell">("buy");
  const [holdersPosition, setHoldersPosition] = useState<"yes" | "no">("yes");
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [selectedHoldersOutcome, setSelectedHoldersOutcome] = useState<string | null>(
    market.isMultipleChoice && market.outcomes?.[0] ? market.outcomes[0].id : null
  );
  const [sellCalculation, setSellCalculation] = useState<SellCalculation | null>(null);
  const [sellAmount, setSellAmount] = useState<string>("");
  const [selectedSellPercent, setSelectedSellPercent] = useState<number | null>(null);

  // Mock user positions - in a real app, this would come from user's portfolio
  const userPositions: UserPosition[] = market.isMultipleChoice && market.outcomes
    ? market.outcomes.map((outcome, index) => ({
        outcomeId: outcome.id,
        shares: index === 0 ? 150 : index === 1 ? 75 : 0, // Mock: user owns shares in first two outcomes
        avgCostBasis: index === 0 ? 0.25 : 0.20, // Mock: average price paid per share
      }))
    : [
        { outcomeId: 'yes', shares: 100, avgCostBasis: 0.45 }, // User owns 100 YES shares at avg $0.45
        { outcomeId: 'no', shares: 50, avgCostBasis: 0.35 },   // User owns 50 NO shares at avg $0.35
      ];

  // Get user's position for the selected outcome
  const getUserPosition = () => {
    if (market.isMultipleChoice && selectedOutcome) {
      return userPositions.find(p => p.outcomeId === selectedOutcome);
    }
    return userPositions.find(p => p.outcomeId === castPosition);
  };

  const userPosition = getUserPosition();

  // Get position details with current price and profit/loss for any outcome
  const getPositionDetails = (outcomeId: string) => {
    const position = userPositions.find(p => p.outcomeId === outcomeId);
    if (!position || position.shares === 0) return null;

    // Get current price based on outcome
    let currentPrice: number;
    if (market.isMultipleChoice && market.outcomes) {
      const outcome = market.outcomes.find(o => o.id === outcomeId);
      currentPrice = outcome ? (outcome.pool / market.totalPool) : 0;
    } else {
      currentPrice = outcomeId === 'yes'
        ? (market.yesPool / market.totalPool)
        : (market.noPool / market.totalPool);
    }

    const currentValue = position.shares * currentPrice;
    const costBasis = position.shares * position.avgCostBasis;
    const profitLoss = currentValue - costBasis;
    const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;

    return {
      shares: position.shares,
      avgCostBasis: position.avgCostBasis,
      currentPrice,
      currentValue,
      profitLoss,
      profitLossPercent,
    };
  };

  // Get positions with shares > 0 for sell mode
  const positionsWithShares = userPositions.filter(p => p.shares > 0);

  // Activity data - single source of truth
  const activityData = [
    { id: "1", wallet: "0x7835...892f", action: "bought", shares: 143, position: "no", price: 0.28, total: 39.8, time: "25 minutes ago", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1" },
    { id: "2", wallet: "0x66CE...A2E3", action: "bought", shares: 93.1, position: "no", price: 0.27, total: 25.4, time: "2 hours ago", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2" },
    { id: "3", wallet: "freedom", action: "bought", shares: 101, position: "no", price: 0.26, total: 26.6, time: "2 hours ago", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3" },
    { id: "4", wallet: "Senzer", action: "bought", shares: 81.6, position: "yes", price: 0.75, total: 61.3, time: "2 hours ago", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4" },
    { id: "5", wallet: "wildegou", action: "bought", shares: 178, position: "no", price: 0.25, total: 44.9, time: "5 hours ago", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=5" },
    { id: "6", wallet: "KnightXBT", action: "bought", shares: 132, position: "yes", price: 0.76, total: 100, time: "5 hours ago", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=6" },
    { id: "7", wallet: "FeeDis", action: "bought", shares: 45.5, position: "yes", price: 0.74, total: 33.7, time: "6 hours ago", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=feedis" },
    { id: "8", wallet: "xiashaonianxu", action: "bought", shares: 38.2, position: "yes", price: 0.73, total: 27.9, time: "8 hours ago", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xia" },
    { id: "9", wallet: "BlockMaster", action: "bought", shares: 65.0, position: "no", price: 0.24, total: 15.6, time: "10 hours ago", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=block" },
    { id: "10", wallet: "TruthSeeker", action: "bought", shares: 52.3, position: "no", price: 0.23, total: 12.0, time: "12 hours ago", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=truth" },
  ];

  // Compute holders from activity data
  const computeHolders = (position: "yes" | "no") => {
    const holdersMap = new Map<string, { wallet: string; shares: number; avatar: string }>();

    activityData
      .filter(a => a.position === position)
      .forEach(activity => {
        const existing = holdersMap.get(activity.wallet);
        if (existing) {
          existing.shares += activity.action === "bought" ? activity.shares : -activity.shares;
        } else {
          holdersMap.set(activity.wallet, {
            wallet: activity.wallet,
            shares: activity.action === "bought" ? activity.shares : -activity.shares,
            avatar: activity.avatar
          });
        }
      });

    return Array.from(holdersMap.values())
      .filter(h => h.shares > 0)
      .sort((a, b) => b.shares - a.shares)
      .map((h, i) => ({ rank: i + 1, username: h.wallet, shares: h.shares, avatar: h.avatar }));
  };

  const holdersData = {
    yes: computeHolders("yes"),
    no: computeHolders("no")
  };

  // Generate mock holders for multiple choice outcomes
  const generateOutcomeHolders = (outcomeId: string, index: number) => {
    const wallets = [
      "0x7835...892f", "0x66CE...A2E3", "freedom", "Senzer", "wildegou",
      "KnightXBT", "FeeDis", "xiashaonianxu", "BlockMaster", "TruthSeeker",
      "CryptoKing", "AfricaRising", "TokenMaster", "DeFiPro", "ChainLink"
    ];
    // Use different subset of wallets based on outcome index
    const startIdx = (index * 3) % wallets.length;
    const selectedWallets = [...wallets.slice(startIdx), ...wallets.slice(0, startIdx)].slice(0, 8);

    return selectedWallets.map((wallet, i) => ({
      rank: i + 1,
      username: wallet,
      shares: Math.floor((200 - i * 20) * (1 + Math.sin(index + i) * 0.3)),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${outcomeId}${i}`
    }));
  };

  // Create holders data for multiple choice outcomes
  const outcomeHoldersData: Record<string, { rank: number; username: string; shares: number; avatar: string }[]> = {};
  if (market.isMultipleChoice && market.outcomes) {
    market.outcomes.forEach((outcome, index) => {
      outcomeHoldersData[outcome.id] = generateOutcomeHolders(outcome.id, index);
    });
  }

  const isSelling = castInterface === "sell";
  const isBuying = castInterface === "buy";

  console.log(isBuying, isSelling);

  // console.log(market, isTrue);

  const handleVerifyClaim = (value: string) => {
    setIsTrue(value);
    // console.log(isTrue);
  };

  // Helper function to get translated text
  const getTranslatedText = (
    text: string,
    translations?: { en: string; fr: string; sw: string }
  ) => {
    if (!translations) return text;
    return translations[language] || translations.en || text;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}k`;
    }
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return `$${formatNumber(amount)}`;
  };

  const getTimeRemaining = (expiresAt: Date): string => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) return t("expired");

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleQuickCast = (position: "yes" | "no", amount: number) => {
    if (amount > userBalance) {
      toast.error(t("insufficientBalance") || "Insufficient balance");
      return;
    }

    onPlaceBet(market.id, position, amount);

    // Success feedback
    toast.success(
      `Truth position cast: ${position.toUpperCase()} with ${amount} USDT`
    );
  };

  const MIN_BET_AMOUNT = 1; // Minimum bet amount in USDT
  const FEE_PERCENTAGE = 0.03; // 3% fee on winnings

  // Helper to get current odds based on market type
  const getCurrentOdds = () => {
    if (market.isMultipleChoice && market.outcomes && selectedOutcome) {
      const outcome = market.outcomes.find(o => o.id === selectedOutcome);
      return outcome ? outcome.odds : 1;
    }
    return castPosition === "yes" ? market.yesOdds : market.noOdds;
  };

  // Helper to get current percentage based on market type
  const getCurrentPercentage = () => {
    if (market.isMultipleChoice && market.outcomes && selectedOutcome) {
      const outcome = market.outcomes.find(o => o.id === selectedOutcome);
      return outcome ? Math.round((outcome.pool / market.totalPool) * 100) : 0;
    }
    return castPosition === "yes"
      ? Math.round((market.yesPool / market.totalPool) * 100)
      : Math.round((market.noPool / market.totalPool) * 100);
  };

  // Helper to get selected outcome label
  const getSelectedOutcomeLabel = () => {
    if (market.isMultipleChoice && market.outcomes && selectedOutcome) {
      const outcome = market.outcomes.find(o => o.id === selectedOutcome);
      return outcome ? outcome.label : '';
    }
    return castPosition === "yes" ? "True" : "False";
  };

  const calculateProfit = (amount: number, position: "yes" | "no") => {
    const odds = market.isMultipleChoice ? getCurrentOdds() : (position === "yes" ? market.yesOdds : market.noOdds);
    const grossPayout = amount * odds;
    const grossProfit = grossPayout - amount;
    const fee = grossProfit * FEE_PERCENTAGE;
    const netPayout = grossPayout - fee;
    const netProfit = netPayout - amount;
    const pricePerShare = 1 / odds;
    const shares = Math.floor(amount / pricePerShare);
    return { amount, potential: netPayout, profit: netProfit, grossPayout, fee, shares, pricePerShare, odds };
  };

  // Calculate sell proceeds - different logic from buying
  const calculateSellProceeds = (sharesToSell: number): SellCalculation | null => {
    const position = getUserPosition();
    if (!position || position.shares === 0) return null;

    // Current price per share = probability (e.g., 30% = $0.30)
    const currentPrice = getCurrentPercentage() / 100;
    const grossProceeds = sharesToSell * currentPrice;
    const fee = grossProceeds * SELL_FEE_PERCENTAGE;
    const netProceeds = grossProceeds - fee;

    // Calculate profit/loss based on average cost basis
    const costBasis = sharesToSell * position.avgCostBasis;
    const profitLoss = netProceeds - costBasis;
    const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;

    return {
      sharesToSell,
      currentPrice,
      grossProceeds,
      fee,
      netProceeds,
      profitLoss,
      profitLossPercent,
      avgCostBasis: position.avgCostBasis,
    };
  };

  const handleAmountChange = (value: string) => {
    setCastAmount(value);
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount > 0) {
      setProfitCalculation(calculateProfit(amount, castPosition));
    } else {
      setProfitCalculation(null);
    }
  };

  // Handle sell amount change (in shares)
  const handleSellAmountChange = (value: string, clearPercent: boolean = true) => {
    setSellAmount(value);
    if (clearPercent) {
      setSelectedSellPercent(null);
    }
    const shares = parseFloat(value);
    if (!isNaN(shares) && shares > 0) {
      setSellCalculation(calculateSellProceeds(shares));
    } else {
      setSellCalculation(null);
    }
  };

  // Handle percentage button click for sell
  const handleSellPercentClick = (percent: number, shares: number) => {
    const amount = percent === 100 ? shares : Math.floor(shares * (percent / 100));
    setSelectedSellPercent(percent);
    handleSellAmountChange(amount.toString(), false);
  };

  const handlePositionChange = (position: "yes" | "no") => {
    setCastPosition(position);
    const amount = parseFloat(castAmount);
    if (!isNaN(amount) && amount > 0) {
      setProfitCalculation(calculateProfit(amount, position));
    }
  };

  // Recalculate profit when selectedOutcome changes for multiple choice markets
  useEffect(() => {
    if (market.isMultipleChoice && selectedOutcome) {
      const amount = parseFloat(castAmount);
      if (!isNaN(amount) && amount > 0) {
        setProfitCalculation(calculateProfit(amount, castPosition));
      }
    }
  }, [selectedOutcome]);

  const handleCustomCast = () => {
    const amount = parseFloat(castAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amount < MIN_BET_AMOUNT) {
      toast.error(`Minimum bet amount is ${MIN_BET_AMOUNT} USDT`);
      return;
    }
    if (amount > userBalance) {
      toast.error(t("insufficientBalance") || "Insufficient balance");
      return;
    }

    onPlaceBet(market.id, castPosition, amount);
    setCastAmount("");
    setProfitCalculation(null);

    toast.success(
      `Custom truth position cast: ${castPosition.toUpperCase()} with ${amount} USDT`
    );
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    // Mock comment submission
    toast.success("Comment posted successfully!");
    setNewComment("");
    setCommentPosition("neutral");
  };

  const handleLikeComment = (commentId: string) => {
    const newLikedComments = new Set(likedComments);
    if (likedComments.has(commentId)) {
      newLikedComments.delete(commentId);
    } else {
      newLikedComments.add(commentId);
    }
    setLikedComments(newLikedComments);
  };

  const getRuleIcon = (category: string) => {
    switch (category) {
      case "resolution":
        return CheckCircle2;
      case "timing":
        return Clock3;
      case "eligibility":
        return FileText;
      case "verification":
        return Shield;
      default:
        return AlertCircle;
    }
  };

  const getRuleColor = (category: string) => {
    switch (category) {
      case "resolution":
        return "text-green-500";
      case "timing":
        return "text-blue-500";
      case "eligibility":
        return "text-yellow-500";
      case "verification":
        return "text-primary";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-3 md:space-y-4 lg:space-y-4 mx-auto scroll-smooth max-w-[1400px]"> {/* Added max-width for better desktop layout */}
      {/* Header */}
      <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1 md:gap-2 lg:gap-2 text-xs md:text-sm lg:text-sm h-8 md:h-9 lg:h-10"
          {...({} as any)}
        >
          <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 lg:h-4 lg:w-4" />
          {t("backToMarkets")}
        </Button>

      </div>

      {/* Main Two-Column Layout for Desktop */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Left Column - All Content */}
        <div className="flex-1 min-w-0 space-y-3 md:space-y-4">
          {/* Market Header Card - Modern Compact Design */}
          <div className="overflow-hidden border border-border rounded-xl bg-transparent">
        <CardContent className="p-4 md:p-5">
          <div className="space-y-4">
            {/* Header with Image Thumbnail */}
            <div className="flex gap-4">
              {market.imageUrl && (
                <img
                  src={market.imageUrl}
                  alt={getTranslatedText(market.claim, market.claimTranslations)}
                  className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-xl object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">
                    {getTranslatedText(market.claim, market.claimTranslations)}
                  </h1>
                  {/* Action Buttons - Desktop only */}
                  <div className="hidden lg:flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="default"
                      onClick={() => setShowShareModal(true)}
                      className="text-white hover:text-white h-10 px-4 text-base"
                    >
                      <Share2 className="h-6 w-6 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
                {/* Meta Info - Inline with title */}
                <div className="flex items-center gap-3 md:gap-6 text-sm md:text-base text-white mt-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 mr-2" />
                    <span>{getTimeRemaining(market.expiresAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <span>Vol. ${Math.round(market.totalPool / 1000)}k</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Probability Chart - Full Width */}
            <div className="w-full -mb-1">
              <ProbabilityChart
                yesPercentage={(market.yesPool / market.totalPool) * 100}
                noPercentage={(market.noPool / market.totalPool) * 100}
                totalPool={market.totalPool}
                yesPool={market.yesPool}
                noPool={market.noPool}
                onShare={() => setShowShareModal(true)}
                isMultipleChoice={market.isMultipleChoice}
                outcomes={market.outcomes}
              />
            </div>
          </div>
        </CardContent>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1 md:gap-1 lg:gap-1 p-1.5 md:p-2 lg:p-2 bg-muted/50 rounded-lg">
        {[
          { id: "overview", label: t("Overview"), icon: Target },
          market.disputable && {
            id: "dispute",
            label: t("Dispute"),
            icon: MessagesSquare,
          },
          !market.disputable && {
            id: "activity",
            label: "Activity",
            icon: Activity,
          },
          { id: "analysis", label: t("aiAnalysis"), icon: Zap },
          {
            id: "comments",
            label: t("Comments"),
            icon: MessageCircle,
            count: comments.length,
          },
        ]
          .filter(Boolean)
          .map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className="flex-1 gap-1 md:gap-2 lg:gap-2 text-xs md:text-sm lg:text-sm h-8 md:h-9 lg:h-10 px-2 md:px-3 lg:px-4"
                {...({} as any)}
              >
                <Icon className="h-3 w-3 md:h-4 md:w-4 lg:h-4 lg:w-4" />
                {tab.label}
                {tab.count && (
                  <Badge variant="secondary" className="ml-0.5 md:ml-1 lg:ml-1 text-[10px] md:text-xs lg:text-xs">
                    {tab.count}
                  </Badge>
                )}
              </Button>
            );
          })}
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
          {/* Dispute Tab */}
          {activeTab === "dispute" && market.disputable && (
            <>
              <div className="border border-border rounded-xl bg-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-semibold">
                    <MessageCircle className="h-5 w-5" />
                    Submit Evidence
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    If you have evidence that contradicts the AI resolution,
                    submit it here. Your evidence will be reviewed by our
                    dispute resolution system.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 pt-4 mt-2">
                  <div className="space-y-3">
                    <Label htmlFor="claim">
                      Describe your evidence
                    </Label>
                    <Textarea
                      id="claim"
                      placeholder="Explain why you think the AI resolution is incorrect. Be specific and cite your sources..."
                      value={claim}
                      onChange={(e) => setClaim(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    <TextCounter text={claim} />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="evidence" className="flex items-center gap-2">
                      <Link2 className="h-4 w-4" />
                      Evidence Links
                    </Label>
                    <Textarea
                      id="evidence"
                      placeholder={"Paste links to supporting evidence (one per line)\ne.g., https://finance.yahoo.com/quote/NFLX"}
                      value={evidenceLink}
                      onChange={(e) => setEvidenceLink(e.target.value)}
                      rows={3}
                      className="resize-none font-mono text-sm"
                    />
                    <span className="text-sm text-muted-foreground">
                      Add links to price charts, news articles, or other verifiable sources
                    </span>
                    <Thumbnail url={evidenceLink} />
                  </div>

                  <div className="space-y-3">
                    <Label>What should the correct outcome be?</Label>
                    <div className="flex flex-wrap gap-3">
                      {market.isMultipleChoice && market.outcomes ? (
                        market.outcomes.map((outcome) => (
                          <button
                            key={outcome.id}
                            type="button"
                            className="px-6 py-3 rounded-full border-2 transition-all text-base font-bold outline-none"
                            style={{
                              backgroundColor: isTrue === outcome.id ? outcome.color : "transparent",
                              color: isTrue === outcome.id ? "black" : (hoveredPill === outcome.id ? outcome.color : "#ffffff"),
                              borderColor: isTrue === outcome.id ? outcome.color : (hoveredPill === outcome.id ? outcome.color : "#444"),
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerifyClaim(outcome.id);
                            }}
                            onMouseEnter={() => setHoveredPill(outcome.id)}
                            onMouseLeave={() => setHoveredPill(null)}
                          >
                            {outcome.label}
                          </button>
                        ))
                      ) : (
                        <>
                          <button
                            type="button"
                            className="px-6 py-3 rounded-full border-2 transition-all text-base font-bold outline-none"
                            style={{
                              backgroundColor: isTrue === "True" ? "#06f6ff" : "transparent",
                              color: isTrue === "True" ? "black" : (hoveredPill === "True" ? "#06f6ff" : "#ffffff"),
                              borderColor: isTrue === "True" ? "#06f6ff" : (hoveredPill === "True" ? "#06f6ff" : "#444"),
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerifyClaim("True");
                            }}
                            onMouseEnter={() => setHoveredPill("True")}
                            onMouseLeave={() => setHoveredPill(null)}
                          >
                            True
                          </button>
                          <button
                            type="button"
                            className="px-6 py-3 rounded-full border-2 transition-all text-base font-bold outline-none"
                            style={{
                              backgroundColor: isTrue === "False" ? "#A855F7" : "transparent",
                              color: isTrue === "False" ? "white" : (hoveredPill === "False" ? "#A855F7" : "#ffffff"),
                              borderColor: isTrue === "False" ? "#A855F7" : (hoveredPill === "False" ? "#A855F7" : "#444"),
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerifyClaim("False");
                            }}
                            onMouseEnter={() => setHoveredPill("False")}
                            onMouseLeave={() => setHoveredPill(null)}
                          >
                            False
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submission Fee:</span>
                      <span>0.1 USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Potential Reward:</span>
                      <span>Up to 1.0 USDT</span>
                    </div>
                  </div>

                  <Button
                    onClick={async () => {
                      setIsVerifying(true);
                      try {
                        await new Promise((res) => setTimeout(res, 1000));
                        toast.success("Evidence submitted successfully");
                        setClaim("");
                      } catch (e) {
                        console.error(e);
                        toast.error("Submission failed");
                      } finally {
                        setIsVerifying(false);
                      }
                    }}
                    disabled={isVerifying || !claim.trim() || isTrue === ""}
                    className="w-full"
                  >
                    {isVerifying ? "Submitting..." : "Submit Evidence"}
                  </Button>
                </CardContent>
              </div>

            </>
          )}

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="border border-border rounded-xl bg-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {t("marketOverview")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">
                    {t("marketDescription")}
                  </h3>
                  <p className="text-muted-foreground">
                    {getTranslatedText(
                      market.description,
                      market.descriptionTranslations
                    )}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">AI Verification Process</h3>
                  <p className="text-muted-foreground">
                    This market uses AI-powered truth verification combined with
                    community consensus. Our system analyzes multiple credible
                    sources, cross-references data, and incorporates expert
                    analysis to determine the most accurate outcome.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Source of Credibility</h3>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{market.source}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    All data is sourced from verified and authoritative organizations
                    to ensure accuracy and reliability.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Resolution Authority</h3>
                  <p className="text-muted-foreground">
                    Market resolution is determined by AI analysis of official sources
                    and verified data. In case of disputes, our multi-layer verification
                    system reviews additional evidence and expert input.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Resolution Timeline</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Market Closes:</span>
                      <span className="text-sm text-muted-foreground">
                        {market.expiresAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Resolution Period:</span>
                      <span className="text-sm text-muted-foreground">
                        24-48 hours after market closes
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">{t("marketStatus")}</h3>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        market.status === "active" ? "default" : "secondary"
                      }
                    >
                      {market.status.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {t("expiresIn")} {getTimeRemaining(market.expiresAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && !market.disputable && (
            <div className="border border-border rounded-xl bg-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Market Activity
                  </CardTitle>
                  <CardDescription>Recent trading positions and transactions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Activity Feed */}
                {activityData.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-3 p-4 rounded-lg bg-card/30 hover:bg-card/50 transition-colors border border-border/50"
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={activity.avatar} />
                      <AvatarFallback>
                        {activity.wallet.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap leading-relaxed">
                        <span className="font-semibold text-base">{activity.wallet}</span>
                        <span className="text-sm text-muted-foreground">{activity.action}</span>
                        <span className="font-bold text-base">{activity.shares}</span>
                        <span className="text-sm text-muted-foreground">shares of</span>
                        <Badge
                          variant={activity.position === "yes" ? "default" : "secondary"}
                          className="text-xs shrink-0"
                        >
                          {activity.position === "yes" ? "True" : "False"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          at ${activity.price.toFixed(2)} (${activity.total.toFixed(1)})
                        </span>
                      </div>
                    </div>

                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 self-start">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </CardContent>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === "comments" && (
            <div className="border border-border rounded-xl bg-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  {t("communityDiscussion")} ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Comment */}
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <Label>{t("shareYourThoughts")}</Label>
                  <Textarea
                    placeholder={t("writeCommentPlaceholder")}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-20"
                  />
                  <div className="flex items-center justify-between">
                    <Select
                      value={commentPosition}
                      onValueChange={(value: any) => setCommentPosition(value)}
                    >
                      <SelectTrigger className="w-40" {...({} as any)}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="neutral">{t("neutral")}</SelectItem>
                        <SelectItem value="yes">{t("truthYes")}</SelectItem>
                        <SelectItem value="no">{t("truthNo")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleCommentSubmit} className="gap-2">
                      <Send className="h-4 w-4" />
                      {t("postComment")}
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex gap-3 p-4 bg-card/50 rounded-lg"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.avatar} />
                        <AvatarFallback>
                          {comment.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {comment.username}
                          </span>
                          {comment.isVerified && (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          )}
                          {comment.position && (
                            <Badge
                              variant={
                                comment.position === "yes"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {comment.position === "yes"
                                ? t("truthYes")
                                : t("truthNo")}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(comment.timestamp)}
                          </span>
                        </div>

                        <p className="text-sm">{comment.comment}</p>

                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLikeComment(comment.id)}
                            className={`gap-1 h-8 ${
                              likedComments.has(comment.id)
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                            {...({} as any)}
                          >
                            <ThumbsUp className="h-3 w-3" />
                            {comment.likes +
                              (likedComments.has(comment.id) ? 1 : 0)}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 h-8 text-muted-foreground"
                            {...({} as any)}
                          >
                            <MessageCircle className="h-3 w-3" />
                            {t("reply")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </div>
          )}

          {/* AI Analysis Tab */}
          {activeTab === "analysis" && (
            <div className="border border-border rounded-xl bg-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {t("aiAnalysis")} & {t("insights")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2">
                    {t("aiConfidenceScore")}
                  </h4>
                  <div className="flex items-center gap-2">
                    <Progress value={72} className="flex-1" />
                    <span className="font-bold">72%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t("aiConfidenceExplanation")}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">{t("keyFactors")}</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      Historical production trends show consistent 15% annual
                      growth
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      Increased investment from streaming platforms
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      Economic uncertainties may impact funding
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      Quality vs quantity balance remains a challenge
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">{t("dataSources")}</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Nigerian Film Corporation official statistics</p>
                    <p>• Nollywood Producers Association reports</p>
                    <p>• International film industry databases</p>
                    <p>• Streaming platform content reports</p>
                  </div>
                </div>
              </CardContent>
            </div>
          )}
          </div>
          {/* End of Tab Content */}

          {/* TOP HOLDERS SECTION - Mobile */}
          {!market.disputable && (
            <div className="lg:hidden mt-4 rounded-2xl bg-gradient-to-b from-zinc-950 to-black border border-zinc-800/50 shadow-2xl overflow-hidden backdrop-blur-xl mb-32">
              {/* Header */}
              <div className="p-4 border-b border-zinc-800/30">
                <h3 className="text-lg font-bold text-white">Top Holders</h3>
              </div>

              {/* Outcome Toggle */}
              <div className="px-4 pt-4 pb-4">
                {market.isMultipleChoice && market.outcomes ? (
                  <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide justify-center">
                    {market.outcomes.map((outcome) => (
                      <button
                        key={outcome.id}
                        type="button"
                        onClick={() => setSelectedHoldersOutcome(outcome.id)}
                        className="flex-shrink-0 py-2 px-4 rounded-full text-sm font-semibold transition-all cursor-pointer border-2"
                        style={{
                          backgroundColor: selectedHoldersOutcome === outcome.id ? `${outcome.color}20` : 'transparent',
                          borderColor: selectedHoldersOutcome === outcome.id ? outcome.color : '#3f3f46',
                          color: selectedHoldersOutcome === outcome.id ? outcome.color : '#71717a'
                        }}
                      >
                        {outcome.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex rounded-full border border-zinc-700/50 p-1.5">
                    <button
                      type="button"
                      onClick={() => setHoldersPosition("yes")}
                      className="flex-1 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer"
                      style={{
                        backgroundColor: holdersPosition === "yes" ? '#06f6ff' : 'transparent',
                        color: holdersPosition === "yes" ? '#000000' : '#71717a'
                      }}
                    >
                      TRUE
                    </button>
                    <button
                      type="button"
                      onClick={() => setHoldersPosition("no")}
                      className="flex-1 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer"
                      style={{
                        backgroundColor: holdersPosition === "no" ? '#7c3aed' : 'transparent',
                        color: holdersPosition === "no" ? '#ffffff' : '#71717a'
                      }}
                    >
                      FALSE
                    </button>
                  </div>
                )}
              </div>

              {/* Holders List - Scrollable (shows 5, scroll for more) */}
              <div className="px-4 pb-4 overflow-y-auto scrollbar-hide" style={{ maxHeight: '220px' }}>
                <div className="space-y-1">
                  {(market.isMultipleChoice && selectedHoldersOutcome ? outcomeHoldersData[selectedHoldersOutcome] : holdersData[holdersPosition])?.map((holder, index) => (
                    <div
                      key={holder.rank}
                      className="flex items-center gap-3 py-2"
                    >
                      {/* Rank Badge */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        holder.rank === 1 ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/50' :
                        holder.rank === 2 ? 'bg-zinc-400/20 text-zinc-300 ring-1 ring-zinc-400/50' :
                        holder.rank === 3 ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/50' :
                        'text-zinc-500'
                      }`}>
                        {holder.rank}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={holder.avatar} />
                        <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
                          {holder.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Username */}
                      <span className="flex-1 text-sm text-white truncate">
                        {holder.username}
                      </span>

                      {/* Shares */}
                      <span className="text-sm font-semibold text-white">
                        {holder.shares.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* End of Left Column */}

        {/* Mobile Sticky Betting Bar - Fixed above footer (hidden when modal is open) */}
        {!market.disputable && !showMobileBetModal && (
          <div
            className="lg:hidden fixed left-0 right-0 z-50"
            style={{ bottom: '70px' }}
          >
            <div
              className="p-4"
              style={{ backgroundColor: '#0f1419', borderTop: '1px solid #1f2937' }}
            >
              {market.isMultipleChoice && market.outcomes ? (
                <>
                  {/* Multiple Choice - Compact Outcomes */}
                  <div className="flex gap-1.5 justify-center pb-2">
                    {market.outcomes.map((outcome) => (
                      <button
                        key={outcome.id}
                        onClick={() => { setSelectedOutcome(outcome.id); setShowMobileBetModal(true); }}
                        className={`flex-1 min-w-0 py-1.5 px-2 rounded-full transition-all text-center cursor-pointer border-2 ${
                          selectedOutcome === outcome.id
                            ? "shadow-lg"
                            : ""
                        }`}
                        style={selectedOutcome === outcome.id ? {
                          background: `linear-gradient(to right, ${outcome.color}30, ${outcome.color}15)`,
                          borderColor: outcome.color,
                          boxShadow: `0 4px 12px -2px ${outcome.color}40`
                        } : {
                          backgroundColor: '#18181b',
                          borderColor: '#3f3f46'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedOutcome !== outcome.id) {
                            e.currentTarget.style.backgroundColor = '#27272a';
                            e.currentTarget.style.borderColor = outcome.color || '#6B7280';
                            const titleEl = e.currentTarget.querySelector('.outcome-title') as HTMLElement;
                            const statsEl = e.currentTarget.querySelector('.outcome-stats') as HTMLElement;
                            if (titleEl) titleEl.style.color = outcome.color || '#a1a1aa';
                            if (statsEl) statsEl.style.color = outcome.color || '#71717a';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedOutcome !== outcome.id) {
                            e.currentTarget.style.backgroundColor = '#18181b';
                            e.currentTarget.style.borderColor = '#3f3f46';
                            const titleEl = e.currentTarget.querySelector('.outcome-title') as HTMLElement;
                            const statsEl = e.currentTarget.querySelector('.outcome-stats') as HTMLElement;
                            if (titleEl) titleEl.style.color = '#a1a1aa';
                            if (statsEl) statsEl.style.color = '#71717a';
                          }
                        }}
                      >
                        <div
                          className="outcome-title text-xs font-bold truncate"
                          style={{ color: selectedOutcome === outcome.id ? outcome.color : '#a1a1aa' }}
                        >
                          {outcome.label}
                        </div>
                        <div
                          className="outcome-stats text-[10px] truncate"
                          style={{ color: selectedOutcome === outcome.id ? outcome.color : '#71717a', opacity: 0.8 }}
                        >
                          {((outcome.pool / market.totalPool) * 100).toFixed(0)}% · {outcome.odds.toFixed(2)}x
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Binary Market - Progress Bar with Percentages */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-bold text-base text-white" style={{ minWidth: '42px' }}>
                      {Math.round((market.yesPool / market.totalPool) * 100)}%
                    </span>
                    <div
                      className="flex-1 rounded-full overflow-hidden flex"
                      style={{ height: '12px', backgroundColor: '#1a1a2e' }}
                    >
                      <div
                        className="h-full"
                        style={{
                          width: `${(market.yesPool / market.totalPool) * 100}%`,
                          background: 'linear-gradient(90deg, rgba(34, 211, 238, 0.6) 0%, rgba(6, 246, 255, 0.7) 50%, rgba(167, 139, 250, 0.4) 100%)'
                        }}
                      />
                      <div
                        className="h-full"
                        style={{
                          width: `${(market.noPool / market.totalPool) * 100}%`,
                          background: 'linear-gradient(90deg, rgba(167, 139, 250, 0.4) 0%, rgba(139, 92, 246, 0.6) 50%, rgba(124, 58, 237, 0.7) 100%)'
                        }}
                      />
                    </div>
                    <span className="font-bold text-base text-right text-white" style={{ minWidth: '42px' }}>
                      {Math.round((market.noPool / market.totalPool) * 100)}%
                    </span>
                  </div>

                  {/* Pool Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { handlePositionChange("yes"); setShowMobileBetModal(true); }}
                      className={`py-3 px-4 rounded-full transition-all text-center cursor-pointer border-2 ${
                        castPosition === "yes"
                          ? "shadow-lg"
                          : "bg-zinc-900/80 border-zinc-700/50"
                      }`}
                      style={castPosition === "yes" ? {
                        background: 'linear-gradient(to bottom right, rgba(34, 211, 238, 0.2), rgba(37, 99, 235, 0.1))',
                        borderColor: 'rgba(34, 211, 238, 0.6)',
                        boxShadow: '0 10px 15px -3px rgba(34, 211, 238, 0.25)'
                      } : {
                        backgroundColor: '#18181b',
                        borderColor: '#3f3f46'
                      }}
                      onMouseEnter={(e) => {
                        if (castPosition !== "yes") {
                          e.currentTarget.style.backgroundColor = '#27272a';
                          e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.6)';
                          const titleEl = e.currentTarget.querySelector('.pool-title') as HTMLElement;
                          const amountEl = e.currentTarget.querySelector('.pool-amount') as HTMLElement;
                          if (titleEl) titleEl.style.color = '#22d3ee';
                          if (amountEl) amountEl.style.color = '#67e8f9';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (castPosition !== "yes") {
                          e.currentTarget.style.backgroundColor = '#18181b';
                          e.currentTarget.style.borderColor = '#3f3f46';
                          const titleEl = e.currentTarget.querySelector('.pool-title') as HTMLElement;
                          const amountEl = e.currentTarget.querySelector('.pool-amount') as HTMLElement;
                          if (titleEl) titleEl.style.color = '#a1a1aa';
                          if (amountEl) amountEl.style.color = '#71717a';
                        }
                      }}
                    >
                      <div className={`pool-title text-base font-bold ${castPosition === "yes" ? "text-cyan-400" : "text-zinc-400"}`}>True</div>
                      <div className={`pool-amount text-xs ${castPosition === "yes" ? "text-cyan-300" : "text-zinc-500"}`}>
                        ${market.yesPool >= 1000 ? (market.yesPool / 1000).toFixed(1) + 'K' : market.yesPool.toFixed(0)}
                      </div>
                    </button>
                    <button
                      onClick={() => { handlePositionChange("no"); setShowMobileBetModal(true); }}
                      className={`py-3 px-4 rounded-full transition-all text-center cursor-pointer border-2 ${
                        castPosition === "no"
                          ? "shadow-lg"
                          : "bg-zinc-900/80 border-zinc-700/50"
                      }`}
                      style={castPosition === "no" ? {
                        background: 'linear-gradient(to bottom right, rgba(192, 132, 252, 0.2), rgba(168, 85, 247, 0.1))',
                        borderColor: 'rgba(192, 132, 252, 0.6)',
                        boxShadow: '0 10px 15px -3px rgba(192, 132, 252, 0.25)'
                      } : {
                        backgroundColor: '#18181b',
                        borderColor: '#3f3f46'
                      }}
                      onMouseEnter={(e) => {
                        if (castPosition !== "no") {
                          e.currentTarget.style.backgroundColor = '#27272a';
                          e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.6)';
                          const titleEl = e.currentTarget.querySelector('.pool-title') as HTMLElement;
                          const amountEl = e.currentTarget.querySelector('.pool-amount') as HTMLElement;
                          if (titleEl) titleEl.style.color = '#c084fc';
                          if (amountEl) amountEl.style.color = '#d8b4fe';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (castPosition !== "no") {
                          e.currentTarget.style.backgroundColor = '#18181b';
                          e.currentTarget.style.borderColor = '#3f3f46';
                          const titleEl = e.currentTarget.querySelector('.pool-title') as HTMLElement;
                          const amountEl = e.currentTarget.querySelector('.pool-amount') as HTMLElement;
                          if (titleEl) titleEl.style.color = '#a1a1aa';
                          if (amountEl) amountEl.style.color = '#71717a';
                        }
                      }}
                    >
                      <div className={`pool-title text-base font-bold ${castPosition === "no" ? "text-purple-400" : "text-zinc-400"}`}>False</div>
                      <div className={`pool-amount text-xs ${castPosition === "no" ? "text-purple-300" : "text-zinc-500"}`}>
                        ${market.noPool >= 1000 ? (market.noPool / 1000).toFixed(1) + 'K' : market.noPool.toFixed(0)}
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Mobile Betting Modal - Above Footer */}
        {showMobileBetModal && !market.disputable && (
          <>
            {/* Backdrop - click to close */}
            <div
              className="lg:hidden fixed inset-0 z-[99] bg-black"
              onClick={() => setShowMobileBetModal(false)}
            />
            <div className="lg:hidden fixed left-0 right-0 z-[100] flex flex-col overflow-hidden" style={{ backgroundColor: '#0f1419', border: '1px solid #1f2937', top: '80px', bottom: '70px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
            {/* Close Button - Right Corner */}
            <button
              onClick={() => setShowMobileBetModal(false)}
              className="absolute top-1 right-4 h-8 w-8 flex items-center justify-center rounded-xl border-2 border-transparent transition-all z-10"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#06f6ff';
                e.currentTarget.style.backgroundColor = '#1a1f26';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>

            {/* Header - Fixed */}
            <div className="flex-shrink-0">
              {/* Spacer for close button */}
              <div className="h-8"></div>

              {/* Market Title Header */}
              <div className="flex items-center gap-3 px-6 pt-2 pb-4">
                {market.imageUrl && (
                  <img src={market.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                )}
                <h2 className="text-white font-bold text-base leading-tight pr-8">
                  {getTranslatedText(market.claim, market.claimTranslations)}
                </h2>
              </div>

              {/* Buy/Sell Tabs */}
              <div className="flex gap-4 border-b border-zinc-800/30 px-6">
                <button
                  onClick={() => setCastInterface("buy")}
                  className={`pt-1 pb-3 px-4 text-sm font-semibold transition-all duration-200 relative ${
                    castInterface === "buy" ? "text-white" : "text-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  Buy
                  {castInterface === "buy" && (
                    <div className="absolute bottom-1 left-0 right-0 h-1 bg-primary"></div>
                  )}
                </button>
                <button
                  onClick={() => setCastInterface("sell")}
                  className={`pt-1 pb-3 px-4 text-sm font-semibold transition-all duration-200 relative ${
                    castInterface === "sell" ? "text-white" : "text-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  Sell
                  {castInterface === "sell" && (
                    <div className="absolute bottom-1 left-0 right-0 h-1 bg-primary"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-4">
                  {/* Progress Bar with Percentages */}
                  {market.isMultipleChoice && market.outcomes ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-x-4 gap-y-1">
                        {market.outcomes.slice(0, 3).map((outcome) => (
                          <span
                            key={outcome.id}
                            className="text-xs font-medium text-white"
                          >
                            {outcome.label}: {Math.round((outcome.pool / market.totalPool) * 100)}%
                          </span>
                        ))}
                      </div>
                      <div className="rounded-full overflow-hidden flex" style={{ height: '10px', backgroundColor: '#1a1a2e' }}>
                        {market.outcomes.map((outcome) => (
                          <div
                            key={outcome.id}
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${(outcome.pool / market.totalPool) * 100}%`,
                              backgroundColor: outcome.color,
                              opacity: selectedOutcome === outcome.id ? 1 : 0.5
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium text-sm">{Math.round((market.yesPool / market.totalPool) * 100)}%</span>
                      <div className="flex-1 rounded-full overflow-hidden flex" style={{ height: '10px', backgroundColor: '#1a1a2e' }}>
                        <div
                          className="h-full"
                          style={{
                            width: `${(market.yesPool / market.totalPool) * 100}%`,
                            background: 'linear-gradient(90deg, rgba(34, 211, 238, 0.6) 0%, rgba(6, 246, 255, 0.7) 50%, rgba(167, 139, 250, 0.4) 100%)'
                          }}
                        />
                        <div
                          className="h-full"
                          style={{
                            width: `${(market.noPool / market.totalPool) * 100}%`,
                            background: 'linear-gradient(90deg, rgba(167, 139, 250, 0.4) 0%, rgba(139, 92, 246, 0.6) 50%, rgba(124, 58, 237, 0.7) 100%)'
                          }}
                        />
                      </div>
                      <span className="text-white font-medium text-sm">{Math.round((market.noPool / market.totalPool) * 100)}%</span>
                    </div>
                  )}

                  {/* Pick a Side - Buy Mode */}
                  {castInterface === "buy" && (
                    <div
                      className="space-y-3"
                      onClick={(e) => {
                        // Deselect only if clicking outside of buttons
                        if (!(e.target as HTMLElement).closest('button')) {
                          if (market.isMultipleChoice) {
                            setSelectedOutcome(null);
                          } else {
                            setCastPosition(null);
                          }
                        }
                      }}
                    >
                      <h3 className="text-sm text-zinc-400">
                        {market.isMultipleChoice ? "Pick an outcome" : "Pick a side"}
                      </h3>
                      {market.isMultipleChoice && market.outcomes ? (
                        <div className="space-y-2">
                          {market.outcomes.map((outcome) => (
                            <button
                              key={outcome.id}
                              onClick={() => setSelectedOutcome(outcome.id)}
                              className={`w-full py-3 px-4 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                                selectedOutcome === outcome.id
                                  ? "border-2 shadow-lg"
                                  : "border-2"
                              }`}
                              style={selectedOutcome === outcome.id ? {
                                background: `linear-gradient(to right, ${outcome.color}20, ${outcome.color}10)`,
                                borderColor: outcome.color,
                                boxShadow: `0 4px 12px -2px ${outcome.color}40`
                              } : {
                                backgroundColor: '#18181b',
                                borderColor: '#3f3f46'
                              }}
                              onMouseEnter={(e) => {
                                if (selectedOutcome !== outcome.id) {
                                  e.currentTarget.style.backgroundColor = '#27272a';
                                  e.currentTarget.style.borderColor = outcome.color || '#6B7280';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (selectedOutcome !== outcome.id) {
                                  e.currentTarget.style.backgroundColor = '#18181b';
                                  e.currentTarget.style.borderColor = '#3f3f46';
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className="font-semibold text-sm"
                                  style={{ color: selectedOutcome === outcome.id ? outcome.color : '#a1a1aa' }}
                                >
                                  {outcome.label}
                                </span>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-white">
                                    {Math.round((outcome.pool / market.totalPool) * 100)}%
                                  </span>
                                  <span className="text-sm font-bold text-white">
                                    {outcome.odds.toFixed(2)}x
                                  </span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => handlePositionChange("yes")}
                            className={`py-4 px-4 rounded-full text-base font-bold transition-all text-center cursor-pointer border-2 ${
                              castPosition === "yes"
                                ? "shadow-lg"
                                : "bg-zinc-900/80 border-zinc-700/50 text-zinc-400"
                            }`}
                            style={castPosition === "yes" ? {
                              background: 'linear-gradient(to bottom right, rgba(34, 211, 238, 0.2), rgba(37, 99, 235, 0.1))',
                              borderColor: 'rgba(34, 211, 238, 0.6)',
                              color: '#22d3ee',
                              boxShadow: '0 10px 15px -3px rgba(34, 211, 238, 0.25)'
                            } : {
                              backgroundColor: '#18181b',
                              borderColor: '#3f3f46'
                            }}
                            onMouseEnter={(e) => {
                              if (castPosition !== "yes") {
                                e.currentTarget.style.backgroundColor = '#27272a';
                                e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.6)';
                                e.currentTarget.style.color = '#22d3ee';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (castPosition !== "yes") {
                                e.currentTarget.style.backgroundColor = '#18181b';
                                e.currentTarget.style.borderColor = '#3f3f46';
                                e.currentTarget.style.color = '#a1a1aa';
                              }
                            }}
                          >
                            TRUE
                          </button>
                          <button
                            onClick={() => handlePositionChange("no")}
                            className={`py-4 px-4 rounded-full text-base font-bold transition-all text-center cursor-pointer border-2 ${
                              castPosition === "no"
                                ? "shadow-lg"
                                : "bg-zinc-900/80 border-zinc-700/50 text-zinc-400"
                            }`}
                            style={castPosition === "no" ? {
                              background: 'linear-gradient(to bottom right, rgba(192, 132, 252, 0.2), rgba(168, 85, 247, 0.1))',
                              borderColor: 'rgba(192, 132, 252, 0.6)',
                              color: '#7c3aed',
                              boxShadow: '0 10px 15px -3px rgba(192, 132, 252, 0.25)'
                            } : {
                              backgroundColor: '#18181b',
                              borderColor: '#3f3f46'
                            }}
                            onMouseEnter={(e) => {
                              if (castPosition !== "no") {
                                e.currentTarget.style.backgroundColor = '#27272a';
                                e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.6)';
                                e.currentTarget.style.color = '#c084fc';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (castPosition !== "no") {
                                e.currentTarget.style.backgroundColor = '#18181b';
                                e.currentTarget.style.borderColor = '#3f3f46';
                                e.currentTarget.style.color = '#a1a1aa';
                              }
                            }}
                          >
                            FALSE
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Your Positions - Sell Mode */}
                  {castInterface === "sell" && (
                    <div
                      className="space-y-3"
                      onClick={(e) => {
                        // Deselect only if clicking outside of buttons
                        if (!(e.target as HTMLElement).closest('button')) {
                          if (market.isMultipleChoice) {
                            setSelectedOutcome(null);
                          } else {
                            setCastPosition(null);
                          }
                        }
                      }}
                    >
                      <h3 className="text-sm text-zinc-400">Your Positions</h3>
                      {positionsWithShares.length > 0 ? (
                        <div className="space-y-2">
                          {market.isMultipleChoice && market.outcomes ? (
                            // Multiple choice - show outcomes where user has shares
                            market.outcomes
                              .filter(outcome => positionsWithShares.some(p => p.outcomeId === outcome.id))
                              .map((outcome) => {
                                const details = getPositionDetails(outcome.id);
                                if (!details) return null;
                                return (
                                  <button
                                    key={outcome.id}
                                    onClick={() => setSelectedOutcome(outcome.id)}
                                    className={`w-full py-3 px-4 rounded-xl text-left transition-all duration-200 cursor-pointer border-2 ${
                                      selectedOutcome === outcome.id ? "shadow-lg" : ""
                                    }`}
                                    style={selectedOutcome === outcome.id ? {
                                      background: `linear-gradient(to right, ${outcome.color}20, ${outcome.color}10)`,
                                      borderColor: outcome.color,
                                      boxShadow: `0 4px 12px -2px ${outcome.color}40`
                                    } : {
                                      backgroundColor: '#18181b',
                                      borderColor: '#3f3f46'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (selectedOutcome !== outcome.id) {
                                        e.currentTarget.style.backgroundColor = '#27272a';
                                        e.currentTarget.style.borderColor = outcome.color || '#6B7280';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (selectedOutcome !== outcome.id) {
                                        e.currentTarget.style.backgroundColor = '#18181b';
                                        e.currentTarget.style.borderColor = '#3f3f46';
                                      }
                                    }}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span
                                        className="font-semibold text-sm"
                                        style={{ color: selectedOutcome === outcome.id ? outcome.color : '#a1a1aa' }}
                                      >
                                        {outcome.label}
                                      </span>
                                      <span className="text-sm font-bold text-white">
                                        {details.shares} shares
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-zinc-500">
                                        Avg ${details.avgCostBasis.toFixed(2)} → ${details.currentPrice.toFixed(2)}
                                      </span>
                                      <span className={details.profitLossPercent >= 0 ? "text-emerald-400" : "text-red-400"}>
                                        {details.profitLossPercent >= 0 ? '+' : ''}{details.profitLossPercent.toFixed(0)}%
                                      </span>
                                    </div>
                                  </button>
                                );
                              })
                          ) : (
                            // Binary - show YES/NO positions where user has shares
                            <>
                              {positionsWithShares.some(p => p.outcomeId === 'yes') && (() => {
                                const details = getPositionDetails('yes');
                                if (!details) return null;
                                return (
                                  <button
                                    onClick={() => setCastPosition("yes")}
                                    className={`w-full py-3 px-4 rounded-xl text-left transition-all duration-200 cursor-pointer border-2 ${
                                      castPosition === "yes" ? "shadow-lg" : ""
                                    }`}
                                    style={castPosition === "yes" ? {
                                      background: 'linear-gradient(to right, rgba(34, 211, 238, 0.2), rgba(34, 211, 238, 0.1))',
                                      borderColor: 'rgba(34, 211, 238, 0.6)',
                                      boxShadow: '0 4px 12px -2px rgba(34, 211, 238, 0.4)'
                                    } : {
                                      backgroundColor: '#18181b',
                                      borderColor: '#3f3f46'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (castPosition !== "yes") {
                                        e.currentTarget.style.backgroundColor = '#27272a';
                                        e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.6)';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (castPosition !== "yes") {
                                        e.currentTarget.style.backgroundColor = '#18181b';
                                        e.currentTarget.style.borderColor = '#3f3f46';
                                      }
                                    }}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className={`font-semibold text-sm ${castPosition === "yes" ? "text-cyan-400" : "text-zinc-400"}`}>
                                        TRUE
                                      </span>
                                      <span className="text-sm font-bold text-white">
                                        {details.shares} shares
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-zinc-500">
                                        Avg ${details.avgCostBasis.toFixed(2)} → ${details.currentPrice.toFixed(2)}
                                      </span>
                                      <span className={details.profitLossPercent >= 0 ? "text-emerald-400" : "text-red-400"}>
                                        {details.profitLossPercent >= 0 ? '+' : ''}{details.profitLossPercent.toFixed(0)}%
                                      </span>
                                    </div>
                                  </button>
                                );
                              })()}
                              {positionsWithShares.some(p => p.outcomeId === 'no') && (() => {
                                const details = getPositionDetails('no');
                                if (!details) return null;
                                return (
                                  <button
                                    onClick={() => setCastPosition("no")}
                                    className={`w-full py-3 px-4 rounded-xl text-left transition-all duration-200 cursor-pointer border-2 ${
                                      castPosition === "no" ? "shadow-lg" : ""
                                    }`}
                                    style={castPosition === "no" ? {
                                      background: 'linear-gradient(to right, rgba(192, 132, 252, 0.2), rgba(192, 132, 252, 0.1))',
                                      borderColor: 'rgba(192, 132, 252, 0.6)',
                                      boxShadow: '0 4px 12px -2px rgba(192, 132, 252, 0.4)'
                                    } : {
                                      backgroundColor: '#18181b',
                                      borderColor: '#3f3f46'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (castPosition !== "no") {
                                        e.currentTarget.style.backgroundColor = '#27272a';
                                        e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.6)';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (castPosition !== "no") {
                                        e.currentTarget.style.backgroundColor = '#18181b';
                                        e.currentTarget.style.borderColor = '#3f3f46';
                                      }
                                    }}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className={`font-semibold text-sm ${castPosition === "no" ? "text-purple-400" : "text-zinc-400"}`}>
                                        FALSE
                                      </span>
                                      <span className="text-sm font-bold text-white">
                                        {details.shares} shares
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-zinc-500">
                                        Avg ${details.avgCostBasis.toFixed(2)} → ${details.currentPrice.toFixed(2)}
                                      </span>
                                      <span className={details.profitLossPercent >= 0 ? "text-emerald-400" : "text-red-400"}>
                                        {details.profitLossPercent >= 0 ? '+' : ''}{details.profitLossPercent.toFixed(0)}%
                                      </span>
                                    </div>
                                  </button>
                                );
                              })()}
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-zinc-500 text-sm">You don't have any positions to sell</p>
                          <button
                            onClick={() => setCastInterface("buy")}
                            className="mt-3 text-sm text-cyan-400 hover:text-cyan-300"
                          >
                            Buy shares instead →
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Amount Input - Buy Mode */}
                  {castInterface === "buy" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm text-zinc-400">Amount</h3>
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-700/50 text-zinc-300">
                          Available USDT {userBalance.toFixed(2)}
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-base" style={{ left: '16px' }}>USDT</span>
                        <Input
                          type="text"
                          placeholder="0.00"
                          value={castAmount}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9.]/g, '');
                            handleAmountChange(value);
                          }}
                          className={`w-full h-12 pr-4 text-white text-lg bg-zinc-900/50 border-2 rounded-xl focus:border-[#06f6ff] focus:ring-0 placeholder:text-zinc-600 ${castAmount ? 'border-[#06f6ff]' : 'border-zinc-700/50'}`}
                          style={{ paddingLeft: '65px' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Amount Input - Sell Mode */}
                  {castInterface === "sell" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm text-zinc-400">Shares to sell</h3>
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-700/50 text-zinc-300">
                          Your shares: {userPosition?.shares || 0}
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-base" style={{ left: '16px' }}>Shares</span>
                        <Input
                          type="text"
                          placeholder="0"
                          value={sellAmount}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9.]/g, '');
                            handleSellAmountChange(value);
                          }}
                          className={`w-full h-12 pr-4 text-white text-lg bg-zinc-900/50 border-2 rounded-xl focus:border-[#ef4444] focus:ring-0 placeholder:text-zinc-600 ${sellAmount ? 'border-[#ef4444]' : 'border-zinc-700/50'}`}
                          style={{ paddingLeft: '75px' }}
                        />
                      </div>
                      {userPosition && userPosition.shares > 0 && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSellPercentClick(25, userPosition.shares)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                              selectedSellPercent === 25
                                ? "bg-red-500/20 text-white border border-red-500/50"
                                : "bg-zinc-800 text-zinc-300 border border-transparent hover:bg-zinc-700 hover:text-white hover:border-red-500/30"
                            }`}
                          >
                            25%
                          </button>
                          <button
                            onClick={() => handleSellPercentClick(50, userPosition.shares)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                              selectedSellPercent === 50
                                ? "bg-red-500/20 text-white border border-red-500/50"
                                : "bg-zinc-800 text-zinc-300 border border-transparent hover:bg-zinc-700 hover:text-white hover:border-red-500/30"
                            }`}
                          >
                            50%
                          </button>
                          <button
                            onClick={() => handleSellPercentClick(75, userPosition.shares)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                              selectedSellPercent === 75
                                ? "bg-red-500/20 text-white border border-red-500/50"
                                : "bg-zinc-800 text-zinc-300 border border-transparent hover:bg-zinc-700 hover:text-white hover:border-red-500/30"
                            }`}
                          >
                            75%
                          </button>
                          <button
                            onClick={() => handleSellPercentClick(100, userPosition.shares)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                              selectedSellPercent === 100
                                ? "bg-red-500/20 text-white border border-red-500/50"
                                : "bg-zinc-800 text-zinc-300 border border-transparent hover:bg-zinc-700 hover:text-white hover:border-red-500/30"
                            }`}
                          >
                            Max
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Market Info - Buy Mode */}
                  {castInterface === "buy" && (
                    <>
                      <div className="space-y-2 text-sm mt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Outcome</span>
                          <span className="text-zinc-300">
                            {getSelectedOutcomeLabel()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Probability</span>
                          <span className="text-zinc-300">
                            {getCurrentPercentage()}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Odds</span>
                          <span className="text-zinc-300">
                            {getCurrentOdds().toFixed(2)}x
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Price per share</span>
                          <span className="text-zinc-300">
                            ${profitCalculation ? profitCalculation.pricePerShare.toFixed(2) : (1 / getCurrentOdds()).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Shares</span>
                          <span className="text-zinc-300">
                            {profitCalculation ? profitCalculation.shares : 0}
                          </span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-zinc-800 my-1"></div>

                      {/* Fee Info */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-zinc-500">Fee (on winnings)</span>
                            <AlertCircle className="w-3 h-3 text-zinc-600" />
                          </div>
                          <span className="text-zinc-300">
                            3% (-${profitCalculation ? profitCalculation.fee.toFixed(2) : "0.00"})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Max profit</span>
                          <span className="text-emerald-400">
                            ${profitCalculation ? profitCalculation.profit.toFixed(2) : "0.00"} ({profitCalculation && profitCalculation.amount > 0 ? ((profitCalculation.profit / profitCalculation.amount) * 100).toFixed(0) : "0"}%)
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-zinc-500">Max payout</span>
                            <AlertCircle className="w-3 h-3 text-zinc-600" />
                          </div>
                          <span className="text-zinc-300">
                            ${profitCalculation ? profitCalculation.potential.toFixed(2) : "0.00"}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Button */}
                      <Button
                        onClick={() => { handleCustomCast(); setShowMobileBetModal(false); }}
                        disabled={!castAmount || parseFloat(castAmount) < MIN_BET_AMOUNT || parseFloat(castAmount) > userBalance}
                        className="w-full h-14 text-lg font-bold rounded-xl cursor-pointer mt-6"
                        style={{
                          backgroundColor: !castAmount || parseFloat(castAmount) < MIN_BET_AMOUNT || parseFloat(castAmount) > userBalance ? '#334155' : '#06f6ff',
                          color: !castAmount || parseFloat(castAmount) < MIN_BET_AMOUNT || parseFloat(castAmount) > userBalance ? '#94a3b8' : '#000000'
                        }}
                      >
                        {!castAmount ? 'Enter amount' : parseFloat(castAmount) < MIN_BET_AMOUNT ? `Min ${MIN_BET_AMOUNT} USDT` : parseFloat(castAmount) > userBalance ? 'Insufficient balance' : 'Buy Position'}
                      </Button>
                    </>
                  )}

                  {/* Market Info - Sell Mode */}
                  {castInterface === "sell" && (
                    <>
                      <div className="space-y-2 text-sm mt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Outcome</span>
                          <span className="text-zinc-300">
                            {getSelectedOutcomeLabel()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Current price</span>
                          <span className="text-zinc-300">
                            ${sellCalculation ? sellCalculation.currentPrice.toFixed(2) : (getCurrentPercentage() / 100).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Avg. cost basis</span>
                          <span className="text-zinc-300">
                            ${userPosition?.avgCostBasis.toFixed(2) || "0.00"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Gross proceeds</span>
                          <span className="text-zinc-300">
                            ${sellCalculation ? sellCalculation.grossProceeds.toFixed(2) : "0.00"}
                          </span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-zinc-800 my-1"></div>

                      {/* Fee Info */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-zinc-500">Trading fee</span>
                            <AlertCircle className="w-3 h-3 text-zinc-600" />
                          </div>
                          <span className="text-zinc-300">
                            3% (-${sellCalculation ? sellCalculation.fee.toFixed(2) : "0.00"})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Net proceeds</span>
                          <span className="text-zinc-300">
                            ${sellCalculation ? sellCalculation.netProceeds.toFixed(2) : "0.00"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Profit/Loss</span>
                          <span className={sellCalculation && sellCalculation.profitLoss >= 0 ? "text-emerald-400" : "text-red-400"}>
                            {sellCalculation && sellCalculation.profitLoss >= 0 ? '+' : ''}${sellCalculation ? sellCalculation.profitLoss.toFixed(2) : "0.00"} ({sellCalculation ? sellCalculation.profitLossPercent.toFixed(0) : "0"}%)
                          </span>
                        </div>
                      </div>

                      {/* Bottom Button */}
                      <Button
                        onClick={() => { toast.success(`Sold ${sellAmount} shares for $${sellCalculation?.netProceeds.toFixed(2)}`); setSellAmount(''); setSellCalculation(null); setShowMobileBetModal(false); }}
                        disabled={!sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > (userPosition?.shares || 0)}
                        className="w-full h-14 text-lg font-bold rounded-xl cursor-pointer mt-6"
                        style={{
                          backgroundColor: !sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > (userPosition?.shares || 0) ? '#334155' : '#ef4444',
                          color: !sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > (userPosition?.shares || 0) ? '#94a3b8' : '#ffffff'
                        }}
                      >
                        {!sellAmount ? 'Enter shares' : parseFloat(sellAmount) > (userPosition?.shares || 0) ? 'Exceeds holdings' : (userPosition?.shares || 0) === 0 ? 'No shares to sell' : 'Sell Shares'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
          </div>
          </>
        )}

        {/* Right Column - Betting Modal (Desktop Only - Sticky) */}
        {!market.disputable && (
          <aside className="hidden lg:block shrink-0" style={{ position: 'sticky', top: '96px', width: '380px' }}>
            {/* BUY INTERFACE */}
            {castInterface === "buy" && (
              <div className="rounded-2xl md:rounded-3xl lg:rounded-3xl bg-gradient-to-b from-zinc-950 to-black border border-zinc-800/50 shadow-2xl overflow-hidden backdrop-blur-xl transition-all duration-300">
                {/* Tabs */}
                <div className="flex gap-3 md:gap-4 lg:gap-6 border-b border-zinc-800/30">
                  <button
                    onClick={() => setCastInterface("buy")}
                    className={`py-3 md:py-3.5 lg:py-4 px-4 md:px-5 lg:px-6 text-sm md:text-base lg:text-base font-semibold transition-all duration-200 relative ${
                      isBuying
                        ? "text-white"
                        : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50 active:bg-zinc-800/70"
                    }`}
                  >
                    Buy
                    {isBuying && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
                      ></div>
                    )}
                  </button>
                  <button
                    onClick={() => setCastInterface("sell")}
                    className={`py-3 md:py-3.5 lg:py-4 px-4 md:px-5 lg:px-6 text-sm md:text-base lg:text-base font-semibold transition-all duration-200 relative ${
                      isSelling
                        ? "text-white"
                        : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50 active:bg-zinc-800/70"
                    }`}
                  >
                    Sell
                    {isSelling && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
                      ></div>
                    )}
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 md:p-5 lg:p-6 space-y-3 md:space-y-4 lg:space-y-4">
                  {/* Percentage Bar */}
                  <div className="space-y-4">
                    {market.isMultipleChoice && market.outcomes ? (
                      <>
                        <div className="flex items-center justify-between flex-wrap gap-x-4 gap-y-1">
                          {market.outcomes.slice(0, 3).map((outcome) => (
                            <span
                              key={outcome.id}
                              className="text-sm font-semibold text-white"
                            >
                              {outcome.label}: {Math.round((outcome.pool / market.totalPool) * 100)}%
                            </span>
                          ))}
                        </div>
                        <div className="rounded-full h-3 overflow-hidden flex shadow-lg border border-zinc-800/50 mt-3">
                          {market.outcomes.map((outcome) => (
                            <div
                              key={outcome.id}
                              className="h-full transition-all duration-500"
                              style={{
                                width: `${(outcome.pool / market.totalPool) * 100}%`,
                                backgroundColor: outcome.color,
                                opacity: selectedOutcome === outcome.id ? 1 : 0.5
                              }}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-4xl font-bold text-white">{Math.round((market.yesPool / market.totalPool) * 100)}%</span>
                          <span className="text-4xl font-bold text-white">{Math.round((market.noPool / market.totalPool) * 100)}%</span>
                        </div>
                        <div className="rounded-full h-3 overflow-hidden flex shadow-lg shadow-cyan-500/10 border border-zinc-800/50">
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${(market.yesPool / market.totalPool) * 100}%`,
                              background: 'linear-gradient(90deg, rgba(34, 211, 238, 0.5) 0%, rgba(6, 246, 255, 0.6) 50%, rgba(167, 139, 250, 0.3) 100%)'
                            }}
                          />
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${(market.noPool / market.totalPool) * 100}%`,
                              background: 'linear-gradient(90deg, rgba(167, 139, 250, 0.3) 0%, rgba(139, 92, 246, 0.5) 50%, rgba(124, 58, 237, 0.6) 100%)'
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Pick a Side */}
                  <div
                    className="space-y-2 pt-2"
                    onClick={(e) => {
                      // Deselect only if clicking outside of buttons
                      if (!(e.target as HTMLElement).closest('button')) {
                        if (market.isMultipleChoice) {
                          setSelectedOutcome(null);
                        } else {
                          setCastPosition(null);
                        }
                      }
                    }}
                  >
                    <h3 className="text-sm font-medium text-white text-left">
                      {market.isMultipleChoice ? "Pick an outcome" : "Pick a side"}
                    </h3>
                    {market.isMultipleChoice && market.outcomes ? (
                      <div className="space-y-2">
                        {market.outcomes.map((outcome) => (
                          <button
                            key={outcome.id}
                            onClick={() => setSelectedOutcome(outcome.id)}
                            className={`w-full py-3 px-4 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                              selectedOutcome === outcome.id
                                ? "border-2 shadow-lg"
                                : "border-2"
                            }`}
                            style={selectedOutcome === outcome.id ? {
                              background: `linear-gradient(to right, ${outcome.color}20, ${outcome.color}10)`,
                              borderColor: outcome.color,
                              boxShadow: `0 4px 12px -2px ${outcome.color}40`
                            } : {
                              backgroundColor: '#18181b',
                              borderColor: '#3f3f46'
                            }}
                            onMouseEnter={(e) => {
                              if (selectedOutcome !== outcome.id) {
                                e.currentTarget.style.backgroundColor = '#27272a';
                                e.currentTarget.style.borderColor = outcome.color || '#6B7280';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedOutcome !== outcome.id) {
                                e.currentTarget.style.backgroundColor = '#18181b';
                                e.currentTarget.style.borderColor = '#3f3f46';
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className="font-semibold"
                                style={{ color: selectedOutcome === outcome.id ? outcome.color : '#a1a1aa' }}
                              >
                                {outcome.label}
                              </span>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-white">
                                  {Math.round((outcome.pool / market.totalPool) * 100)}%
                                </span>
                                <span className="text-sm font-bold text-white">
                                  {outcome.odds.toFixed(2)}x
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handlePositionChange("yes")}
                          className={`py-3 px-4 rounded-full text-base font-bold transition-all text-center cursor-pointer border-2 ${
                            castPosition === "yes"
                              ? "shadow-lg"
                              : "bg-zinc-900/80 border-zinc-700/50 text-zinc-400"
                          }`}
                          style={castPosition === "yes" ? {
                            background: 'linear-gradient(to bottom right, rgba(34, 211, 238, 0.2), rgba(37, 99, 235, 0.1))',
                            borderColor: 'rgba(34, 211, 238, 0.6)',
                            color: '#22d3ee',
                            boxShadow: '0 10px 15px -3px rgba(34, 211, 238, 0.25)'
                          } : {
                            backgroundColor: '#18181b',
                            borderColor: '#3f3f46'
                          }}
                          onMouseEnter={(e) => {
                            if (castPosition !== "yes") {
                              e.currentTarget.style.backgroundColor = '#27272a';
                              e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.6)';
                              e.currentTarget.style.color = '#22d3ee';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (castPosition !== "yes") {
                              e.currentTarget.style.backgroundColor = '#18181b';
                              e.currentTarget.style.borderColor = '#3f3f46';
                              e.currentTarget.style.color = '#a1a1aa';
                            }
                          }}
                        >
                          TRUE
                        </button>
                        <button
                          onClick={() => handlePositionChange("no")}
                          className={`py-3 px-4 rounded-full text-base font-bold transition-all text-center cursor-pointer border-2 ${
                            castPosition === "no"
                              ? "shadow-lg"
                              : "bg-zinc-900/80 border-zinc-700/50 text-zinc-400"
                          }`}
                          style={castPosition === "no" ? {
                            background: 'linear-gradient(to bottom right, rgba(192, 132, 252, 0.2), rgba(168, 85, 247, 0.1))',
                            borderColor: 'rgba(192, 132, 252, 0.6)',
                            color: '#7c3aed',
                            boxShadow: '0 10px 15px -3px rgba(192, 132, 252, 0.25)'
                          } : {
                            backgroundColor: '#18181b',
                            borderColor: '#3f3f46'
                          }}
                          onMouseEnter={(e) => {
                            if (castPosition !== "no") {
                              e.currentTarget.style.backgroundColor = '#27272a';
                              e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.6)';
                              e.currentTarget.style.color = '#c084fc';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (castPosition !== "no") {
                              e.currentTarget.style.backgroundColor = '#18181b';
                              e.currentTarget.style.borderColor = '#3f3f46';
                              e.currentTarget.style.color = '#a1a1aa';
                            }
                          }}
                        >
                          FALSE
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2 md:space-y-3 lg:space-y-3 pt-2 md:pt-3 lg:pt-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm md:text-base lg:text-base font-medium text-white text-left">Amount</h3>
                      <span className="text-xs md:text-sm lg:text-sm font-medium px-3 md:px-4 lg:px-4 py-1 md:py-1.5 lg:py-1.5 rounded-full bg-zinc-900/80 border border-zinc-700/50 text-zinc-300">
                        Available USDT {userBalance.toFixed(2)}
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute top-1/2 -translate-y-1/2 font-semibold text-zinc-400 pointer-events-none text-lg md:text-xl lg:text-2xl" style={{ left: '20px' }}>
                        USDT
                      </span>
                      <Input
                        type="text"
                        placeholder="0.00"
                        value={castAmount}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          handleAmountChange(value);
                        }}
                        className={`w-full h-12 md:h-14 lg:h-16 pr-4 md:pr-6 lg:pr-6 font-bold text-white text-left bg-zinc-900/80 border-2 rounded-xl md:rounded-2xl lg:rounded-2xl focus:border-[#06f6ff] focus:ring-0 transition-all placeholder:text-zinc-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-lg md:text-xl lg:text-2xl ${castAmount ? 'border-[#06f6ff]' : 'border-zinc-700/50'}`} style={{ paddingLeft: '90px' }}
                      />
                    </div>
                  </div>

                  {/* Market Info */}
                  <div className="space-y-3 py-4 border-t border-zinc-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-base text-white text-left font-normal">Outcome</span>
                      <span className="text-base font-medium text-white text-right">
                        {getSelectedOutcomeLabel()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-white text-left font-normal">Probability</span>
                      <span className="text-base font-medium text-white text-right">
                        {getCurrentPercentage()}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-white text-left font-normal">Odds</span>
                      <span className="text-base font-medium text-white text-right">
                        {getCurrentOdds().toFixed(2)}x
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-white text-left font-normal">Price per share</span>
                      <span className="text-base font-medium text-white text-right">
                        ${profitCalculation ? profitCalculation.pricePerShare.toFixed(2) : (1 / getCurrentOdds()).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-white text-left font-normal">Shares</span>
                      <span className="text-base font-medium text-white text-right">
                        {profitCalculation ? profitCalculation.shares : 0}
                      </span>
                    </div>
                  </div>

                  {/* Fee Info */}
                  <div className="space-y-3 py-4 border-t border-zinc-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base text-white text-left font-normal">Fee (on winnings)</span>
                        <AlertCircle className="w-4 h-4 text-zinc-500" />
                      </div>
                      <span className="text-base font-medium text-white text-right">
                        3% (-${profitCalculation ? profitCalculation.fee.toFixed(2) : "0.00"})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-white text-left font-normal">Max profit</span>
                      <span className="text-base font-semibold text-emerald-400 text-right">
                        {profitCalculation ? profitCalculation.profit.toFixed(2) : "0.00"} USDT ({profitCalculation && profitCalculation.amount > 0 ? ((profitCalculation.profit / profitCalculation.amount) * 100).toFixed(0) : "0"}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-white text-left font-normal">Max payout</span>
                      <span className="text-base font-medium text-white text-right">
                        {profitCalculation ? profitCalculation.potential.toFixed(2) : "0.00"} USDT
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleCustomCast}
                    disabled={!castAmount || parseFloat(castAmount) < MIN_BET_AMOUNT || parseFloat(castAmount) > userBalance}
                    className="relative w-full h-12 md:h-13 lg:h-14 text-base md:text-lg lg:text-lg font-bold rounded-xl md:rounded-2xl lg:rounded-2xl cursor-pointer"
                    style={{
                      backgroundColor: !castAmount || parseFloat(castAmount) < MIN_BET_AMOUNT || parseFloat(castAmount) > userBalance ? '#334155' : '#06f6ff',
                      color: !castAmount || parseFloat(castAmount) < MIN_BET_AMOUNT || parseFloat(castAmount) > userBalance ? '#94a3b8' : '#000000'
                    }}
                  >
                    {!castAmount ? 'Enter amount' : parseFloat(castAmount) < MIN_BET_AMOUNT ? `Min ${MIN_BET_AMOUNT} USDT` : parseFloat(castAmount) > userBalance ? 'Insufficient balance' : 'Buy Position'}
                  </Button>
                </div>
              </div>
            )}

            {/* SELL INTERFACE */}
            {castInterface === "sell" && (
              <div className="rounded-2xl md:rounded-3xl lg:rounded-3xl bg-gradient-to-b from-zinc-950 to-black border border-zinc-800/50 shadow-2xl overflow-hidden backdrop-blur-xl transition-all duration-300">
                {/* Tabs */}
                <div className="flex gap-3 md:gap-4 lg:gap-6 border-b border-zinc-800/30">
                  <button
                    onClick={() => setCastInterface("buy")}
                    className={`py-3 md:py-3.5 lg:py-4 px-4 md:px-5 lg:px-6 text-sm md:text-base lg:text-base font-semibold transition-all duration-200 relative ${
                      isBuying
                        ? "text-white"
                        : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50 active:bg-zinc-800/70"
                    }`}
                  >
                    Buy
                    {isBuying && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
                      ></div>
                    )}
                  </button>
                  <button
                    onClick={() => setCastInterface("sell")}
                    className={`py-3 md:py-3.5 lg:py-4 px-4 md:px-5 lg:px-6 text-sm md:text-base lg:text-base font-semibold transition-all duration-200 relative ${
                      isSelling
                        ? "text-white"
                        : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50 active:bg-zinc-800/70"
                    }`}
                  >
                    Sell
                    {isSelling && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
                      ></div>
                    )}
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 md:p-5 lg:p-6 space-y-3 md:space-y-4 lg:space-y-4">
                  {/* Percentage Bar */}
                  <div className="space-y-4">
                    {market.isMultipleChoice && market.outcomes ? (
                      <>
                        <div className="flex items-center justify-between flex-wrap gap-x-4 gap-y-1">
                          {market.outcomes.slice(0, 3).map((outcome) => (
                            <span
                              key={outcome.id}
                              className="text-sm font-semibold text-white"
                            >
                              {outcome.label}: {Math.round((outcome.pool / market.totalPool) * 100)}%
                            </span>
                          ))}
                        </div>
                        <div className="rounded-full h-3 overflow-hidden flex shadow-lg border border-zinc-800/50 mt-3">
                          {market.outcomes.map((outcome) => (
                            <div
                              key={outcome.id}
                              className="h-full transition-all duration-500"
                              style={{
                                width: `${(outcome.pool / market.totalPool) * 100}%`,
                                backgroundColor: outcome.color,
                                opacity: selectedOutcome === outcome.id ? 1 : 0.5
                              }}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-4xl font-bold text-white">{Math.round((market.yesPool / market.totalPool) * 100)}%</span>
                          <span className="text-4xl font-bold text-white">{Math.round((market.noPool / market.totalPool) * 100)}%</span>
                        </div>
                        <div className="rounded-full h-3 overflow-hidden flex shadow-lg shadow-cyan-500/10 border border-zinc-800/50">
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${(market.yesPool / market.totalPool) * 100}%`,
                              background: 'linear-gradient(90deg, rgba(34, 211, 238, 0.5) 0%, rgba(6, 246, 255, 0.6) 50%, rgba(167, 139, 250, 0.3) 100%)'
                            }}
                          />
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${(market.noPool / market.totalPool) * 100}%`,
                              background: 'linear-gradient(90deg, rgba(167, 139, 250, 0.3) 0%, rgba(139, 92, 246, 0.5) 50%, rgba(124, 58, 237, 0.6) 100%)'
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Your Positions - Sell Mode */}
                  <div
                    className="space-y-2 pt-2"
                    onClick={(e) => {
                      // Deselect only if clicking outside of buttons
                      if (!(e.target as HTMLElement).closest('button')) {
                        if (market.isMultipleChoice) {
                          setSelectedOutcome(null);
                        } else {
                          setCastPosition(null);
                        }
                      }
                    }}
                  >
                    <h3 className="text-sm font-medium text-white text-left">Your Positions</h3>
                    {positionsWithShares.length > 0 ? (
                      <div className="space-y-2">
                        {market.isMultipleChoice && market.outcomes ? (
                          // Multiple choice - show outcomes where user has shares
                          market.outcomes
                            .filter(outcome => positionsWithShares.some(p => p.outcomeId === outcome.id))
                            .map((outcome) => {
                              const details = getPositionDetails(outcome.id);
                              if (!details) return null;
                              return (
                                <button
                                  key={outcome.id}
                                  onClick={() => setSelectedOutcome(outcome.id)}
                                  className={`w-full py-3 px-4 rounded-xl text-left transition-all duration-200 cursor-pointer border-2 ${
                                    selectedOutcome === outcome.id ? "shadow-lg" : ""
                                  }`}
                                  style={selectedOutcome === outcome.id ? {
                                    background: `linear-gradient(to right, ${outcome.color}20, ${outcome.color}10)`,
                                    borderColor: outcome.color,
                                    boxShadow: `0 4px 12px -2px ${outcome.color}40`
                                  } : {
                                    backgroundColor: '#18181b',
                                    borderColor: '#3f3f46'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (selectedOutcome !== outcome.id) {
                                      e.currentTarget.style.backgroundColor = '#27272a';
                                      e.currentTarget.style.borderColor = outcome.color || '#6B7280';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (selectedOutcome !== outcome.id) {
                                      e.currentTarget.style.backgroundColor = '#18181b';
                                      e.currentTarget.style.borderColor = '#3f3f46';
                                    }
                                  }}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span
                                      className="font-semibold"
                                      style={{ color: selectedOutcome === outcome.id ? outcome.color : '#a1a1aa' }}
                                    >
                                      {outcome.label}
                                    </span>
                                    <span className="text-sm font-bold text-white">
                                      {details.shares} shares
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-500">
                                      Avg ${details.avgCostBasis.toFixed(2)} → ${details.currentPrice.toFixed(2)}
                                    </span>
                                    <span className={details.profitLossPercent >= 0 ? "text-emerald-400" : "text-red-400"}>
                                      {details.profitLossPercent >= 0 ? '+' : ''}{details.profitLossPercent.toFixed(0)}%
                                    </span>
                                  </div>
                                </button>
                              );
                            })
                        ) : (
                          // Binary - show YES/NO positions where user has shares
                          <>
                            {positionsWithShares.some(p => p.outcomeId === 'yes') && (() => {
                              const details = getPositionDetails('yes');
                              if (!details) return null;
                              return (
                                <button
                                  onClick={() => setCastPosition("yes")}
                                  className={`w-full py-3 px-4 rounded-xl text-left transition-all duration-200 cursor-pointer border-2 ${
                                    castPosition === "yes" ? "shadow-lg" : ""
                                  }`}
                                  style={castPosition === "yes" ? {
                                    background: 'linear-gradient(to right, rgba(34, 211, 238, 0.2), rgba(34, 211, 238, 0.1))',
                                    borderColor: 'rgba(34, 211, 238, 0.6)',
                                    boxShadow: '0 4px 12px -2px rgba(34, 211, 238, 0.4)'
                                  } : {
                                    backgroundColor: '#18181b',
                                    borderColor: '#3f3f46'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (castPosition !== "yes") {
                                      e.currentTarget.style.backgroundColor = '#27272a';
                                      e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.6)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (castPosition !== "yes") {
                                      e.currentTarget.style.backgroundColor = '#18181b';
                                      e.currentTarget.style.borderColor = '#3f3f46';
                                    }
                                  }}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`font-semibold ${castPosition === "yes" ? "text-cyan-400" : "text-zinc-400"}`}>
                                      TRUE
                                    </span>
                                    <span className="text-sm font-bold text-white">
                                      {details.shares} shares
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-500">
                                      Avg ${details.avgCostBasis.toFixed(2)} → ${details.currentPrice.toFixed(2)}
                                    </span>
                                    <span className={details.profitLossPercent >= 0 ? "text-emerald-400" : "text-red-400"}>
                                      {details.profitLossPercent >= 0 ? '+' : ''}{details.profitLossPercent.toFixed(0)}%
                                    </span>
                                  </div>
                                </button>
                              );
                            })()}
                            {positionsWithShares.some(p => p.outcomeId === 'no') && (() => {
                              const details = getPositionDetails('no');
                              if (!details) return null;
                              return (
                                <button
                                  onClick={() => setCastPosition("no")}
                                  className={`w-full py-3 px-4 rounded-xl text-left transition-all duration-200 cursor-pointer border-2 ${
                                    castPosition === "no" ? "shadow-lg" : ""
                                  }`}
                                  style={castPosition === "no" ? {
                                    background: 'linear-gradient(to right, rgba(192, 132, 252, 0.2), rgba(192, 132, 252, 0.1))',
                                    borderColor: 'rgba(192, 132, 252, 0.6)',
                                    boxShadow: '0 4px 12px -2px rgba(192, 132, 252, 0.4)'
                                  } : {
                                    backgroundColor: '#18181b',
                                    borderColor: '#3f3f46'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (castPosition !== "no") {
                                      e.currentTarget.style.backgroundColor = '#27272a';
                                      e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.6)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (castPosition !== "no") {
                                      e.currentTarget.style.backgroundColor = '#18181b';
                                      e.currentTarget.style.borderColor = '#3f3f46';
                                    }
                                  }}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`font-semibold ${castPosition === "no" ? "text-purple-400" : "text-zinc-400"}`}>
                                      FALSE
                                    </span>
                                    <span className="text-sm font-bold text-white">
                                      {details.shares} shares
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-500">
                                      Avg ${details.avgCostBasis.toFixed(2)} → ${details.currentPrice.toFixed(2)}
                                    </span>
                                    <span className={details.profitLossPercent >= 0 ? "text-emerald-400" : "text-red-400"}>
                                      {details.profitLossPercent >= 0 ? '+' : ''}{details.profitLossPercent.toFixed(0)}%
                                    </span>
                                  </div>
                                </button>
                              );
                            })()}
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-zinc-500 text-sm">You don't have any positions to sell</p>
                        <button
                          onClick={() => setCastInterface("buy")}
                          className="mt-3 text-sm text-cyan-400 hover:text-cyan-300"
                        >
                          Buy shares instead →
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Amount Input - Shares */}
                  <div className="space-y-2 md:space-y-3 lg:space-y-3 pt-2 md:pt-3 lg:pt-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm md:text-base lg:text-base font-medium text-white text-left">Shares to sell</h3>
                      <span className="text-xs md:text-sm lg:text-sm font-medium px-3 md:px-4 lg:px-4 py-1 md:py-1.5 lg:py-1.5 rounded-full bg-zinc-900/80 border border-zinc-700/50 text-zinc-300">
                        Your shares: {userPosition?.shares || 0}
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute top-1/2 -translate-y-1/2 font-semibold text-zinc-400 pointer-events-none text-lg md:text-xl lg:text-xl" style={{ left: '20px' }}>
                        Shares
                      </span>
                      <Input
                        type="text"
                        placeholder="0"
                        value={sellAmount}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          handleSellAmountChange(value);
                        }}
                        className={`w-full h-12 md:h-14 lg:h-16 pr-4 md:pr-6 lg:pr-6 font-bold text-white text-left bg-zinc-900/80 border-2 rounded-xl md:rounded-2xl lg:rounded-2xl focus:border-[#ef4444] focus:ring-0 transition-all placeholder:text-zinc-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-lg md:text-xl lg:text-2xl ${sellAmount ? 'border-[#ef4444]' : 'border-zinc-700/50'}`} style={{ paddingLeft: '100px' }}
                      />
                    </div>
                    {userPosition && userPosition.shares > 0 && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSellPercentClick(25, userPosition.shares)}
                          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                            selectedSellPercent === 25
                              ? "bg-red-500/20 text-white border border-red-500/50"
                              : "bg-zinc-800 text-zinc-300 border border-transparent hover:bg-zinc-700 hover:text-white hover:border-red-500/30"
                          }`}
                        >
                          25%
                        </button>
                        <button
                          onClick={() => handleSellPercentClick(50, userPosition.shares)}
                          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                            selectedSellPercent === 50
                              ? "bg-red-500/20 text-white border border-red-500/50"
                              : "bg-zinc-800 text-zinc-300 border border-transparent hover:bg-zinc-700 hover:text-white hover:border-red-500/30"
                          }`}
                        >
                          50%
                        </button>
                        <button
                          onClick={() => handleSellPercentClick(75, userPosition.shares)}
                          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                            selectedSellPercent === 75
                              ? "bg-red-500/20 text-white border border-red-500/50"
                              : "bg-zinc-800 text-zinc-300 border border-transparent hover:bg-zinc-700 hover:text-white hover:border-red-500/30"
                          }`}
                        >
                          75%
                        </button>
                        <button
                          onClick={() => handleSellPercentClick(100, userPosition.shares)}
                          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                            selectedSellPercent === 100
                              ? "bg-red-500/20 text-white border border-red-500/50"
                              : "bg-zinc-800 text-zinc-300 border border-transparent hover:bg-zinc-700 hover:text-white hover:border-red-500/30"
                          }`}
                        >
                          Max
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Market Info */}
                  <div className="space-y-3 py-4 border-t border-zinc-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-base text-white text-left font-normal">Outcome</span>
                      <span className="text-base font-medium text-white text-right">
                        {getSelectedOutcomeLabel()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-white text-left font-normal">Current price</span>
                      <span className="text-base font-medium text-white text-right">
                        ${sellCalculation ? sellCalculation.currentPrice.toFixed(2) : (getCurrentPercentage() / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-white text-left font-normal">Avg. cost basis</span>
                      <span className="text-base font-medium text-white text-right">
                        ${userPosition?.avgCostBasis.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-white text-left font-normal">Gross proceeds</span>
                      <span className="text-base font-medium text-white text-right">
                        ${sellCalculation ? sellCalculation.grossProceeds.toFixed(2) : "0.00"}
                      </span>
                    </div>
                  </div>

                  {/* Fee Info */}
                  <div className="space-y-3 py-4 border-t border-zinc-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base text-white text-left font-normal">Trading fee</span>
                        <AlertCircle className="w-4 h-4 text-zinc-500" />
                      </div>
                      <span className="text-base font-medium text-white text-right">
                        3% (-${sellCalculation ? sellCalculation.fee.toFixed(2) : "0.00"})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-white text-left font-normal">Net proceeds</span>
                      <span className="text-base font-medium text-white text-right">
                        ${sellCalculation ? sellCalculation.netProceeds.toFixed(2) : "0.00"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-white text-left font-normal">Profit/Loss</span>
                      <span className={`text-base font-semibold text-right ${sellCalculation && sellCalculation.profitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {sellCalculation && sellCalculation.profitLoss >= 0 ? '+' : ''}${sellCalculation ? sellCalculation.profitLoss.toFixed(2) : "0.00"} ({sellCalculation ? sellCalculation.profitLossPercent.toFixed(0) : "0"}%)
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={() => { toast.success(`Sold ${sellAmount} shares for $${sellCalculation?.netProceeds.toFixed(2)}`); setSellAmount(''); setSellCalculation(null); }}
                    disabled={!sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > (userPosition?.shares || 0)}
                    className="relative w-full h-12 md:h-13 lg:h-14 text-base md:text-lg lg:text-lg font-bold rounded-xl md:rounded-2xl lg:rounded-2xl cursor-pointer"
                    style={{
                      backgroundColor: !sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > (userPosition?.shares || 0) ? '#334155' : '#ef4444',
                      color: !sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > (userPosition?.shares || 0) ? '#94a3b8' : '#ffffff'
                    }}
                  >
                    {!sellAmount ? 'Enter shares' : parseFloat(sellAmount) > (userPosition?.shares || 0) ? 'Exceeds holdings' : (userPosition?.shares || 0) === 0 ? 'No shares to sell' : 'Sell Shares'}
                  </Button>
                </div>
              </div>
            )}
            {/* TOP HOLDERS SECTION - Desktop */}
            <div className="mt-6 rounded-2xl md:rounded-3xl lg:rounded-3xl bg-gradient-to-b from-zinc-950 to-black border border-zinc-800/50 shadow-2xl overflow-hidden backdrop-blur-xl">
              {/* Header */}
              <div className="p-4 md:p-5 lg:p-6 border-b border-zinc-800/30">
                <h3 className="text-lg font-bold text-white">Top Holders</h3>
              </div>

              {/* YES/NO Toggle or Outcome Toggle */}
              <div className="px-4 md:px-5 lg:px-6 pt-4 pb-4">
                {market.isMultipleChoice && market.outcomes ? (
                  <div className="flex gap-1.5 pb-6 justify-center">
                    {market.outcomes.map((outcome) => (
                      <button
                        key={outcome.id}
                        onClick={() => setSelectedHoldersOutcome(outcome.id)}
                        className="flex-1 py-1.5 px-1 rounded-full text-xs font-semibold transition-all cursor-pointer border-2 truncate"
                        style={{
                          backgroundColor: selectedHoldersOutcome === outcome.id ? `${outcome.color}20` : 'transparent',
                          borderColor: selectedHoldersOutcome === outcome.id ? outcome.color : '#3f3f46',
                          color: selectedHoldersOutcome === outcome.id ? outcome.color : '#71717a'
                        }}
                      >
                        {outcome.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex rounded-full border border-zinc-700/50 p-1.5">
                    <button
                      type="button"
                      onClick={() => setHoldersPosition("yes")}
                      className="flex-1 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer"
                      style={{
                        backgroundColor: holdersPosition === "yes" ? '#06f6ff' : 'transparent',
                        color: holdersPosition === "yes" ? '#000000' : '#71717a'
                      }}
                    >
                      TRUE
                    </button>
                    <button
                      type="button"
                      onClick={() => setHoldersPosition("no")}
                      className="flex-1 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer"
                      style={{
                        backgroundColor: holdersPosition === "no" ? '#7c3aed' : 'transparent',
                        color: holdersPosition === "no" ? '#ffffff' : '#71717a'
                      }}
                    >
                      FALSE
                    </button>
                  </div>
                )}
              </div>

              {/* Holders List - Scrollable (shows 5, scroll for more) */}
              <div className="px-4 md:px-5 lg:px-6 pb-4 md:pb-5 lg:pb-6 overflow-y-auto scrollbar-hide" style={{ maxHeight: '220px' }}>
                <div className="space-y-1">
                  {(market.isMultipleChoice && market.outcomes && selectedHoldersOutcome
                    ? outcomeHoldersData[selectedHoldersOutcome] || []
                    : holdersData[holdersPosition]
                  ).map((holder, index) => (
                    <div
                      key={holder.rank}
                      className="flex items-center gap-3 py-2"
                    >
                      {/* Rank Badge */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        holder.rank === 1 ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/50' :
                        holder.rank === 2 ? 'bg-zinc-400/20 text-zinc-300 ring-1 ring-zinc-400/50' :
                        holder.rank === 3 ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/50' :
                        'text-zinc-500'
                      }`}>
                        {holder.rank}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={holder.avatar} />
                        <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
                          {holder.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Username */}
                      <span className="flex-1 text-sm text-white truncate">
                        {holder.username}
                      </span>

                      {/* Shares */}
                      <span className="text-sm font-semibold text-white">
                        {holder.shares.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          market={market}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
