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
    id: "bank",
    name: "Bank Transfer",
    description: "Direct bank transfer using local banking",
    icon: Building2,
    type: "bank",
    fees: "1.5%",
    processingTime: "2-5 mins",
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Fund Your Wallet
          </DialogTitle>
          <DialogDescription>
            Add funds to start betting on truth markets
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    step >= s
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {step > s ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="font-semibold">{s}</span>
                  )}
                </div>
                <span className="text-xs mt-1 text-muted-foreground">
                  {s === 1 ? "Method" : s === 2 ? "Amount" : "Details"}
                </span>
              </div>
              {s < totalSteps && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-all ${
                    step > s ? "bg-primary" : "bg-muted-foreground/30"
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
                    className="cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                    onClick={() => handleMethodSelect(method)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{method.name}</p>
                              {method.popular && (
                                <Badge variant="secondary" className="text-xs">
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {method.description}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                {method.processingTime}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Fee: {method.fees}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-primary">
                    Secure & Fast Deposits
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
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
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {selectedMethod.icon && <selectedMethod.icon className="h-5 w-5 text-primary" />}
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
              <Label>Select Currency</Label>
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
              <Label>Amount to Deposit</Label>
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
              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      You'll receive
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {calculateUSDT()} USDT
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">USD equivalent</span>
                    <span className="font-medium">
                      ${(Number(amount) * selectedCurrency.rate).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Processing fee ({selectedMethod.fees})
                    </span>
                    <span className="font-medium text-orange-500">
                      ${calculateFees()}
                    </span>
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
                disabled={!amount || Number(amount) <= 0}
                className="flex-1"
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
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleComplete} className="flex-1">
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
