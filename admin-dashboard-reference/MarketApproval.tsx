import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { marketsApi } from '@/utils/apiService';
import { toast } from 'sonner';

interface MarketApprovalProps {
  userProfile?: {
    walletAddress: string;
    displayName?: string;
  };
}

const MarketApproval: React.FC<MarketApprovalProps> = ({ userProfile }) => {
  const [pendingMarkets, setPendingMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingMarkets();
  }, []);

  const loadPendingMarkets = async () => {
    try {
      setLoading(true);
      const markets = await marketsApi.getPending();
      setPendingMarkets(markets);
    } catch (error) {
      console.error('Error loading pending markets:', error);
      toast.error('Failed to load pending markets');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (marketId: string) => {
    toast.success('Market approval initiated (blockchain transaction required)');
    // TODO: Implement on-chain approval
  };

  const handleReject = async (marketId: string) => {
    toast.success('Market rejected');
    setPendingMarkets(prev => prev.filter(m => m.id !== marketId));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Market Approvals ({pendingMarkets.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingMarkets.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No markets pending approval
          </p>
        ) : (
          <div className="space-y-4">
            {pendingMarkets.map((market) => (
              <div key={market.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold">{market.claim || market.question}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{market.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">{market.category || 'General'}</Badge>
                  {market.country && <Badge variant="secondary">{market.country}</Badge>}
                  <Badge variant="outline">{market.market_type || 'future'}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(market.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve & Deploy
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(market.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketApproval;
