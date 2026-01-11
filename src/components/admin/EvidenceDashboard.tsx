import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  Link as LinkIcon,
  Upload,
  Sparkles,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

interface Evidence {
  id: string;
  marketId: string;
  marketClaim: string;
  type: 'community' | 'admin' | 'ai';
  submittedBy: string;
  submittedAt: Date;
  content: string;
  sourceUrl?: string;
  upvotes: number;
  downvotes: number;
  status: 'pending' | 'verified' | 'rejected';
}

interface DisputedMarket {
  id: string;
  claim: string;
  currentResolution: 'TRUE' | 'FALSE';
  disputeCount: number;
  totalVolume: number;
  evidence: Evidence[];
}

const EvidenceDashboard: React.FC = () => {
  const [fetchingAI, setFetchingAI] = useState<string | null>(null);
  const [aiQuery, setAiQuery] = useState('');

  // Mock data
  const disputedMarkets: DisputedMarket[] = [
    {
      id: '1',
      claim: 'Will Bitcoin reach $100K in 2024?',
      currentResolution: 'TRUE',
      disputeCount: 3,
      totalVolume: 45000,
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
          upvotes: 67,
          downvotes: 8,
          status: 'pending'
        },
        {
          id: 'e3',
          marketId: '1',
          marketClaim: 'Will Bitcoin reach $100K in 2024?',
          type: 'ai',
          submittedBy: 'Gemini AI',
          submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          content: 'Based on data from CoinGecko, Binance, and Coinbase, Bitcoin reached an all-time high of $100,050.42 on December 17, 2024 at 14:23 UTC. This is verified across multiple independent sources.',
          sourceUrl: 'https://www.coingecko.com/en/coins/bitcoin',
          upvotes: 0,
          downvotes: 0,
          status: 'verified'
        }
      ]
    },
    {
      id: '2',
      claim: 'Will the US pass a crypto regulation bill in 2024?',
      currentResolution: 'FALSE',
      disputeCount: 1,
      totalVolume: 12000,
      evidence: [
        {
          id: 'e4',
          marketId: '2',
          marketClaim: 'Will the US pass a crypto regulation bill in 2024?',
          type: 'community',
          submittedBy: '0x9c5d...a8b9',
          submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
          content: 'The FIT21 bill passed the House but did not pass the Senate in 2024.',
          sourceUrl: 'https://www.congress.gov/bill/118th-congress/house-bill/4763',
          upvotes: 23,
          downvotes: 2,
          status: 'verified'
        }
      ]
    }
  ];

  const handleFetchAI = async (marketId: string, claim: string) => {
    setFetchingAI(marketId);
    // Simulate AI fetching
    await new Promise(resolve => setTimeout(resolve, 3000));
    toast.success('AI evidence generated successfully');
    setFetchingAI(null);
  };

  const handleVerifyEvidence = (evidenceId: string) => {
    toast.success('Evidence marked as verified');
  };

  const handleRejectEvidence = (evidenceId: string) => {
    toast.success('Evidence rejected');
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

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
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

      {/* Disputed Markets with Evidence */}
      <div className="space-y-6">
        {disputedMarkets.map((market) => (
          <Card key={market.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg">{market.claim}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="destructive">
                      {market.disputeCount} Dispute(s)
                    </Badge>
                    <Badge className={market.currentResolution === 'TRUE' ? 'bg-green-600' : 'bg-red-600'}>
                      Current: {market.currentResolution}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ${market.totalVolume.toLocaleString()} volume
                    </span>
                  </div>
                </div>
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
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                      <div className="flex items-center gap-2">
                        {getEvidenceTypeIcon(evidence.type)}
                        {getEvidenceTypeBadge(evidence.type)}
                        {evidence.status === 'verified' && (
                          <Badge className="bg-green-600">Verified</Badge>
                        )}
                        {evidence.status === 'rejected' && (
                          <Badge variant="destructive">Rejected</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
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

                      {evidence.status === 'pending' && (
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
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Resolution Decision
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline">
                    Uphold Current Resolution
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Change to TRUE
                  </Button>
                  <Button variant="destructive">
                    Change to FALSE
                  </Button>
                  <Button variant="outline" className="text-yellow-500 border-yellow-500/30">
                    Request More Evidence
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {disputedMarkets.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No disputed markets requiring evidence review</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EvidenceDashboard;
