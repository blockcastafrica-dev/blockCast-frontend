import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, mainnet, polygon, arbitrum, bsc } from 'wagmi/chains';
import { http } from 'wagmi';

// WalletConnect Project ID - Get yours from https://cloud.walletconnect.com
// Using a demo project ID for development - replace with your own for production
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '21fef48091f12692cad574a6f7753643';

export const config = getDefaultConfig({
  appName: 'BlockCast',
  projectId,
  chains: [base, mainnet, polygon, arbitrum, bsc],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [bsc.id]: http(),
  },
  ssr: false,
});

export { base, mainnet, polygon, arbitrum, bsc };
