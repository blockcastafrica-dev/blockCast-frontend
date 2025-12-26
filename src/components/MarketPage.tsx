import { useState } from "react";
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
  Heart,
  Bookmark,
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
}

const quickCastAmounts = [0.01, 0.05, 0.1, 0.5, 1.0];

export default function MarketPage({
  market,
  onPlaceBet,
  userBalance,
  onBack,
}: MarketPageProps) {
  const { t, language } = useLanguage();
  const [castPosition, setCastPosition] = useState<"yes" | "no">("yes");
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
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showMobileBetModal, setShowMobileBetModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "dispute" | "overview" | "comments" | "analysis" | "activity"
  >(market.disputable ? "dispute" : "overview");
  const [claim, setClaim] = useState<string>("");
  const [isTrue, setIsTrue] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [evidenceLink, setEvidenceLink] = useState("");
  const [castInterface, setCastInterface] = useState<"buy" | "sell">("buy");


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

  const calculateProfit = (amount: number, position: "yes" | "no") => {
    const odds = position === "yes" ? market.yesOdds : market.noOdds;
    const potentialReturn = amount * odds;
    const profit = potentialReturn - amount;
    return { amount, potential: potentialReturn, profit };
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

  const handlePositionChange = (position: "yes" | "no") => {
    setCastPosition(position);
    const amount = parseFloat(castAmount);
    if (!isNaN(amount) && amount > 0) {
      setProfitCalculation(calculateProfit(amount, position));
    }
  };

  const handleCustomCast = () => {
    const amount = parseFloat(castAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
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
    <div className="space-y-3 md:space-y-4 lg:space-y-4 mx-auto scroll-smooth max-w-7xl"> {/* Added max-width for better desktop layout */}
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
      <div className="flex flex-col lg:flex-row" style={{ gap: '60px' }}>
        {/* Left Column - All Content */}
        <div className="flex-1 min-w-0 space-y-3 md:space-y-4">
          {/* Market Header Card */}
          <div className="overflow-hidden border border-border rounded-xl bg-transparent">
        {market.imageUrl && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={market.imageUrl}
              alt={getTranslatedText(market.claim, market.claimTranslations)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />

            {/* {market.trending && (
              <div className="absolute top-4 left-4">
                <Badge
                  variant="secondary"
                  className="bg-primary/20 text-primary border-primary/30"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {t("trending")}
                </Badge>
              </div>
            )} */}

            <div className="absolute bottom-3 md:bottom-4 lg:bottom-4 left-3 md:left-4 lg:left-4 right-3 md:right-4 lg:right-4">
              <Badge
                variant="outline"
                className="text-[10px] md:text-xs lg:text-xs mb-1.5 md:mb-2 lg:mb-2 bg-background/80"
              >
                {market.category}
              </Badge>
              <h1 className="text-base md:text-lg lg:text-xl font-bold text-white mb-1.5 md:mb-2 lg:mb-2">
                {getTranslatedText(market.claim, market.claimTranslations)}
              </h1>
            </div>
          </div>
        )}

        <CardContent className="p-4 md:p-5 lg:p-6">
          <div className="space-y-4 md:space-y-5 lg:space-y-6">
            {/* Market Info */}
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {getTranslatedText(
                  market.description,
                  market.descriptionTranslations
                )}
              </p>

              {/* Location & Source */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>{market.country || market.region}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>{market.source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {t("expiresIn")} {getTimeRemaining(market.expiresAt)}
                  </span>
                </div>
                {/* Pool Volume */}
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>
                    ${(market.totalPool / 1000).toFixed(1)}k Pool
                  </span>
                </div>
              </div>
            </div>

            {/* Probability Chart - Full Width */}
            <div className="w-full">
              <ProbabilityChart
                yesPercentage={(market.yesPool / market.totalPool) * 100}
                noPercentage={(market.noPool / market.totalPool) * 100}
                totalPool={market.totalPool}
                yesPool={market.yesPool}
                noPool={market.noPool}
                onShare={() => setShowShareModal(true)}
                isLiked={isLiked}
                onLikeToggle={() => setIsLiked(!isLiked)}
                likeCount={formatNumber(Math.floor(Math.random() * 500) + 100)}
                isBookmarked={isBookmarked}
                onBookmarkToggle={() => setIsBookmarked(!isBookmarked)}
              />
            </div>
          </div>
        </CardContent>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1 md:gap-1 lg:gap-1 p-1.5 md:p-2 lg:p-2 bg-muted/50 rounded-lg">
        {[
          market.disputable && {
            id: "dispute",
            label: t("Dispute"),
            icon: MessagesSquare,
          },
          { id: "overview", label: t("Overview"), icon: Target },
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
          {/* Verify Truth Tab*/}
          {activeTab === "dispute" && market.disputable && (
            <>
              <div className="border border-border rounded-xl bg-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-semibold">
                    <MessageCircle className="h-5 w-5" />
                    Do you want to dispute this resolution?
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    {/* {market.claim} */}
                    If you have evidence that contradicts the AI resolution,
                    submit it here. Your evidence will be reviewed by our
                    dispute resolution system.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="p-4 bg-text-muted-foreground/10 rounded-lg border border-input">
                    <span className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4" />
                      <p className="text-md">
                        Evidence Submission Fee and Rewards
                      </p>
                    </span>

                    <ul className="list-disc mb-4 text-sm">
                      <li>
                        Submission Fee:{" "}
                        <span className="text-muted-foreground text-xs">
                          0.1 HBAR (paid from wallet)
                        </span>
                      </li>
                      <li>
                        Your Balance:{" "}
                        <span className="text-muted-foreground text-xs">
                          0.0000 HBAR
                        </span>
                      </li>
                      <li>
                        Reward if Accepted:{" "}
                        <span className="text-muted-foreground text-xs">
                          Up to 1.0 HBAR + Quality bonus
                        </span>
                      </li>
                      <li>
                        Partial Refund:{" "}
                        <span className="text-muted-foreground text-xs">
                          50% fee refunded for good-faith attempts
                        </span>
                      </li>
                    </ul>

                    <span className="text-red-500 text-sm">
                      ⚠️ Insufficient balance. You need at least 0.1 HBAR to
                      submit evidence
                    </span>
                  </div>
                </CardContent>

                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="claim">
                        Describe your evidence (maximum 200 characters)
                      </Label>
                      <Textarea
                        id="claim"
                        placeholder="Explain why you think the AI resolution is incorrect. Be specific and cite your sources..."
                        value={claim}
                        onChange={(e) => setClaim(e.target.value)}
                        rows={2}
                        className="resize-none mt-4"
                      />
                      <TextCounter text={claim} />
                    </div>

                    {/* ***********************************Evidence links ************************************/}
                    <div className="space-y-2">
                      <Label htmlFor="claim">Supporting links (Optional)</Label>
                      <Textarea
                        id="evidence"
                        placeholder="https://example.com/evidence1;https://example.com/evidence2"
                        value={evidenceLink}
                        onChange={(e) => setEvidenceLink(e.target.value)}
                        rows={2}
                        className="resize-none mt-4"
                      />
                      {evidenceLink && (
                        <span className="text-sm font-semiBold text-red-500">
                          Multiple links must be separated by a semi column(;),
                          or a comma(,)
                        </span>
                      )}

                      <Thumbnail url={evidenceLink} />

                      {/* <iframe src="https://lucide.dev" frameborder="0"></iframe> */}
                    </div>

                    <Select value={isTrue} onValueChange={handleVerifyClaim}>
                      <SelectTrigger
                        className="w-40 md:w-32 flex-1 h-11 bg-background/50 border-primary/30 text-sm"
                        {...({} as any)}
                      >
                        <SelectValue placeholder="Yes/No" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="True">True</SelectItem>
                        <SelectItem value="False">False</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={async () => {
                        setIsVerifying(true);
                        try {
                          // Placeholder verification logic
                          await new Promise((res) => setTimeout(res, 1000));
                          toast.success("Verification submitted");
                          setClaim("");
                        } catch (e) {
                          console.error(e);
                          toast.error("Verification failed");
                        } finally {
                          setIsVerifying(false);
                        }
                      }}
                      disabled={isVerifying || !claim.trim() || isTrue === ""}
                      className="w-full"
                    >
                      {isVerifying ? "Verifying..." : "Verify Truth"}
                    </Button>
                  </div>
                </CardContent>
              </div>

              {/************************** Market Activity Timeline **************************/}
              <div className="mt-8 border border-border rounded-xl bg-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-semibold">
                    <Clock4 className="h-4 w-4" />
                    Market Activity Timeline
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    Complete history of market events, evidence submissions, and
                    blockchain transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-text-muted-foreground/10 rounded-lg border border-input flex gap-4">
                    <div className="mt-2">
                      <Target className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex items-center gap-2">
                        <p className="text-md">Market Created</p>
                        <span className="text-xs border border-input p-1 rounded-lg">
                          Genesis Event
                        </span>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        <p> Prediction market created by cccc</p>
                        <p>9/24/2025</p>
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Prediction market closed/opened */}

                <CardContent>
                  <div className="flex flex-col gap-2 w-full p-4 bg-foreground rounded-lg border border-input">
                    <div className="flex items-center gap-2">
                      <p
                        style={{ color: "#ffa200" }}
                        className="text-md font-semibold"
                      >
                        Prediction Market Closed
                      </p>
                      <span
                        style={{ backgroundColor: "#ffa200" }}
                        className="text-sm font-bold py-1 px-6 rounded-lg bg-yellow-600"
                      >
                        Evidence Submission | {10} days Left
                      </span>
                    </div>
                    <div className="text-muted-foreground text-sm">
                      <p>
                        Prediction period ended, market entered resolution phase
                      </p>
                      <p>10/2/2025 at 10:00:00 PM</p>
                    </div>
                  </div>
                </CardContent>

                <CardContent>
                  <div className="p-4 bg-text-muted-foreground/10 rounded-lg border border-input flex gap-4">
                    <div className="mt-2">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex items-center gap-2">
                        <p className="text-md">Evidence Submitted</p>
                        <span
                          style={{ backgroundColor: "#fff" }}
                          className="text-xs border border-input rounded-lg"
                        >
                          Genesis Event
                        </span>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        <p>Submitted by 0x1234...5678</p>
                        <p className="text-white">
                          "I don't agree with this resolution"{" "}
                          <a className="text-blue-500" href="">
                            [Link]
                          </a>
                        </p>
                        <p>9/24/2025 TX: 0xea5696...fa70d7 Fee:0.1 HBAR 0</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>

              {/************************** Market Description**************************/}
              <div className="mt-8 border border-border rounded-xl bg-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-semibold">
                    <Target className="h-4 w-4" />
                    <h3>Market Overview</h3>
                  </CardTitle>
                  <CardTitle className="flex items-center gap-2 font-semibold mt-6">
                    <h3>Market Description</h3>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mb-4">
                    Deployed directly for test
                  </CardDescription>

                  <Separator />
                </CardHeader>
                <CardContent>
                  <div className="py-1 mb-4 bg-text-muted-foreground/10 flex flex-col gap-4">
                    <h3 className="text-md">Verification Methodology</h3>
                    <p className="text-muted-foreground">
                      This market uses Ai-Powered truth verification combined
                      with community consensus. Our system analyzes multiple
                      credible sources, corss-references data, and incorporates
                      expert anlysis to determine the most accurate outcome.
                    </p>
                  </div>
                  <Separator />
                </CardContent>

                {/* Resolution Status */}

                <CardContent>
                  <div className="p-4 rounded-lg border border-input">
                    <div className="mb-6 bg-text-muted-foreground/10 flex justify-between">
                      <div>
                        <span className="flex items-center gap-2 font-semibold text-sm mb-1">
                          <Target className="h-3 w-3" />
                          <h3>Resolution Status</h3>
                        </span>
                        <p className="text-muted-foreground text-sm">
                          Status unknown
                        </p>
                      </div>
                      <h5 className="text-xs font-bold">Unknown</h5>
                    </div>
                    <span className="flex flex-col gap-4">
                      <Separator />
                      <Separator />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold">Market Status</h3>
                    <div className="flex gap-3 mt-4 items-center">
                      <span className="rounded-lg bg-secondary py-1 px-2 text-sm font-bold">
                        DISPUTABLE
                      </span>
                      <span className="border border-input py-1 px-2 text-xs rounded-lg font-bold">
                        {crypto.randomUUID()}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        Expires in {"Expired"}
                      </span>
                    </div>
                  </div>
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
                {[
                  {
                    id: "1",
                    wallet: "0x7835...892f",
                    action: "bought",
                    shares: 143,
                    position: "no",
                    price: 0.28,
                    total: 39.8,
                    time: "25 minutes ago",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1"
                  },
                  {
                    id: "2",
                    wallet: "0x66CE...A2E3",
                    action: "bought",
                    shares: 93.1,
                    position: "no",
                    price: 0.27,
                    total: 25.4,
                    time: "2 hours ago",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2"
                  },
                  {
                    id: "3",
                    wallet: "freedom",
                    action: "bought",
                    shares: 101,
                    position: "no",
                    price: 0.26,
                    total: 26.6,
                    time: "2 hours ago",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3"
                  },
                  {
                    id: "4",
                    wallet: "Senzer",
                    action: "sold",
                    shares: 81.6,
                    position: "yes",
                    price: 0.75,
                    total: 61.3,
                    time: "2 hours ago",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4"
                  },
                  {
                    id: "5",
                    wallet: "wildegou",
                    action: "sold",
                    shares: 178,
                    position: "no",
                    price: 0.25,
                    total: 44.9,
                    time: "5 hours ago",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=5"
                  },
                  {
                    id: "6",
                    wallet: "KnightXBT",
                    action: "bought",
                    shares: 132,
                    position: "yes",
                    price: 0.76,
                    total: 100,
                    time: "5 hours ago",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=6"
                  },
                ].map((activity) => (
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
        </div>
        {/* End of Left Column */}

        {/* Mobile Sticky Betting Bar - Fixed above footer (hidden when modal is open) */}
        {!market.disputable && !showMobileBetModal && (
          <div
            className="lg:hidden fixed left-0 right-0 z-50"
            style={{ bottom: '70px' }}
          >
            <div
              className="mx-3 rounded-2xl p-4"
              style={{ backgroundColor: '#0f1419', border: '1px solid #1f2937' }}
            >
              {/* Progress Bar with Percentages */}
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
                  className={`py-3 px-4 rounded-full transition-all text-center cursor-pointer ${
                    castPosition === "yes"
                      ? "border-2 shadow-lg"
                      : "bg-zinc-900/80 border-2 border-zinc-700/50"
                  }`}
                  style={castPosition === "yes" ? {
                    background: 'linear-gradient(to bottom right, rgba(34, 211, 238, 0.2), rgba(37, 99, 235, 0.1))',
                    borderColor: 'rgba(34, 211, 238, 0.6)',
                    boxShadow: '0 10px 15px -3px rgba(34, 211, 238, 0.25)'
                  } : {}}
                >
                  <div className={`text-base font-bold ${castPosition === "yes" ? "text-cyan-400" : "text-zinc-400"}`}>True</div>
                  <div className={`text-xs ${castPosition === "yes" ? "text-cyan-300" : "text-zinc-500"}`}>
                    ${market.yesPool >= 1000 ? (market.yesPool / 1000).toFixed(1) + 'K' : market.yesPool.toFixed(0)}
                  </div>
                </button>
                <button
                  onClick={() => { handlePositionChange("no"); setShowMobileBetModal(true); }}
                  className={`py-3 px-4 rounded-full transition-all text-center cursor-pointer ${
                    castPosition === "no"
                      ? "border-2 shadow-lg"
                      : "bg-zinc-900/80 border-2 border-zinc-700/50"
                  }`}
                  style={castPosition === "no" ? {
                    background: 'linear-gradient(to bottom right, rgba(192, 132, 252, 0.2), rgba(168, 85, 247, 0.1))',
                    borderColor: 'rgba(192, 132, 252, 0.6)',
                    boxShadow: '0 10px 15px -3px rgba(192, 132, 252, 0.25)'
                  } : {}}
                >
                  <div className={`text-base font-bold ${castPosition === "no" ? "text-purple-400" : "text-zinc-400"}`}>False</div>
                  <div className={`text-xs ${castPosition === "no" ? "text-purple-300" : "text-zinc-500"}`}>
                    ${market.noPool >= 1000 ? (market.noPool / 1000).toFixed(1) + 'K' : market.noPool.toFixed(0)}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Betting Modal - Above Footer */}
        {showMobileBetModal && !market.disputable && (
          <>
            {/* Backdrop - click to close */}
            <div
              className="lg:hidden fixed inset-0 z-[99] bg-black/50"
              onClick={() => setShowMobileBetModal(false)}
            />
            <div className="lg:hidden fixed left-0 right-0 z-[100] flex flex-col overflow-hidden" style={{ backgroundColor: '#0f1419', border: '1px solid #1f2937', top: '80px', bottom: '70px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
            {/* Close Button - Right Corner */}
            <button
              onClick={() => setShowMobileBetModal(false)}
              className="absolute top-3 right-4 h-8 w-8 flex items-center justify-center rounded-xl border-2 border-transparent transition-all z-10"
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

            {/* Static Content - No Scroll */}
            <div className="flex-1 flex flex-col">
              {/* Market Title Header */}
              <div className="flex items-center gap-3 px-5 pt-12 pb-3">
                {market.imageUrl && (
                  <img src={market.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                )}
                <h2 className="text-white font-bold text-base leading-tight pr-8">
                  {getTranslatedText(market.claim, market.claimTranslations)}
                </h2>
              </div>

              {/* Buy/Sell Tabs */}
              <div className="flex gap-4 border-b border-zinc-800/30 px-5">
                <button
                  onClick={() => setCastInterface("buy")}
                  className={`pt-1 pb-2 px-4 text-sm font-semibold transition-all duration-200 relative ${
                    castInterface === "buy" ? "text-white" : "text-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  Buy
                  {castInterface === "buy" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
                  )}
                </button>
                <button
                  onClick={() => setCastInterface("sell")}
                  className={`pt-1 pb-2 px-4 text-sm font-semibold transition-all duration-200 relative ${
                    castInterface === "sell" ? "text-white" : "text-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  Sell
                  {castInterface === "sell" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-between px-5 py-4">
                <div className="space-y-3">
                  {/* Progress Bar with Percentages */}
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

                  {/* Pick a Side */}
                  <div className="space-y-2">
                    <h3 className="text-sm text-zinc-400">Pick a side</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handlePositionChange("yes")}
                        className={`py-3 px-4 rounded-full text-base font-bold transition-all text-center cursor-pointer ${
                          castPosition === "yes"
                            ? "border-2 shadow-lg"
                            : "bg-zinc-900/80 border-2 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800/80"
                        }`}
                        style={castPosition === "yes" ? {
                          background: 'linear-gradient(to bottom right, rgba(34, 211, 238, 0.2), rgba(37, 99, 235, 0.1))',
                          borderColor: 'rgba(34, 211, 238, 0.6)',
                          color: '#22d3ee',
                          boxShadow: '0 10px 15px -3px rgba(34, 211, 238, 0.25)'
                        } : {}}
                      >
                        TRUE
                      </button>
                      <button
                        onClick={() => handlePositionChange("no")}
                        className={`py-3 px-4 rounded-full text-base font-bold transition-all text-center cursor-pointer ${
                          castPosition === "no"
                            ? "border-2 shadow-lg"
                            : "bg-zinc-900/80 border-2 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800/80"
                        }`}
                        style={castPosition === "no" ? {
                          background: 'linear-gradient(to bottom right, rgba(192, 132, 252, 0.2), rgba(168, 85, 247, 0.1))',
                          borderColor: 'rgba(192, 132, 252, 0.6)',
                          color: '#7c3aed',
                          boxShadow: '0 10px 15px -3px rgba(192, 132, 252, 0.25)'
                        } : {}}
                      >
                        FALSE
                      </button>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm text-zinc-400">Amount</h3>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-700/50 text-zinc-300">
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
                        className="w-full h-12 pr-4 text-white text-lg bg-zinc-900/50 border border-zinc-700/50 rounded-xl focus:border-zinc-600 focus:ring-0 placeholder:text-zinc-600"
                        style={{ paddingLeft: '65px' }}
                      />
                    </div>
                  </div>

                  {/* Market Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Price change</span>
                      <span className="text-zinc-300">
                        ${(castPosition === "yes" ? market.yesOdds : market.noOdds).toFixed(2)} → ${(castPosition === "yes" ? market.yesOdds : market.noOdds).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Shares</span>
                      <span className="text-zinc-300">
                        {profitCalculation ? Math.floor(profitCalculation.amount / (castPosition === "yes" ? market.yesOdds : market.noOdds)) : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Avg. price</span>
                      <span className="text-zinc-300">
                        ${profitCalculation ? (profitCalculation.amount / Math.max(1, Math.floor(profitCalculation.amount / (castPosition === "yes" ? market.yesOdds : market.noOdds)))).toFixed(2) : "0.00"}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-zinc-800 my-1"></div>

                  {/* Fee Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-zinc-500">Fee</span>
                        <AlertCircle className="w-3 h-3 text-zinc-600" />
                      </div>
                      <span className="text-zinc-300">3%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Max profit</span>
                      <span className="text-emerald-400">
                        ${profitCalculation ? profitCalculation.profit.toFixed(2) : "0.00"} ({profitCalculation ? ((profitCalculation.profit / Math.max(0.01, profitCalculation.amount)) * 100).toFixed(2) : "0.00"}%)
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

                </div>

                {/* Bottom Button */}
                <div className="pt-4">
                  <Button
                    onClick={() => { handleCustomCast(); setShowMobileBetModal(false); }}
                    disabled={!castAmount || parseFloat(castAmount) > userBalance}
                    className="w-full h-14 text-lg font-bold rounded-xl cursor-pointer"
                    style={{
                      backgroundColor: !castAmount || parseFloat(castAmount) > userBalance ? '#334155' : '#06f6ff',
                      color: !castAmount || parseFloat(castAmount) > userBalance ? '#94a3b8' : '#000000'
                    }}
                  >
                    {!castAmount ? 'Enter amount' : parseFloat(castAmount) > userBalance ? 'Insufficient balance' : 'Cast Position'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          </>
        )}

        {/* Right Column - Betting Modal (Desktop Only - Sticky) */}
        {!market.disputable && (
          <aside className="hidden lg:block lg:w-[380px] shrink-0" style={{ position: 'sticky', top: '100px', alignSelf: 'flex-start', height: 'fit-content' }}>
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
                  </div>

                  {/* Pick a Side */}
                  <div className="space-y-2 pt-2">
                    <h3 className="text-sm font-medium text-white text-left">Pick a side</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handlePositionChange("yes")}
                        className={`py-3 px-4 rounded-full text-base font-bold transition-all text-center cursor-pointer ${
                          castPosition === "yes"
                            ? "border-2 shadow-lg"
                            : "bg-zinc-900/80 border-2 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800/80"
                        }`}
                        style={castPosition === "yes" ? {
                          background: 'linear-gradient(to bottom right, rgba(34, 211, 238, 0.2), rgba(37, 99, 235, 0.1))',
                          borderColor: 'rgba(34, 211, 238, 0.6)',
                          color: '#22d3ee',
                          boxShadow: '0 10px 15px -3px rgba(34, 211, 238, 0.25)'
                        } : {}}
                      >
                        TRUE
                      </button>
                      <button
                        onClick={() => handlePositionChange("no")}
                        className={`py-3 px-4 rounded-full text-base font-bold transition-all text-center cursor-pointer ${
                          castPosition === "no"
                            ? "border-2 shadow-lg"
                            : "bg-zinc-900/80 border-2 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800/80"
                        }`}
                        style={castPosition === "no" ? {
                          background: 'linear-gradient(to bottom right, rgba(192, 132, 252, 0.2), rgba(168, 85, 247, 0.1))',
                          borderColor: 'rgba(192, 132, 252, 0.6)',
                          color: '#7c3aed',
                          boxShadow: '0 10px 15px -3px rgba(192, 132, 252, 0.25)'
                        } : {}}
                      >
                        FALSE
                      </button>
                    </div>
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
                        className="w-full h-12 md:h-14 lg:h-16 pr-4 md:pr-6 lg:pr-6 font-bold text-white text-left bg-zinc-900/80 border-2 border-zinc-700/50 rounded-xl md:rounded-2xl lg:rounded-2xl focus:border-zinc-600 focus:ring-0 transition-all placeholder:text-zinc-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-lg md:text-xl lg:text-2xl" style={{ paddingLeft: '90px' }}
                      />
                    </div>
                  </div>

                  {/* Market Info */}
                  <div className="space-y-3 py-4 border-t border-zinc-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-base text-white text-left font-normal">Price change</span>
                      <span className="text-base font-medium text-white text-right">
                        {(castPosition === "yes" ? market.yesOdds : market.noOdds).toFixed(2)} USDT → {(castPosition === "yes" ? market.yesOdds : market.noOdds).toFixed(2)} USDT
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-white text-left font-normal">Shares</span>
                      <span className="text-base font-medium text-white text-right">
                        {profitCalculation ? Math.floor(profitCalculation.amount / (castPosition === "yes" ? market.yesOdds : market.noOdds)) : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-white text-left font-normal">Avg. price</span>
                      <span className="text-base font-medium text-white text-right">
                        {profitCalculation ? (profitCalculation.amount / Math.max(1, Math.floor(profitCalculation.amount / (castPosition === "yes" ? market.yesOdds : market.noOdds)))).toFixed(2) : "0.00"} USDT
                      </span>
                    </div>
                  </div>

                  {/* Fee Info */}
                  <div className="space-y-3 py-4 border-t border-zinc-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base text-white text-left font-normal">Fee</span>
                        <AlertCircle className="w-4 h-4 text-zinc-500" />
                      </div>
                      <span className="text-base font-medium text-white text-right">3%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-white text-left font-normal">Max profit</span>
                      <span className="text-base font-semibold text-emerald-400 text-right">
                        {profitCalculation ? profitCalculation.profit.toFixed(2) : "0.00"} USDT ({profitCalculation ? ((profitCalculation.profit / profitCalculation.amount) * 100).toFixed(2) : "0.00"}%)
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
                    disabled={!castAmount || parseFloat(castAmount) > userBalance}
                    className="relative w-full h-12 md:h-13 lg:h-14 text-base md:text-lg lg:text-lg font-bold rounded-xl md:rounded-2xl lg:rounded-2xl cursor-pointer"
                    style={{ backgroundColor: '#06f6ff', color: '#000000' }}
                  >
                    Cast Position
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
                  </div>

                  {/* Pick a Side */}
                  <div className="space-y-2 pt-2">
                    <h3 className="text-sm font-medium text-white text-left">Pick a side</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handlePositionChange("yes")}
                        className={`py-3 px-4 rounded-full text-base font-bold transition-all text-center cursor-pointer ${
                          castPosition === "yes"
                            ? "border-2 shadow-lg"
                            : "bg-zinc-900/80 border-2 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800/80"
                        }`}
                        style={castPosition === "yes" ? {
                          background: 'linear-gradient(to bottom right, rgba(34, 211, 238, 0.2), rgba(37, 99, 235, 0.1))',
                          borderColor: 'rgba(34, 211, 238, 0.6)',
                          color: '#22d3ee',
                          boxShadow: '0 10px 15px -3px rgba(34, 211, 238, 0.25)'
                        } : {}}
                      >
                        TRUE
                      </button>
                      <button
                        onClick={() => handlePositionChange("no")}
                        className={`py-3 px-4 rounded-full text-base font-bold transition-all text-center cursor-pointer ${
                          castPosition === "no"
                            ? "border-2 shadow-lg"
                            : "bg-zinc-900/80 border-2 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800/80"
                        }`}
                        style={castPosition === "no" ? {
                          background: 'linear-gradient(to bottom right, rgba(192, 132, 252, 0.2), rgba(168, 85, 247, 0.1))',
                          borderColor: 'rgba(192, 132, 252, 0.6)',
                          color: '#7c3aed',
                          boxShadow: '0 10px 15px -3px rgba(192, 132, 252, 0.25)'
                        } : {}}
                      >
                        FALSE
                      </button>
                    </div>
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
                        className="w-full h-12 md:h-14 lg:h-16 pr-4 md:pr-6 lg:pr-6 font-bold text-white text-left bg-zinc-900/80 border-2 border-zinc-700/50 rounded-xl md:rounded-2xl lg:rounded-2xl focus:border-zinc-600 focus:ring-0 transition-all placeholder:text-zinc-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-lg md:text-xl lg:text-2xl" style={{ paddingLeft: '90px' }}
                      />
                    </div>
                  </div>

                  {/* Market Info */}
                  <div className="space-y-3 py-4 border-t border-zinc-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-base text-white text-left font-normal">Price change</span>
                      <span className="text-base font-medium text-white text-right">
                        {(castPosition === "yes" ? market.yesOdds : market.noOdds).toFixed(2)} USDT → {(castPosition === "yes" ? market.yesOdds : market.noOdds).toFixed(2)} USDT
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-white text-left font-normal">Shares</span>
                      <span className="text-base font-medium text-white text-right">
                        {profitCalculation ? Math.floor(profitCalculation.amount / (castPosition === "yes" ? market.yesOdds : market.noOdds)) : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-white text-left font-normal">Avg. price</span>
                      <span className="text-base font-medium text-white text-right">
                        {profitCalculation ? (profitCalculation.amount / Math.max(1, Math.floor(profitCalculation.amount / (castPosition === "yes" ? market.yesOdds : market.noOdds)))).toFixed(2) : "0.00"} USDT
                      </span>
                    </div>
                  </div>

                  {/* Fee Info */}
                  <div className="space-y-3 py-4 border-t border-zinc-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base text-white text-left font-normal">Fee</span>
                        <AlertCircle className="w-4 h-4 text-zinc-500" />
                      </div>
                      <span className="text-base font-medium text-white text-right">3%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-white text-left font-normal">Max profit</span>
                      <span className="text-base font-semibold text-emerald-400 text-right">
                        {profitCalculation ? profitCalculation.profit.toFixed(2) : "0.00"} USDT ({profitCalculation ? ((profitCalculation.profit / profitCalculation.amount) * 100).toFixed(2) : "0.00"}%)
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
                    disabled={!castAmount || parseFloat(castAmount) > userBalance}
                    className="relative w-full h-12 md:h-13 lg:h-14 text-base md:text-lg lg:text-lg font-bold rounded-xl md:rounded-2xl lg:rounded-2xl cursor-pointer"
                    style={{ backgroundColor: '#06f6ff', color: '#000000' }}
                  >
                    Cast Position
                  </Button>
                </div>
              </div>
            )}
            {/* <Card></div> */}
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
