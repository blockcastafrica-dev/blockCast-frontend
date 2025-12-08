import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Clock, CheckCircle, XCircle, Users, Zap, Trophy, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Import local database functions
import { getAllMarkets } from '@/utils/browserDB';

// Define the BettingMarket interface locally
interface BettingMarket {
  id: string;
  claim: string;
  category: string;
  subcategory?: string;
  source: string;
  description: string;
  totalPool: number;
  yesPool: number;
  noPool: number;
  yesOdds: number;
  noOdds: number;
  totalCasters: number;
  expiresAt: Date;
  status: 'active' | 'resolving' | 'resolved';
  trending: boolean;
  imageUrl?: string;
  country?: string;
  region?: string;
  marketType: 'present' | 'future';
  confidenceLevel: 'high' | 'medium' | 'low';
}

export default function TruthMarketsPage() {
  const navigate = useNavigate();
  const [userBalance] = useState(1.0);
  const [markets, setMarkets] = useState<BettingMarket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch markets from local database
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setIsLoading(true);
        const dbMarkets = getAllMarkets();
        // Convert database markets to BettingMarket format
        const formattedMarkets = dbMarkets.map((market: any) => ({
          id: market.id,
          claim: market.claim,
          category: market.category,
          subcategory: market.subcategory,
          source: market.source,
          description: market.description,
          totalPool: market.total_pool,
          yesPool: market.yes_pool,
          noPool: market.no_pool,
          yesOdds: market.yes_odds,
          noOdds: market.no_odds,
          totalCasters: market.total_casters,
          expiresAt: new Date(market.expires_at),
          status: market.status,
          trending: market.trending === 1,
          country: market.country,
          region: market.region,
          marketType: market.market_type,
          confidenceLevel: market.confidence_level,
          imageUrl: market.image_url
        }));
        setMarkets(formattedMarkets);
      } catch (error) {
        console.error('Error fetching markets:', error);
        toast.error('Failed to load markets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  const handlePlaceBet = async (marketId: string, position: 'yes' | 'no', amount: number) => {
    if (amount > userBalance) {
      toast.error('Insufficient balance');
      return;
    }

    // Simulate betting delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(`Truth position cast successfully on ${position.toUpperCase()}!`);
  };

  const filteredMarkets = markets.filter(market => {
    const matchesSearch = market.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         market.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || market.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatOdds = (odds: number): string => {
    return odds.toFixed(2);
  };

  const formatTimeLeft = (endDate: Date | undefined): string => {
    if (!endDate) {
      return 'N/A';
    }
    
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Expired';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Ending soon';
  };

  // Calculate probability based on pool sizes
  const calculateProbability = (pool: number, totalPool: number): number => {
    if (totalPool === 0) return 0;
    return (pool / totalPool) * 100;
  };

  // Format currency values
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h3>Loading Truth Markets...</h3>
          <p className="text-muted-foreground">
            Connecting to African truth verification network
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text mb-1 flex items-center gap-2">
            <TrendingUp className="h-7 w-7" />
            Truth Markets
          </h1>
          <p className="text-sm text-muted-foreground">
            Bet on the truth of real-world claims • Earn rewards for accuracy • Build credibility
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass-card px-4 py-2 rounded-lg neon-glow">
            <div className="text-sm text-muted-foreground">Your Balance</div>
            <div className="text-xl font-bold text-primary">{userBalance.toFixed(3)} ETH</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search claims, categories, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full lg:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Politics">Politics</SelectItem>
            <SelectItem value="Economy">Economy</SelectItem>
            <SelectItem value="Technology">Technology</SelectItem>
            <SelectItem value="Environment">Environment</SelectItem>
            <SelectItem value="Health">Health</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="Sports">Sports</SelectItem>
            <SelectItem value="Entertainment">Entertainment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-lg pulse-glow">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">Active Markets</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{markets.length}</p>
          <p className="text-sm text-muted-foreground">Open for betting</p>
        </div>

        <div className="glass-card p-4 rounded-lg pulse-glow">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-secondary" />
            <span className="font-semibold text-secondary">Total Volume</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(filteredMarkets.reduce((sum, market) => sum + market.totalPool, 0))}
          </p>
          <p className="text-sm text-muted-foreground">ETH locked</p>
        </div>

        <div className="glass-card p-4 rounded-lg pulse-glow">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-green-500" />
            <span className="font-semibold text-green-500">Participants</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(filteredMarkets.reduce((sum, market) => sum + market.totalCasters, 0))}
          </p>
          <p className="text-sm text-muted-foreground">Active verifiers</p>
        </div>

        <div className="glass-card p-4 rounded-lg pulse-glow">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold text-yellow-500">Avg Accuracy</span>
          </div>
          <p className="text-2xl font-bold text-foreground">92.4%</p>
          <p className="text-sm text-muted-foreground">Community consensus</p>
        </div>
      </div>

      {/* Markets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMarkets.map((market) => (
          <Card
            key={market.id}
            className="glass-card overflow-hidden cursor-pointer hover:shadow-lg transition-all shimmer"
            onClick={() => navigate(`/market/${market.id}`)}
          >
            {market.imageUrl && (
              <div className="relative h-48">
                <img 
                  src={market.imageUrl} 
                  alt={market.claim}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                
                {/* Trending badge */}
                {market.trending && (
                  <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                    TRENDING
                  </Badge>
                )}
                
                {/* Confidence badge */}
                <Badge 
                  className={`absolute top-3 right-3 text-xs ${
                    market.confidenceLevel === 'high' ? 'bg-green-500' :
                    market.confidenceLevel === 'medium' ? 'bg-yellow-500' :
                    'bg-red-500'
                  } text-white`}
                >
                  {market.confidenceLevel.toUpperCase()}
                </Badge>
              </div>
            )}
            
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{market.category}</Badge>
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      {formatTimeLeft(market.expiresAt)} left
                    </Badge>
                    {market.trending && (
                      <Badge className="bg-red-500/20 text-red-500 border-red-500/30 lg:hidden">
                        TRENDING
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg leading-tight">{market.claim}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {formatCurrency(market.totalCasters)} participants
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {formatCurrency(market.totalPool)} ETH volume
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Ends {market.expiresAt?.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Betting Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* YES Option */}
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-semibold text-green-500">YES</span>
                    </div>
                    <span className="text-lg font-bold text-green-500">{formatOdds(market.yesOdds)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Probability</span>
                      <span className="font-medium">{calculateProbability(market.yesPool, market.totalPool).toFixed(1)}%</span>
                    </div>
                    <Progress value={calculateProbability(market.yesPool, market.totalPool)} className="h-2 [&>div]:bg-green-500" />
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaceBet(market.id, 'yes', 0.01);
                        }}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white neon-glow"
                        size="sm"
                      >
                        Bet 0.01 ETH
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaceBet(market.id, 'yes', 0.05);
                        }}
                        className="flex-1 bg-green-500/80 hover:bg-green-600 text-white neon-glow"
                        size="sm"
                      >
                        Bet 0.05 ETH
                      </Button>
                    </div>
                  </div>
                </div>

                {/* NO Option */}
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="font-semibold text-red-500">NO</span>
                    </div>
                    <span className="text-lg font-bold text-red-500">{formatOdds(market.noOdds)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Probability</span>
                      <span className="font-medium">{calculateProbability(market.noPool, market.totalPool).toFixed(1)}%</span>
                    </div>
                    <Progress value={calculateProbability(market.noPool, market.totalPool)} className="h-2 [&>div]:bg-red-500" />
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaceBet(market.id, 'no', 0.01);
                        }}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white neon-glow"
                        size="sm"
                      >
                        Bet 0.01 ETH
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaceBet(market.id, 'no', 0.05);
                        }}
                        className="flex-1 bg-red-500/80 hover:bg-red-600 text-white neon-glow"
                        size="sm"
                      >
                        Bet 0.05 ETH
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-foreground">{formatCurrency(market.yesPool)}</div>
                  <div className="text-xs text-muted-foreground">YES Pool</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">{formatCurrency(market.noPool)}</div>
                  <div className="text-xs text-muted-foreground">NO Pool</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">{formatCurrency(market.totalCasters)}</div>
                  <div className="text-xs text-muted-foreground">Verifiers</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}