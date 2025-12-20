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
  comingSoon?: boolean;
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
    comingSoon: true,
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
    comingSoon: true,
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
      <DialogContent className="!fixed !inset-0 w-screen h-screen sm:!static sm:w-auto sm:h-auto sm:max-w-[600px] sm:max-h-[90vh] overflow-y-auto border-2 border-cyan-500/50 !bg-slate-950 shadow-2xl pt-[env(safe-area-inset-top,1rem)] pb-[env(safe-area-inset-bottom,1rem)] px-3 sm:p-6 gap-2 sm:gap-4 sm:rounded-lg rounded-none">
        <DialogHeader className="space-y-0.5 sm:space-y-2">
          <DialogTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-xl md:text-2xl">
            <div className="p-1 sm:p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/30">
              <Wallet className="h-3.5 w-3.5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-bold">
              Fund Your Wallet
            </span>
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-[10px] sm:text-sm md:text-base">
            Add funds to start betting
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between my-2 mx-2 sm:mx-0 sm:my-0 sm:mb-4 p-1.5 sm:p-3 md:p-4 rounded-lg bg-slate-900 border border-cyan-500/40 px-1 sm:px-0 py-2 sm:py-0">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    step >= s
                      ? "bg-gradient-to-br from-cyan-500 to-purple-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/50"
                      : "border-slate-600 text-slate-500 bg-slate-800/50"
                  }`}
                >
                  {step > s ? (
                    <Check className="h-3 w-3 sm:h-6 sm:w-6" />
                  ) : (
                    <span className="font-bold text-xs sm:text-lg">{s}</span>
                  )}
                </div>
                <span className={`text-[9px] sm:text-xs mt-0.5 sm:mt-2 font-medium whitespace-nowrap ${step >= s ? "text-cyan-400" : "text-slate-500"}`}>
                  {s === 1 ? "Method" : s === 2 ? "Amount" : "Details"}
                </span>
              </div>
              {s < totalSteps && (
                <div
                  className={`h-0.5 sm:h-1 flex-1 mx-0.5 sm:mx-2 transition-all rounded-full ${
                    step > s ? "bg-gradient-to-r from-cyan-500 to-purple-500" : "bg-slate-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Choose Payment Method */}
        {step === 1 && (
          <div className="space-y-2 sm:space-y-4 px-2 sm:px-0 py-2 sm:py-0">
            <div className="space-y-3 sm:space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Card
                    key={method.id}
                    className="cursor-pointer hover:border-cyan-500/60 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 bg-slate-900 border-slate-700 group"
                    onClick={() => handleMethodSelect(method)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-3">
                        <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 group-hover:from-cyan-500/30 group-hover:to-purple-500/30 flex items-center justify-center border border-cyan-500/30 transition-all">
                            <Icon className="h-4.5 w-4.5 sm:h-7 sm:w-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                              <p className="font-bold text-xs sm:text-base text-white group-hover:text-cyan-400 transition-colors">{method.name}</p>
                              {method.popular && (
                                <Badge
                                  className="text-[9px] sm:text-xs border whitespace-nowrap px-1.5 py-0 sm:px-2 sm:py-0.5"
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
                            <p className="text-[10px] sm:text-sm text-slate-400 line-clamp-2 mb-1 sm:mb-2">
                              {method.description}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                                <span className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-0.5 sm:gap-1 font-medium whitespace-nowrap">
                                  <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                                  {method.processingTime}
                                </span>
                                <span className="text-[10px] sm:text-xs text-slate-400 font-medium whitespace-nowrap">
                                  Fee: {method.fees}
                                </span>
                              </div>
                              {method.id === "card" && (
                                <div className="flex items-center gap-0.5 sm:gap-1.5">
                                  {/* Visa Logo */}
                                  <div className="h-6 w-10 sm:h-10 sm:w-16 rounded flex items-center justify-center flex-shrink-0">
                                    <svg viewBox="0 0 141.732 141.732" className="h-full w-full">
                                      <g fill="#FFFFFF">
                                        <path d="M62.935 89.571h-9.733l6.083-37.384h9.734zM45.014 52.187L35.735 77.9l-1.098-5.537.001.002-3.275-16.812s-.396-3.366-4.617-3.366h-15.34l-.18.633s4.691.976 10.181 4.273l8.456 32.479h10.141l15.485-37.385H45.014zM121.569 89.571h8.937l-7.792-37.385h-7.824c-3.613 0-4.493 2.786-4.493 2.786L95.881 89.571h10.146l2.029-5.553h12.373l1.14 5.553zm-10.71-13.224l5.114-13.99 2.877 13.99h-7.991zM96.642 61.177l1.389-8.028s-4.286-1.63-8.754-1.63c-4.83 0-16.3 2.111-16.3 12.376 0 9.658 13.462 9.778 13.462 14.851s-12.075 4.164-16.06.965l-1.447 8.394s4.346 2.111 10.986 2.111c6.642 0 16.662-3.439 16.662-12.799 0-9.72-13.583-10.625-13.583-14.851.001-4.227 9.48-3.684 13.645-1.389z"/>
                                      </g>
                                    </svg>
                                  </div>
                                  {/* Mastercard Logo */}
                                  <div className="h-6 w-10 sm:h-10 sm:w-16 bg-white rounded flex items-center justify-center overflow-hidden p-0.5 flex-shrink-0">
                                    <svg viewBox="0 0 48 32" className="h-full w-full">
                                      <circle cx="18" cy="16" r="10" fill="#EB001B"/>
                                      <circle cx="30" cy="16" r="10" fill="#F79E1B"/>
                                      <path d="M24 8.7c-1.9 1.7-3.1 4.2-3.1 7s1.2 5.3 3.1 7c1.9-1.7 3.1-4.2 3.1-7s-1.2-5.3-3.1-7z" fill="#FF5F00"/>
                                    </svg>
                                  </div>
                                </div>
                              )}
                              {method.id === "crypto" && (
                                <div className="flex items-center gap-0.5 sm:gap-1.5">
                                  {/* MetaMask Logo */}
                                  <div className="h-5 w-5 sm:h-8 sm:w-8 rounded flex items-center justify-center p-0.5 flex-shrink-0">
                                    <svg viewBox="0 0 212 189" className="h-full w-full">
                                      <path d="M200.9 0L125.5 56.1 139 23.3 200.9 0z" fill="#E17726"/>
                                      <path d="M10.7 0l74.7 56.7-13.1-33.4L10.7 0zM171.6 137.4l-18.9 29 40.5 11.1 11.6-39.5-33.2-.6zM7.3 137.9l11.5 39.5 40.5-11.1-18.9-29-33.1.6z" fill="#E27625"/>
                                      <path d="M57.5 82.1l-11.8 17.8 40.2 1.8-1.4-43.1-27 23.5zM154.1 82.1l-27.4-24.1-1 43.7 40.2-1.8-11.8-17.8zM59.3 166.4l24.1-11.7-20.8-16.2-3.3 27.9zM128.2 154.7l24.1 11.7-3.3-27.9-20.8 16.2z" fill="#E27625"/>
                                      <path d="M152.3 166.4l-24.1-11.7 1.9 15.7-.2 6.6 22.4-10.6zM59.3 166.4l22.4 10.6-.1-6.6 1.9-15.7-24.2 11.7z" fill="#D5BFB2"/>
                                      <path d="M81.9 124.1l-20-5.9 14.1-6.5 5.9 12.4zM129.7 124.1l5.9-12.4 14.2 6.5-20.1 5.9z" fill="#233447"/>
                                      <path d="M59.3 166.4l3.4-29-22.3.6 18.9 28.4zM149 137.4l3.4 29 18.9-28.4-22.3-.6zM165.9 99.9l-40.2 1.8 3.7 20.4 5.9-12.4 14.2 6.5 16.4-16.3zM61.9 118.2l14.1-6.5 5.9 12.4 3.7-20.4-40.2-1.8 16.5 16.3z" fill="#CC6228"/>
                                      <path d="M45.4 99.9l17.1 33.3-0.6-16.5-16.5-16.8zM149.5 116.7l-.6 16.5 17.1-33.3-16.5 16.8zM85.6 101.7l-3.7 20.4 4.6 23.9 1-31.1-1.9-13.2zM125.7 101.7l-1.8 13.1 0.9 31.2 4.6-23.9-3.7-20.4z" fill="#E27525"/>
                                      <path d="M129.7 124.1l-4.6 23.9 3.3 2.3 20.8-16.2.6-16.5-20.1 6.5zM61.9 118.2l.6 16.5 20.8 16.2 3.3-2.3-4.6-23.9-20 6.5z" fill="#F5841F"/>
                                      <path d="M130 177l.2-6.6-1.7-1.5h-25.4l-1.6 1.5.1 6.6-22.4-10.6 7.8 6.4 15.9 11h25.8l15.9-11 7.8-6.4L130 177z" fill="#C0AC9D"/>
                                      <path d="M128.2 154.7l-3.3-2.3h-38.2l-3.3 2.3-1.9 15.7 1.6-1.5h25.4l1.7 1.5-1.9-15.7z" fill="#161616"/>
                                      <path d="M204 62l7.1-34.1L200.9 0l-72.7 54.2 27.9 23.6 39.4 11.5 8.7-10.1-3.8-2.7 6-5.5-4.6-3.6 6-4.6-4-3zM.5 27.9l7.1 34.1-4 3 6 4.6-4.6 3.6 6 5.5-3.8 2.7 8.7 10.1 39.4-11.5 27.9-23.6L10.7 0 .5 27.9z" fill="#763E1A"/>
                                      <path d="M195.3 89.3l-39.4-11.5 11.8 17.8-17.1 33.3 22.6-.3h33.2l-11.1-39.3zM57.5 77.8l-39.4 11.5L7 128.6h33.1l22.6.3-17.1-33.3 11.9-17.8zM125.7 101.7l2.5-43.6 11.5-31.1H72.8l11.5 31.1 2.5 43.6 0.9 13.3 0.1 31.1h38.1l0.1-31.1 1-13.3z" fill="#F5841F"/>
                                    </svg>
                                  </div>
                                  {/* Binance Logo */}
                                  <div className="h-5 w-5 sm:h-8 sm:w-8 rounded flex items-center justify-center flex-shrink-0">
                                    <svg viewBox="0 0 126.61 126.61" className="h-full w-full">
                                      <g fill="#F3BA2F">
                                        <path d="M38.73 53.2l24.59-24.58 24.6 24.6 14.3-14.31L63.32 0 24.43 38.9l14.3 14.3zM0 63.31l14.3-14.3 14.31 14.3-14.31 14.3zM38.73 73.41l24.59 24.59 24.6-24.6 14.31 14.29-38.9 38.91-38.91-38.88v-.03l-.66-.66 14.3-14.3.66.66v.02zM98 63.31l14.3-14.3 14.31 14.3-14.31 14.3z"/>
                                        <path d="M77.83 63.3l-14.51-14.52-10.73 10.73-1.24 1.23-2.54 2.54v.02l14.51 14.5 14.51-14.5z"/>
                                      </g>
                                    </svg>
                                  </div>
                                  {/* Coinbase Wallet Logo */}
                                  <div className="h-5 w-5 sm:h-8 sm:w-8 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: 'linear-gradient(135deg, #2E66F8 0%, #124AEB 100%)' }}>
                                    <svg viewBox="0 0 1024 1024" className="h-3 w-3 sm:h-5 sm:w-5">
                                      <path fill="#FFFFFF" d="M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0zm0 896c-212.1 0-384-171.9-384-384S299.9 128 512 128s384 171.9 384 384-171.9 384-384 384z"/>
                                      <path fill="#FFFFFF" d="M512 256c-141.4 0-256 114.6-256 256s114.6 256 256 256 256-114.6 256-256-114.6-256-256-256z"/>
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-3 w-3 sm:h-5 sm:w-5 flex-shrink-0 text-slate-400 group-hover:translate-x-1 transition-transform mt-0.5 sm:mt-0" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg p-2 sm:p-4 border border-cyan-500/30 backdrop-blur-sm">
              <div className="flex items-start gap-1.5 sm:gap-3">
                <div className="p-1 sm:p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
                  <Shield className="h-3 w-3 sm:h-5 sm:w-5 text-white flex-shrink-0" />
                </div>
                <div>
                  <h4 className="font-bold text-[10px] sm:text-sm text-cyan-400">
                    🔒 Secure & Fast Deposits
                  </h4>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">
                    All deposits are secured with bank-grade encryption. Your funds are automatically converted to USDT for betting.
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
