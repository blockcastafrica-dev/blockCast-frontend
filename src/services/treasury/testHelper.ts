// Treasury Test Helper - Run in browser console to test fund flow
import { v4 as uuidv4 } from 'uuid';
import {
  getTreasury,
  getTreasuryStats,
  getTransactions,
  getFeeConfig,
} from './treasuryService';
import {
  getMarketPools,
  getOrCreateMarketPool,
  placeBet,
  resolveMarket,
  calculatePayouts,
  getBetsByMarket,
  getAllBets,
} from './marketPoolService';
import {
  getPendingPayouts,
  processAllPendingPayouts,
} from './payoutService';

// Create a test market
export const createTestMarket = () => {
  const marketId = `test-market-${Date.now()}`;
  const market = {
    id: marketId,
    claim: 'Test Market: Will this test pass?',
    category: 'Test',
    status: 'active',
    created_at: new Date().toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    total_pool: 0,
    yes_pool: 0,
    no_pool: 0,
  };

  // Save to localStorage
  const markets = JSON.parse(localStorage.getItem('blockcast_markets') || '[]');
  markets.push(market);
  localStorage.setItem('blockcast_markets', JSON.stringify(markets));

  // Create pool
  getOrCreateMarketPool(marketId);

  console.log('✅ Created test market:', marketId);
  return marketId;
};

// Simulate placing bets
export const simulateBets = (marketId: string) => {
  console.log('\n📊 SIMULATING BETS...\n');

  // User 1 bets $100 on YES
  const bet1 = placeBet('user-1', marketId, 'yes', 100);
  if ('error' in bet1) {
    console.error('❌ Bet 1 failed:', bet1.error);
  } else {
    console.log('✅ User 1 bet $100 on YES');
    console.log('   Pool after bet:', bet1.pool);
  }

  // User 2 bets $200 on YES
  const bet2 = placeBet('user-2', marketId, 'yes', 200);
  if ('error' in bet2) {
    console.error('❌ Bet 2 failed:', bet2.error);
  } else {
    console.log('✅ User 2 bet $200 on YES');
  }

  // User 3 bets $150 on NO
  const bet3 = placeBet('user-3', marketId, 'no', 150);
  if ('error' in bet3) {
    console.error('❌ Bet 3 failed:', bet3.error);
  } else {
    console.log('✅ User 3 bet $150 on NO');
  }

  // User 4 bets $250 on NO
  const bet4 = placeBet('user-4', marketId, 'no', 250);
  if ('error' in bet4) {
    console.error('❌ Bet 4 failed:', bet4.error);
  } else {
    console.log('✅ User 4 bet $250 on NO');
    console.log('   Final pool:', bet4.pool);
  }

  // Show pool state
  const pools = getMarketPools();
  const pool = pools.find(p => p.marketId === marketId);
  console.log('\n📈 POOL STATE:');
  console.log(`   Total Pool: $${pool?.totalPool}`);
  console.log(`   YES Pool: $${pool?.yesPool}`);
  console.log(`   NO Pool: $${pool?.noPool}`);
  console.log(`   Fees Collected (should be 0): $${pool?.feesCollected}`);

  return pool;
};

// Show payout preview before resolution
export const previewPayouts = (marketId: string, winningPosition: 'yes' | 'no') => {
  console.log(`\n🔮 PAYOUT PREVIEW (if ${winningPosition.toUpperCase()} wins):\n`);

  const payouts = calculatePayouts(marketId, winningPosition);
  const feeConfig = getFeeConfig();

  let totalGross = 0;
  let totalFees = 0;
  let totalNet = 0;

  payouts.forEach(payout => {
    console.log(`   User: ${payout.userId}`);
    console.log(`   Bet Amount: $${payout.betAmount}`);
    console.log(`   Gross Winnings: $${payout.winnings}`);
    console.log(`   Profit: $${(payout.winnings - payout.betAmount).toFixed(2)}`);
    console.log(`   Platform Fee (${feeConfig.platformFeeRate * 100}% of profit): $${payout.platformFee}`);
    console.log(`   Net Payout: $${payout.netPayout}`);
    console.log('   ---');

    totalGross += payout.winnings;
    totalFees += payout.platformFee;
    totalNet += payout.netPayout;
  });

  console.log(`\n   TOTALS:`);
  console.log(`   Gross Payouts: $${totalGross.toFixed(2)}`);
  console.log(`   Platform Fees: $${totalFees.toFixed(2)} → Treasury`);
  console.log(`   Net to Winners: $${totalNet.toFixed(2)}`);

  return payouts;
};

