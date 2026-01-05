// Treasury Service Types

export type TransactionType = 'deposit' | 'withdrawal' | 'bet' | 'payout' | 'fee' | 'refund';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  fee: number;
  netAmount: number;
  from: string | null;        // wallet address or 'treasury' or 'market_pool:{marketId}'
  to: string | null;          // wallet address or 'treasury' or 'market_pool:{marketId}'
  userId: string | null;
  marketId: string | null;
  betId: string | null;
  status: TransactionStatus;
  txHash: string | null;      // blockchain transaction hash (for future)
  description: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface TreasuryVault {
  id: string;
  name: string;
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalFeesCollected: number;
  totalPayoutsProcessed: number;
  lastUpdated: string;
}

export interface MarketPool {
  marketId: string;
  totalPool: number;
  yesPool: number;
  noPool: number;
  feesCollected: number;
  status: 'active' | 'resolved' | 'cancelled' | 'refunded';
  winningPosition: 'yes' | 'no' | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Bet {
  id: string;
  userId: string;
  marketId: string;
  position: 'yes' | 'no';
  amount: number;
  potentialReturn: number;
  odds: number;
  status: 'active' | 'won' | 'lost' | 'refunded' | 'cancelled';
  payoutAmount: number | null;
  payoutTransactionId: string | null;
  placedAt: string;
  settledAt: string | null;
}

export interface PayoutCalculation {
  betId: string;
  userId: string;
  betAmount: number;
  winnings: number;
  platformFee: number;
  netPayout: number;
}

export interface TreasuryStats {
  totalBalance: number;
  totalFeesCollected: number;
  pendingPayouts: number;
  pendingPayoutsCount: number;
  totalVolume: number;
  totalTransactions: number;
  activeMarketPools: number;
  totalMarketPoolValue: number;
  feeRate: number;
  last24hVolume: number;
  last24hFees: number;
}

export interface FeeConfig {
  platformFeeRate: number;       // e.g., 0.025 for 2.5%
  depositFeeRate: number;        // e.g., 0.005 for 0.5%
  withdrawalFeeRate: number;     // e.g., 0.005 for 0.5%
  minWithdrawal: number;
  maxWithdrawal: number;
  minBet: number;
  maxBet: number;
}

// Multi-sig Types
export type WithdrawalRequestStatus = 'pending_approval' | 'approved' | 'rejected' | 'executed' | 'expired' | 'cancelled';

export interface MultiSigConfig {
  enabled: boolean;
  threshold: number;              // Number of approvals required (e.g., 2)
  totalSigners: number;           // Total number of signers (e.g., 3)
  signers: Signer[];              // List of authorized signers
  expirationHours: number;        // Hours before a pending request expires
}

export interface Signer {
  id: string;
  name: string;
  email: string;
  walletAddress?: string;
  role: 'owner' | 'admin' | 'signer';
  addedAt: string;
  addedBy: string;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  destinationAddress: string;
  reason: string;
  requestedBy: string;            // Signer ID who initiated
  requestedAt: string;
  status: WithdrawalRequestStatus;
  approvals: Approval[];
  rejections: Rejection[];
  expiresAt: string;
  executedAt: string | null;
  transactionId: string | null;   // Links to Transaction when executed
  txHash: string | null;          // Blockchain hash when executed
}

export interface Approval {
  signerId: string;
  signerName: string;
  approvedAt: string;
  signature?: string;             // For future blockchain integration
}

export interface Rejection {
  signerId: string;
  signerName: string;
  rejectedAt: string;
  reason: string;
}
