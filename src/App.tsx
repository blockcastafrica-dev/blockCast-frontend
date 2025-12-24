import { useState, useEffect } from 'react';
import { LanguageProvider } from '@/components/LanguageContext';
import { createBrowserRouter, RouterProvider as ReactRouterProvider, Outlet } from 'react-router-dom';
import TopNavigation from '@/components/TopNavigation';
import Footer from '@/components/Footer';
import BettingMarkets from '@/components/BettingMarkets';
import BettingPortfolio from '@/components/BettingPortfolio';
import About from '@/components/About';
import Contact from '@/components/Contact';
import PrivacyPolicy from '@/components/PrivacyPolicy';
import TermsOfService from '@/components/TermsOfService';
import Onboarding from '@/components/Onboarding';
import VerificationInput from '@/components/VerificationInput';
import VerificationResults from '@/components/VerificationResults';
import VerificationHistory from '@/components/VerificationHistory';
import Settings from '@/components/Settings';
import MarketPage from '@/components/MarketPage';
import Categories from '@/components/Categories';
import { BettingMarket } from '@/components/BettingMarkets';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Gift, Sparkles, Wallet, Shield, Target, Zap, Users } from 'lucide-react';
import MarketDetailsPage from '@/pages/MarketDetailsPage';
import CommunityHub from '@/pages/CommunityHub';
// Import the new page components
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsOfServicePage from '@/pages/TermsOfServicePage';
import HelpCenterPage from '@/pages/HelpCenterPage';
// Import browser-compatible database functions
import { getUser, createUser, getAllMarkets, getUserBets, createBet, createVerification, getUserVerifications, updateUser } from '@/utils/browserDB';

// Define interfaces
interface UserProfile {
  id: string;
  balance: number;
  totalBets: number;
  totalWinnings: number;
  verificationCount: number;
  level: string;
  isNew: boolean;
}

interface UserBet {
  id: string;
  marketId: string;
  marketClaim?: string;
  position: 'yes' | 'no';
  amount: number;
  odds?: number;
  potentialWinning?: number;
  potentialReturn?: number;
  placedAt: Date;
  status: 'active' | 'won' | 'lost' | 'pending';
  resolvedAt?: Date;
  actualWinning?: number;
  expiresAt?: Date;
}

interface VerificationResult {
  id: string;
  claim: string;
  verdict: 'true' | 'false' | 'mixed' | 'unverified';
  confidence: number;
  aiAnalysis: string;
  sources: {
    title: string;
    url: string;
    credibility: number;
  }[];
  blockchainHash: string;
  timestamp: Date;
  verificationTime: number;
}

// Simplified utility functions
const generateUserId = () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const formatCurrency = (amount: number): string => {
  return `${amount.toFixed(3)}`;
};

const isValidPage = (tab: string): boolean => {
  const validPages = [
    'markets', 'market-detail', 'portfolio', 'verify', 'social-hub', 
    'settings', 'about', 'contact', 'categories',
    'privacy', 'terms'
  ];
  return validPages.includes(tab);
};

const shouldShowOnboarding = (): boolean => {
  return !localStorage.getItem('blockcast_onboarded');
};

const markOnboardingComplete = (): void => {
  localStorage.setItem('blockcast_onboarded', 'true');
};

const initializeDarkMode = (): boolean => {
  const stored = localStorage.getItem('blockcast_dark_mode');
  const isDark = stored !== null ? stored === 'true' : true;
  document.documentElement.classList.toggle('dark', isDark);
  return isDark;
};

const toggleDarkMode = (current: boolean): boolean => {
  const newMode = !current;
  localStorage.setItem('blockcast_dark_mode', newMode.toString());
  document.documentElement.classList.toggle('dark', newMode);
  return newMode;
};

// Router Layout Component
const RouterLayout = ({ userProfile, isDarkMode, handleToggleDarkMode }: { 
  userProfile: UserProfile | null, 
  isDarkMode: boolean, 
  handleToggleDarkMode: () => void 
}) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavigation
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        userBalance={userProfile?.balance || 0}
      />

      <main className="flex-1 container mx-auto px-4 py-6 lg:px-8 pb-20 lg:pb-6"> {/*  max-w-7xl removed */}
        <Outlet />
      </main>

      <Footer />
      <Toaster />
    </div>
  );
};

