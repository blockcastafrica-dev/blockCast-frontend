// Multi-Sig Service - Manages withdrawal approval workflow
import { v4 as uuidv4 } from 'uuid';
import {
  MultiSigConfig,
  Signer,
  WithdrawalRequest,
  WithdrawalRequestStatus,
  Approval,
  Rejection,
} from './types';
import { getTreasury, createTransaction } from './treasuryService';

const CONFIG_KEY = 'blockcast_multisig_config';
const REQUESTS_KEY = 'blockcast_withdrawal_requests';

// Default multi-sig configuration
const DEFAULT_CONFIG: MultiSigConfig = {
  enabled: true,
  threshold: 2,           // Require 2 approvals
  totalSigners: 3,        // Out of 3 total signers
  expirationHours: 48,    // Requests expire after 48 hours
  signers: [
    {
      id: 'signer-1',
      name: 'Admin Owner',
      email: 'owner@blockcast.com',
      role: 'owner',
      addedAt: new Date().toISOString(),
      addedBy: 'system',
    },
    {
      id: 'signer-2',
      name: 'Treasury Admin',
      email: 'treasury@blockcast.com',
      role: 'admin',
      addedAt: new Date().toISOString(),
      addedBy: 'system',
    },
    {
      id: 'signer-3',
      name: 'Finance Admin',
      email: 'finance@blockcast.com',
      role: 'signer',
      addedAt: new Date().toISOString(),
      addedBy: 'system',
    },
  ],
};

