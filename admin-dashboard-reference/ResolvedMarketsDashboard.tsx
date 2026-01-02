import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { marketsApi } from '@/utils/apiService';

interface ResolvedMarketsDashboardProps {
  walletAddress: string;
}

const ResolvedMarketsDashboard: React.FC<ResolvedMarketsDashboardProps> = ({ walletAddress }) => {
  const [resolvedMarkets, setResolvedMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResolvedMarkets();
  }, []);

  const loadResolvedMarkets = async () => {
    try {
      setLoading(true);
      const markets = await marketsApi.getAll({ status: 'resolved' });
      setResolvedMarkets(markets);
    } catch (error) {
      console.error('Error loading resolved markets:', error);
    } finally {
      setLoading(false);
    }
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
          <CheckCircle className="h-5 w-5" />
          Resolved Markets ({resolvedMarkets.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {resolvedMarkets.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No resolved markets yet
          </p>
        ) : (
          <div className="space-y-4">
            {resolvedMarkets.map((market) => (
              <div key={market.id} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">{market.claim || market.question}</h4>
                <div className="flex items-center gap-2">
                  <Badge
                    className={market.resolution === 'YES'
                      ? 'bg-green-600'
                      : market.resolution === 'NO'
                        ? 'bg-red-600'
                        : 'bg-gray-600'
                    }
                  >
                    {market.resolution || 'RESOLVED'}
                  </Badge>
                  <Badge variant="outline">{market.category || 'General'}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResolvedMarketsDashboard;