// Resolve market and collect fees
export const resolveTestMarket = (marketId: string, winningPosition: 'yes' | 'no') => {
  console.log(`\n🏁 RESOLVING MARKET (${winningPosition.toUpperCase()} wins)...\n`);

  const treasuryBefore = getTreasury();
  console.log(`   Treasury Balance BEFORE: $${treasuryBefore.balance}`);
  console.log(`   Total Fees Collected BEFORE: $${treasuryBefore.totalFeesCollected}`);

  const result = resolveMarket(marketId, winningPosition);

  if ('error' in result) {
    console.error('❌ Resolution failed:', result.error);
    return;
  }

  const treasuryAfter = getTreasury();
  console.log(`\n   Treasury Balance AFTER: $${treasuryAfter.balance}`);
  console.log(`   Total Fees Collected AFTER: $${treasuryAfter.totalFeesCollected}`);
  console.log(`   Fees from this market: $${result.totalFeesCollected.toFixed(2)}`);

  // Show pending payouts
  const pendingPayouts = getPendingPayouts();
  console.log(`\n   Pending Payouts: ${pendingPayouts.length}`);
  pendingPayouts.forEach(p => {
    console.log(`   - $${p.amount} to ${p.userId}`);
  });

  return result;
};

// Process all pending payouts
export const processPayouts = () => {
  console.log('\n💰 PROCESSING PAYOUTS...\n');

  const result = processAllPendingPayouts();

  console.log(`   Successful: ${result.successful.length}`);
  console.log(`   Failed: ${result.failed.length}`);
  console.log(`   Total Amount Paid: $${result.totalAmount}`);

  return result;
};

// Show full treasury state
export const showTreasuryState = () => {
  const stats = getTreasuryStats();
  const treasury = getTreasury();
  const transactions = getTransactions();
  const feeTransactions = transactions.filter(t => t.type === 'fee');

  console.log('\n💎 TREASURY STATE:\n');
  console.log(`   Balance: $${treasury.balance.toFixed(2)}`);
  console.log(`   Total Fees Collected: $${treasury.totalFeesCollected.toFixed(2)}`);
  console.log(`   Total Payouts Processed: $${treasury.totalPayoutsProcessed.toFixed(2)}`);
  console.log(`   Pending Payouts: $${stats.pendingPayouts} (${stats.pendingPayoutsCount} transactions)`);
  console.log(`   Total Transactions: ${stats.totalTransactions}`);
  console.log(`   Fee Transactions: ${feeTransactions.length}`);

  if (feeTransactions.length > 0) {
    console.log('\n   Recent Fee Collections:');
    feeTransactions.slice(0, 5).forEach(t => {
      console.log(`   - $${t.amount.toFixed(2)} from ${t.description}`);
    });
  }

  return stats;
};

// Run full test
export const runFullTest = () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('       TREASURY FUND FLOW TEST');
  console.log('═══════════════════════════════════════════════════════════');

  // Step 1: Show initial state
  console.log('\n📋 STEP 1: Initial Treasury State');
  showTreasuryState();

  // Step 2: Create market
  console.log('\n📋 STEP 2: Create Test Market');
  const marketId = createTestMarket();

  // Step 3: Place bets
  console.log('\n📋 STEP 3: Place Bets');
  console.log('   - User 1: $100 on YES');
  console.log('   - User 2: $200 on YES');
  console.log('   - User 3: $150 on NO');
  console.log('   - User 4: $250 on NO');
  console.log('   - Total Pool: $700 (YES: $300, NO: $400)');
  simulateBets(marketId);

  // Step 4: Preview payouts for both outcomes
  console.log('\n📋 STEP 4: Preview Payouts');
  previewPayouts(marketId, 'yes');
  previewPayouts(marketId, 'no');

  // Step 5: Resolve market (YES wins)
  console.log('\n📋 STEP 5: Resolve Market (YES wins)');
  resolveTestMarket(marketId, 'yes');

  // Step 6: Process payouts
  console.log('\n📋 STEP 6: Process Payouts');
  processPayouts();

  // Step 7: Final treasury state
  console.log('\n📋 STEP 7: Final Treasury State');
  showTreasuryState();

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('       TEST COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');

  return marketId;
};

// Clear all test data
export const clearTestData = () => {
  localStorage.removeItem('blockcast_treasury');
  localStorage.removeItem('blockcast_treasury_transactions');
  localStorage.removeItem('blockcast_treasury_bets');
  localStorage.removeItem('blockcast_market_pools');
  localStorage.removeItem('blockcast_fee_config');
  console.log('✅ All treasury test data cleared');
};

// Export for browser console
const testHelper = {
  createTestMarket,
  simulateBets,
  previewPayouts,
  resolveTestMarket,
  processPayouts,
  showTreasuryState,
  runFullTest,
  clearTestData,
};

export default testHelper;

// Make available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).treasuryTest = testHelper;
}
