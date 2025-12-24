import { useState, useEffect } from "react";
import { X, Wallet, CreditCard, Smartphone, Copy, Check, ChevronRight, ArrowLeft, Zap, Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = "crypto" | "mobile" | "card" | null;
type Step = "select" | "amount" | "details";

const cryptoWallets = [
  { id: "metamask", name: "MetaMask", icon: "🦊" },
  { id: "trust", name: "Trust Wallet", icon: "🛡️" },
  { id: "coinbase", name: "Coinbase Wallet", icon: "🔵" },
];

const mobileMoneyProviders = [
  { id: "mpesa", name: "M-Pesa", icon: "🟢" },
  { id: "mtn", name: "MTN Mobile Money", icon: "🟡" },
  { id: "airtel", name: "Airtel Money", icon: "🔴" },
];

const currencies = [
  { code: "USD", symbol: "$", rate: 1 },
  { code: "NGN", symbol: "₦", rate: 0.00065 },
  { code: "KES", symbol: "KSh", rate: 0.0077 },
  { code: "GHS", symbol: "₵", rate: 0.082 },
];

export default function FundWalletModal({ isOpen, onClose }: FundWalletModalProps) {
  const [step, setStep] = useState<Step>("select");
  const [method, setMethod] = useState<PaymentMethod>(null);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(currencies[0]);
  const [copied, setCopied] = useState(false);

  // Card details
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");

  // Mobile money
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");

  const depositAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setTimeout(() => {
        setStep("select");
        setMethod(null);
        setAmount("");
        setCardNumber("");
        setCardName("");
        setCardExpiry("");
        setCardCVV("");
        setPhoneNumber("");
        setSelectedProvider("");
      }, 300);
    }
  }, [isOpen]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const getUSDTAmount = () => {
    if (!amount || isNaN(Number(amount))) return "0.00";
    return (Number(amount) * currency.rate).toFixed(2);
  };

  const handleSubmit = () => {
    toast.success("Payment initiated! Funds will arrive shortly.");
    onClose();
  };

  const selectMethod = (m: PaymentMethod) => {
    setMethod(m);
    setStep("amount");
  };

  const goBack = () => {
    if (step === "details") setStep("amount");
    else if (step === "amount") {
      setStep("select");
      setMethod(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed z-[110] bg-slate-950 border-2 border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          top: '100px',
          bottom: '80px',
          left: '16px',
          right: '16px',
        }}
      >

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {step !== "select" && (
              <button onClick={goBack} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </button>
            )}
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold">Fund Your Wallet</h2>
              <p className="text-slate-400 text-xs">Add funds to start betting</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">

          {/* Step 1: Select Payment Method */}
          {step === "select" && (
            <div className="space-y-3">
              {/* Crypto Wallet */}
              <button
                onClick={() => selectMethod("crypto")}
                className="w-full p-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-xl transition-all group text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center text-2xl">
                      🪙
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">Crypto Wallet</span>
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] rounded-full font-medium">Popular</span>
                      </div>
                      <p className="text-slate-400 text-sm">MetaMask, Trust Wallet, Coinbase</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Instant</span>
                        <span>Fee: 0.5%</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
              </button>

              {/* Mobile Money */}
              <button
                onClick={() => selectMethod("mobile")}
                className="w-full p-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-xl transition-all group text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <span className="text-white font-semibold">Mobile Money</span>
                      <p className="text-slate-400 text-sm">M-Pesa, MTN, Airtel Money</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> 1-3 mins</span>
                        <span>Fee: 1.2%</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
              </button>

              {/* Credit Card */}
              <button
                onClick={() => selectMethod("card")}
                className="w-full p-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-xl transition-all group text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <span className="text-white font-semibold">Credit/Debit Card</span>
                      <p className="text-slate-400 text-sm">Visa, Mastercard, Verve</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Instant</span>
                        <span>Fee: 2.9%</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
              </button>

              {/* Security Note */}
              <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl mt-4">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-medium">Secure & Fast Deposits</p>
                    <p className="text-slate-400 text-xs mt-0.5">All deposits are secured with bank-grade encryption. Funds are converted to USDT.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Enter Amount */}
          {step === "amount" && (
            <div className="space-y-4">
              {/* Currency Select */}
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Currency</label>
                <select
                  value={currency.code}
                  onChange={(e) => setCurrency(currencies.find(c => c.code === e.target.value) || currencies[0])}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                >
                  {currencies.map(c => (
                    <option key={c.code} value={c.code}>{c.code} - {c.symbol}</option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{currency.symbol}</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-3 pl-10 bg-slate-900 border border-slate-700 rounded-xl text-white text-lg font-semibold focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Conversion */}
              {amount && Number(amount) > 0 && (
                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">You'll receive</span>
                    <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                      {getUSDTAmount()} USDT
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-slate-400">Fee ({method === "crypto" ? "0.5%" : method === "mobile" ? "1.2%" : "2.9%"})</span>
                    <span className="text-orange-400">${(Number(getUSDTAmount()) * (method === "crypto" ? 0.005 : method === "mobile" ? 0.012 : 0.029)).toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={() => setStep("details")}
                disabled={!amount || Number(amount) <= 0}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold rounded-xl transition-all disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 3: Payment Details */}
          {step === "details" && (
            <div className="space-y-4">

              {/* Crypto Wallet Details */}
              {method === "crypto" && (
                <>
                  <div className="text-center mb-4">
                    <p className="text-slate-300 text-sm">Send <span className="text-cyan-400 font-bold">{getUSDTAmount()} USDT</span> to:</p>
                  </div>

                  <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl">
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-cyan-400 text-sm break-all flex-1">{depositAddress}</code>
                      <button
                        onClick={() => handleCopy(depositAddress)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-blue-400 font-medium">Important</p>
                        <ul className="text-slate-400 text-xs mt-1 space-y-1">
                          <li>• Send only USDT (ERC-20) to this address</li>
                          <li>• Minimum deposit: $10 USDT</li>
                          <li>• Funds arrive in 1-5 minutes</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all"
                  >
                    I've Sent the Payment
                  </button>
                </>
              )}

              {/* Mobile Money Details */}
              {method === "mobile" && (
                <>
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 block">Select Provider</label>
                    <div className="grid grid-cols-3 gap-2">
                      {mobileMoneyProviders.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProvider(p.id)}
                          className={`p-3 rounded-xl border transition-all text-center ${
                            selectedProvider === p.id
                              ? "bg-cyan-500/20 border-cyan-500"
                              : "bg-slate-900 border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          <span className="text-2xl block mb-1">{p.icon}</span>
                          <span className="text-white text-xs font-medium">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 block">Phone Number</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+254 7XX XXX XXX"
                      className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <p className="text-green-400 text-sm font-medium">How it works:</p>
                    <ol className="text-slate-400 text-xs mt-1 space-y-1 list-decimal list-inside">
                      <li>Enter your mobile money number</li>
                      <li>You'll receive a payment prompt</li>
                      <li>Enter your PIN to confirm</li>
                      <li>Funds credited in 1-3 minutes</li>
                    </ol>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!selectedProvider || !phoneNumber}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold rounded-xl transition-all disabled:cursor-not-allowed"
                  >
                    Send Payment Request
                  </button>
                </>
              )}

              {/* Credit Card Details */}
              {method === "card" && (
                <>
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 block">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 block">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      placeholder="JOHN DOE"
                      className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white uppercase focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 text-sm font-medium mb-2 block">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 text-sm font-medium mb-2 block">CVV</label>
                      <input
                        type="password"
                        value={cardCVV}
                        onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-400 text-xs">Your card is secured with 256-bit SSL encryption. We never store your card details.</p>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!cardNumber || !cardName || !cardExpiry || !cardCVV}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold rounded-xl transition-all disabled:cursor-not-allowed"
                  >
                    Pay {currency.symbol}{amount}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