// Get multi-sig configuration
export const getMultiSigConfig = (): MultiSigConfig => {
  const stored = localStorage.getItem(CONFIG_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
  return DEFAULT_CONFIG;
};

// Update multi-sig configuration
export const updateMultiSigConfig = (updates: Partial<MultiSigConfig>): MultiSigConfig => {
  const current = getMultiSigConfig();
  const updated = { ...current, ...updates };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
  return updated;
};

// Add a new signer
export const addSigner = (signer: Omit<Signer, 'id' | 'addedAt'>, addedBy: string): Signer => {
  const config = getMultiSigConfig();
  const newSigner: Signer = {
    ...signer,
    id: `signer-${uuidv4().slice(0, 8)}`,
    addedAt: new Date().toISOString(),
    addedBy,
  };
  config.signers.push(newSigner);
  config.totalSigners = config.signers.length;
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  return newSigner;
};

// Remove a signer
export const removeSigner = (signerId: string): boolean => {
  const config = getMultiSigConfig();
  const index = config.signers.findIndex(s => s.id === signerId);
  if (index === -1) return false;

  // Don't allow removing if it would go below threshold
  if (config.signers.length <= config.threshold) {
    return false;
  }

  config.signers.splice(index, 1);
  config.totalSigners = config.signers.length;
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  return true;
};

// Get all withdrawal requests
export const getWithdrawalRequests = (): WithdrawalRequest[] => {
  const stored = localStorage.getItem(REQUESTS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

// Save withdrawal requests
const saveWithdrawalRequests = (requests: WithdrawalRequest[]) => {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
};

// Create a new withdrawal request
export const createWithdrawalRequest = (
  amount: number,
  destinationAddress: string,
  reason: string,
  requestedBy: string
): WithdrawalRequest | { error: string } => {
  const config = getMultiSigConfig();
  const treasury = getTreasury();

  // Validate amount
  if (amount <= 0) {
    return { error: 'Amount must be greater than 0' };
  }

  if (amount > treasury.balance) {
    return { error: 'Insufficient treasury balance' };
  }

  // Validate requester is a signer
  const requester = config.signers.find(s => s.id === requestedBy);
  if (!requester) {
    return { error: 'Requester is not an authorized signer' };
  }

  // Calculate expiration
  const expiresAt = new Date(Date.now() + config.expirationHours * 60 * 60 * 1000);

  const request: WithdrawalRequest = {
    id: `wr-${uuidv4().slice(0, 8)}`,
    amount,
    destinationAddress,
    reason,
    requestedBy,
    requestedAt: new Date().toISOString(),
    status: 'pending_approval',
    approvals: [],
    rejections: [],
    expiresAt: expiresAt.toISOString(),
    executedAt: null,
    transactionId: null,
    txHash: null,
  };

  const requests = getWithdrawalRequests();
  requests.unshift(request);
  saveWithdrawalRequests(requests);

  return request;
};

// Approve a withdrawal request
export const approveWithdrawalRequest = (
  requestId: string,
  signerId: string
): WithdrawalRequest | { error: string } => {
  const config = getMultiSigConfig();
  const requests = getWithdrawalRequests();
  const index = requests.findIndex(r => r.id === requestId);

  if (index === -1) {
    return { error: 'Withdrawal request not found' };
  }

  const request = requests[index];

  // Check if request is still pending
  if (request.status !== 'pending_approval') {
    return { error: `Request is already ${request.status}` };
  }

  // Check if expired
  if (new Date(request.expiresAt) < new Date()) {
    requests[index].status = 'expired';
    saveWithdrawalRequests(requests);
    return { error: 'Request has expired' };
  }

  // Validate signer
  const signer = config.signers.find(s => s.id === signerId);
  if (!signer) {
    return { error: 'Not an authorized signer' };
  }

  // Check if already approved by this signer
  if (request.approvals.some(a => a.signerId === signerId)) {
    return { error: 'Already approved by this signer' };
  }

  // Check if already rejected by this signer
  if (request.rejections.some(r => r.signerId === signerId)) {
    return { error: 'Already rejected by this signer' };
  }

  // Add approval
  const approval: Approval = {
    signerId,
    signerName: signer.name,
    approvedAt: new Date().toISOString(),
  };

  request.approvals.push(approval);

  // Check if threshold is met
  if (request.approvals.length >= config.threshold) {
    request.status = 'approved';
  }

  requests[index] = request;
  saveWithdrawalRequests(requests);

  // Auto-execute if approved
  if (request.status === 'approved') {
    return executeWithdrawalRequest(requestId);
  }

  return request;
};

// Reject a withdrawal request
export const rejectWithdrawalRequest = (
  requestId: string,
  signerId: string,
  reason: string
): WithdrawalRequest | { error: string } => {
  const config = getMultiSigConfig();
  const requests = getWithdrawalRequests();
  const index = requests.findIndex(r => r.id === requestId);

  if (index === -1) {
    return { error: 'Withdrawal request not found' };
  }

  const request = requests[index];

  // Check if request is still pending
  if (request.status !== 'pending_approval') {
    return { error: `Request is already ${request.status}` };
  }

  // Validate signer
  const signer = config.signers.find(s => s.id === signerId);
  if (!signer) {
    return { error: 'Not an authorized signer' };
  }

  // Check if already voted
  if (request.approvals.some(a => a.signerId === signerId)) {
    return { error: 'Already approved by this signer' };
  }
  if (request.rejections.some(r => r.signerId === signerId)) {
    return { error: 'Already rejected by this signer' };
  }

  // Add rejection
  const rejection: Rejection = {
    signerId,
    signerName: signer.name,
    rejectedAt: new Date().toISOString(),
    reason,
  };

  request.rejections.push(rejection);

  // Calculate remaining possible approvals
  const totalVotes = request.approvals.length + request.rejections.length;
  const remainingVotes = config.totalSigners - totalVotes;
  const possibleApprovals = request.approvals.length + remainingVotes;

  // If it's impossible to reach threshold, mark as rejected
  if (possibleApprovals < config.threshold) {
    request.status = 'rejected';
  }

  requests[index] = request;
  saveWithdrawalRequests(requests);

  return request;
};

// Execute an approved withdrawal request
export const executeWithdrawalRequest = (
  requestId: string
): WithdrawalRequest | { error: string } => {
  const requests = getWithdrawalRequests();
  const index = requests.findIndex(r => r.id === requestId);

  if (index === -1) {
    return { error: 'Withdrawal request not found' };
  }

  const request = requests[index];

  if (request.status !== 'approved') {
    return { error: 'Request is not approved' };
  }

  const treasury = getTreasury();

  // Double-check balance
  if (request.amount > treasury.balance) {
    return { error: 'Insufficient treasury balance' };
  }

  // Create the withdrawal transaction
  const transaction = createTransaction('withdrawal', request.amount, {
    from: 'treasury',
    to: request.destinationAddress,
    description: `Multi-sig withdrawal: ${request.reason}`,
    status: 'completed',
    metadata: {
      multiSigRequestId: request.id,
      approvals: request.approvals.length,
      approvedBy: request.approvals.map(a => a.signerName),
    },
  });

  // Update treasury balance
  const treasuryData = JSON.parse(localStorage.getItem('blockcast_treasury') || '{}');
  treasuryData.balance = (treasuryData.balance || 0) - request.amount;
  treasuryData.totalWithdrawals = (treasuryData.totalWithdrawals || 0) + request.amount;
  treasuryData.lastUpdated = new Date().toISOString();
  localStorage.setItem('blockcast_treasury', JSON.stringify(treasuryData));

  // Update request
  request.status = 'executed';
  request.executedAt = new Date().toISOString();
  request.transactionId = transaction.id;
  request.txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

  requests[index] = request;
  saveWithdrawalRequests(requests);

  return request;
};

// Cancel a withdrawal request (only by requester or owner)
export const cancelWithdrawalRequest = (
  requestId: string,
  signerId: string
): WithdrawalRequest | { error: string } => {
  const config = getMultiSigConfig();
  const requests = getWithdrawalRequests();
  const index = requests.findIndex(r => r.id === requestId);

  if (index === -1) {
    return { error: 'Withdrawal request not found' };
  }

  const request = requests[index];

  if (request.status !== 'pending_approval') {
    return { error: 'Can only cancel pending requests' };
  }

  // Only requester or owner can cancel
  const signer = config.signers.find(s => s.id === signerId);
  if (!signer) {
    return { error: 'Not an authorized signer' };
  }

  if (signerId !== request.requestedBy && signer.role !== 'owner') {
    return { error: 'Only the requester or an owner can cancel' };
  }

  request.status = 'cancelled';
  requests[index] = request;
  saveWithdrawalRequests(requests);

  return request;
};

// Get pending withdrawal requests
export const getPendingWithdrawalRequests = (): WithdrawalRequest[] => {
  const requests = getWithdrawalRequests();
  const now = new Date();

  // Check for expired requests and update them
  let hasExpired = false;
  requests.forEach((r, i) => {
    if (r.status === 'pending_approval' && new Date(r.expiresAt) < now) {
      requests[i].status = 'expired';
      hasExpired = true;
    }
  });

  if (hasExpired) {
    saveWithdrawalRequests(requests);
  }

  return requests.filter(r => r.status === 'pending_approval');
};

// Get withdrawal request by ID
export const getWithdrawalRequest = (requestId: string): WithdrawalRequest | null => {
  const requests = getWithdrawalRequests();
  return requests.find(r => r.id === requestId) || null;
};

// Check if a signer has voted on a request
export const hasSignerVoted = (requestId: string, signerId: string): 'approved' | 'rejected' | null => {
  const request = getWithdrawalRequest(requestId);
  if (!request) return null;

  if (request.approvals.some(a => a.signerId === signerId)) return 'approved';
  if (request.rejections.some(r => r.signerId === signerId)) return 'rejected';
  return null;
};

// Get multi-sig stats
export const getMultiSigStats = (): {
  pendingRequests: number;
  totalPendingAmount: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  totalWithdrawnThisMonth: number;
} => {
  const requests = getWithdrawalRequests();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const pending = requests.filter(r => r.status === 'pending_approval');
  const thisMonth = requests.filter(r => new Date(r.requestedAt) >= monthStart);

  return {
    pendingRequests: pending.length,
    totalPendingAmount: pending.reduce((sum, r) => sum + r.amount, 0),
    approvedThisMonth: thisMonth.filter(r => r.status === 'executed').length,
    rejectedThisMonth: thisMonth.filter(r => r.status === 'rejected').length,
    totalWithdrawnThisMonth: thisMonth
      .filter(r => r.status === 'executed')
      .reduce((sum, r) => sum + r.amount, 0),
  };
};

// Export multi-sig service
const multiSigService = {
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
};

export default multiSigService;
