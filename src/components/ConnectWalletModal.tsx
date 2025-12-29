import { useState, useEffect } from "react";
import { X, Check, ChevronRight, ArrowLeft, Wallet } from "lucide-react";
import blockcastLogo from "@/assets/blockcast logo dark BG.svg";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (wallet: string) => void;
}

type ModalView = 'main' | 'more-wallets' | 'social-login';

// Wallet icons
const walletIcons = {
  binance: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png?v=029",
  metamask: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
  okx: "https://www.okx.com/cdn/assets/imgs/226/DF8E072D3BA65498.png",
  trustwallet: "https://trustwallet.com/assets/images/media/assets/TWT.png",
  coinbase: "https://altcoinsbox.com/wp-content/uploads/2022/12/coinbase-logo.webp",
  phantom: "https://phantom.app/img/phantom-logo.svg",
};

// Social icons as simple SVG components
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#5865F2">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#26A5E4">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

export default function ConnectWalletModal({ isOpen, onClose, onConnect }: ConnectWalletModalProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [detectedWallets, setDetectedWallets] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<ModalView>('main');

  // Detect available wallets
  useEffect(() => {
    const detected: string[] = [];
    if (typeof window !== 'undefined') {
      if ((window as any).ethereum?.isMetaMask) detected.push('metamask');
      if ((window as any).BinanceChain) detected.push('binance');
      if ((window as any).okxwallet) detected.push('okx');
      if ((window as any).trustwallet) detected.push('trustwallet');
      if ((window as any).coinbaseWalletExtension) detected.push('coinbase');
      if ((window as any).phantom?.solana) detected.push('phantom');
    }
    setDetectedWallets(detected);
  }, []);

  // Reset view when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentView('main');
    }
  }, [isOpen]);

  const handleWalletConnect = (wallet: string) => {
    if (!agreedToTerms) return;
    onConnect(wallet);
  };

  const handleSocialConnect = (provider: string) => {
    if (!agreedToTerms) return;
    onConnect(`social-${provider}`);
  };

  const resetAndClose = () => {
    setCurrentView('main');
    setAgreedToTerms(false);
    onClose();
  };

  const mainWallets = [
    { id: 'binance', name: 'Binance Wallet', icon: walletIcons.binance },
    { id: 'metamask', name: 'MetaMask', icon: walletIcons.metamask },
    { id: 'okx', name: 'OKX Wallet', icon: walletIcons.okx },
  ];

  const moreWallets = [
    { id: 'trustwallet', name: 'Trust Wallet', icon: walletIcons.trustwallet },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: walletIcons.coinbase },
    { id: 'phantom', name: 'Phantom', icon: walletIcons.phantom },
  ];

  const socialProviders = [
    { id: 'google', name: 'Google', icon: GoogleIcon, bgColor: '#fff', textColor: '#000' },
    { id: 'apple', name: 'Apple', icon: AppleIcon, bgColor: '#000', textColor: '#fff' },
    { id: 'twitter', name: 'X (Twitter)', icon: XIcon, bgColor: '#000', textColor: '#fff' },
    { id: 'discord', name: 'Discord', icon: DiscordIcon, bgColor: '#5865F2', textColor: '#fff' },
    { id: 'telegram', name: 'Telegram', icon: TelegramIcon, bgColor: '#26A5E4', textColor: '#fff' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99998,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={resetAndClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 99999,
          backgroundColor: '#0f1419',
          borderRadius: '16px',
          border: '1px solid #1f2937',
          width: '95%',
          maxWidth: '480px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b border-gray-800"
          style={{ padding: '16px' }}
        >
          <div className="flex items-center gap-3">
            {currentView !== 'main' && (
              <button
                type="button"
                onClick={() => setCurrentView('main')}
                className="p-1"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
            )}
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">
                {currentView === 'main' && 'Connect Wallet'}
                {currentView === 'more-wallets' && 'More Wallets'}
                {currentView === 'social-login' && 'Social Login'}
              </h2>
              <p className="text-gray-500 text-xs">
                {currentView === 'main' && 'Choose how to connect'}
                {currentView === 'more-wallets' && 'Select from more options'}
                {currentView === 'social-login' && 'Connect with social account'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="h-9 w-9 p-0 flex items-center justify-center rounded-xl border-2 border-transparent transition-all group"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#06f6ff';
              e.currentTarget.style.backgroundColor = '#1a1f26';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X className="h-5 w-5 text-gray-400 group-hover:text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Main View */}
          {currentView === 'main' && (
            <div className="space-y-3">
              {/* Wallet Section Label */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-500 text-xs uppercase tracking-wider">Connect Wallet</span>
                <div className="flex-1 h-px bg-gray-800"></div>
              </div>

              {/* Wallet Options */}
              {mainWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleWalletConnect(wallet.id)}
                  disabled={!agreedToTerms}
                  className={`w-full p-4 bg-[#1a1f26] border border-gray-700 rounded-xl text-left transition-colors ${
                    agreedToTerms ? 'hover:border-cyan-500/50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border border-gray-600 flex items-center justify-center bg-white/5">
                        <img src={wallet.icon} alt={wallet.name} className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-white font-medium">{wallet.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {detectedWallets.includes(wallet.id) && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded-full border border-emerald-500/30">
                          Detected
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                </button>
              ))}

              {/* More Wallets Button */}
              <button
                onClick={() => setCurrentView('more-wallets')}
                className="w-full p-4 bg-[#1a1f26] border border-gray-700 rounded-xl text-left hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border border-gray-600 flex items-center justify-center">
                      <span className="text-gray-400 text-lg">+</span>
                    </div>
                    <span className="text-white font-medium">More Wallets</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </div>
              </button>

              {/* OR Divider */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-gray-800"></div>
                <span className="text-gray-600 text-xs uppercase">or</span>
                <div className="flex-1 h-px bg-gray-800"></div>
              </div>

              {/* Social Login Button */}
              <button
                onClick={() => setCurrentView('social-login')}
                className="w-full p-4 bg-[#1a1f26] border border-gray-700 rounded-xl text-left hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border border-gray-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <span className="text-white font-medium">Login with Social Account</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </div>
              </button>

              {/* Terms Checkbox */}
              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  className="w-5 h-5 rounded flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: agreedToTerms ? '#06f6ff' : 'transparent',
                    border: agreedToTerms ? 'none' : '2px solid #444',
                  }}
                >
                  {agreedToTerms && <Check className="w-3.5 h-3.5" style={{ color: '#000000' }} />}
                </button>
                <span className="text-sm text-gray-400">
                  I agree to the{' '}
                  <a href="/privacy" className="text-cyan-400 hover:underline">Privacy</a>
                  {' '}and{' '}
                  <a href="/terms" className="text-cyan-400 hover:underline">Terms of Use</a>
                </span>
              </div>

              {!agreedToTerms && (
                <p className="text-center text-xs text-gray-600">
                  Please agree to the terms to continue
                </p>
              )}
            </div>
          )}

          {/* More Wallets View */}
          {currentView === 'more-wallets' && (
            <div className="space-y-3">
              {[...mainWallets, ...moreWallets].map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleWalletConnect(wallet.id)}
                  disabled={!agreedToTerms}
                  className={`w-full p-4 bg-[#1a1f26] border border-gray-700 rounded-xl text-left transition-colors ${
                    agreedToTerms ? 'hover:border-cyan-500/50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border border-gray-600 flex items-center justify-center bg-white/5">
                        <img src={wallet.icon} alt={wallet.name} className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-white font-medium">{wallet.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {detectedWallets.includes(wallet.id) && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded-full border border-emerald-500/30">
                          Detected
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                </button>
              ))}

              {/* Terms reminder */}
              {!agreedToTerms && (
                <p className="text-center text-xs text-gray-600 pt-2">
                  Go back and agree to terms to connect
                </p>
              )}
            </div>
          )}

          {/* Social Login View */}
          {currentView === 'social-login' && (
            <div className="space-y-3">
              {socialProviders.map((provider) => {
                const Icon = provider.icon;
                return (
                  <button
                    key={provider.id}
                    onClick={() => handleSocialConnect(provider.id)}
                    disabled={!agreedToTerms}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      agreedToTerms ? 'cursor-pointer hover:opacity-90' : 'opacity-50 cursor-not-allowed'
                    }`}
                    style={{
                      backgroundColor: provider.bgColor,
                      border: provider.id === 'google' ? '1px solid #e5e7eb' : '1px solid transparent',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon />
                        <span className="font-medium" style={{ color: provider.textColor }}>
                          Continue with {provider.name}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5" style={{ color: provider.textColor, opacity: 0.5 }} />
                    </div>
                  </button>
                );
              })}

              {/* Terms reminder */}
              {!agreedToTerms && (
                <p className="text-center text-xs text-gray-600 pt-2">
                  Go back and agree to terms to connect
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
