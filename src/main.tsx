import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { LanguageProvider } from "./components/LanguageContext";

// RainbowKit and Wagmi imports
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config/wagmi';

// Create a client for React Query
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider
        theme={darkTheme({
          accentColor: '#06f6ff',
          accentColorForeground: '#000000',
          borderRadius: 'large',
          fontStack: 'system',
        })}
        modalSize="compact"
      >
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
