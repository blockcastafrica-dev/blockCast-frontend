import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gavel, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { marketsApi } from '@/utils/apiService';
import { toast } from 'sonner';

interface MarketResolutionDashboardProps {
  walletAddress: string;
}

const MarketResolutionDashboard: React.FC<MarketResolutionDashboardProps> = ({ walletAddress }) => {
  const [expiredMarkets, setExpiredMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpiredMarkets();
  }, []);

  const loadExpiredMarkets = async () => {
    try {
      setLoading(true);
      const markets = await marketsApi.getAll({ status: 'expired' });
      setExpiredMarkets(markets);
    } catch (error) {
      console.error('Error loading expired markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (marketId: string, outcome: 'YES' | 'NO') => {
    toast.success(`Resolving market as ${outcome}...`);
    // TODO: Implement on-chain resolution
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
          <Gavel className="h-5 w-5" />
          Markets Awaiting Resolution ({expiredMarkets.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expiredMarkets.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No markets awaiting resolution
          </p>
        ) : (
          <div className="space-y-4">
            {expiredMarkets.map((market) => (
              <div key={market.id} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">{market.claim || market.question}</h4>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="destructive">Expired</Badge>
                  <Badge variant="outline">{market.category || 'General'}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleResolve(market.id, 'YES')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Resolve YES
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleResolve(market.id, 'NO')}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Resolve NO
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

export default MarketResolutionDashboard;
