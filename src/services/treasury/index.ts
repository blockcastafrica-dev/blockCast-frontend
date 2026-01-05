// Treasury Services - Main Export
export * from './types';
export { default as treasuryService } from './treasuryService';
export { default as marketPoolService } from './marketPoolService';
export { default as payoutService } from './payoutService';
export { default as multiSigService } from './multiSigService';
export { default as treasuryTestHelper } from './testHelper';

// Re-export commonly used functions
export {
  getTreasury,
  getTreasuryStats,
  getFeeConfig,
  updateFeeConfig,
  getTransactions,
  createTransaction,
  updateTransaction,
  completeTransaction,
  collectFee,
  processWithdrawal,
  getTransactionsByType,
  getTransactionsByStatus,
  getTransactionsByUser,
  getTransactionsByMarket,
} from './treasuryService';

export {
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
} from './marketPoolService';

export {
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
} from './payoutService';

export {
  getMultiSigConfig,
  updateMultiSigConfig,
  addSigner,
  removeSigner,
  getWithdrawalRequests,
  createWithdrawalRequest,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
  executeWithdrawalRequest,
  cancelWithdrawalRequest,
  getPendingWithdrawalRequests,
  getWithdrawalRequest,
  hasSignerVoted,
  getMultiSigStats,
} from './multiSigService';

// Convenience function to initialize treasury with sample data
export const initializeTreasuryWithSampleData = () => {
  const { getTreasury } = require('./treasuryService');
  const { getMarketPools, getOrCreateMarketPool } = require('./marketPoolService');

  // Initialize treasury
  getTreasury();

  // Get existing markets from localStorage and create pools for them
  const storedMarkets = localStorage.getItem('blockcast_markets');
  if (storedMarkets) {
    const markets = JSON.parse(storedMarkets);
    markets.forEach((market: any) => {
      const pool = getOrCreateMarketPool(market.id);
      // Sync pool values with market values if needed
      if (market.total_pool && pool.totalPool === 0) {
        const pools = getMarketPools();
        const poolIndex = pools.findIndex((p: any) => p.marketId === market.id);
        if (poolIndex !== -1) {
          pools[poolIndex] = {
            ...pools[poolIndex],
            totalPool: market.total_pool || 0,
            yesPool: market.yes_pool || 0,
            noPool: market.no_pool || 0,
          };
          localStorage.setItem('blockcast_market_pools', JSON.stringify(pools));
        }
      }
    });
  }

  console.log('Treasury services initialized');
};

// Full fund flow summary for documentation
export const FUND_FLOW_DOCUMENTATION = `
================================================================================
                        BLOCKCAST FUND FLOW ARCHITECTURE
================================================================================

1. USER DEPOSITS
   └─► User deposits funds via FundWalletModal
       └─► Deposit fee (0.5%) collected to Treasury
       └─► Net amount credited to User balance

2. PLACING BETS
   └─► User places bet via Market interface
       └─► FULL bet amount goes to Market Pool (yes_pool or no_pool)
       └─► NO FEE taken at bet placement
       └─► Bet record created with potential_return calculated

3. MARKET POOLS (Escrow)
   ├─► Each market has its own pool
   ├─► total_pool = yes_pool + no_pool
   ├─► Odds calculated: total_pool / position_pool
   └─► Funds locked until market resolution

4. MARKET RESOLUTION
   └─► Admin resolves market with winning position
       ├─► Losing bets: status → 'lost', payout = 0
       └─► Winning bets:
           ├─► Calculate share: bet_amount / winning_pool
           ├─► Calculate gross payout: total_pool × share
           ├─► Calculate profit: gross_payout - original_bet
           ├─► Platform fee (2.5%) taken from PROFIT ONLY
           └─► Create pending payout transaction (net amount)

5. PAYOUT PROCESSING
   └─► Payouts from Market Pool to Winners
       ├─► Winner receives: gross_payout - platform_fee
       ├─► Platform fee sent to Treasury Vault
       ├─► Individual or batch processing
       └─► Transaction marked as completed

6. TREASURY VAULT
   ├─► Receives: Platform fees (2.5% of winner PROFITS)
   ├─► Receives: Deposit fees (0.5%)
   ├─► Outgoing: Admin withdrawals (requires approval)
   └─► Balance = Total fees collected - Withdrawals

7. MARKET CANCELLATION
   └─► If market is cancelled before resolution
       └─► All bets refunded in FULL (no fee was taken)

8. ADMIN WITHDRAWALS
   └─► Admin initiates withdrawal from Treasury
       └─► Requires multi-sig approval (future)
       └─► Funds sent to specified address

================================================================================
                              KEY FORMULAS
================================================================================

Odds = Total Pool / Position Pool
Winner Share = Bet Amount / Winning Pool
Gross Payout = Total Pool × Winner Share
Profit = Gross Payout - Original Bet Amount
Platform Fee = Profit × 2.5% (only on profits, not stake)
Net Payout = Gross Payout - Platform Fee

================================================================================
                              EXAMPLE
================================================================================

Market Pool: $1000 total ($600 YES, $400 NO)
User bet $100 on YES

If YES wins:
  - Share = $100 / $600 = 16.67%
  - Gross Payout = $1000 × 16.67% = $166.70
  - Profit = $166.70 - $100 = $66.70
  - Platform Fee = $66.70 × 2.5% = $1.67 → Treasury
  - Net Payout = $166.70 - $1.67 = $165.03 → Winner

================================================================================
`;
