import { useState, useEffect } from "react";
import { X, Check, ChevronRight, ArrowLeft, Wallet } from "lucide-react";
import blockcastLogo from "@/assets/blockcast logo dark BG.svg";
import phantomLogo from "@/assets/phantom-logo.svg";
import { WalletOkx } from "@web3icons/react";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (wallet: string) => void;
}

type ModalView = 'main' | 'more-wallets' | 'social-login';

// Wallet icons
const walletIcons: Record<string, string | null> = {
  binance: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png?v=029",
  metamask: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
  okx: null, // Using WalletOkx component
  trustwallet: "https://trustwallet.com/assets/images/media/assets/TWT.png",
  coinbase: "https://altcoinsbox.com/wp-content/uploads/2022/12/coinbase-logo.webp",
  phantom: phantomLogo,
};

// Social icons as simple SVG components
const GoogleIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const XIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 71 55" fill="white">
    <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3## 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.0383 50.6034 51.2557 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1099 30.1693C30.1099 34.1136 27.2680 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.7018 30.1693C53.7018 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.751-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472z"/>
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
    { id: 'coinbase', name: 'Coinbase Wallet', icon: walletIcons.coinbase },
  ];

  const moreWallets = [
    { id: 'trustwallet', name: 'Trust Wallet', icon: walletIcons.trustwallet },
    { id: 'okx', name: 'OKX Wallet', icon: walletIcons.okx },
    { id: 'phantom', name: 'Phantom', icon: walletIcons.phantom },
  ];

  const socialProviders = [
    { id: 'google', name: 'Google', icon: GoogleIcon, bgColor: '#fff', textColor: '#000' },
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
                  className={`w-full p-4 border rounded-xl text-left transition-all duration-200 ${
                    agreedToTerms ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
                  }`}
                  style={{ backgroundColor: '#1a1f26', borderColor: '#374151' }}
                  onMouseEnter={(e) => {
                    if (agreedToTerms) {
                      e.currentTarget.style.backgroundColor = '#2a3140';
                      e.currentTarget.style.borderColor = '#06b6d4';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a1f26';
                    e.currentTarget.style.borderColor = '#374151';
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border border-gray-600 flex items-center justify-center bg-white/5">
                        {wallet.id === 'okx' ? (
                          <WalletOkx variant="mono" size={24} color="#fff" />
                        ) : (
                          <img src={wallet.icon} alt={wallet.name} className="w-6 h-6 object-contain" />
                        )}
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
                className="w-full p-4 border rounded-xl text-left transition-all duration-200 cursor-pointer"
                style={{ backgroundColor: '#1a1f26', borderColor: '#374151' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2a3140';
                  e.currentTarget.style.borderColor = '#06b6d4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1f26';
                  e.currentTarget.style.borderColor = '#374151';
                }}
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
                className="w-full p-4 border rounded-xl text-left transition-all duration-200 cursor-pointer"
                style={{ backgroundColor: '#1a1f26', borderColor: '#374151' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2a3140';
                  e.currentTarget.style.borderColor = '#06b6d4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1f26';
                  e.currentTarget.style.borderColor = '#374151';
                }}
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
              {moreWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleWalletConnect(wallet.id)}
                  disabled={!agreedToTerms}
                  className={`w-full p-4 border rounded-xl text-left transition-all duration-200 ${
                    agreedToTerms ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
                  }`}
                  style={{ backgroundColor: '#1a1f26', borderColor: '#374151' }}
                  onMouseEnter={(e) => {
                    if (agreedToTerms) {
                      e.currentTarget.style.backgroundColor = '#2a3140';
                      e.currentTarget.style.borderColor = '#06b6d4';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a1f26';
                    e.currentTarget.style.borderColor = '#374151';
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border border-gray-600 flex items-center justify-center bg-white/5">
                        {wallet.id === 'okx' ? (
                          <WalletOkx variant="mono" size={24} color="#fff" />
                        ) : (
                          <img src={wallet.icon} alt={wallet.name} className="w-6 h-6 object-contain" />
                        )}
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
            <div className="flex flex-col gap-4">
              {/* Login with divider */}
              <div className="flex items-center gap-4 mb-2">
                <div className="flex-1 h-px bg-gray-700"></div>
                <span className="text-gray-400 text-sm">Login with</span>
                <div className="flex-1 h-px bg-gray-700"></div>
              </div>

              {/* Social buttons */}
              <div className="space-y-3">
                {socialProviders.map((provider) => {
                  const Icon = provider.icon;
                  return (
                    <button
                      key={provider.id}
                      onClick={() => handleSocialConnect(provider.id)}
                      disabled={!agreedToTerms}
                      className={`w-full py-4 px-6 rounded-full flex items-center justify-center gap-3 transition-all duration-200 ${
                        agreedToTerms ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
                      }`}
                      style={{
                        backgroundColor: '#1a1f26',
                        border: '1px solid #374151',
                      }}
                      onMouseEnter={(e) => {
                        if (agreedToTerms) {
                          e.currentTarget.style.backgroundColor = '#2a3140';
                          e.currentTarget.style.borderColor = '#06b6d4';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#1a1f26';
                        e.currentTarget.style.borderColor = '#374151';
                      }}
                    >
                      <Icon />
                      <span className="text-white font-medium">{provider.name}</span>
                    </button>
                  );
                })}
              </div>

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
