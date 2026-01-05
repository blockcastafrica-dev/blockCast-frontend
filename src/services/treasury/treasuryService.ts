// Treasury Service - Manages the platform treasury vault
import { v4 as uuidv4 } from 'uuid';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
  TreasuryVault,
  TreasuryStats,
  FeeConfig
} from './types';

const STORAGE_KEY = 'blockcast_treasury';
const TRANSACTIONS_KEY = 'blockcast_treasury_transactions';
const CONFIG_KEY = 'blockcast_fee_config';

// Default fee configuration
const DEFAULT_FEE_CONFIG: FeeConfig = {
  platformFeeRate: 0.025,      // 2.5%
  depositFeeRate: 0.005,       // 0.5%
  withdrawalFeeRate: 0.005,    // 0.5%
  minWithdrawal: 10,
  maxWithdrawal: 50000,
  minBet: 1,
  maxBet: 10000,
};

// Initialize treasury vault
const initializeTreasury = (): TreasuryVault => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  const treasury: TreasuryVault = {
    id: 'main-treasury',
    name: 'Platform Treasury',
    balance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalFeesCollected: 0,
    totalPayoutsProcessed: 0,
    lastUpdated: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(treasury));
  return treasury;
};

// Get current treasury state
export const getTreasury = (): TreasuryVault => {
  return initializeTreasury();
};

