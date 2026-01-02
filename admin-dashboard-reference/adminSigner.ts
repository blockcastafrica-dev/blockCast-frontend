// Admin signer utility for privileged operations
// WARNING: This uses a private key stored in env vars - only for admin functions

import { ethers } from 'ethers';

const BSC_RPC_URL = import.meta.env.VITE_BSC_RPC_URL || 'https://bsc-testnet-rpc.publicnode.com';
const ADMIN_PRIVATE_KEY = import.meta.env.VITE_ADMIN_PRIVATE_KEY;

let provider: ethers.JsonRpcProvider | null = null;
let adminWallet: ethers.Wallet | null = null;

// Initialize the provider and wallet
function init() {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
  }

  if (!adminWallet && ADMIN_PRIVATE_KEY) {
    adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
  }
}

// Get admin signer for transactions
export async function getAdminSigner(): Promise<ethers.Wallet> {
  init();

  if (!adminWallet) {
    throw new Error('Admin private key not configured');
  }

  return adminWallet;
}

// Get admin address
export async function getAdminAddress(): Promise<string> {
  const signer = await getAdminSigner();
  return signer.address;
}

// Check if admin signer is available
export function isAdminSignerAvailable(): boolean {
  return !!ADMIN_PRIVATE_KEY;
}
