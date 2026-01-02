import { useState } from "react";
import bnbChainLogo from "@/assets/bnb-bnb-logo.svg";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  Menu,
  Shield,
  Settings,
  Moon,
  Sun,
  TrendingUp,
  Wallet,
  Bell,
  Users,
  Languages,
  ChevronDown,
  Search,
  HandCoins,
  BriefcaseBusiness,
  History,
  User,
  Copy,
  Check,
  LogOut,
  Newspaper,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useLanguage } from "./LanguageContext";
import { useNavigate, useLocation } from "react-router-dom";
import blockcastLogo from "@/assets/4714a7efb088ecf7991d3a7cb494d86ff45fc844.png";
import FooterAccordion from './FooterAccordion';
import NavAccordion from "./NavAccordion";
import FundWalletModal from "./FundWalletModal";
import WithdrawWallet from "./WithdrawWallet";
import ConnectWalletModal from "./ConnectWalletModal";
import { BsTwitterX } from "react-icons/bs";
import { FaDiscord, FaTiktok, FaTelegramPlane } from "react-icons/fa";
import geminiLogo from "@/assets/gemini-logo-2025.svg";
import { TokenUSDT } from '@web3icons/react';

interface TopNavigationProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  userBalance: number;
}

export default function TopNavigation({
  isDarkMode,
  onToggleDarkMode,
  userBalance,
}: TopNavigationProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isWithdrawalVisible, setIsWithdrawalVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConnectWallet, setShowConnectWallet] = useState(false);

  // Generate or get wallet address (in real app, this would come from wallet connection)
  const walletAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";

  // Copy wallet address to clipboard
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Format wallet address for display (shortened)
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Simplified main navigation - only core features
  const mainNavItems = [
    { id: "markets", label: "Truth Markets", icon: TrendingUp, path: "/" },
    // {
    //   id: "verify",
    //   label: "Verify Truth",
    //   icon: Shield,
    //   path: "/verify-truth",
    // },
    {
      id: "news-room",
      label: "News Room",
      icon: Newspaper,
      path: "/news-room",
    },
  ];

  const languageOptions = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "sw", name: "Kiswahili", flag: "🇰🇪" },
  ];

  const handleNavClick = (path: string = "", activeTab: string = "") => {
    navigate(path, { state: { active: `${activeTab}` } });
    setShowMobileMenu(false);
    // console.log('Navigating to:', path, 'Active Tab:', activeTab);
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleConnectWalletClick = () => {
    setShowConnectWallet(true);
  };

  const handleWalletConnect = (wallet: string) => {
    // Simulate wallet connection - in real app, this would connect to the actual wallet
    console.log('Connecting to wallet:', wallet);
    setIsLoggedIn(true);
    setShowConnectWallet(false);
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-16 items-center justify-between px-4 container mx-auto lg:px-8">
          {" "}
          {/* .container .max-w-7xl --removed*/}
          {/* Left: Logo and Brand */}
          <div className="flex items-center gap-4 md:gap-5 lg:gap-6">
            <div className="flex items-center gap-2 md:gap-2.5 lg:gap-3">
              <button
                onClick={handleLogoClick}
                className="flex items-center gap-2 md:gap-2.5 lg:gap-3 hover:opacity-80 transition-opacity focus:outline-none cursor-pointer"
                aria-label="Go to Truth Markets"
              >
                <img
                  src={blockcastLogo}
                  alt="Blockcast Logo"
                  className="w-7 md:w-8 lg:w-8 h-7 md:h-8 lg:h-8 rounded-lg"
                />
                <div>
                  <h1 className="text-base md:text-lg lg:text-lg font-bold">Blockcast</h1>
                </div>
              </button>
            </div>

            {/* Desktop Navigation Links - Simplified */}
            <nav className="hidden lg:flex items-center space-x-0.5 md:space-x-1 lg:space-x-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.path)}
                    className="flex items-center gap-1.5 md:gap-2 lg:gap-2 px-3 md:px-4 lg:px-4 py-2 h-9 md:h-10 lg:h-10 cursor-pointer text-sm md:text-base lg:text-base transition-colors"
                    style={{ color: '#9ca3af' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#22d3ee';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#9ca3af';
                    }}
                  >
                    <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-4 lg:w-4" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          {/* Right: User Actions - Simplified */}
          <div className="flex items-center gap-2 md:gap-2.5 lg:gap-3">
            {/* Language Selector - Compact */}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 px-2 py-1 cursor-pointer"
                >
                  <Languages className="h-4 w-4" />
                  <span className="hidden lg:inline text-xs">
                    {languageOptions.find((l) => l.code === language)?.flag}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languageOptions.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className={language === lang.code ? "bg-primary/10" : ""}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu> */}

            {/* Balance (Desktop) - Only show when logged in */}
            {isLoggedIn && (
              <div
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer transition-all"
                style={{ border: '2px solid transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.border = '2px solid #22d3ee'}
                onMouseLeave={(e) => e.currentTarget.style.border = '2px solid transparent'}
                onClick={() => handleNavClick("/settings", "wallet")}
              >
                <TokenUSDT variant="mono" size={20} color="#FFFFFF" />
                <span className="text-sm font-semibold text-foreground">
                  {userBalance.toFixed(3)}
                </span>
              </div>
            )}

            {/* Deposit Button - Show when logged in (Desktop only) */}
            {isLoggedIn && (
              <Button
                onClick={() => setIsVisible(true)}
                size="sm"
                variant="outline"
                className="hidden lg:flex gap-1.5 md:gap-2 lg:gap-2 px-4 md:px-5 lg:px-6 py-1.5 md:py-2 lg:py-2 h-9 md:h-10 lg:h-10 text-xs md:text-sm lg:text-sm cursor-pointer rounded-full text-white hover:text-white hover:bg-transparent"
                style={{ border: '2px solid transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.border = '2px solid #22d3ee'}
                onMouseLeave={(e) => e.currentTarget.style.border = '2px solid transparent'}
              >
                <span className="font-medium">+ Deposit</span>
              </Button>
            )}

            {/* Notifications - Only show when logged in */}
            {isLoggedIn && (
              <Button
                variant="ghost"
                size="sm"
                className="relative p-2 cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-secondary text-secondary-foreground text-xs flex items-center justify-center">
                  3
                </Badge>
              </Button>
            )}

            {/* Conditional rendering based on login state */}
            {!isLoggedIn ? (
              // Logged out state - show Connect Wallet button
              <div className="flex items-center gap-4">
                <img
                  src={bnbChainLogo}
                  alt="BNB Chain"
                  className="h-7 w-7 md:h-8 md:w-8"
                />
                <button
                  onClick={handleConnectWalletClick}
                  className="flex items-center gap-2 px-4 md:px-5 lg:px-6 py-2 md:py-2.5 rounded-full text-sm md:text-base font-medium transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: '#06f6ff', color: '#000000' }}
                >
                  <Wallet className="h-4 w-4 md:h-5 md:w-5" />
                  Connect Wallet
                </button>
              </div>
            ) : (
              // Logged in state - show user avatar dropdown
              <div className="hidden lg:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="gap-2 px-2 py-1 cursor-pointer"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          JD
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-2 p-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          JD
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">John Doe</p>
                        <button
                          onClick={handleCopyAddress}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <span className="font-mono">{formatAddress(walletAddress)}</span>
{copied ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleNavClick("/settings", "profile")}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleNavClick("/settings", "portfolio")}
                    >
                      <History className="h-4 w-4 mr-2" />
                      Activity
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleNavClick("/settings", "wallet")}
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      My Wallet
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleNavClick("/settings")}>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden">
              <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                {/* <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger> */}
                <SheetContent side="right" className="w-80">
                  <SheetHeader className="pb-6">
                    {/* <SheetTitle className="flex items-center gap-2">
                      <button
                        onClick={handleLogoClick}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
                      >
                        <img
                          src={blockcastLogo}
                          alt="Blockcast Logo"
                          className="w-6 h-6 rounded"
                        />
                        Blockcast
                      </button>
                    </SheetTitle> */}
                  </SheetHeader>

                  {/* Logged In State */}
                  {isLoggedIn ? (
                    <>
                      {/* User Profile Section */}
                      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            JD
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">John Doe</p>
                          <button
                            onClick={handleCopyAddress}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            <span className="font-mono">{formatAddress(walletAddress)}</span>
{copied ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNavClick("/settings")}
                          className="p-2 h-8 w-8 cursor-pointer mr-2"
                          aria-label="Settings"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>

                        </div>

                      {/* Balance */}
                      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-5 w-5 text-primary" />
                          <span className="font-medium">Balance</span>
                        </div>
                        <span className="font-bold text-primary">
                          {userBalance.toFixed(3)} USDT
                        </span>
                      </div>

                      <div
                        onClick={() => handleNavClick("/settings", "profile")}
                        className="flex items-center gap-2 px-2 ml-2 cursor-pointer"
                      >
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-md text-muted-foreground">
                          Profile
                        </span>
                      </div>

                      <div
                        onClick={() => handleNavClick("/settings", "portfolio")}
                        className="flex items-center gap-2 px-2 ml-2 cursor-pointer"
                      >
                        <History className="size-4 text-primary" />
                        <span className="text-md text-muted-foreground">
                          Activity
                        </span>
                      </div>

                      <div
                        onClick={() => handleNavClick("/settings", "wallet")}
                        className="flex items-center gap-2 px-2 ml-2 cursor-pointer"
                      >
                        <Wallet className="h-4 w-4 text-primary" />
                        <span className="text-md text-muted-foreground">
                          My Wallet
                        </span>
                      </div>
                    </>
                  ) : (
                    /* Logged Out State */
                    <>
                      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1">Welcome to Blockcast</p>
                          <p className="text-xs text-muted-foreground">Connect your wallet to get started</p>
                        </div>
                      </div>

                      {/* Connect Wallet Button */}
                      <div className="flex px-4 py-2 items-center gap-4">
                        <img
                          src={bnbChainLogo}
                          alt="BNB Chain"
                          className="h-7 w-7"
                        />
                        <button
                          onClick={() => {
                            setShowMobileMenu(false);
                            setShowConnectWallet(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 hover:opacity-90"
                          style={{ backgroundColor: '#06f6ff', color: '#000000' }}
                        >
                          <Wallet className="h-4 w-4" />
                          Connect Wallet
                        </button>
                      </div>
                    </>
                  )}

                  {/* Support & Legal Links */}
                  <div className="mt-4">
                    <FooterAccordion
                      handleLinkClick={(page) => {
                        handleNavClick(`/${page}`);
                      }}
                      enableMobileHover={true}
                    />
                  </div>

                  {/* Social Media Links - Mobile Only */}
                  <div className="mt-4 px-2">
                    <h4 className="text-sm font-semibold mb-3 text-foreground">Connect With Us</h4>
                    <div className="flex items-center gap-3">
                      <Button
                        {...({} as any)}
                        variant="ghost"
                        size="sm"
                        className="p-2 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => window.open('https://x.com/BlockCastLive', '_blank')}
                      >
                        <BsTwitterX className="h-5 w-5" />
                      </Button>
                      <Button
                        {...({} as any)}
                        variant="ghost"
                        size="sm"
                        className="p-2 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <FaDiscord className="h-5 w-5" />
                      </Button>
                      <Button
                        {...({} as any)}
                        variant="ghost"
                        size="sm"
                        className="p-2 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <FaTiktok className="h-5 w-5" />
                      </Button>
                      <Button
                        {...({} as any)}
                        variant="ghost"
                        size="sm"
                        className="p-2 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <FaTelegramPlane className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Powered by AI section */}
                  <div className="mt-6 px-2">
                    <div className="flex items-center gap-2 text-base text-white">
                      <span>Powered by</span>
                      <img src={geminiLogo} alt="Gemini" className="h-4" />
                      <span>&</span>
                      <div className="flex items-center gap-1.5">
                        <svg className="h-4 w-4" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M101.008 42L190.99 124.905L190.99 124.886L190.99 42.1913H208.506L208.506 125.276L298.891 42V136.524L336 136.524V272.866H299.005V357.035L208.506 277.525L208.506 357.948H190.99L190.99 278.836L101.11 358V272.866H64V136.524H101.008V42ZM177.785 153.826H81.5159V255.564H101.088V223.472L177.785 153.826ZM118.625 231.149V319.392L190.99 255.655L190.99 165.421L118.625 231.149ZM209.01 254.812V165.336L281.396 231.068V272.866H281.489V318.491L209.01 254.812ZM299.005 255.564H318.484V153.826L222.932 153.826L299.005 222.751V255.564ZM281.375 136.524V81.7983L221.977 136.524L281.375 136.524ZM177.921 136.524H118.524V81.7983L177.921 136.524Z" fill="white"/>
                        </svg>
                        <span>Perplexity</span>
                      </div>
                    </div>
                  </div>

                  {/* Settings dropdown menu */}
                  {/* <NavAccordion
                    handleLinkClick={(page) => {
                      handleNavClick("/settings", page);
                    }}
                    data={[
                      { label: "Profile", page: "profile" },
                      { label: "Portfolio", page: "portfolio" },
                      { label: "History", page: "history" },
                    ]}
                    accordionTitle={"Settings"}
                  /> */}

                  {isLoggedIn && (
                    <div className="fixed bottom-0 mb-6">
                      {/* Language Selector Mobile */}
                      {/* <div className="mt-3">
                        <Select
                          value={language}
                          onValueChange={(value) => setLanguage(value as any)}
                        >
                          <SelectTrigger>
                            <Languages className="h-4 w-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {languageOptions.map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                <span className="mr-2">{lang.flag}</span>
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div> */}

                      {/* Log Out */}
                      <div
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-2 ml-2 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 text-primary" />
                        <span className="text-md text-muted-foreground">
                          Log Out
                        </span>
                      </div>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation - Only Core Features */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-t border-border/40">
        <div
          className="flex flex-row justify-between items-center p-2 w-full"
          style={{ height: "70px" }}
        >
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => handleNavClick(item.path)}
                className={`flex flex-col items-center justify-center gap-1 h-16 px-2 ${
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground"
                }`}
                style={{
                  flex: "1",
                  minWidth: "70px",
                  minHeight: "60px",
                  padding: "12px 5px",
                  margin: "0 2px",
                }}
              >
                <Icon className="h-6 w-6" />
                <span
                  className="text-xs font-medium truncate"
                  style={{ fontSize: "12px" }}
                >
                  {item.label.split(" ")[0]}
                </span>
                {/* {active && (
                  <div className="w-6 h-1 bg-primary rounded-full" />
                )} */}
              </Button>
            );
          })}
          <Button
            variant="ghost"
            onClick={() => {
              // If we're already on the home page, focus the search input
              if (location.pathname === "/") {
                // Scroll to top to ensure the search input is visible
                window.scrollTo({ top: 0, behavior: "smooth" });

                // Focus the search input after a short delay to allow for scrolling
                setTimeout(() => {
                  const searchInput = document.getElementById(
                    "markets-search-input"
                  );
                  if (searchInput) {
                    searchInput.focus();
                  }
                }, 300);
              } else {
                // Navigate to the home page
                navigate("/");
              }
            }}
            className="flex flex-col items-center justify-center gap-1 text-muted-foreground"
            style={{
              flex: "1",
              minWidth: "70px",
              minHeight: "60px",
              padding: "12px 5px",
              margin: "0 2px",
            }}
          >
            <Search className="h-6 w-6" />
            <span
              className="text-xs font-medium truncate"
              style={{ fontSize: "12px" }}
            >
              Search
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center justify-center gap-1 text-muted-foreground"
            onClick={() => setShowMobileMenu(true)}
            style={{
              flex: "1",
              minWidth: "70px",
              minHeight: "60px",
              padding: "12px 5px",
              margin: "0 2px",
            }}
          >
            <Menu className="h-5 w-5" />
            <span
              className="text-xs font-medium truncate"
              style={{
                fontSize: "12px",
              }}
            >
              Menu
            </span>
          </Button>
        </div>
      </div>
      <FundWalletModal
        isOpen={isVisible}
        onClose={() => setIsVisible(false)}
      />
      {isWithdrawalVisible && (
        <WithdrawWallet
          isOpen={isWithdrawalVisible}
          onClose={() => setIsWithdrawalVisible(false)}
        />
      )}
      <ConnectWalletModal
        isOpen={showConnectWallet}
        onClose={() => setShowConnectWallet(false)}
        onConnect={handleWalletConnect}
      />
    </>
  );
}
