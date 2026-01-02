import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  Calendar,
  Users,
  DollarSign,
  RefreshCw,
  Gavel
} from 'lucide-react';
import { toast } from 'sonner';

interface PendingMarket {
  id: string;
  claim: string;
  description: string;
  category: string;
  creator: string;
  createdAt: Date;
  expiresAt: Date;
  initialPool: number;
  marketType: 'binary' | 'multiple_choice';
}

interface ExpiredMarket {
  id: string;
  claim: string;
  category: string;
  totalVolume: number;
  participants: number;
  expiredAt: Date;
  yesPool: number;
  noPool: number;
}

const MarketApproval: React.FC = () => {
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [viewMarket, setViewMarket] = useState<PendingMarket | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject'; markets: string[] } | null>(null);
  const [resolveMarket, setResolveMarket] = useState<ExpiredMarket | null>(null);
  const [highVolumeVerification, setHighVolumeVerification] = useState(false);

  // Mock data
  const pendingMarkets: PendingMarket[] = [
    {
      id: '1',
      claim: 'Will AI surpass human intelligence by 2030?',
      description: 'Market resolves YES if a generally recognized AI system demonstrates superhuman performance across all cognitive tasks.',
      category: 'Technology',
      creator: '0x7f3a9b2c...d4e5',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      expiresAt: new Date('2030-01-01'),
      initialPool: 1000,
      marketType: 'binary'
    },
    {
      id: '2',
      claim: 'Will Tesla stock reach $500 by Q2 2025?',
      description: 'Resolves YES if TSLA stock price reaches $500 at any point before June 30, 2025.',
      category: 'Finance',
      creator: '0x8a4b6c3d...e7f8',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      expiresAt: new Date('2025-06-30'),
      initialPool: 500,
      marketType: 'binary'
    },
    {
      id: '3',
      claim: 'Will SpaceX launch Starship to Mars in 2025?',
      description: 'Resolves YES if SpaceX successfully launches a Starship vehicle on a trajectory to Mars.',
      category: 'Science',
      creator: '0x9c5d7e4f...a8b9',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      expiresAt: new Date('2025-12-31'),
      initialPool: 2000,
      marketType: 'binary'
    }
  ];

  const expiredMarkets: ExpiredMarket[] = [
    {
      id: 'e1',
      claim: 'Will Bitcoin reach $100K in December 2024?',
      category: 'Crypto',
      totalVolume: 15000,
      participants: 234,
      expiredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      yesPool: 9000,
      noPool: 6000
    },
    {
      id: 'e2',
      claim: 'Will the Fed cut rates in December 2024?',
      category: 'Finance',
      totalVolume: 800,
      participants: 45,
      expiredAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      yesPool: 500,
      noPool: 300
    }
  ];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMarkets(pendingMarkets.map(m => m.id));
    } else {
      setSelectedMarkets([]);
    }
  };

  const handleSelectMarket = (marketId: string, checked: boolean) => {
    if (checked) {
      setSelectedMarkets(prev => [...prev, marketId]);
    } else {
      setSelectedMarkets(prev => prev.filter(id => id !== marketId));
    }
  };

  const handleBatchAction = (action: 'approve' | 'reject') => {
    if (selectedMarkets.length === 0) {
      toast.error('No markets selected');
      return;
    }
    setConfirmAction({ type: action, markets: selectedMarkets });
  };

  const executeAction = () => {
    if (!confirmAction) return;

    toast.success(`${confirmAction.type === 'approve' ? 'Approved' : 'Rejected'} ${confirmAction.markets.length} market(s)`);
    setSelectedMarkets([]);
    setConfirmAction(null);
  };

  const handleResolve = (market: ExpiredMarket) => {
    if (market.totalVolume > 1000) {
      setHighVolumeVerification(true);
    }
    setResolveMarket(market);
  };

  const executeResolution = (outcome: 'YES' | 'NO') => {
    if (!resolveMarket) return;
    toast.success(`Market resolved as ${outcome}`);
    setResolveMarket(null);
    setHighVolumeVerification(false);
  };

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Pending Markets Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#06f6ff]" />
                Pending Market Approvals
              </CardTitle>
              <CardDescription>Review and approve new market submissions</CardDescription>
            </div>
            {selectedMarkets.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedMarkets.length} selected</Badge>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleBatchAction('approve')}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve All
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBatchAction('reject')}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject All
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {pendingMarkets.map((market) => (
              <div
                key={market.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedMarkets.includes(market.id)}
                    onCheckedChange={(checked) => handleSelectMarket(market.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{market.claim}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{market.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{market.category}</Badge>
                  <Badge variant="secondary">{market.marketType}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created {formatTimeAgo(market.createdAt)}</span>
                  <span>Pool: ${market.initialPool}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setViewMarket(market)}>
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1">
                    <XCircle className="h-3 w-3 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedMarkets.length === pendingMarkets.length && pendingMarkets.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Market</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Initial Pool</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingMarkets.map((market) => (
                  <TableRow key={market.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedMarkets.includes(market.id)}
                        onCheckedChange={(checked) => handleSelectMarket(market.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="font-medium text-sm truncate">{market.claim}</p>
                        <p className="text-xs text-muted-foreground truncate">{market.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{market.category}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{market.creator}</TableCell>
                    <TableCell>${market.initialPool}</TableCell>
                    <TableCell>{formatTimeAgo(market.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setViewMarket(market)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Markets Awaiting Resolution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-orange-500" />
            Markets Awaiting Resolution
          </CardTitle>
          <CardDescription>Expired markets requiring outcome determination</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expiredMarkets.map((market) => (
              <div
                key={market.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{market.claim}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="destructive">Expired</Badge>
                      <Badge variant="outline">{market.category}</Badge>
                      {market.totalVolume > 1000 && (
                        <Badge className="bg-purple-600">High Volume</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Volume</p>
                    <p className="font-semibold">${market.totalVolume.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Participants</p>
                    <p className="font-semibold">{market.participants}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">YES Pool</p>
                    <p className="font-semibold text-green-500">${market.yesPool.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">NO Pool</p>
                    <p className="font-semibold text-red-500">${market.noPool.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Expired {formatTimeAgo(market.expiredAt)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleResolve(market)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolve YES
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleResolve(market)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Resolve NO
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Market Dialog */}
      <Dialog open={!!viewMarket} onOpenChange={() => setViewMarket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Market Details</DialogTitle>
          </DialogHeader>
          {viewMarket && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Claim</label>
                <p className="mt-1 font-medium">{viewMarket.claim}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1 text-sm">{viewMarket.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="mt-1">{viewMarket.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Market Type</label>
                  <p className="mt-1">{viewMarket.marketType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Creator</label>
                  <p className="mt-1 font-mono text-sm">{viewMarket.creator}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Initial Pool</label>
                  <p className="mt-1">${viewMarket.initialPool}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expires</label>
                  <p className="mt-1">{viewMarket.expiresAt.toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewMarket(null)}>Close</Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button variant="destructive">
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Action Confirmation */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === 'approve' ? 'Approve' : 'Reject'} {confirmAction?.markets.length} Markets?
            </DialogTitle>
            <DialogDescription>
              This action will {confirmAction?.type === 'approve' ? 'approve and deploy' : 'reject'} the selected markets.
              {confirmAction?.type === 'approve' && ' They will be available for trading immediately.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button
              className={confirmAction?.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={confirmAction?.type === 'reject' ? 'destructive' : 'default'}
              onClick={executeAction}
            >
              Confirm {confirmAction?.type === 'approve' ? 'Approval' : 'Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* High Volume Resolution Dialog */}
      <Dialog open={!!resolveMarket} onOpenChange={() => { setResolveMarket(null); setHighVolumeVerification(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {highVolumeVerification && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
              Resolve Market
            </DialogTitle>
            {highVolumeVerification && (
              <DialogDescription className="text-yellow-500">
                This is a high-volume market (&gt;$1,000). Additional verification required.
              </DialogDescription>
            )}
          </DialogHeader>
          {resolveMarket && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Market</label>
                <p className="mt-1 font-medium">{resolveMarket.claim}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">YES Pool</p>
                  <p className="text-xl font-bold text-green-500">${resolveMarket.yesPool.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">NO Pool</p>
                  <p className="text-xl font-bold text-red-500">${resolveMarket.noPool.toLocaleString()}</p>
                </div>
              </div>
              {highVolumeVerification && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm font-medium text-yellow-500 mb-2">Verification Required</p>
                  <p className="text-sm text-muted-foreground">
                    Please confirm you have reviewed all relevant evidence before resolving this high-volume market.
                    This action will distribute ${resolveMarket.totalVolume.toLocaleString()} to participants.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => { setResolveMarket(null); setHighVolumeVerification(false); }}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => executeResolution('YES')}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Resolve YES
            </Button>
            <Button variant="destructive" onClick={() => executeResolution('NO')}>
              <XCircle className="h-4 w-4 mr-1" />
              Resolve NO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketApproval;
