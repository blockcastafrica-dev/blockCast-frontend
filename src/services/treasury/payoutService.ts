// Payout Service - Manages winner payout distribution
import { Transaction, PayoutCalculation } from './types';
import treasuryService, { getTransactions, updateTransaction, createTransaction } from './treasuryService';
import marketPoolService from './marketPoolService';

// Get all pending payouts
export const getPendingPayouts = (): Transaction[] => {
  return getTransactions().filter(
    t => t.type === 'payout' && t.status === 'pending'
  );
};

// Get payouts by market
export const getPayoutsByMarket = (marketId: string): Transaction[] => {
  return getTransactions().filter(
    t => t.type === 'payout' && t.marketId === marketId
  );
};

// Get payouts by user
export const getPayoutsByUser = (userId: string): Transaction[] => {
  return getTransactions().filter(
    t => t.type === 'payout' && t.userId === userId
  );
};

// Process a single payout
export const processPayout = (transactionId: string): Transaction | { error: string } => {
  const transactions = getTransactions();
  const transaction = transactions.find(t => t.id === transactionId);

  if (!transaction) {
    return { error: 'Payout transaction not found' };
  }

  if (transaction.type !== 'payout') {
    return { error: 'Transaction is not a payout' };
  }

  if (transaction.status !== 'pending') {
    return { error: `Payout is already ${transaction.status}` };
  }

  // Update status to processing
  updateTransaction(transactionId, { status: 'processing' });

  // In a real system, this would:
  // 1. Connect to blockchain/payment provider
  // 2. Execute the transfer
  // 3. Wait for confirmation
  // 4. Update status based on result

  // For now, simulate successful processing
  const updated = updateTransaction(transactionId, {
    status: 'completed',
    txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
  });

  // Update user balance (in real app, would update on-chain balance)
  if (updated && updated.userId) {
    const users = JSON.parse(localStorage.getItem('blockcast_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === updated.userId);
    if (userIndex !== -1) {
      users[userIndex].balance = (users[userIndex].balance || 0) + updated.amount;
      users[userIndex].total_winnings = (users[userIndex].total_winnings || 0) + updated.amount;
      localStorage.setItem('blockcast_users', JSON.stringify(users));
    }
  }

  return updated || { error: 'Failed to update transaction' };
};

// Process multiple payouts in batch
export const processPayoutBatch = (transactionIds: string[]): {
  successful: Transaction[];
  failed: { id: string; error: string }[];
} => {
  const successful: Transaction[] = [];
  const failed: { id: string; error: string }[] = [];

  for (const id of transactionIds) {
    const result = processPayout(id);
    if ('error' in result) {
      failed.push({ id, error: result.error });
    } else {
      successful.push(result);
    }
  }

  return { successful, failed };
};

// Process all pending payouts
export const processAllPendingPayouts = (): {
  successful: Transaction[];
  failed: { id: string; error: string }[];
  totalProcessed: number;
  totalAmount: number;
} => {
  const pending = getPendingPayouts();
  const result = processPayoutBatch(pending.map(p => p.id));

  return {
    ...result,
    totalProcessed: result.successful.length,
    totalAmount: result.successful.reduce((sum, t) => sum + t.amount, 0),
  };
};

// Cancel a pending payout
export const cancelPayout = (
  transactionId: string,
  reason: string
): Transaction | { error: string } => {
  const transactions = getTransactions();
  const transaction = transactions.find(t => t.id === transactionId);

  if (!transaction) {
    return { error: 'Payout transaction not found' };
  }

  if (transaction.type !== 'payout') {
    return { error: 'Transaction is not a payout' };
  }

  if (transaction.status !== 'pending') {
    return { error: `Cannot cancel payout that is ${transaction.status}` };
  }

  // Update the transaction
  const updated = updateTransaction(transactionId, {
    status: 'cancelled',
    metadata: {
      ...transaction.metadata,
      cancelReason: reason,
      cancelledAt: new Date().toISOString(),
    },
  });

  // Note: In a real system, cancelling a payout would require
  // returning the funds to the market pool or handling the dispute

  return updated || { error: 'Failed to cancel payout' };
};

// Get payout statistics
export const getPayoutStats = (): {
  totalPayouts: number;
  pendingPayouts: number;
  completedPayouts: number;
  cancelledPayouts: number;
  totalPendingAmount: number;
  totalCompletedAmount: number;
  averagePayoutAmount: number;
} => {
  const transactions = getTransactions().filter(t => t.type === 'payout');

  const pending = transactions.filter(t => t.status === 'pending');
  const completed = transactions.filter(t => t.status === 'completed');
  const cancelled = transactions.filter(t => t.status === 'cancelled');

  const totalCompletedAmount = completed.reduce((sum, t) => sum + t.amount, 0);

  return {
    totalPayouts: transactions.length,
    pendingPayouts: pending.length,
    completedPayouts: completed.length,
    cancelledPayouts: cancelled.length,
    totalPendingAmount: pending.reduce((sum, t) => sum + t.amount, 0),
    totalCompletedAmount,
    averagePayoutAmount: completed.length > 0 ? totalCompletedAmount / completed.length : 0,
  };
};

// Retry a failed payout
export const retryPayout = (transactionId: string): Transaction | { error: string } => {
  const transactions = getTransactions();
  const transaction = transactions.find(t => t.id === transactionId);

  if (!transaction) {
    return { error: 'Payout transaction not found' };
  }

  if (transaction.status !== 'failed') {
    return { error: 'Can only retry failed payouts' };
  }

  // Reset to pending and process
  updateTransaction(transactionId, {
    status: 'pending',
    metadata: {
      ...transaction.metadata,
      retryCount: (transaction.metadata.retryCount || 0) + 1,
      lastRetryAt: new Date().toISOString(),
    },
  });

  return processPayout(transactionId);
};

// Get user's payout history with summary
export const getUserPayoutHistory = (userId: string): {
  payouts: Transaction[];
  totalReceived: number;
  pendingAmount: number;
  totalPayouts: number;
} => {
  const payouts = getPayoutsByUser(userId);
  const completed = payouts.filter(p => p.status === 'completed');
  const pending = payouts.filter(p => p.status === 'pending');

  return {
    payouts,
    totalReceived: completed.reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
    totalPayouts: payouts.length,
  };
};

// Create manual payout (admin function)
export const createManualPayout = (
  userId: string,
  amount: number,
  reason: string,
  adminId: string
): Transaction => {
  return createTransaction('payout', amount, {
    from: 'treasury',
    to: userId,
    userId,
    description: `Manual payout: ${reason}`,
    status: 'pending',
    metadata: {
      isManual: true,
      reason,
      createdBy: adminId,
    },
  });
};

// Export payout service
const payoutService = {
  getPendingPayouts,
  getPayoutsByMarket,
  getPayoutsByUser,
  processPayout,
  processPayoutBatch,
  processAllPendingPayouts,
  cancelPayout,
  getPayoutStats,
  retryPayout,
  getUserPayoutHistory,
  createManualPayout,
};

export default payoutService;
