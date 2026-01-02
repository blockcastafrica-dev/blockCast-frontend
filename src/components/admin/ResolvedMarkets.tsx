import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle,
  AlertTriangle,
  Flag,
  Clock,
  Users,
  DollarSign,
  FileText,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ResolvedMarket {
  id: string;
  claim: string;
  category: string;
  resolution: 'YES' | 'NO';
  resolvedAt: Date;
  resolvedBy: string;
  totalVolume: number;
  participants: number;
  disputeStatus: 'none' | 'pending' | 'resolved';
  disputeCount: number;
}

const ResolvedMarkets: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [disputeMarket, setDisputeMarket] = useState<ResolvedMarket | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  // Mock data
  const resolvedMarkets: ResolvedMarket[] = [
    {
      id: '1',
      claim: 'Will the Fed cut interest rates in December 2024?',
      category: 'Finance',
      resolution: 'YES',
      resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      resolvedBy: '0x7f3a...d4e5',
      totalVolume: 25000,
      participants: 156,
      disputeStatus: 'none',
      disputeCount: 0
    },
    {
      id: '2',
      claim: 'Will Bitcoin reach $100K in 2024?',
      category: 'Crypto',
      resolution: 'YES',
      resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      resolvedBy: '0x8a4b...e7f8',
      totalVolume: 45000,
      participants: 312,
      disputeStatus: 'pending',
      disputeCount: 3
    },
    {
      id: '3',
      claim: 'Will SpaceX launch Starship successfully?',
      category: 'Science',
      resolution: 'NO',
      resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      resolvedBy: '0x9c5d...a8b9',
      totalVolume: 12000,
      participants: 89,
      disputeStatus: 'resolved',
      disputeCount: 1
    },
    {
      id: '4',
      claim: 'Will Apple release Vision Pro 2 in 2024?',
      category: 'Technology',
      resolution: 'NO',
      resolvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      resolvedBy: '0x7f3a...d4e5',
      totalVolume: 8500,
      participants: 67,
      disputeStatus: 'none',
      disputeCount: 0
    }
  ];

  const filteredMarkets = resolvedMarkets.filter(market =>
    market.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
    market.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDisputeStatusBadge = (status: string, count: number) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500 text-black">{count} Dispute(s) Pending</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="text-green-500 border-green-500/30">Dispute Resolved</Badge>;
      default:
        return null;
    }
  };

  const handleInitiateDispute = () => {
    if (!disputeReason.trim()) {
      toast.error('Please provide a reason for the dispute');
      return;
    }
    toast.success('Dispute filed successfully');
    setDisputeMarket(null);
    setDisputeReason('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Resolved Markets
              </CardTitle>
              <CardDescription>View resolution history and manage disputes</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredMarkets.map((market) => (
              <div
                key={market.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm flex-1">{market.claim}</p>
                  <Badge
                    className={market.resolution === 'YES' ? 'bg-green-600' : 'bg-red-600'}
                  >
                    {market.resolution}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{market.category}</Badge>
                  {getDisputeStatusBadge(market.disputeStatus, market.disputeCount)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Volume</p>
                    <p className="font-semibold">${market.totalVolume.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Participants</p>
                    <p className="font-semibold">{market.participants}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Resolved: {formatDate(market.resolvedAt)}</span>
                  <span>by {market.resolvedBy}</span>
                </div>

                {market.disputeStatus !== 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setDisputeMarket(market)}
                  >
                    <Flag className="h-3 w-3 mr-1" />
                    File Dispute
                  </Button>
                )}

                {market.disputeStatus === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-yellow-500 border-yellow-500/30"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Review Disputes
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Market</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Resolution</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Resolved</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMarkets.map((market) => (
                  <TableRow key={market.id}>
                    <TableCell>
                      <p className="font-medium text-sm max-w-xs truncate">{market.claim}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{market.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={market.resolution === 'YES' ? 'bg-green-600' : 'bg-red-600'}
                      >
                        {market.resolution}
                      </Badge>
                    </TableCell>
                    <TableCell>${market.totalVolume.toLocaleString()}</TableCell>
                    <TableCell>{market.participants}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{formatDate(market.resolvedAt)}</p>
                        <p className="text-xs text-muted-foreground">by {market.resolvedBy}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getDisputeStatusBadge(market.disputeStatus, market.disputeCount) || (
                        <span className="text-muted-foreground text-sm">No disputes</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {market.disputeStatus === 'pending' ? (
                        <Button size="sm" variant="outline" className="text-yellow-500 border-yellow-500/30">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => setDisputeMarket(market)}>
                          <Flag className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredMarkets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No resolved markets found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dispute Dialog */}
      <Dialog open={!!disputeMarket} onOpenChange={() => { setDisputeMarket(null); setDisputeReason(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-yellow-500" />
              File Dispute
            </DialogTitle>
            <DialogDescription>
              Submit a dispute for review. The market resolution will be re-examined based on submitted evidence.
            </DialogDescription>
          </DialogHeader>
          {disputeMarket && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">{disputeMarket.claim}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">Current Resolution:</span>
                  <Badge className={disputeMarket.resolution === 'YES' ? 'bg-green-600' : 'bg-red-600'}>
                    {disputeMarket.resolution}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Reason for Dispute</label>
                <Textarea
                  placeholder="Provide detailed reasoning and evidence for why this resolution should be reconsidered..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-500">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Filing a dispute will pause all payouts for this market until the review is complete.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDisputeMarket(null); setDisputeReason(''); }}>
              Cancel
            </Button>
            <Button className="bg-yellow-500 text-black hover:bg-yellow-600" onClick={handleInitiateDispute}>
              <Flag className="h-4 w-4 mr-1" />
              Submit Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResolvedMarkets;
