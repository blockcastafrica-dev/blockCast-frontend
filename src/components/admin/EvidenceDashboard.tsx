import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Link as LinkIcon,
  Sparkles,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Users,
  Clock,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Loader2,
  RotateCcw,
  Gavel
} from 'lucide-react';
import { toast } from 'sonner';

// Market Status Types following the lifecycle
type MarketResolutionStatus =
  | 'TRADING'           // Active trading period
  | 'EVIDENCE_COLLECTION' // 48-hour evidence submission window
  | 'AI_ANALYSIS'       // AI analyzing with evidence
  | 'PENDING_RESOLUTION' // Awaiting admin decision
  | 'RESOLVED'          // Winners paid
  | 'REFUNDED';         // All bets returned

interface Evidence {
  id: string;
  marketId: string;
  marketClaim: string;
  type: 'community' | 'admin' | 'ai';
  submittedBy: string;
  submittedAt: Date;
  content: string;
  sourceUrl?: string;
  supportedOutcome?: string;
  upvotes: number;
  downvotes: number;
  status: 'pending' | 'verified' | 'rejected';
}

interface MarketOutcome {
  id: string;
  label: string;
  pool: number;
  odds: number;
  color: string;
}

interface DisputedMarket {
  id: string;
  claim: string;
  isMultipleChoice: boolean;
  outcomes?: MarketOutcome[];
  currentResolution: string | null;
  resolutionStatus: MarketResolutionStatus;
  aiConfidence: number;
  aiSuggestedOutcome: string | null;
  disputeCount: number;
  totalVolume: number;
  evidenceWindowEnds: Date;
  evidence: Evidence[];
}