// Update treasury balance
const updateTreasury = (updates: Partial<TreasuryVault>): TreasuryVault => {
  const current = getTreasury();
  const updated: TreasuryVault = {
    ...current,
    ...updates,
    lastUpdated: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

// Get fee configuration
export const getFeeConfig = (): FeeConfig => {
  const stored = localStorage.getItem(CONFIG_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_FEE_CONFIG));
  return DEFAULT_FEE_CONFIG;
};

// Update fee configuration
export const updateFeeConfig = (updates: Partial<FeeConfig>): FeeConfig => {
  const current = getFeeConfig();
  const updated = { ...current, ...updates };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
  return updated;
};

// Get all transactions
export const getTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(TRANSACTIONS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

// Save transactions
const saveTransactions = (transactions: Transaction[]) => {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

// Create a new transaction
export const createTransaction = (
  type: TransactionType,
  amount: number,
  options: {
    from?: string | null;
    to?: string | null;
    userId?: string | null;
    marketId?: string | null;
    betId?: string | null;
    description?: string;
    metadata?: Record<string, any>;
    fee?: number;
    status?: TransactionStatus;
  } = {}
): Transaction => {
  const feeConfig = getFeeConfig();

  // Calculate fee based on transaction type
  let fee = options.fee ?? 0;
  if (fee === 0) {
    switch (type) {
      case 'deposit':
        fee = amount * feeConfig.depositFeeRate;
        break;
      case 'withdrawal':
        fee = amount * feeConfig.withdrawalFeeRate;
        break;
      case 'bet':
        fee = amount * feeConfig.platformFeeRate;
        break;
      case 'payout':
        fee = 0; // Fee already collected on bet
        break;
    }
  }

  const transaction: Transaction = {
    id: uuidv4(),
    type,
    amount,
    fee,
    netAmount: amount - fee,
    from: options.from ?? null,
    to: options.to ?? null,
    userId: options.userId ?? null,
    marketId: options.marketId ?? null,
    betId: options.betId ?? null,
    status: options.status ?? 'pending',
    txHash: null,
    description: options.description ?? `${type} transaction`,
    metadata: options.metadata ?? {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  };

  const transactions = getTransactions();
  transactions.unshift(transaction);
  saveTransactions(transactions);

  return transaction;
};

// Update transaction status
export const updateTransaction = (
  transactionId: string,
  updates: Partial<Transaction>
): Transaction | null => {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === transactionId);

  if (index === -1) return null;

  transactions[index] = {
    ...transactions[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (updates.status === 'completed') {
    transactions[index].completedAt = new Date().toISOString();
  }

  saveTransactions(transactions);
  return transactions[index];
};

// Complete a transaction and update treasury
export const completeTransaction = (transactionId: string): Transaction | null => {
  const transactions = getTransactions();
  const transaction = transactions.find(t => t.id === transactionId);

  if (!transaction || transaction.status !== 'pending') return null;

  const treasury = getTreasury();

  // Update treasury based on transaction type
  switch (transaction.type) {
    case 'fee':
      updateTreasury({
        balance: treasury.balance + transaction.amount,
        totalFeesCollected: treasury.totalFeesCollected + transaction.amount,
      });
      break;
    case 'withdrawal':
      if (treasury.balance < transaction.amount) {
        return updateTransaction(transactionId, { status: 'failed' });
      }
      updateTreasury({
        balance: treasury.balance - transaction.amount,
        totalWithdrawals: treasury.totalWithdrawals + transaction.amount,
      });
      break;
    case 'deposit':
      updateTreasury({
        balance: treasury.balance + transaction.netAmount,
        totalDeposits: treasury.totalDeposits + transaction.amount,
        totalFeesCollected: treasury.totalFeesCollected + transaction.fee,
      });
      break;
    case 'payout':
      updateTreasury({
        totalPayoutsProcessed: treasury.totalPayoutsProcessed + transaction.amount,
      });
      break;
  }

  return updateTransaction(transactionId, { status: 'completed' });
};

// Collect platform fee (called when market resolves and winners are paid)
export const collectFee = (
  feeAmount: number,
  marketId: string,
  betId: string,
  userId: string
): Transaction => {
  const transaction = createTransaction('fee', feeAmount, {
    from: `market_pool:${marketId}`,
    to: 'treasury',
    marketId,
    betId,
    userId,
    description: `Platform fee from winning payout (bet ${betId})`,
    fee: 0, // Fee transaction has no additional fee
    status: 'completed',
  });

  // Immediately credit to treasury
  const treasury = getTreasury();
  updateTreasury({
    balance: treasury.balance + feeAmount,
    totalFeesCollected: treasury.totalFeesCollected + feeAmount,
  });

  return transaction;
};

// Process withdrawal from treasury
export const processWithdrawal = (
  amount: number,
  toAddress: string,
  adminId: string
): Transaction | { error: string } => {
  const treasury = getTreasury();
  const feeConfig = getFeeConfig();

  if (amount < feeConfig.minWithdrawal) {
    return { error: `Minimum withdrawal is $${feeConfig.minWithdrawal}` };
  }

  if (amount > feeConfig.maxWithdrawal) {
    return { error: `Maximum withdrawal is $${feeConfig.maxWithdrawal}` };
  }

  if (amount > treasury.balance) {
    return { error: 'Insufficient treasury balance' };
  }

  const transaction = createTransaction('withdrawal', amount, {
    from: 'treasury',
    to: toAddress,
    userId: adminId,
    description: `Admin withdrawal to ${toAddress}`,
    status: 'pending',
    metadata: { adminId, requiresMultiSig: true },
  });

  return transaction;
};

// Get treasury statistics
export const getTreasuryStats = (): TreasuryStats => {
  const treasury = getTreasury();
  const transactions = getTransactions();
  const feeConfig = getFeeConfig();
  const marketPools = JSON.parse(localStorage.getItem('blockcast_market_pools') || '[]');

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const pendingPayouts = transactions.filter(
    t => t.type === 'payout' && t.status === 'pending'
  );

  const last24hTransactions = transactions.filter(
    t => new Date(t.createdAt) > last24h
  );

  const activeMarketPools = marketPools.filter((p: any) => p.status === 'active');
  const totalMarketPoolValue = activeMarketPools.reduce(
    (sum: number, p: any) => sum + p.totalPool, 0
  );

  return {
    totalBalance: treasury.balance,
    totalFeesCollected: treasury.totalFeesCollected,
    pendingPayouts: pendingPayouts.reduce((sum, t) => sum + t.amount, 0),
    pendingPayoutsCount: pendingPayouts.length,
    totalVolume: transactions
      .filter(t => t.type === 'bet')
      .reduce((sum, t) => sum + t.amount, 0),
    totalTransactions: transactions.length,
    activeMarketPools: activeMarketPools.length,
    totalMarketPoolValue,
    feeRate: feeConfig.platformFeeRate * 100,
    last24hVolume: last24hTransactions
      .filter(t => t.type === 'bet')
      .reduce((sum, t) => sum + t.amount, 0),
    last24hFees: last24hTransactions
      .filter(t => t.type === 'fee')
      .reduce((sum, t) => sum + t.amount, 0),
  };
};

// Get transactions by type
export const getTransactionsByType = (type: TransactionType): Transaction[] => {
  return getTransactions().filter(t => t.type === type);
};

// Get transactions by status
export const getTransactionsByStatus = (status: TransactionStatus): Transaction[] => {
  return getTransactions().filter(t => t.status === status);
};

// Get transactions by user
export const getTransactionsByUser = (userId: string): Transaction[] => {
  return getTransactions().filter(t => t.userId === userId);
};

// Get transactions by market
export const getTransactionsByMarket = (marketId: string): Transaction[] => {
  return getTransactions().filter(t => t.marketId === marketId);
};

// Export treasury service
const treasuryService = {
  getTreasury,
  getFeeConfig,
  updateFeeConfig,
  getTransactions,
  createTransaction,
  updateTransaction,
  completeTransaction,
  collectFee,
  processWithdrawal,
  getTreasuryStats,
  getTransactionsByType,
  getTransactionsByStatus,
  getTransactionsByUser,
  getTransactionsByMarket,
};

export default treasuryService;
