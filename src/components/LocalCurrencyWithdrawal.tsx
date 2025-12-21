import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Separator } from "./ui/separator";
import {
  Wallet,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Zap,
  Shield,
  CheckCircle,
  Copy,
  Smartphone,
  Clock,
  AlertCircle,
  Check,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

// USDT Icon Component
const UsdtIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <circle cx="16" cy="16" r="16" fill="currentColor" opacity="0.2"/>
    <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117" fill="currentColor"/>
  </svg>
);

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rate: number;
}

interface WithdrawalMethod {
  id: string;
  name: string;
  description: string;
  icon: any;
  type: "crypto" | "bank" | "mobile" | "card";
  fees: string;
  processingTime: string;
  minAmount: number;
  popular?: boolean;
  comingSoon?: boolean;
}

interface LocalCurrencyWithdrawalProps {
  visible?: boolean;
  onClose?: () => void;
  userBalance?: number;
}

const africanCurrencies: CurrencyOption[] = [
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", rate: 0.0012 },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪", rate: 0.0077 },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦", rate: 0.055 },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", flag: "🇬🇭", rate: 0.082 },
  { code: "ETB", name: "Ethiopian Birr", symbol: "Br", flag: "🇪🇹", rate: 0.018 },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", rate: 1.0 },
];

const withdrawalMethods: WithdrawalMethod[] = [
  {
    id: "crypto",
    name: "Crypto Wallet",
    description: "Withdraw to your crypto wallet address",
    icon: UsdtIcon,
    type: "crypto",
    fees: "0.5%",
    processingTime: "10-30 minutes",
    minAmount: 10,
    popular: true,
  },
  {
    id: "mobile",
    name: "Mobile Money",
    description: "M-Pesa, MTN Mobile Money, and more",
    icon: Smartphone,
    type: "mobile",
    fees: "1.2%",
    processingTime: "Instant - 1 hour",
    minAmount: 5,
    comingSoon: true,
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    description: "Withdraw to your linked card",
    icon: CreditCard,
    type: "card",
    fees: "2.5%",
    processingTime: "2-5 business days",
    minAmount: 20,
    comingSoon: true,
  },
];

