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
  QrCode,
  Clock,
  AlertCircle,
  Check,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rate: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: any;
  type: "crypto" | "bank" | "mobile" | "card";
  fees: string;
  processingTime: string;
  popular?: boolean;
}

interface LocalCurrencyWalletProps {
  visible?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

const africanCurrencies: CurrencyOption[] = [
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", rate: 0.0012 },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪", rate: 0.0077 },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦", rate: 0.055 },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", flag: "🇬🇭", rate: 0.082 },
  { code: "ETB", name: "Ethiopian Birr", symbol: "Br", flag: "🇪🇹", rate: 0.018 },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", rate: 1.0 },
];

const paymentMethods: PaymentMethod[] = [
  {
    id: "card",
    name: "Credit/Debit Card",
    description: "Pay with Visa, Mastercard, or any major card",
    icon: CreditCard,
    type: "card",
    fees: "2.9%",
    processingTime: "Instant",
    popular: true,
  },
  {
    id: "crypto",
    name: "Crypto Wallet",
    description: "Deposit with MetaMask, Trust Wallet, or any crypto wallet",
    icon: Bitcoin,
    type: "crypto",
    fees: "0.5%",
    processingTime: "Instant",
    popular: true,
  },
  {
    id: "mobile",
    name: "Mobile Money",
    description: "M-Pesa, MTN Mobile Money, and more",
    icon: Smartphone,
    type: "mobile",
    fees: "1.2%",
    processingTime: "1-3 mins",
  },
];

