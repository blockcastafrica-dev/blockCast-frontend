// Market Pool Service - Manages escrow pools for each market
import { v4 as uuidv4 } from 'uuid';
import { MarketPool, Bet, PayoutCalculation } from './types';
import treasuryService, { getFeeConfig, collectFee, createTransaction } from './treasuryService';

const POOLS_KEY = 'blockcast_market_pools';
const BETS_KEY = 'blockcast_treasury_bets';

// Get all market pools
export const getMarketPools = (): MarketPool[] => {
  const stored = localStorage.getItem(POOLS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

// Save market pools
const saveMarketPools = (pools: MarketPool[]) => {
  localStorage.setItem(POOLS_KEY, JSON.stringify(pools));
};

// Get all bets
export const getAllBets = (): Bet[] => {
  const stored = localStorage.getItem(BETS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

// Save bets
const saveBets = (bets: Bet[]) => {
  localStorage.setItem(BETS_KEY, JSON.stringify(bets));
};

// Get or create market pool
export const getOrCreateMarketPool = (marketId: string): MarketPool => {
  const pools = getMarketPools();
  let pool = pools.find(p => p.marketId === marketId);

  if (!pool) {
    pool = {
      marketId,
      totalPool: 0,
      yesPool: 0,
      noPool: 0,
      feesCollected: 0,
      status: 'active',
      winningPosition: null,
      resolvedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    pools.push(pool);
    saveMarketPools(pools);
  }

  return pool;
};

// Get market pool
export const getMarketPool = (marketId: string): MarketPool | null => {
  const pools = getMarketPools();
  return pools.find(p => p.marketId === marketId) || null;
};

// Update market pool
const updateMarketPool = (marketId: string, updates: Partial<MarketPool>): MarketPool | null => {
  const pools = getMarketPools();
  const index = pools.findIndex(p => p.marketId === marketId);

  if (index === -1) return null;

  pools[index] = {
    ...pools[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveMarketPools(pools);
  return pools[index];
};

// Calculate odds based on pool sizes (gross odds - fee applied on payout)
export const calculateOdds = (pool: MarketPool): { yesOdds: number; noOdds: number } => {
  if (pool.totalPool === 0) {
    return { yesOdds: 2.0, noOdds: 2.0 };
  }

  // Odds = Total Pool / Position Pool (fee will be deducted from winnings)
  const yesOdds = pool.yesPool > 0 ? pool.totalPool / pool.yesPool : 2.0;
  const noOdds = pool.noPool > 0 ? pool.totalPool / pool.noPool : 2.0;

  return {
    yesOdds: Math.round(yesOdds * 100) / 100,
    noOdds: Math.round(noOdds * 100) / 100,
  };
};

// Place a bet - adds funds to market pool (no fee at placement)
export const placeBet = (
  userId: string,
  marketId: string,
  position: 'yes' | 'no',
  amount: number
): { bet: Bet; pool: MarketPool } | { error: string } => {
  const feeConfig = getFeeConfig();

  // Validate bet amount
  if (amount < feeConfig.minBet) {
    return { error: `Minimum bet is $${feeConfig.minBet}` };
  }
  if (amount > feeConfig.maxBet) {
    return { error: `Maximum bet is $${feeConfig.maxBet}` };
  }

  // Get or create market pool
  const pool = getOrCreateMarketPool(marketId);

  if (pool.status !== 'active') {
    return { error: 'Market is not active' };
  }

  // Full amount goes to pool - fee is collected on payout
  const { yesOdds, noOdds } = calculateOdds(pool);
  const odds = position === 'yes' ? yesOdds : noOdds;

  // Create bet record
  const bet: Bet = {
    id: uuidv4(),
    userId,
    marketId,
    position,
    amount,
    potentialReturn: amount * odds,
    odds,
    status: 'active',
    payoutAmount: null,
    payoutTransactionId: null,
    placedAt: new Date().toISOString(),
    settledAt: null,
  };

  // Update pool - full amount goes to pool
  const poolUpdates: Partial<MarketPool> = {
    totalPool: pool.totalPool + amount,
  };

  if (position === 'yes') {
    poolUpdates.yesPool = pool.yesPool + amount;
  } else {
    poolUpdates.noPool = pool.noPool + amount;
  }

  const updatedPool = updateMarketPool(marketId, poolUpdates)!;

  // Save bet
  const bets = getAllBets();
  bets.push(bet);
  saveBets(bets);

  // Create bet transaction record (no fee at placement)
  createTransaction('bet', amount, {
    from: userId,
    to: `market_pool:${marketId}`,
    userId,
    marketId,
    betId: bet.id,
    description: `Bet ${position.toUpperCase()} on market`,
    fee: 0,
    status: 'completed',
    metadata: { position, odds },
  });

  return { bet, pool: updatedPool };
};

// Get bets by market
export const getBetsByMarket = (marketId: string): Bet[] => {
  return getAllBets().filter(b => b.marketId === marketId);
};

// Get bets by user
export const getBetsByUser = (userId: string): Bet[] => {
  return getAllBets().filter(b => b.userId === userId);
};

// Get active bets by user
export const getActiveBetsByUser = (userId: string): Bet[] => {
  return getAllBets().filter(b => b.userId === userId && b.status === 'active');
};

// Calculate payouts for resolved market (fee deducted from winnings)
export const calculatePayouts = (marketId: string, winningPosition: 'yes' | 'no'): PayoutCalculation[] => {
  const pool = getMarketPool(marketId);
  if (!pool) return [];

  const feeConfig = getFeeConfig();
  const bets = getBetsByMarket(marketId);
  const winningBets = bets.filter(b => b.position === winningPosition && b.status === 'active');
  const winningPool = winningPosition === 'yes' ? pool.yesPool : pool.noPool;

  if (winningPool === 0) return [];

  // Total pool to distribute
  const totalPool = pool.totalPool;

  return winningBets.map(bet => {
    // Share of winning pool based on bet amount
    const share = bet.amount / winningPool;
    // Gross winnings from the total pool
    const grossWinnings = totalPool * share;
    // Platform fee is deducted from winnings (only on profit, not original stake)
    const profit = grossWinnings - bet.amount;
    const platformFee = profit > 0 ? profit * feeConfig.platformFeeRate : 0;
    // Net payout = gross winnings - platform fee
    const netPayout = grossWinnings - platformFee;

    return {
      betId: bet.id,
      userId: bet.userId,
      betAmount: bet.amount,
      winnings: Math.round(grossWinnings * 100) / 100,
      platformFee: Math.round(platformFee * 100) / 100,
      netPayout: Math.round(netPayout * 100) / 100,
    };
  });
};

// Resolve market and create payout transactions (fees collected on payout)
export const resolveMarket = (
  marketId: string,
  winningPosition: 'yes' | 'no'
): { payouts: PayoutCalculation[]; pool: MarketPool; totalFeesCollected: number } | { error: string } => {
  const pool = getMarketPool(marketId);

  if (!pool) {
    return { error: 'Market pool not found' };
  }

  if (pool.status !== 'active') {
    return { error: 'Market is not active' };
  }

  // Calculate payouts (includes fee calculation)
  const payouts = calculatePayouts(marketId, winningPosition);

  // Calculate total fees to collect
  const totalFeesCollected = payouts.reduce((sum, p) => sum + p.platformFee, 0);

  // Update all bets
  const bets = getAllBets();
  const marketBets = bets.filter(b => b.marketId === marketId);

  marketBets.forEach(bet => {
    const betIndex = bets.findIndex(b => b.id === bet.id);
    if (betIndex === -1) return;

    if (bet.position === winningPosition) {
      const payout = payouts.find(p => p.betId === bet.id);
      bets[betIndex] = {
        ...bet,
        status: 'won',
        payoutAmount: payout?.netPayout || 0,
        settledAt: new Date().toISOString(),
      };

      // Create payout transaction (pending - needs to be processed)
      if (payout) {
        const tx = createTransaction('payout', payout.netPayout, {
          from: `market_pool:${marketId}`,
          to: bet.userId,
          userId: bet.userId,
          marketId,
          betId: bet.id,
          description: `Payout for winning bet on ${winningPosition.toUpperCase()}`,
          status: 'pending',
          metadata: {
            winningPosition,
            betAmount: bet.amount,
            odds: bet.odds,
            grossWinnings: payout.winnings,
            platformFee: payout.platformFee,
          },
        });

        bets[betIndex].payoutTransactionId = tx.id;

        // Collect platform fee to treasury (from winner's profit)
        if (payout.platformFee > 0) {
          collectFee(payout.platformFee, marketId, bet.id, bet.userId);
        }
      }
    } else {
      bets[betIndex] = {
        ...bet,
        status: 'lost',
        payoutAmount: 0,
        settledAt: new Date().toISOString(),
      };
    }
  });

  saveBets(bets);

  // Update pool status and fees collected
  const updatedPool = updateMarketPool(marketId, {
    status: 'resolved',
    winningPosition,
    feesCollected: totalFeesCollected,
    resolvedAt: new Date().toISOString(),
  })!;

  return { payouts, pool: updatedPool, totalFeesCollected };
};

// Cancel market and refund all bets (full amount - no fee was taken)
export const cancelMarket = (marketId: string): { refundedBets: number; pool: MarketPool } | { error: string } => {
  const pool = getMarketPool(marketId);

  if (!pool) {
    return { error: 'Market pool not found' };
  }

  if (pool.status !== 'active') {
    return { error: 'Market is not active' };
  }

  const bets = getAllBets();
  const marketBets = bets.filter(b => b.marketId === marketId && b.status === 'active');

  // Refund all bets - full amount (no fee was taken at bet placement)
  marketBets.forEach(bet => {
    const betIndex = bets.findIndex(b => b.id === bet.id);
    if (betIndex === -1) return;

    bets[betIndex] = {
      ...bet,
      status: 'refunded',
      payoutAmount: bet.amount, // Full refund
      settledAt: new Date().toISOString(),
    };

    // Create refund transaction
    createTransaction('refund', bet.amount, {
      from: `market_pool:${marketId}`,
      to: bet.userId,
      userId: bet.userId,
      marketId,
      betId: bet.id,
      description: 'Market cancelled - full bet refund',
      status: 'pending',
      metadata: { originalAmount: bet.amount },
    });
  });

  saveBets(bets);

  // Update pool status
  const updatedPool = updateMarketPool(marketId, {
    status: 'cancelled',
  })!;

  return { refundedBets: marketBets.length, pool: updatedPool };
};

// Get pool statistics
export const getPoolStats = (): {
  totalPools: number;
  activePools: number;
  resolvedPools: number;
  totalValueLocked: number;
  totalFeesCollected: number;
} => {
  const pools = getMarketPools();

  return {
    totalPools: pools.length,
    activePools: pools.filter(p => p.status === 'active').length,
    resolvedPools: pools.filter(p => p.status === 'resolved').length,
    totalValueLocked: pools
      .filter(p => p.status === 'active')
      .reduce((sum, p) => sum + p.totalPool, 0),
    totalFeesCollected: pools.reduce((sum, p) => sum + p.feesCollected, 0),
  };
};

// Export market pool service
const marketPoolService = {
  getMarketPools,
  getMarketPool,
  getOrCreateMarketPool,
  calculateOdds,
  placeBet,
  getBetsByMarket,
  getBetsByUser,
  getActiveBetsByUser,
  calculatePayouts,
  resolveMarket,
  cancelMarket,
  getPoolStats,
  getAllBets,
};

export default marketPoolService;