export default function LocalCurrencyWithdrawal({
  visible,
  onClose,
  userBalance = 1.0,
}: LocalCurrencyWithdrawalProps) {
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(africanCurrencies[5]); // Default to USD
  const [amount, setAmount] = useState<string>("");
  const [copied, setCopied] = useState<string>("");

  // Crypto details state
  const [cryptoAddress, setCryptoAddress] = useState<string>("");

  // Mobile money state
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [mobileProvider, setMobileProvider] = useState<string>("");

  // Card details state
  const [cardLast4, setCardLast4] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const calculateLocalAmount = () => {
    if (!amount || isNaN(Number(amount))) return "0.00";
    const localAmount = Number(amount) / selectedCurrency.rate;
    return localAmount.toFixed(2);
  };

  const calculateFees = () => {
    if (!selectedMethod || !amount || isNaN(Number(amount))) return "0.00";
    const feePercentage = parseFloat(selectedMethod.fees.replace("%", "")) / 100;
    return (Number(amount) * feePercentage).toFixed(6);
  };

  const calculateTotal = () => {
    if (!amount || isNaN(Number(amount))) return "0.00";
    const total = Number(amount) - Number(calculateFees());
    return total.toFixed(6);
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      toast.success(`${label} copied to clipboard!`);
      setTimeout(() => setCopied(""), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleMethodSelect = (method: WithdrawalMethod) => {
    setSelectedMethod(method);
    setStep(2);
  };

  const handleNext = () => {
    if (step === 2) {
      if (!amount || Number(amount) <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }
      if (Number(amount) > userBalance) {
        toast.error("Insufficient balance");
        return;
      }
      if (selectedMethod && Number(amount) < selectedMethod.minAmount) {
        toast.error(`Minimum withdrawal is $${selectedMethod.minAmount}`);
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = () => {
    // Validate required fields based on method
    if (selectedMethod?.type === "crypto") {
      if (!cryptoAddress) {
        toast.error("Please enter your crypto wallet address");
        return;
      }
    } else if (selectedMethod?.type === "mobile") {
      if (!mobileNumber || !mobileProvider) {
        toast.error("Please fill in all mobile money details");
        return;
      }
    } else if (selectedMethod?.type === "card") {
      if (!cardLast4) {
        toast.error("Please enter the last 4 digits of your card");
        return;
      }
    }

    toast.success(
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span>Withdrawal request submitted! Processing...</span>
      </div>
    );
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedMethod(null);
    setAmount("");
    setCopied("");
    setCryptoAddress("");
    setMobileNumber("");
    setMobileProvider("");
    setCardLast4("");
    if (onClose) onClose();
  };

  const totalSteps = 3;

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        style={isMobile ? {
          position: 'fixed',
          top: '80px',
          left: '16px',
          right: '16px',
          bottom: '100px',
          width: 'calc(100vw - 32px)',
          maxHeight: 'calc(100vh - 180px)',
          transform: 'none',
          padding: '20px',
        } : {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '600px',
          maxHeight: '90vh',
        }}
        className="overflow-y-auto border-2 border-purple-500/50 !bg-slate-950 shadow-2xl gap-1.5 sm:gap-2 rounded-lg"
      >
        <DialogHeader className="space-y-0.5 pb-0">
          <DialogTitle className="flex items-center gap-1.5 sm:gap-3 text-sm sm:text-xl md:text-2xl">
            <div className="p-1 sm:p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
              <TrendingDown className="h-3.5 w-3.5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">
              Withdraw Funds
            </span>
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-[10px] sm:text-sm md:text-base text-left ml-7 sm:ml-10">
            Withdraw your winnings
          </DialogDescription>
        </DialogHeader>

        {/* Balance Display */}
        <div className="bg-slate-900 rounded-lg p-3 sm:p-4 border border-purple-500/40 shadow-xl shadow-purple-500/20 -mt-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-sm text-slate-400 font-medium">Available Balance</p>
              <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{userBalance.toFixed(6)} USDT</p>
            </div>
            <div className="p-2 sm:p-2.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-slate-900 border border-purple-500/40">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    step >= s
                      ? "bg-gradient-to-br from-purple-500 to-pink-500 border-purple-400 text-white shadow-lg shadow-purple-500/50"
                      : "border-slate-600 text-slate-500 bg-slate-800/50"
                  }`}
                >
                  {step > s ? (
                    <Check className="h-3 w-3 sm:h-5 sm:w-5" />
                  ) : (
                    <span className="font-bold text-[10px] sm:text-sm">{s}</span>
                  )}
                </div>
                <span className={`text-[9px] sm:text-xs mt-1 font-medium whitespace-nowrap ${step >= s ? "text-purple-400" : "text-slate-500"}`}>
                  {s === 1 ? "Method" : s === 2 ? "Amount" : "Details"}
                </span>
              </div>
              {s < totalSteps && (
                <div
                  className={`h-0.5 flex-1 mx-1 sm:mx-2 transition-all rounded-full ${
                    step > s ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-slate-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Choose Withdrawal Method */}
        {step === 1 && (
          <div className="space-y-3">
            <div className="space-y-3">
              {withdrawalMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Card
                    key={method.id}
                    className="cursor-pointer hover:border-purple-500/60 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 bg-slate-900 border-slate-700 group"
                    onClick={() => handleMethodSelect(method)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start sm:items-center justify-between gap-3">
                        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30 flex items-center justify-center border border-purple-500/30 transition-all">
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                              <p className="font-bold text-xs sm:text-base text-white group-hover:text-purple-400 transition-colors">{method.name}</p>
                              {method.popular && (
                                <Badge
                                  className="text-[9px] sm:text-xs border px-1.5 py-0 sm:px-2 sm:py-0.5"
                                  style={{
                                    backgroundColor: 'rgba(6, 182, 212, 0.2)',
                                    color: 'rgb(34, 211, 238)',
                                    borderColor: 'rgba(6, 182, 212, 0.5)'
                                  }}
                                >
                                  Popular
                                </Badge>
                              )}
                              {method.comingSoon && (
                                <Badge
                                  className="text-[9px] sm:text-xs border whitespace-nowrap px-1.5 py-0 sm:px-2 sm:py-0.5"
                                  style={{
                                    backgroundColor: 'rgba(168, 85, 247, 0.2)',
                                    color: 'rgb(192, 132, 252)',
                                    borderColor: 'rgba(168, 85, 247, 0.5)'
                                  }}
                                >
                                  Coming Soon
                                </Badge>
                              )}
                            </div>
                            <p className="text-[10px] sm:text-sm text-slate-400 line-clamp-2 mb-1 sm:mb-1">
                              {method.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                              <span className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
                                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                {method.processingTime}
                              </span>
                              <span className="text-[10px] sm:text-xs text-slate-400 whitespace-nowrap">
                                Fee: {method.fees}
                              </span>
                              <span className="text-[10px] sm:text-xs text-slate-400 whitespace-nowrap">
                                Min: ${method.minAmount}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 sm:h-5 sm:w-5 flex-shrink-0 text-slate-400 group-hover:translate-x-1 transition-transform mt-0.5 sm:mt-0" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-blue-500">
                    Withdrawal Information
                  </h4>
                  <ul className="text-[10px] sm:text-xs text-muted-foreground mt-1 space-y-0.5">
                    <li>• Withdrawals are processed within the stated timeframe</li>
                    <li>• Additional verification may be required for large amounts</li>
                    <li>• Network fees apply for crypto withdrawals</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Enter Amount */}
        {step === 2 && selectedMethod && (
          <div className="space-y-4">
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {selectedMethod.icon && <selectedMethod.icon className="h-5 w-5 text-white" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{selectedMethod.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedMethod.fees} fee • {selectedMethod.processingTime}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label>Withdrawal Amount (USDT)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base font-medium text-muted-foreground pointer-events-none">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg font-semibold h-12 pl-8"
                  max={userBalance}
                  step="0.01"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: ${selectedMethod.minAmount}</span>
                <button
                  onClick={() => setAmount(userBalance.toString())}
                  className="text-primary hover:underline font-medium"
                >
                  Max: ${userBalance.toFixed(6)}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Receive In</Label>
              <Select
                value={selectedCurrency.code}
                onValueChange={(value) => {
                  const currency = africanCurrencies.find((c) => c.code === value);
                  if (currency) setSelectedCurrency(currency);
                }}
              >
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{selectedCurrency.flag}</span>
                      <span>{selectedCurrency.code} - {selectedCurrency.name}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {africanCurrencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{currency.flag}</span>
                        <span>{currency.code}</span>
                        <span className="text-muted-foreground text-sm">
                          - {currency.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {amount && Number(amount) > 0 && (
              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Withdrawal amount
                    </span>
                    <span className="font-medium">
                      ${Number(amount).toFixed(6)} USDT
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Processing fee ({selectedMethod.fees})
                    </span>
                    <span className="font-medium text-orange-500">
                      -${calculateFees()} USDT
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">You'll receive</span>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        ${calculateTotal()} USDT
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ≈ {selectedCurrency.symbol}{calculateLocalAmount()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!amount || Number(amount) <= 0 || Number(amount) > userBalance}
                className="flex-1"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Withdrawal Details */}
        {step === 3 && selectedMethod && (
          <div className="space-y-4">
            {/* Crypto Wallet Details */}
            {selectedMethod.type === "crypto" && (
              <>
                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <UsdtIcon className="h-5 w-5" />
                      Crypto Wallet Address
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Enter your USDT wallet address (ERC-20)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label>Wallet Address</Label>
                      <Input
                        placeholder="0x..."
                        value={cryptoAddress}
                        onChange={(e) => setCryptoAddress(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                          <strong className="text-orange-500">Important:</strong> Ensure your wallet address supports USDT (ERC-20). Sending to wrong address may result in permanent loss of funds.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Mobile Money Details */}
            {selectedMethod.type === "mobile" && (
              <>
                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-primary" />
                      Mobile Money Details
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Enter your mobile money information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label>Mobile Money Provider</Label>
                      <Select value={mobileProvider} onValueChange={setMobileProvider}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mpesa">M-Pesa</SelectItem>
                          <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                          <SelectItem value="airtel">Airtel Money</SelectItem>
                          <SelectItem value="tigopesa">Tigo Pesa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Mobile Number</Label>
                      <Input
                        placeholder="+234 801 234 5678"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Debit Card Details */}
            {selectedMethod.type === "card" && (
              <>
                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Debit Card Details
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Withdraw to your linked debit card
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label>Last 4 Digits of Card</Label>
                      <Input
                        placeholder="1234"
                        value={cardLast4}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          if (value.length <= 4) setCardLast4(value);
                        }}
                        className="font-mono"
                        maxLength={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        For verification purposes only
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Summary */}
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <CardContent className="p-4 space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  Withdrawal Summary
                </h4>
                <Separator />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">${amount} USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee</span>
                    <span className="font-medium text-orange-500">-${calculateFees()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing Time</span>
                    <span className="font-medium">{selectedMethod.processingTime}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-semibold">You'll receive</span>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${calculateTotal()} USDT</p>
                      <p className="text-xs text-muted-foreground">
                        ≈ {selectedCurrency.symbol}{calculateLocalAmount()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleComplete} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Withdrawal
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
