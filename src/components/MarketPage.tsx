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
  const [activeTab, setActiveTab] = useState<
    "dispute" | "overview" | "comments" | "rules" | "analysis"
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
    <div className="space-y-4 mx-auto scroll-smooth"> {/*max-w-6xl --removed*/}
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2"
          {...({} as any)}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToMarkets")}
        </Button>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLiked(!isLiked)}
            className={`gap-1 ${isLiked ? "text-red-500" : ""}`}
            {...({} as any)}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            {formatNumber(Math.floor(Math.random() * 500) + 100)}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`gap-1 ${isBookmarked ? "text-primary" : ""}`}
            {...({} as any)}
          >
            <Bookmark
              className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
            />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1 cursor-pointer"
            onClick={() => setShowShareModal(true)}
            {...({} as any)}
          >
            <Share2 className="h-4 w-4" />
            {t("share")}
          </Button>
        </div>
      </div>

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

            <div className="absolute bottom-4 left-4 right-4">
              <Badge
                variant="outline"
                className="text-xs mb-2 bg-background/80"
              >
                {market.category}
              </Badge>
              <h1 className="text-xl font-bold text-white mb-2">
                {getTranslatedText(market.claim, market.claimTranslations)}
              </h1>
            </div>
          </div>
        )}

        <CardContent className="p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Market Info */}
            <div className="lg:col-span-2 space-y-4">
              <p className="text-muted-foreground">
                {getTranslatedText(
                  market.description,
                  market.descriptionTranslations
                )}
              </p>

              {/* Location & Source */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
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
              </div>

              {/* Pool Distribution */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {t("truthVerificationPool")}
                  </span>
                  <span className="text-sm font-bold">
                    {formatCurrency(market.totalPool)}
                  </span>
                </div>
                <Progress
                  value={(market.yesPool / market.totalPool) * 100}
                  className="h-3"
                />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-primary">{t("truthYes")}</span>
                    <span className="font-medium">
                      {formatCurrency(market.yesPool)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">{t("truthNo")}</span>
                    <span className="font-medium">
                      {formatCurrency(market.noPool)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Odds & Stats */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className={`text-center p-4 ${market.disputable ? 'bg-foreground' : 'bg-primary/10 border-primary/20'} rounded-lg border `}>
                  <div className="text-sm text-muted-foreground mb-1">
                    {t("truthYes")}
                  </div>
                  <div className={`text-2xl font-bold ${market.disputable ? 'text-muted-foreground' : 'text-primary'} `}>
                    {market.yesOdds.toFixed(2)}x
                  </div>
                </div>
                <div className={`text-center p-4 ${market.disputable ? 'bg-foreground' : 'bg-secondary/10 border-secondary/20'}  rounded-lg border `}>
                  <div className="text-sm text-muted-foreground mb-1">
                    {t("truthNo")}
                  </div>
                  <div className={`text-2xl font-bold ${market.disputable ? 'text-muted-foreground' : 'text-secondary'}`}>
                    {market.noOdds.toFixed(2)}x
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {formatNumber(market.totalCasters)} {t("verifiers")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>
                    {formatNumber(Math.floor(Math.random() * 10000) + 5000)}{" "}
                    {t("views")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>
                    {comments.length} {t("comments")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>
                    {formatNumber(Math.floor(Math.random() * 500) + 100)}{" "}
                    {t("likes")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/50 rounded-lg">
        {[
          market.disputable && {
            id: "dispute",
            label: t("Dispute"),
            icon: MessagesSquare,
          },
          { id: "overview", label: t("Overview"), icon: Target },
          { id: "analysis", label: t("aiAnalysis"), icon: Zap },
          { id: "rules", label: t("rules"), icon: Scale },
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
                className="flex-1 gap-2"
                {...({} as any)}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.count && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {tab.count}
                  </Badge>
                )}
              </Button>
            );
          })}
      </div>

      <div
        className={`grid grid-cols-1 lg:${
          market.disputable ? "grid-cols-2" : "grid-cols-3"
        } gap-4 items-start relative`}
      >
        {/* Main Content */}
        <div className="lg:col-span-2">
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
                  <h3 className="font-semibold mb-2">
                    {t("verificationMethodology")}
                  </h3>
                  <p className="text-muted-foreground">
                    This market uses AI-powered truth verification combined with
                    community consensus. Our system analyzes multiple credible
                    sources, cross-references data, and incorporates expert
                    analysis to determine the most accurate outcome.
                  </p>
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

          {/* Rules Tab */}
          {activeTab === "rules" && (
            <div className="border border-border rounded-xl bg-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  {t("marketRules")} & {t("conditions")}
                </CardTitle>
                <CardDescription>{t("marketRulesDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {rules.map((rule) => {
                  const Icon = getRuleIcon(rule.category);
                  return (
                    <div
                      key={rule.id}
                      className="p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <Icon
                          className={`h-5 w-5 mt-0.5 ${getRuleColor(
                            rule.category
                          )}`}
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{rule.title}</h4>
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {rule.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {rule.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

        {/* Sidebar - Casting Interface */}
        {market.disputable || (
          <aside className="lg:sticky lg:top-6 self-start h-fit max-h-[calc(100vh-3rem)] overflow-visible">
            {/* BUY INTERFACE */}
            {castInterface === "buy" && (
              <div className="rounded-3xl bg-gradient-to-b from-zinc-950 to-black border border-zinc-800/50 shadow-2xl overflow-hidden backdrop-blur-xl transition-all duration-300">
                {/* Tabs */}
                <div className="flex bg-zinc-950/50 relative">
                  <button
                    onClick={() => setCastInterface("buy")}
                    className={`flex-1 py-5 text-sm font-bold transition-all duration-300 relative cursor-pointer ${
                      isBuying
                        ? "text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Buy
                    {isBuying && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setCastInterface("sell")}
                    className={`flex-1 py-5 text-sm font-bold transition-all duration-300 relative cursor-pointer ${
                      isSelling
                        ? "text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Sell
                    {isSelling && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-pink-500"></div>
                    )}
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-zinc-800/50"></div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Percentage Bar */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-bold" style={{ color: '#22d3ee' }}>{Math.round((market.yesPool / market.totalPool) * 100)}%</span>
                      <span className="text-4xl font-bold" style={{ color: '#c084fc' }}>{Math.round((market.noPool / market.totalPool) * 100)}%</span>
                    </div>
                    <div className="relative h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
                      <div
                        className="absolute inset-0"
                        style={{
                          width: `${(market.yesPool / market.totalPool) * 100}%`,
                          background: 'linear-gradient(to right, #22d3ee, #06b6d4, #c084fc)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Pick a Side */}
                  <div className="space-y-3 pt-3">
                    <h3 className="text-base font-medium text-white text-left">Pick a side</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handlePositionChange("yes")}
                        className={`py-5 px-5 rounded-2xl text-lg font-bold transition-all text-center cursor-pointer ${
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
                        className={`py-5 px-5 rounded-2xl text-lg font-bold transition-all text-center cursor-pointer ${
                          castPosition === "no"
                            ? "border-2 shadow-lg"
                            : "bg-zinc-900/80 border-2 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800/80"
                        }`}
                        style={castPosition === "no" ? {
                          background: 'linear-gradient(to bottom right, rgba(192, 132, 252, 0.2), rgba(168, 85, 247, 0.1))',
                          borderColor: 'rgba(192, 132, 252, 0.6)',
                          color: '#c084fc',
                          boxShadow: '0 10px 15px -3px rgba(192, 132, 252, 0.25)'
                        } : {}}
                      >
                        FALSE
                      </button>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-3 pt-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-medium text-white text-left">Amount</h3>
                      <span className="text-sm font-medium px-4 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-700/50 text-zinc-300">
                        Available {userBalance.toFixed(2)} USDT
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="0.00 USDT"
                        value={castAmount ? `${castAmount} USDT` : ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          handleAmountChange(value);
                        }}
                        className="w-full h-16 px-6 text-2xl font-bold text-white text-left bg-zinc-900/80 border-2 border-zinc-700/50 rounded-2xl focus:border-zinc-600 focus:ring-0 transition-all placeholder:text-zinc-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
                    className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none text-white"
                  >
                    {t("castPosition")}
                  </Button>
                </div>
              </div>
            )}

            {/* SELL INTERFACE */}
            {castInterface === "sell" && (
              <div className="rounded-3xl bg-gradient-to-b from-zinc-950 to-black border border-zinc-800/50 shadow-2xl overflow-hidden backdrop-blur-xl transition-all duration-300">
                {/* Tabs */}
                <div className="flex bg-zinc-950/50 relative">
                  <button
                    onClick={() => setCastInterface("buy")}
                    className={`flex-1 py-5 text-sm font-bold transition-all duration-300 relative cursor-pointer ${
                      isBuying
                        ? "text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Buy
                    {isBuying && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setCastInterface("sell")}
                    className={`flex-1 py-5 text-sm font-bold transition-all duration-300 relative cursor-pointer ${
                      isSelling
                        ? "text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Sell
                    {isSelling && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-pink-500"></div>
                    )}
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-zinc-800/50"></div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Percentage Bar */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-bold" style={{ color: '#22d3ee' }}>{Math.round((market.yesPool / market.totalPool) * 100)}%</span>
                      <span className="text-4xl font-bold" style={{ color: '#c084fc' }}>{Math.round((market.noPool / market.totalPool) * 100)}%</span>
                    </div>
                    <div className="relative h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
                      <div
                        className="absolute inset-0"
                        style={{
                          width: `${(market.yesPool / market.totalPool) * 100}%`,
                          background: 'linear-gradient(to right, #22d3ee, #06b6d4, #c084fc)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Pick a Side */}
                  <div className="space-y-3 pt-3">
                    <h3 className="text-base font-medium text-white text-left">Pick a side</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handlePositionChange("yes")}
                        className={`py-5 px-5 rounded-2xl text-lg font-bold transition-all text-center cursor-pointer ${
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
                        className={`py-5 px-5 rounded-2xl text-lg font-bold transition-all text-center cursor-pointer ${
                          castPosition === "no"
                            ? "border-2 shadow-lg"
                            : "bg-zinc-900/80 border-2 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800/80"
                        }`}
                        style={castPosition === "no" ? {
                          background: 'linear-gradient(to bottom right, rgba(192, 132, 252, 0.2), rgba(168, 85, 247, 0.1))',
                          borderColor: 'rgba(192, 132, 252, 0.6)',
                          color: '#c084fc',
                          boxShadow: '0 10px 15px -3px rgba(192, 132, 252, 0.25)'
                        } : {}}
                      >
                        FALSE
                      </button>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-3 pt-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-medium text-white text-left">Amount</h3>
                      <span className="text-sm font-medium px-4 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-700/50 text-zinc-300">
                        Available {userBalance.toFixed(2)} USDT
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="0.00 USDT"
                        value={castAmount ? `${castAmount} USDT` : ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          handleAmountChange(value);
                        }}
                        className="w-full h-16 px-6 text-2xl font-bold text-white text-left bg-zinc-900/80 border-2 border-zinc-700/50 rounded-2xl focus:border-zinc-600 focus:ring-0 transition-all placeholder:text-zinc-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
                    className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 transition-all shadow-lg shadow-pink-500/20 disabled:shadow-none text-white"
                  >
                    Sell Position
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