export default function App() {
  // Core state
  const [currentTab, setCurrentTab] = useState('markets');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // User state
  const [userId] = useState(generateUserId());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const [markets, setMarkets] = useState<BettingMarket[]>([]);
  
  // Verification state
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationHistory, setVerificationHistory] = useState<VerificationResult[]>([]);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Market page state
  const [selectedMarket, setSelectedMarket] = useState<BettingMarket | null>(null);

  // Initialize app on mount
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    setIsLoading(true);
    
    try {
      // Initialize dark mode
      const darkModeEnabled = initializeDarkMode();
      setIsDarkMode(darkModeEnabled);
      
      // Check onboarding status
      const needsOnboarding = shouldShowOnboarding();
      setShowOnboarding(needsOnboarding);
      
      // Fetch markets from database
      const dbMarkets = getAllMarkets();
      // Convert database markets to BettingMarket format
      const formattedMarkets = dbMarkets.map((market: any) => ({
        id: market.id,
        claim: market.claim,
        category: market.category,
        subcategory: market.subcategory,
        source: market.source,
        description: market.description,
        totalPool: market.total_pool,
        yesPool: market.yes_pool,
        noPool: market.no_pool,
        yesOdds: market.yes_odds,
        noOdds: market.no_odds,
        totalCasters: market.total_casters,
        expiresAt: new Date(market.expires_at),
        status: market.status,
        trending: market.trending === 1,
        country: market.country,
        region: market.region,
        marketType: market.market_type,
        confidenceLevel: market.confidence_level,
        imageUrl: market.image_url
      }));
      setMarkets(formattedMarkets);
      
      // Check if user exists in database, create if not
      let user = getUser(userId);
      if (!user) {
        createUser(userId);
        user = getUser(userId);
      }
      
      // Initialize user profile
      const profile: UserProfile = {
        id: userId,
        balance: user.balance || 1.0,
        totalBets: user.total_bets || 0,
        totalWinnings: user.total_winnings || 0,
        verificationCount: user.verification_count || 0,
        level: user.level || 'Novice Verifier',
        isNew: !localStorage.getItem('blockcast_welcomed')
      };
      
      setUserProfile(profile);
      
      // Fetch user bets from database
      const dbBets = getUserBets(userId);
      // Convert database bets to UserBet format
      const formattedBets = dbBets.map((bet: any) => ({
        id: bet.id,
        marketId: bet.market_id,
        position: bet.position,
        amount: bet.amount,
        placedAt: new Date(bet.placed_at),
        status: bet.status,
        potentialReturn: bet.potential_return
      }));
      setUserBets(formattedBets);
      
      // Fetch user verifications from database
      const dbVerifications = getUserVerifications(userId);
      setVerificationHistory(dbVerifications);
      
      // Show welcome for new users
      if (profile.isNew && !needsOnboarding) {
        setShowWelcomeDialog(true);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      toast.error('Failed to initialize application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle navigation changes
  const handleTabChange = (tab: string) => {
    if (isValidPage(tab)) {
      setCurrentTab(tab);
      setSelectedMarket(null);
      if (tab !== 'verify') {
        setVerificationResult(null);
      }
    }
  };

  // Handle back from market page
  const handleBackFromMarket = () => {
    setSelectedMarket(null);
    setCurrentTab('markets');
  };

  // Handle dark mode toggle
  const handleToggleDarkMode = () => {
    const newMode = toggleDarkMode(isDarkMode);
    setIsDarkMode(newMode);
  };

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    markOnboardingComplete();
    setShowOnboarding(false);
    setShowWelcomeDialog(true);
  };

  // Handle welcome bonus claim
  const handleClaimWelcomeBonus = () => {
    localStorage.setItem('blockcast_welcomed', 'true');
    setShowWelcomeDialog(false);
    toast.success('Welcome to Blockcast! Your account is ready for truth verification.');
  };

  // Handle truth verification
  const handleVerifyTruth = async (claim: string) => {
    if (!claim || claim.trim().length < 10) {
      toast.error('Please enter a claim of at least 10 characters');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);
    
    const loadingMessages = [
      'Analyzing claim credibility...',
      'Cross-referencing African news sources...',
      'Consulting fact-checking databases...',
      'Evaluating evidence patterns...',
      'Generating verification report...'
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      setLoadingMessage(loadingMessages[messageIndex % loadingMessages.length]);
      messageIndex++;
    }, 800);

    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newVerification: any = {
        id: `verification_${Date.now()}`,
        user_id: userId,
        claim: claim,
        result: {
          id: `verification_${Date.now()}`,
          claim: claim,
          verdict: Math.random() > 0.5 ? 'true' : 'false',
          confidence: Math.floor(Math.random() * 40 + 60), // 60-100%
          aiAnalysis: 'This verification uses AI-powered fact-checking combined with community consensus to determine truth. Multiple credible African news sources were analyzed to reach this conclusion.',
          sources: [
            { title: 'African Union News Network', url: 'https://au-news.org', credibility: 96 },
            { title: 'Reuters Africa', url: 'https://reuters.com/africa', credibility: 94 },
            { title: 'BBC Africa', url: 'https://bbc.com/africa', credibility: 92 },
            { title: 'Al Jazeera Africa', url: 'https://aljazeera.com/africa', credibility: 90 }
          ],
          blockchainHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          timestamp: new Date(),
          verificationTime: Math.floor(Math.random() * 3000) + 1000
        },
        created_at: new Date().toISOString()
      };
      
      // Save verification to database
      createVerification(newVerification);
      
      setVerificationResult(newVerification.result);
      
      // Update user profile with reward
      if (userProfile) {
        const reward = 0.005; // Small reward for verification
        const updatedProfile = {
          ...userProfile,
          balance: userProfile.balance + reward,
          verificationCount: userProfile.verificationCount + 1
        };
        setUserProfile(updatedProfile);
        
        // Update user in database
        updateUser(userId, {
          balance: updatedProfile.balance,
          verification_count: updatedProfile.verificationCount
        });
      }

      // Update verification history
      setVerificationHistory(prev => [newVerification.result, ...prev.slice(0, 19)]);
      
      toast.success('Truth verification completed! You earned a verification reward.');
      
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      clearInterval(messageInterval);
      setIsVerifying(false);
      setLoadingMessage('');
    }
  };

  // Handle verification history selection
  const handleSelectVerification = (result: VerificationResult) => {
    setVerificationResult(result);
    setCurrentTab('verify');
    toast.success('Verification result loaded');
  };

  // Handle betting/casting
  const handlePlaceBet = async (marketId: string, position: 'yes' | 'no', amount: number) => {
    if (!userProfile || amount > userProfile.balance) {
      toast.error('Insufficient balance');
      return;
    }

    // Simulate betting delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create new bet
    const market = markets.find(m => m.id === marketId);
    if (!market) return;

    const newBet: any = {
      id: `bet_${Date.now()}`,
      user_id: userId,
      market_id: marketId,
      position: position,
      amount: amount,
      placed_at: new Date().toISOString(),
      status: 'active',
      potential_return: amount * (position === 'yes' ? market.yesOdds : market.noOdds)
    };
    
    // Save bet to database
    createBet(newBet);
    
    // Convert to UserBet format for state
    const formattedBet: UserBet = {
      id: newBet.id,
      marketId: newBet.market_id,
      marketClaim: market.claim,
      position: newBet.position,
      amount: newBet.amount,
      odds: position === 'yes' ? market.yesOdds : market.noOdds,
      potentialWinning: newBet.potential_return,
      placedAt: new Date(newBet.placed_at),
      status: newBet.status
    };
    
    setUserBets(prev => [formattedBet, ...prev]);
    
    // Update user profile
    const updatedProfile = {
      ...userProfile,
      balance: userProfile.balance - amount,
      totalBets: userProfile.totalBets + 1
    };
    setUserProfile(updatedProfile);
    
    // Update user in database
    updateUser(userId, {
      balance: updatedProfile.balance,
      total_bets: updatedProfile.totalBets
    });

    toast.success('Truth position cast successfully!');
  };

  // Handle category selection
  const handleSelectCategory = (categoryId: string) => {
    // Filter markets by category when implementing category filtering
    toast.success(`Selected ${categoryId} category`);
  };

  // Enhanced Router Provider with database integration
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RouterLayout userProfile={userProfile} isDarkMode={isDarkMode} handleToggleDarkMode={handleToggleDarkMode} />,
      children: [
        {
          path: "/",
          element: (
            <BettingMarkets 
              onPlaceBet={handlePlaceBet} 
              userBalance={userProfile?.balance || 0}
            />
          )
        },
        // {
        //   path: "/verify-truth",
        //   element: (
        //     <div className="space-y-6 max-w-4xl mx-auto">
        //       <VerificationInput 
        //         onSubmit={handleVerifyTruth}
        //         isLoading={isVerifying}
        //       />
        //       {verificationResult && (
        //         <VerificationResults 
        //           result={verificationResult}
        //           onNewVerification={() => setVerificationResult(null)}
        //         />
        //       )}
        //     </div>
        //   )
        // },
        {
          path: "/community-hub",
          element: <CommunityHub />
        },
        {
          path: "/settings",
          element: (
            <Settings 
              isDarkMode={isDarkMode} 
              onToggleDarkMode={handleToggleDarkMode}
              userBalance={userProfile?.balance || 0}
              userBets={userBets}
              verificationHistory={verificationHistory}
              onSelectVerification={handleSelectVerification}
            />
          )
        },
        {
          path: "/portfolio",
          element: <BettingPortfolio userBets={userBets} userBalance={userProfile?.balance || 0} />
        },
        {
          path: "/categories",
          element: <Categories onSelectCategory={handleSelectCategory} />
        },
        {
          path: "/market/:marketId",
          element: <MarketDetailsPage />
        },
        // Updated routes for dedicated page components
        {
          path: "/about",
          element: <AboutPage />
        },
        {
          path: "/contact",
          element: <ContactPage />
        },
        {
          path: "/privacy",
          element: <PrivacyPolicyPage />
        },
        {
          path: "/terms",
          element: <TermsOfServicePage />
        },
        {
          path: "/help",
          element: <HelpCenterPage />
        }
      ]
    }
  ]);

  // Show onboarding if needed
  if (showOnboarding) {
    return (
      <LanguageProvider>
        <div className="min-h-screen bg-background">
          <Onboarding onComplete={handleOnboardingComplete} />
          <Toaster />
        </div>
      </LanguageProvider>
    );
  }

  if (isLoading) {
    return (
      <LanguageProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3>Loading Blockcast...</h3>
            <p className="text-muted-foreground">
              Connecting to African truth verification network
            </p>
          </div>
        </div>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <ReactRouterProvider router={router} />
      
      {/* Welcome Dialog */}
      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center gap-3 justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
                Welcome to Blockcast!
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <span className="text-muted-foreground block">
              You've successfully joined Africa's premier truth verification platform! 
              Your account is ready to start verifying truth and casting positions.
            </span>
            
            <div className="p-6 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg border border-primary/30">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
                  <Wallet className="h-8 w-8" />
                  {formatCurrency(userProfile?.balance || 1.0)} USDT
                </div>
                <span className="text-sm text-muted-foreground">Starting Balance</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />image.png
                <span>Verify Truth</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4 text-secondary" />
                <span>Cast Positions</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-4 w-4 text-green-500" />
                <span>Earn Rewards</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 text-yellow-500" />
                <span>Join Community</span>
              </div>
            </div>
          </div>
          
          <Button onClick={handleClaimWelcomeBonus} className="w-full mt-4 gap-2">
            <Sparkles className="h-4 w-4" />
            Start Verifying Truth
          </Button>
        </DialogContent>
      </Dialog>

      {/* Toast Notifications */}
      <Toaster />
    </LanguageProvider>
  );
}

