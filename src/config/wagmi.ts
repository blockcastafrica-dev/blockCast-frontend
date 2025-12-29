import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, mainnet, polygon, arbitrum, bsc } from 'wagmi/chains';

// WalletConnect Project ID - Replace with your own from https://cloud.walletconnect.com
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

export const config = getDefaultConfig({
  appName: 'BlockCast',
  projectId,
  chains: [base, mainnet, polygon, arbitrum, bsc],
  ssr: false,
});

export { base, mainnet, polygon, arbitrum, bsc };