// Simple QR code component (using a placeholder - in production use qrcode.react)
const QRCodeDisplay = ({ data }: { data: string }) => {
  return (
    <div className="relative">
      <div className="w-48 h-48 mx-auto bg-white p-4 rounded-lg border-2 border-border">
        {/* Placeholder QR code pattern */}
        <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-0.5">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className={`${
                Math.random() > 0.5 ? "bg-black" : "bg-white"
              } rounded-sm`}
            />
          ))}
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-primary/10 backdrop-blur-sm rounded-full p-3">
          <QrCode className="h-8 w-8 text-primary" />
        </div>
      </div>
    </div>
  );
};

export default function LocalCurrencyWallet({
  visible,
  onClose,
}: LocalCurrencyWalletProps) {
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(africanCurrencies[0]);
  const [amount, setAmount] = useState<string>("");
  const [copied, setCopied] = useState<string>("");

  // Card details state
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardName, setCardName] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCVV, setCardCVV] = useState<string>("");

  const depositAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
  const bankAccountNumber = "1234567890";
  const bankName = "First Bank of Nigeria";
  const accountName = "BlockCast Limited";
  const mobileMoneyNumber = "+234 801 234 5678";

  const calculateUSDT = () => {
    if (!amount || isNaN(Number(amount))) return "0.000000";
    const usdAmount = Number(amount) * selectedCurrency.rate;
    return usdAmount.toFixed(6);
  };

  const calculateFees = () => {
    if (!selectedMethod || !amount || isNaN(Number(amount))) return "0.00";
    const usdAmount = Number(amount) * selectedCurrency.rate;
    const feePercentage = parseFloat(selectedMethod.fees.replace("%", "")) / 100;
    return (usdAmount * feePercentage).toFixed(2);
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

  // Format card number with spaces (e.g., 1234 5678 9012 3456)
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Format expiry date (MM/YY)
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    if (formatted.length <= 5) {
      setCardExpiry(formatted);
    }
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/gi, "");
    if (value.length <= 4) {
      setCardCVV(value);
    }
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep(2);
  };

  const handleNext = () => {
    if (step === 2 && (!amount || Number(amount) <= 0)) {
      toast.error("Please enter a valid amount");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = () => {
    toast.success(
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span>Deposit initiated! Funds will arrive shortly.</span>
      </div>
    );
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedMethod(null);
    setAmount("");
    setCopied("");
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCVV("");
    if (onClose) onClose();
  };

  const totalSteps = 3;

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto border-2 border-cyan-500/50 !bg-slate-950 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/30">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-bold">
              Fund Your Wallet
            </span>
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Add funds to start betting on truth markets
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-slate-900 border border-cyan-500/40">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    step >= s
                      ? "bg-gradient-to-br from-cyan-500 to-purple-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/50"
                      : "border-slate-600 text-slate-500 bg-slate-800/50"
                  }`}
                >
                  {step > s ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <span className="font-bold text-lg">{s}</span>
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium ${step >= s ? "text-cyan-400" : "text-slate-500"}`}>
                  {s === 1 ? "Method" : s === 2 ? "Amount" : "Details"}
                </span>
              </div>
              {s < totalSteps && (
                <div
                  className={`h-1 flex-1 mx-2 transition-all rounded-full ${
                    step > s ? "bg-gradient-to-r from-cyan-500 to-purple-500" : "bg-slate-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Choose Payment Method */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Card
                    key={method.id}
                    className="cursor-pointer hover:border-cyan-500/60 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 bg-slate-900 border-slate-700 group"
                    onClick={() => handleMethodSelect(method)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 group-hover:from-cyan-500/30 group-hover:to-purple-500/30 flex items-center justify-center border border-cyan-500/30 transition-all">
                            <Icon className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-white group-hover:text-cyan-400 transition-colors">{method.name}</p>
                              {method.popular && (
                                <Badge
                                  className="text-xs border"
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
                            <p className="text-sm text-slate-400">
                              {method.description}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                                  <Zap className="h-3 w-3" />
                                  {method.processingTime}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">
                                  Fee: {method.fees}
                                </span>
                              </div>
                              {method.id === "card" && (
                                <div className="flex items-center gap-2">
                                  {/* Visa Logo */}
                                  <div className="h-10 w-16 rounded flex items-center justify-center p-0.5">
                                    <svg viewBox="0 0 48 32" className="h-full w-full">
                                      <path fill="#FFFFFF" d="M20.2 14.7l-1.4 6.8h-2.3l1.4-6.8h2.3zm11.8 4.4l1.2-3.3.7 3.3h-1.9zm2.6 2.4h2.1l-1.8-6.8h-2c-.4 0-.8.2-1 .6l-3.4 6.2h2.4l.5-1.3h3l.2 1.3zm-7-2.3c0-1.8-2.5-1.9-2.4-2.7 0-.2.2-.5.8-.6.3-.1 1-.1 1.8.3l.3-1.5c-.4-.2-1-.3-1.7-.3-2.3 0-3.9 1.2-3.9 2.9 0 1.3 1.1 2 2 2.4.9.4 1.2.7 1.2 1.1 0 .6-.7.9-1.4.9-.8 0-1.3-.1-2-.5l-.4 1.6c.5.2 1.3.4 2.2.4 2.4 0 4-1.2 4-3zm-10.6-4.5l-3.7 6.8h-2.4l-1.8-7c-.1-.4-.3-.5-.7-.7-.6-.3-1.7-.5-2.6-.7l.1-.3h4.5c.6 0 1.1.4 1.2 1l1.1 5.9 2.8-6.9h2.5z"/>
                                    </svg>
                                  </div>
                                  {/* Mastercard Logo */}
                                  <div className="h-10 w-16 bg-white rounded flex items-center justify-center overflow-hidden p-0.5">
                                    <svg viewBox="0 0 48 32" className="h-full w-full">
                                      <circle cx="18" cy="16" r="10" fill="#EB001B"/>
                                      <circle cx="30" cy="16" r="10" fill="#F79E1B"/>
                                      <path d="M24 8.7c-1.9 1.7-3.1 4.2-3.1 7s1.2 5.3 3.1 7c1.9-1.7 3.1-4.2 3.1-7s-1.2-5.3-3.1-7z" fill="#FF5F00"/>
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-4 border border-cyan-500/30 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
                  <Shield className="h-5 w-5 text-white flex-shrink-0" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-cyan-400">
                    🔒 Secure & Fast Deposits
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    All deposits are secured with bank-grade encryption. Your funds
                    are automatically converted to USDT for betting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Enter Amount */}
        {step === 2 && selectedMethod && (
          <div className="space-y-4">
            <Card className="bg-slate-900 border-cyan-500/40">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/30">
                    {selectedMethod.icon && <selectedMethod.icon className="h-6 w-6 text-white" />}
                  </div>
                  <div>
                    <p className="font-bold text-white">{selectedMethod.name}</p>
                    <p className="text-xs text-cyan-400">
                      {selectedMethod.fees} fee • {selectedMethod.processingTime}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label className="text-slate-200 font-medium">Select Currency</Label>
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

            <div className="space-y-2">
              <Label className="text-slate-200 font-medium">Amount to Deposit</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base font-medium text-muted-foreground pointer-events-none">
                  {selectedCurrency.symbol}
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg font-semibold h-12"
                  style={{ paddingLeft: `${selectedCurrency.symbol.length * 12 + 24}px` }}
                />
              </div>
            </div>

            {amount && Number(amount) > 0 && (
              <Card className="bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 border-cyan-500/30 backdrop-blur-sm shadow-xl shadow-cyan-500/10">
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400 font-medium">
                      You'll receive
                    </span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      {calculateUSDT()} USDT
                    </span>
                  </div>
                  <Separator className="bg-slate-700" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">USD equivalent</span>
                    <span className="font-semibold text-white">
                      ${(Number(amount) * selectedCurrency.rate).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">
                      Processing fee ({selectedMethod.fees})
                    </span>
                    <span className="font-semibold text-orange-400">
                      ${calculateFees()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 border-cyan-500/30 hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!amount || Number(amount) <= 0}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 border-0 shadow-lg shadow-cyan-500/30 transition-all"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Deposit Instructions */}
        {step === 3 && selectedMethod && (
          <div className="space-y-4">
            {/* Crypto Wallet Instructions */}
            {selectedMethod.type === "crypto" && (
              <>
                <div className="text-center space-y-4">
                  <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                    <h3 className="font-semibold">Scan QR Code</h3>
                    <QRCodeDisplay data={depositAddress} />
                    <p className="text-xs text-muted-foreground">
                      Scan with your crypto wallet app
                    </p>
                  </div>

                  <div className="text-left space-y-2">
                    <Label className="text-sm">Or copy deposit address</Label>
                    <div className="flex gap-2">
                      <Input
                        value={depositAddress}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(depositAddress, "Address")}
                      >
                        {copied === "Address" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="text-left">
                        <h4 className="font-semibold text-sm text-blue-500">
                          Important
                        </h4>
                        <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                          <li>• Send only USDT (ERC-20) to this address</li>
                          <li>• Minimum deposit: $10 USDT</li>
                          <li>• Funds arrive in 1-5 minutes after confirmation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Bank Transfer Instructions */}
            {selectedMethod.type === "bank" && (
              <>
                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Bank Account Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Bank Name
                      </Label>
                      <div className="flex gap-2">
                        <Input value={bankName} readOnly className="font-medium" />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(bankName, "Bank Name")}
                        >
                          {copied === "Bank Name" ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Account Number
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={bankAccountNumber}
                          readOnly
                          className="font-mono font-semibold"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(bankAccountNumber, "Account Number")}
                        >
                          {copied === "Account Number" ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Account Name
                      </Label>
                      <div className="flex gap-2">
                        <Input value={accountName} readOnly className="font-medium" />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(accountName, "Account Name")}
                        >
                          {copied === "Account Name" ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Amount</Label>
                      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <p className="text-lg font-bold text-primary">
                          {selectedCurrency.symbol}
                          {amount}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm text-blue-500">
                        Next Steps
                      </h4>
                      <ol className="text-xs text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
                        <li>Transfer the exact amount to the account above</li>
                        <li>Your deposit will be credited within 2-5 minutes</li>
                        <li>You'll receive a confirmation notification</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Mobile Money Instructions */}
            {selectedMethod.type === "mobile" && (
              <>
                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-primary" />
                      Mobile Money Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Mobile Money Number
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={mobileMoneyNumber}
                          readOnly
                          className="font-mono font-semibold"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(mobileMoneyNumber, "Mobile Number")}
                        >
                          {copied === "Mobile Number" ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Account Name
                      </Label>
                      <Input value={accountName} readOnly className="font-medium" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Amount</Label>
                      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <p className="text-lg font-bold text-primary">
                          {selectedCurrency.symbol}
                          {amount}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm text-blue-500">
                        How to Send
                      </h4>
                      <ol className="text-xs text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
                        <li>Open your mobile money app</li>
                        <li>Select "Send Money"</li>
                        <li>Enter the number and amount above</li>
                        <li>Complete the transaction with your PIN</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Credit Card Payment Form */}
            {selectedMethod.type === "card" && (
              <>
                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Card Payment Details
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Your payment is secured with 256-bit SSL encryption
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Card Number */}
                    <div className="space-y-2">
                      <Label>Card Number</Label>
                      <Input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="font-mono"
                        maxLength={19}
                      />
                    </div>

                    {/* Cardholder Name */}
                    <div className="space-y-2">
                      <Label>Cardholder Name</Label>
                      <Input
                        type="text"
                        placeholder="JOHN DOE"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        className="uppercase"
                      />
                    </div>

                    {/* Expiry and CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          className="font-mono"
                          maxLength={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CVV</Label>
                        <Input
                          type="password"
                          placeholder="123"
                          value={cardCVV}
                          onChange={handleCVVChange}
                          className="font-mono"
                          maxLength={4}
                        />
                      </div>
                    </div>

                    {/* Amount Summary */}
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Amount
                        </span>
                        <span className="font-medium">
                          {selectedCurrency.symbol}{amount}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Processing Fee ({selectedMethod.fees})
                        </span>
                        <span className="font-medium text-orange-500">
                          ${calculateFees()}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total</span>
                        <span className="text-lg font-bold text-primary">
                          ${(Number(amount) * selectedCurrency.rate + Number(calculateFees())).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm text-green-500">
                        Secure Payment
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your card information is encrypted and never stored on our servers.
                        Processed by Stripe for maximum security.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 border-cyan-500/30 hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleComplete}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 border-0 shadow-lg shadow-cyan-500/30 transition-all"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                I've Sent the Payment
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