const EvidenceDashboard: React.FC = () => {
  const [fetchingAI, setFetchingAI] = useState<string | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [analyzingMarket, setAnalyzingMarket] = useState<string | null>(null);

  // Mock data with resolution flow states
  const [disputedMarkets, setDisputedMarkets] = useState<DisputedMarket[]>([
    {
      id: '1',
      claim: 'Will Bitcoin reach $100K in 2024?',
      isMultipleChoice: false,
      currentResolution: null,
      resolutionStatus: 'EVIDENCE_COLLECTION',
      aiConfidence: 0,
      aiSuggestedOutcome: null,
      disputeCount: 3,
      totalVolume: 45000,
      evidenceWindowEnds: new Date(Date.now() + 36 * 60 * 60 * 1000), // 36 hours left
      evidence: [
        {
          id: 'e1',
          marketId: '1',
          marketClaim: 'Will Bitcoin reach $100K in 2024?',
          type: 'community',
          submittedBy: '0x7f3a...d4e5',
          submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          content: 'Bitcoin closed at $99,850 on Dec 31, 2024. It never technically reached $100K.',
          sourceUrl: 'https://coinmarketcap.com/currencies/bitcoin/historical-data/',
          supportedOutcome: 'FALSE',
          upvotes: 45,
          downvotes: 12,
          status: 'pending'
        },
        {
          id: 'e2',
          marketId: '1',
          marketClaim: 'Will Bitcoin reach $100K in 2024?',
          type: 'community',
          submittedBy: '0x8a4b...e7f8',
          submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          content: 'According to multiple exchanges, BTC briefly touched $100,050 on Dec 17, 2024.',
          sourceUrl: 'https://www.tradingview.com/chart/?symbol=BTCUSD',
          supportedOutcome: 'TRUE',
          upvotes: 67,
          downvotes: 8,
          status: 'verified'
        }
      ]
    },
    {
      id: '2',
      claim: 'Who will win Album of the Year at the 2025 Grammy Awards?',
      isMultipleChoice: true,
      outcomes: [
        { id: 'beyonce', label: 'Beyoncé', pool: 1487500, odds: 2.86, color: '#06F6FF' },
        { id: 'taylor-swift', label: 'Taylor Swift', pool: 1062500, odds: 4.0, color: '#05DDFF' },
        { id: 'kendrick-lamar', label: 'Kendrick Lamar', pool: 850000, odds: 5.0, color: '#5B3AE8' },
        { id: 'billie-eilish', label: 'Billie Eilish', pool: 637500, odds: 6.67, color: '#432AC5' },
        { id: 'other', label: 'Other', pool: 212500, odds: 20.0, color: '#2C1CA4' },
      ],
      currentResolution: null,
      resolutionStatus: 'AI_ANALYSIS',
      aiConfidence: 92,
      aiSuggestedOutcome: 'beyonce',
      disputeCount: 2,
      totalVolume: 4250000,
      evidenceWindowEnds: new Date(Date.now() - 2 * 60 * 60 * 1000), // Window ended
      evidence: [
        {
          id: 'e3',
          marketId: '2',
          marketClaim: 'Who will win Album of the Year at the 2025 Grammy Awards?',
          type: 'community',
          submittedBy: '0x9c5d...a8b9',
          submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          content: 'Beyoncé won Album of the Year for "Renaissance" at the 67th Grammy Awards on Feb 2, 2025.',
          sourceUrl: 'https://www.grammy.com/awards/67th-annual-grammy-awards',
          supportedOutcome: 'beyonce',
          upvotes: 156,
          downvotes: 3,
          status: 'verified'
        },
        {
          id: 'e4',
          marketId: '2',
          marketClaim: 'Who will win Album of the Year at the 2025 Grammy Awards?',
          type: 'ai',
          submittedBy: 'Gemini AI',
          submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          content: 'Based on official Grammy.com records and multiple news sources (Rolling Stone, Billboard, Variety), Beyoncé\'s "Renaissance" won Album of the Year at the 67th Annual Grammy Awards held on February 2, 2025. This is her first Album of the Year win.',
          sourceUrl: 'https://www.grammy.com/awards',
          supportedOutcome: 'beyonce',
          upvotes: 0,
          downvotes: 0,
          status: 'verified'
        }
      ]
    },
    {
      id: '3',
      claim: 'Will the US pass a crypto regulation bill in 2024?',
      isMultipleChoice: false,
      currentResolution: null,
      resolutionStatus: 'PENDING_RESOLUTION',
      aiConfidence: 78,
      aiSuggestedOutcome: 'FALSE',
      disputeCount: 1,
      totalVolume: 12000,
      evidenceWindowEnds: new Date(Date.now() - 48 * 60 * 60 * 1000), // Window ended
      evidence: [
        {
          id: 'e5',
          marketId: '3',
          marketClaim: 'Will the US pass a crypto regulation bill in 2024?',
          type: 'community',
          submittedBy: '0x9c5d...a8b9',
          submittedAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
          content: 'The FIT21 bill passed the House but did not pass the Senate in 2024.',
          sourceUrl: 'https://www.congress.gov/bill/118th-congress/house-bill/4763',
          supportedOutcome: 'FALSE',
          upvotes: 23,
          downvotes: 2,
          status: 'verified'
        }
      ]
    }
  ]);

  const handleFetchAI = async (marketId: string, claim: string) => {
    setFetchingAI(marketId);
    await new Promise(resolve => setTimeout(resolve, 3000));
    toast.success('AI evidence generated successfully');
    setFetchingAI(null);
  };

  const handleRunAIAnalysis = async (marketId: string) => {
    setAnalyzingMarket(marketId);
    await new Promise(resolve => setTimeout(resolve, 4000));

    setDisputedMarkets(prev => prev.map(m => {
      if (m.id === marketId) {
        const newConfidence = Math.floor(Math.random() * 30) + 70; // 70-100%
        return {
          ...m,
          resolutionStatus: 'PENDING_RESOLUTION' as MarketResolutionStatus,
          aiConfidence: newConfidence,
          aiSuggestedOutcome: m.isMultipleChoice ? m.outcomes?.[0]?.id || null : 'TRUE'
        };
      }
      return m;
    }));

    toast.success('AI analysis complete');
    setAnalyzingMarket(null);
  };

  const handleVerifyEvidence = (evidenceId: string) => {
    setDisputedMarkets(prev => prev.map(m => ({
      ...m,
      evidence: m.evidence.map(e =>
        e.id === evidenceId ? { ...e, status: 'verified' as const } : e
      )
    })));
    toast.success('Evidence marked as verified');
  };

  const handleRejectEvidence = (evidenceId: string) => {
    setDisputedMarkets(prev => prev.map(m => ({
      ...m,
      evidence: m.evidence.map(e =>
        e.id === evidenceId ? { ...e, status: 'rejected' as const } : e
      )
    })));
    toast.success('Evidence rejected');
  };

  const handleResolveMarket = (marketId: string, outcome: string) => {
    setDisputedMarkets(prev => prev.map(m => {
      if (m.id === marketId) {
        return {
          ...m,
          resolutionStatus: 'RESOLVED' as MarketResolutionStatus,
          currentResolution: outcome
        };
      }
      return m;
    }));
    toast.success(`Market resolved as ${outcome}. Winners will be paid automatically.`);
  };

  const handleRefundMarket = (marketId: string) => {
    setDisputedMarkets(prev => prev.map(m => {
      if (m.id === marketId) {
        return {
          ...m,
          resolutionStatus: 'REFUNDED' as MarketResolutionStatus,
          currentResolution: null
        };
      }
      return m;
    }));
    toast.success('Market refunded. All bets will be returned to users.');
  };

  const getEvidenceTypeIcon = (type: string) => {
    switch (type) {
      case 'community': return <Users className="h-4 w-4 text-blue-500" />;
      case 'admin': return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'ai': return <Sparkles className="h-4 w-4 text-[#06f6ff]" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getEvidenceTypeBadge = (type: string) => {
    switch (type) {
      case 'community': return <Badge variant="outline" className="text-blue-500 border-blue-500/30">Community</Badge>;
      case 'admin': return <Badge className="bg-purple-600">Admin</Badge>;
      case 'ai': return <Badge className="bg-[#06f6ff] text-black">AI Generated</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: MarketResolutionStatus) => {
    switch (status) {
      case 'TRADING':
        return <Badge className="bg-green-600">Trading Active</Badge>;
      case 'EVIDENCE_COLLECTION':
        return <Badge className="bg-yellow-600 text-black">Evidence Collection</Badge>;
      case 'AI_ANALYSIS':
        return <Badge className="bg-[#06f6ff] text-black">AI Analysis</Badge>;
      case 'PENDING_RESOLUTION':
        return <Badge className="bg-orange-600">Pending Resolution</Badge>;
      case 'RESOLVED':
        return <Badge className="bg-green-600">Resolved</Badge>;
      case 'REFUNDED':
        return <Badge className="bg-gray-600">Refunded</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatTimeRemaining = (endDate: Date) => {
    const diff = endDate.getTime() - Date.now();
    if (diff <= 0) return 'Window Closed';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }
    return `${hours}h ${minutes}m remaining`;
  };

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-500';
    if (confidence >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getOutcomeLabel = (market: DisputedMarket, outcomeId: string) => {
    if (market.isMultipleChoice && market.outcomes) {
      return market.outcomes.find(o => o.id === outcomeId)?.label || outcomeId;
    }
    return outcomeId;
  };

  return (
    <div className="space-y-6">
      {/* Resolution Flow Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gavel className="h-5 w-5" />
            Market Resolution Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-600 text-black">Evidence Collection</Badge>
              <span className="text-muted-foreground">→</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-[#06f6ff] text-black">AI Analysis</Badge>
              <span className="text-muted-foreground">→</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-600">Pending Resolution</Badge>
              <span className="text-muted-foreground">→</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">≥90% confidence:</span>
              <Badge className="bg-green-600">Resolved</Badge>
            </div>
            <span className="text-muted-foreground">/</span>
            <div className="flex items-center gap-2">
              <span className="text-red-500">&lt;90% confidence:</span>
              <Badge className="bg-gray-600">Refunded</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Evidence Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#06f6ff]" />
            AI Evidence Generator
          </CardTitle>
          <CardDescription>
            Use AI (Gemini/Perplexity) to automatically fetch and verify evidence for disputed markets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Textarea
              placeholder="Enter a claim or question to verify with AI..."
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className="flex-1"
              rows={2}
            />
            <Button className="bg-[#06f6ff] text-black hover:bg-[#06f6ff]/90 shrink-0">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Evidence
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Markets in Resolution Flow */}
      <div className="space-y-6">
        {disputedMarkets.map((market) => (
          <Card key={market.id} className={
            market.resolutionStatus === 'RESOLVED' ? 'border-green-500/30' :
            market.resolutionStatus === 'REFUNDED' ? 'border-gray-500/30' :
            ''
          }>
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{market.claim}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {getStatusBadge(market.resolutionStatus)}
                      {market.isMultipleChoice && (
                        <Badge variant="outline" className="text-purple-500 border-purple-500/30">
                          Multiple Choice
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {market.evidence.length} Evidence
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${market.totalVolume.toLocaleString()} volume
                      </span>
                    </div>
                  </div>

                  {market.resolutionStatus === 'EVIDENCE_COLLECTION' && (
                    <Button
                      variant="outline"
                      className="shrink-0"
                      onClick={() => handleFetchAI(market.id, market.claim)}
                      disabled={fetchingAI === market.id}
                    >
                      {fetchingAI === market.id ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      Fetch AI Evidence
                    </Button>
                  )}
                </div>

                {/* Evidence Window Timer */}
                {market.resolutionStatus === 'EVIDENCE_COLLECTION' && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        Evidence Submission Window
                      </span>
                      <span className="text-sm font-mono text-yellow-500">
                        {formatTimeRemaining(market.evidenceWindowEnds)}
                      </span>
                    </div>
                    <Progress
                      value={Math.max(0, Math.min(100,
                        ((48 * 60 * 60 * 1000) - (market.evidenceWindowEnds.getTime() - Date.now())) / (48 * 60 * 60 * 1000) * 100
                      ))}
                      className="h-2"
                    />
                  </div>
                )}

                {/* AI Confidence Display */}
                {(market.resolutionStatus === 'AI_ANALYSIS' || market.resolutionStatus === 'PENDING_RESOLUTION') && market.aiConfidence > 0 && (
                  <div className={`p-4 rounded-lg border ${
                    market.aiConfidence >= 90 ? 'bg-green-500/10 border-green-500/30' : 'bg-orange-500/10 border-orange-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#06f6ff]" />
                        AI Analysis Result
                      </span>
                      <span className={`text-lg font-bold ${getConfidenceColor(market.aiConfidence)}`}>
                        {market.aiConfidence}% Confidence
                      </span>
                    </div>
                    <Progress
                      value={market.aiConfidence}
                      className={`h-3 ${market.aiConfidence >= 90 ? '[&>div]:bg-green-500' : '[&>div]:bg-orange-500'}`}
                    />
                    {market.aiSuggestedOutcome && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Suggested Outcome:</span>
                        <Badge className={market.aiConfidence >= 90 ? 'bg-green-600' : 'bg-orange-600'}>
                          {getOutcomeLabel(market, market.aiSuggestedOutcome)}
                        </Badge>
                      </div>
                    )}
                    {market.aiConfidence < 90 && (
                      <p className="text-sm text-orange-500 mt-2 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Confidence below 90%. Consider requesting more evidence or issuing refund.
                      </p>
                    )}
                  </div>
                )}

                {/* Resolved/Refunded Status */}
                {market.resolutionStatus === 'RESOLVED' && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium text-green-500">
                        Resolved: {getOutcomeLabel(market, market.currentResolution || '')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Winners have been automatically paid from the pool.
                    </p>
                  </div>
                )}

                {market.resolutionStatus === 'REFUNDED' && (
                  <div className="p-4 bg-gray-500/10 border border-gray-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="h-5 w-5 text-gray-500" />
                      <span className="font-medium text-gray-400">Market Refunded</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      All bets have been returned to users.
                    </p>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {/* Evidence List */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Submitted Evidence ({market.evidence.length})
                </h4>

                {market.evidence.map((evidence) => (
                  <div
                    key={evidence.id}
                    className={`border rounded-lg p-4 ${
                      evidence.status === 'verified' ? 'border-green-500/30 bg-green-500/5' :
                      evidence.status === 'rejected' ? 'border-red-500/30 bg-red-500/5' :
                      'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getEvidenceTypeIcon(evidence.type)}
                        {getEvidenceTypeBadge(evidence.type)}
                        {evidence.supportedOutcome && (
                          <Badge variant="outline">
                            Supports: {getOutcomeLabel(market, evidence.supportedOutcome)}
                          </Badge>
                        )}
                        {evidence.status === 'verified' && (
                          <Badge className="bg-green-600">Verified</Badge>
                        )}
                        {evidence.status === 'rejected' && (
                          <Badge variant="destructive">Rejected</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(evidence.submittedAt)}
                      </span>
                    </div>

                    <p className="text-sm mb-3">{evidence.content}</p>

                    {evidence.sourceUrl && (
                      <a
                        href={evidence.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-[#06f6ff] hover:underline mb-3"
                      >
                        <LinkIcon className="h-3 w-3" />
                        View Source
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          Submitted by: <span className="font-mono">{evidence.submittedBy}</span>
                        </span>
                        {evidence.type === 'community' && (
                          <div className="flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1 text-green-500">
                              <ThumbsUp className="h-3 w-3" />
                              {evidence.upvotes}
                            </span>
                            <span className="flex items-center gap-1 text-red-500">
                              <ThumbsDown className="h-3 w-3" />
                              {evidence.downvotes}
                            </span>
                          </div>
                        )}
                      </div>

                      {evidence.status === 'pending' && market.resolutionStatus !== 'RESOLVED' && market.resolutionStatus !== 'REFUNDED' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleVerifyEvidence(evidence.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectEvidence(evidence.id)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Resolution Actions */}
              {market.resolutionStatus !== 'RESOLVED' && market.resolutionStatus !== 'REFUNDED' && (
                <>
                  <Separator className="my-6" />

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Gavel className="h-4 w-4" />
                      Resolution Actions
                    </h4>

                    {market.resolutionStatus === 'EVIDENCE_COLLECTION' && (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Evidence collection in progress. Run AI analysis when ready or wait for window to close.
                        </p>
                        <Button
                          onClick={() => handleRunAIAnalysis(market.id)}
                          disabled={analyzingMarket === market.id}
                          className="bg-[#06f6ff] text-black hover:bg-[#06f6ff]/90"
                        >
                          {analyzingMarket === market.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Run AI Analysis
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {market.resolutionStatus === 'AI_ANALYSIS' && (
                      <div className="flex items-center gap-2 text-[#06f6ff]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        AI is analyzing evidence...
                      </div>
                    )}

                    {market.resolutionStatus === 'PENDING_RESOLUTION' && (
                      <div className="space-y-4">
                        {market.aiConfidence >= 90 ? (
                          <>
                            <p className="text-sm text-green-500 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              High confidence ({market.aiConfidence}%). Recommended to resolve.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {market.isMultipleChoice && market.outcomes ? (
                                market.outcomes.map((outcome) => (
                                  <Button
                                    key={outcome.id}
                                    onClick={() => handleResolveMarket(market.id, outcome.id)}
                                    style={{
                                      backgroundColor: market.aiSuggestedOutcome === outcome.id ? outcome.color : 'transparent',
                                      color: market.aiSuggestedOutcome === outcome.id ? 'black' : 'white',
                                      borderColor: outcome.color
                                    }}
                                    className="border"
                                  >
                                    Resolve: {outcome.label}
                                    {market.aiSuggestedOutcome === outcome.id && ' (Suggested)'}
                                  </Button>
                                ))
                              ) : (
                                <>
                                  <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleResolveMarket(market.id, 'TRUE')}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Resolve TRUE
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleResolveMarket(market.id, 'FALSE')}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Resolve FALSE
                                  </Button>
                                </>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-orange-500 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Low confidence ({market.aiConfidence}%). Consider refunding or requesting more evidence.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                className="text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10"
                                onClick={() => {
                                  setDisputedMarkets(prev => prev.map(m =>
                                    m.id === market.id ? { ...m, resolutionStatus: 'EVIDENCE_COLLECTION' as MarketResolutionStatus } : m
                                  ));
                                  toast.info('Requesting more evidence. Window extended.');
                                }}
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Request More Evidence
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleRefundMarket(market.id)}
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Refund All Bets
                              </Button>
                              <Separator orientation="vertical" className="h-8" />
                              <span className="text-sm text-muted-foreground self-center">Or force resolve:</span>
                              {market.isMultipleChoice && market.outcomes ? (
                                market.outcomes.slice(0, 3).map((outcome) => (
                                  <Button
                                    key={outcome.id}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleResolveMarket(market.id, outcome.id)}
                                  >
                                    {outcome.label}
                                  </Button>
                                ))
                              ) : (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleResolveMarket(market.id, 'TRUE')}
                                  >
                                    TRUE
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleResolveMarket(market.id, 'FALSE')}
                                  >
                                    FALSE
                                  </Button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {disputedMarkets.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No markets in resolution flow</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EvidenceDashboard;
