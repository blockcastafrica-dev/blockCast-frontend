import { useState } from "react";
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
  Building2,
  Smartphone,
  Bitcoin,
  Clock,
  AlertCircle,
  Check,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

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
    id: "bank",
    name: "Bank Transfer",
    description: "Direct transfer to your bank account",
    icon: Building2,
    type: "bank",
    fees: "1.5%",
    processingTime: "1-3 business days",
    minAmount: 10,
    popular: true,
  },
  {
    id: "crypto",
    name: "Crypto Wallet",
    description: "Withdraw to your crypto wallet address",
    icon: Bitcoin,
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
  },
  {
    id: "card",
    name: "Debit Card",
    description: "Withdraw to your linked debit card",
    icon: CreditCard,
    type: "card",
    fees: "2.5%",
    processingTime: "2-5 business days",
    minAmount: 20,
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

  // Bank details state
  const [bankName, setBankName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");

  // Crypto details state
  const [cryptoAddress, setCryptoAddress] = useState<string>("");

  // Mobile money state
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [mobileProvider, setMobileProvider] = useState<string>("");

  // Card details state
  const [cardLast4, setCardLast4] = useState<string>("");

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
    if (selectedMethod?.type === "bank") {
      if (!bankName || !accountNumber || !accountName) {
        toast.error("Please fill in all bank details");
        return;
      }
    } else if (selectedMethod?.type === "crypto") {
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
    setBankName("");
    setAccountNumber("");
    setAccountName("");
    setCryptoAddress("");
    setMobileNumber("");
    setMobileProvider("");
    setCardLast4("");
    if (onClose) onClose();
  };

  const totalSteps = 3;

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[96vw] sm:max-w-[600px] max-h-[72vh] sm:max-h-[90vh] overflow-y-auto border-2 border-purple-500/50 !bg-slate-950 shadow-2xl p-3.5 sm:p-6 gap-2 sm:gap-4">
        <DialogHeader className="space-y-0.5 sm:space-y-2">
          <DialogTitle className="flex items-center gap-1.5 sm:gap-3 text-sm sm:text-xl md:text-2xl">
            <div className="p-1 sm:p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
              <TrendingDown className="h-3.5 w-3.5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">
              Withdraw Funds
            </span>
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-[10px] sm:text-sm md:text-base">
            Withdraw your winnings
          </DialogDescription>
        </DialogHeader>

        {/* Balance Display */}
        <div className="bg-slate-900 rounded-lg p-2 sm:p-5 border border-purple-500/40 shadow-xl shadow-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-sm text-slate-400 font-medium">Available Balance</p>
              <p className="text-base sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{userBalance.toFixed(6)} USDT</p>
            </div>
            <div className="p-1.5 sm:p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Wallet className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between my-4 mx-2 sm:mx-0 sm:my-0 sm:mb-4 md:mb-6 p-1.5 sm:p-3 md:p-4 rounded-lg bg-slate-900 border border-purple-500/40 px-1 sm:px-0 py-3 sm:py-0">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    step >= s
                      ? "bg-gradient-to-br from-purple-500 to-pink-500 border-purple-400 text-white shadow-lg shadow-purple-500/50"
                      : "border-slate-600 text-slate-500 bg-slate-800/50"
                  }`}
                >
                  {step > s ? (
                    <Check className="h-3 w-3 sm:h-6 sm:w-6" />
                  ) : (
                    <span className="font-bold text-xs sm:text-lg">{s}</span>
                  )}
                </div>
                <span className={`text-[9px] sm:text-xs mt-0.5 sm:mt-2 font-medium whitespace-nowrap ${step >= s ? "text-purple-400" : "text-slate-500"}`}>
                  {s === 1 ? "Method" : s === 2 ? "Amount" : "Details"}
                </span>
              </div>
              {s < totalSteps && (
                <div
                  className={`h-0.5 sm:h-1 flex-1 mx-0.5 sm:mx-2 transition-all rounded-full ${
                    step > s ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-slate-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Choose Withdrawal Method */}
        {step === 1 && (
          <div className="space-y-2 sm:space-y-4 px-1 sm:px-0 py-3 sm:py-0">
            <div className="space-y-3 sm:space-y-3">
              {withdrawalMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Card
                    key={method.id}
                    className="cursor-pointer hover:border-purple-500/60 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 bg-slate-900 border-slate-700 group"
                    onClick={() => handleMethodSelect(method)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-3">
                        <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30 flex items-center justify-center border border-purple-500/30 transition-all">
                            <Icon className="h-4.5 w-4.5 sm:h-7 sm:w-7 text-white" />
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

            <div className="bg-blue-500/10 rounded-lg p-2 sm:p-4 border border-blue-500/20">
              <div className="flex items-start gap-1.5 sm:gap-3">
                <AlertCircle className="h-3 w-3 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[10px] sm:text-sm text-blue-500">
                    Withdrawal Information
                  </h4>
                  <ul className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-2 space-y-0 sm:space-y-1">
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
            {/* Bank Transfer Details */}
            {selectedMethod.type === "bank" && (
              <>
                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Bank Account Details
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Enter your bank account information to receive funds
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input
                        placeholder="e.g., First Bank of Nigeria"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input
                        placeholder="1234567890"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Account Name</Label>
                      <Input
                        placeholder="John Doe"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Crypto Wallet Details */}
            {selectedMethod.type === "crypto" && (
              <>
                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Bitcoin className="h-5 w-5 text-primary" />
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
