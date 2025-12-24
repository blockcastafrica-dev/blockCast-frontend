import { useState } from "react";
import { X, Wallet, CreditCard, Smartphone, Copy, Check, ChevronRight, ArrowLeft, Shield } from "lucide-react";
import { toast } from "sonner";

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = "crypto" | "mobile" | "card" | null;

export default function FundWalletModal({ isOpen, onClose }: FundWalletModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [method, setMethod] = useState<PaymentMethod>(null);
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [provider, setProvider] = useState("");

  const depositAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";

  const resetAndClose = () => {
    setStep(1);
    setMethod(null);
    setAmount("");
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCVV("");
    setPhoneNumber("");
    setProvider("");
    onClose();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    toast.success("Address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    toast.success("Payment initiated successfully!");
    resetAndClose();
  };

  const isAmountValid = amount && Number(amount) > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={resetAndClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'absolute',
          left: '16px',
          right: '16px',
          top: '96px',
          bottom: '80px',
          backgroundColor: '#0f1419',
          border: '1px solid rgba(6, 182, 212, 0.5)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step === 3 ? 2 : 1)}
                className="p-1"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
            )}
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">Fund Your Wallet</h2>
              <p className="text-gray-500 text-xs">Add funds to start betting</p>
            </div>
          </div>
          <button onClick={resetAndClose} className="p-2">
            <X className="w-5 h-5 text-cyan-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">

          {/* Step 1: Select Method */}
          {step === 1 && (
            <div className="space-y-3">
              {/* Crypto */}
              <button
                onClick={() => { setMethod("crypto"); setStep(2); }}
                className="w-full p-4 bg-[#1a1f26] border border-gray-700 rounded-xl text-left hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-xl">🪙</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">Crypto Wallet</span>
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] rounded-full">Popular</span>
                      </div>
                      <p className="text-gray-500 text-xs">MetaMask, Trust Wallet • Fee: 0.5%</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
              </button>

              {/* Mobile Money */}
              <button
                onClick={() => { setMethod("mobile"); setStep(2); }}
                className="w-full p-4 bg-[#1a1f26] border border-gray-700 rounded-xl text-left hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <span className="text-white font-medium">Mobile Money</span>
                      <p className="text-gray-500 text-xs">M-Pesa, MTN, Airtel • Fee: 1.2%</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
              </button>

              {/* Card */}
              <button
                onClick={() => { setMethod("card"); setStep(2); }}
                className="w-full p-4 bg-[#1a1f26] border border-gray-700 rounded-xl text-left hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <span className="text-white font-medium">Credit/Debit Card</span>
                      <p className="text-gray-500 text-xs">Visa, Mastercard • Fee: 2.9%</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
              </button>

              <div className="p-3 bg-[#1a1f26] border border-gray-800 rounded-xl mt-4">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-cyan-400 mt-0.5" />
                  <p className="text-gray-400 text-xs">All deposits are secured with encryption. Funds are converted to USDT.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Enter Amount */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-3 pl-8 bg-[#1a1f26] border border-gray-700 rounded-xl text-white text-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {isAmountValid && (
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">You'll receive</span>
                    <span className="text-cyan-400 font-bold">{Number(amount).toFixed(2)} USDT</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => isAmountValid && setStep(3)}
                disabled={!isAmountValid}
                style={{
                  backgroundColor: isAmountValid ? '#06b6d4' : '#334155',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '12px',
                  width: '100%',
                  fontWeight: 600,
                  cursor: isAmountValid ? 'pointer' : 'not-allowed',
                }}
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 3: Payment Details */}
          {step === 3 && (
            <div className="space-y-4">

              {/* Crypto */}
              {method === "crypto" && (
                <>
                  <p className="text-gray-300 text-sm text-center">Send <span className="text-cyan-400 font-bold">${amount} USDT</span> to:</p>
                  <div className="p-3 bg-[#1a1f26] border border-gray-700 rounded-xl flex items-center gap-2">
                    <code className="text-cyan-400 text-xs flex-1 break-all">{depositAddress}</code>
                    <button onClick={handleCopy} className="p-2 bg-gray-800 rounded-lg">
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                  <button
                    onClick={handleSubmit}
                    style={{ backgroundColor: '#06b6d4', color: 'white', padding: '12px', borderRadius: '12px', width: '100%', fontWeight: 600 }}
                  >
                    I've Sent Payment
                  </button>
                </>
              )}

              {/* Mobile Money */}
              {method === "mobile" && (
                <>
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Provider</label>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full p-3 bg-[#1a1f26] border border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="">Select provider</option>
                      <option value="mpesa">M-Pesa</option>
                      <option value="mtn">MTN Mobile Money</option>
                      <option value="airtel">Airtel Money</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Phone Number</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+254 7XX XXX XXX"
                      className="w-full p-3 bg-[#1a1f26] border border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!provider || !phoneNumber}
                    style={{
                      backgroundColor: provider && phoneNumber ? '#06b6d4' : '#334155',
                      color: 'white',
                      padding: '12px',
                      borderRadius: '12px',
                      width: '100%',
                      fontWeight: 600,
                      cursor: provider && phoneNumber ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Send Payment Request
                  </button>
                </>
              )}

              {/* Card */}
              {method === "card" && (
                <>
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full p-3 bg-[#1a1f26] border border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Name on Card</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="JOHN DOE"
                      className="w-full p-3 bg-[#1a1f26] border border-gray-700 rounded-xl text-white uppercase focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-300 text-sm mb-2 block">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full p-3 bg-[#1a1f26] border border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm mb-2 block">CVV</label>
                      <input
                        type="password"
                        value={cardCVV}
                        onChange={(e) => setCardCVV(e.target.value)}
                        placeholder="123"
                        maxLength={4}
                        className="w-full p-3 bg-[#1a1f26] border border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!cardNumber || !cardName || !cardExpiry || !cardCVV}
                    style={{
                      backgroundColor: cardNumber && cardName && cardExpiry && cardCVV ? '#06b6d4' : '#334155',
                      color: 'white',
                      padding: '12px',
                      borderRadius: '12px',
                      width: '100%',
                      fontWeight: 600,
                      cursor: cardNumber && cardName && cardExpiry && cardCVV ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Pay ${amount}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
