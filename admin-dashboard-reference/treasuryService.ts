// Treasury Service for Protocol Fee data
// This service provides data about protocol fees collected from market resolutions

import { supabase } from './supabase';
import { ethers } from 'ethers';

// Interfaces
export interface TreasuryBalance {
  token: string;
  symbol: string;
  balance: string;
  balanceFormatted: string;
}

export interface FeeCollection {
  marketId: string;
  marketTitle: string;
  feeAmount: string;
  feeAmountUsdt: string;
  outcome: string;
  confidence: number;
  transactionHash: string;
  timestamp: string;
}

export interface TreasuryAnalytics {
  totalValue: string;
  tokenCount: number;
  monthlyFees: string;
  feeGrowth: string;
}

// Contract addresses
const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS || '0x17B40492e3d7A2A2bA2FE0c09322CF9e5563Cb0b';
const BSC_RPC_URL = import.meta.env.VITE_BSC_RPC_URL || 'https://bsc-testnet-rpc.publicnode.com';

// Treasury ABI
const TREASURY_ABI = [
  'function getNativeBalance() view returns (uint256)',
  'function getBalance(address token) view returns (uint256)'
];

class ProtocolTreasuryService {
  private provider: ethers.JsonRpcProvider;
  private treasury: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
    this.treasury = new ethers.Contract(TREASURY_ADDRESS, TREASURY_ABI, this.provider);
  }

  async getAllBalances(): Promise<TreasuryBalance[]> {
    try {
      // Get native BNB balance
      let nativeBalance = BigInt(0);
      try {
        nativeBalance = await this.treasury.getNativeBalance();
      } catch (e) {
        // Fallback to direct balance check
        nativeBalance = await this.provider.getBalance(TREASURY_ADDRESS);
      }

      const balances: TreasuryBalance[] = [];

      if (nativeBalance > 0) {
        balances.push({
          token: 'native',
          symbol: 'BNB',
          balance: nativeBalance.toString(),
          balanceFormatted: `${Number(ethers.formatEther(nativeBalance)).toFixed(6)} BNB`
        });
      }

      return balances;
    } catch (error) {
      console.error('Failed to get treasury balances:', error);
      return [];
    }
  }

  async getFeeHistory(): Promise<FeeCollection[]> {
    try {
      if (!supabase) return [];

      const { data, error } = await supabase
        .from('protocol_fees')
        .select('*')
        .order('collected_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching fee history:', error);
        return [];
      }

      return (data || []).map(fee => ({
        marketId: fee.market_id,
        marketTitle: fee.market_claim || `Market ${fee.market_id.slice(0, 8)}...`,
        feeAmount: `${Number(fee.fee_amount_bnb).toFixed(6)}`,
        feeAmountUsdt: `${Number(fee.fee_amount_usdt).toFixed(2)}`,
        outcome: fee.outcome,
        confidence: fee.confidence_score,
        transactionHash: fee.transaction_hash,
        timestamp: fee.collected_at
      }));
    } catch (error) {
      console.error('Failed to get fee history:', error);
      return [];
    }
  }

  async getTreasuryAnalytics(): Promise<TreasuryAnalytics> {
    try {
      if (!supabase) {
        return {
          totalValue: '0',
          tokenCount: 1,
          monthlyFees: '0',
          feeGrowth: '0'
        };
      }

      // Get all fees
      const { data: allFees } = await supabase
        .from('protocol_fees')
        .select('fee_amount_bnb, fee_amount_usdt, collected_at');

      // Get fees from last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: monthlyFeesData } = await supabase
        .from('protocol_fees')
        .select('fee_amount_bnb, fee_amount_usdt')
        .gte('collected_at', thirtyDaysAgo);

      const totalBnb = allFees?.reduce((sum, f) => sum + Number(f.fee_amount_bnb), 0) || 0;
      const totalUsdt = allFees?.reduce((sum, f) => sum + Number(f.fee_amount_usdt), 0) || 0;
      const monthlyBnb = monthlyFeesData?.reduce((sum, f) => sum + Number(f.fee_amount_bnb), 0) || 0;

      // Get previous 30 days for growth calculation
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
      const { data: prevMonthFees } = await supabase
        .from('protocol_fees')
        .select('fee_amount_bnb')
        .gte('collected_at', sixtyDaysAgo)
        .lt('collected_at', thirtyDaysAgo);

      const prevMonthBnb = prevMonthFees?.reduce((sum, f) => sum + Number(f.fee_amount_bnb), 0) || 0;
      const growth = prevMonthBnb > 0 ? ((monthlyBnb - prevMonthBnb) / prevMonthBnb * 100) : 0;

      return {
        totalValue: totalUsdt.toFixed(2),
        tokenCount: 1, // BNB
        monthlyFees: monthlyBnb.toFixed(6),
        feeGrowth: growth.toFixed(1)
      };
    } catch (error) {
      console.error('Failed to get treasury analytics:', error);
      return {
        totalValue: '0',
        tokenCount: 1,
        monthlyFees: '0',
        feeGrowth: '0'
      };
    }
  }

  async withdrawToken(token: string, amount: string, recipient: string): Promise<boolean> {
    // This would require admin wallet - implemented in dashboard directly
    console.warn('Withdraw should be called from dashboard with admin signer');
    return false;
  }
}

export const treasuryService = new ProtocolTreasuryService();
