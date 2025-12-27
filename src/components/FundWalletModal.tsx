import { useState } from "react";
import { X, Wallet, CreditCard, Smartphone, Copy, Check, ChevronRight, ArrowLeft, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface NetworkOption {
  id: string;
  name: string;
  token: string;
  address: string;
  minDeposit: number;
  confirmations: number;
  estimatedTime: string;
  icon: string;
}

const networks: NetworkOption[] = [
  {
    id: "bep20",
    name: "BNB Smart Chain",
    token: "USDT (BEP20)",
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    minDeposit: 10,
    confirmations: 15,
    estimatedTime: "~3 minutes",
    icon: "🟡"
  },
  {
    id: "erc20",
    name: "Ethereum",
    token: "USDT (ERC20)",
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    minDeposit: 50,
    confirmations: 12,
    estimatedTime: "~5 minutes",
    icon: "⟠"
  },
  {
    id: "base",
    name: "Base",
    token: "USDT (Base)",
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    minDeposit: 10,
    confirmations: 10,
    estimatedTime: "~2 minutes",
    icon: "🔵"
  },
  {
    id: "trc20",
    name: "Tron",
    token: "USDT (TRC20)",
    address: "TJYvKLZwC9f5HqJKx4qJKx4qJKx4qJKx4q",
    minDeposit: 5,
    confirmations: 20,
    estimatedTime: "~3 minutes",
    icon: "🔺"
  },
];

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = "crypto" | "mobile" | "card" | null;

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rate: number; // rate to USD
}

const currencies: CurrencyOption[] = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", rate: 1.0 },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", rate: 1580 },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪", rate: 154 },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", flag: "🇬🇭", rate: 14.5 },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦", rate: 18.2 },
];

export default function FundWalletModal({ isOpen, onClose }: FundWalletModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [method, setMethod] = useState<PaymentMethod>(null);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<CurrencyOption>(currencies[0]);
  const [copied, setCopied] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [provider, setProvider] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkOption>(networks[0]);
  const [transactionId, setTransactionId] = useState("");

  const resetAndClose = () => {
    setStep(1);
    setMethod(null);
    setAmount("");
    setCurrency(currencies[0]);
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCVV("");
    setPhoneNumber("");
    setProvider("");
    setSelectedNetwork(networks[0]);
    setTransactionId("");
    onClose();
  };

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(selectedNetwork.address);
    setCopied(true);
    toast.success("Address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCryptoSubmit = () => {
    if (!transactionId.trim()) {
      toast.error("Please enter your transaction ID/hash");
      return;
    }
    if (amountInUSD < selectedNetwork.minDeposit) {
      toast.error(`Minimum deposit is ${selectedNetwork.minDeposit} USDT for ${selectedNetwork.name}`);
      return;
    }
    toast.success("Deposit submitted! We'll verify your transaction shortly.");
    resetAndClose();
  };

  // Convert amount to USD
  const amountInUSD = amount ? Number(amount) / currency.rate : 0;

  const handleSubmit = () => {
    toast.success("Payment initiated successfully!");
    resetAndClose();
  };

  const isAmountValid = amount && Number(amount) > 0;

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
          zIndex: 9998,
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
          zIndex: 9999,
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
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step === 3 && method === "crypto" ? 1 : step === 3 ? 2 : 1)}
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
          <button
            type="button"
            onClick={resetAndClose}
            className="h-9 w-9 p-0 flex items-center justify-center rounded-xl border-2 border-transparent transition-all group"
            style={{ }}
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

          {/* Step 1: Select Method */}
          {step === 1 && (
            <div className="space-y-3">
              {/* Crypto - skip currency, go to step 3 */}
              <button
                onClick={() => { setMethod("crypto"); setStep(3); }}
                className="w-full p-4 bg-[#1a1f26] border border-gray-700 rounded-xl text-left hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border border-gray-600 flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.922 17.383V17.38C17.774 17.39 17.066 17.434 15.984 17.434C15.116 17.434 14.254 17.396 13.984 17.38V17.384C10.326 17.216 7.588 16.534 7.588 15.716C7.588 14.898 10.326 14.218 13.984 14.046V16.762C14.258 16.782 15.136 16.836 16 16.836C17.026 16.836 17.77 16.774 17.922 16.76V14.048C21.572 14.218 24.304 14.9 24.304 15.716C24.304 16.534 21.572 17.214 17.922 17.383ZM17.922 13.81V11.388H22.916V7.576H9.012V11.388H14.006V13.808C9.876 14.01 6.804 14.89 6.804 15.944C6.804 17 9.876 17.878 14.006 18.082V25.932H17.924V18.08C22.046 17.876 25.112 16.998 25.112 15.944C25.112 14.89 22.046 14.012 17.922 13.81Z" fill="white"/>
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">Crypto Wallet</span>
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] rounded-full">Popular</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {/* MetaMask */}
                        <svg className="w-4 h-4" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M35.1 3.5L21.8 13.3L24.3 7.5L35.1 3.5Z" fill="#E17726"/>
                          <path d="M4.9 3.5L18.1 13.4L15.7 7.5L4.9 3.5Z" fill="#E27625"/>
                          <path d="M30.2 26.9L26.6 32.5L34.3 34.6L36.5 27L30.2 26.9Z" fill="#E27625"/>
                          <path d="M3.5 27L5.7 34.6L13.4 32.5L9.8 26.9L3.5 27Z" fill="#E27625"/>
                          <path d="M13 17.1L10.8 20.4L18.2 20.7L18 12.6L13 17.1Z" fill="#E27625"/>
                          <path d="M27 17.1L21.9 12.5L21.8 20.7L29.2 20.4L27 17.1Z" fill="#E27625"/>
                          <path d="M13.4 32.5L17.9 30.3L14 27L13.4 32.5Z" fill="#E27625"/>
                          <path d="M22.1 30.3L26.6 32.5L26 27L22.1 30.3Z" fill="#E27625"/>
                          <path d="M26.6 32.5L22.1 30.3L22.5 33.5L22.4 34.5L26.6 32.5Z" fill="#D5BFB2"/>
                          <path d="M13.4 32.5L17.6 34.5L17.5 33.5L17.9 30.3L13.4 32.5Z" fill="#D5BFB2"/>
                          <path d="M17.7 25.2L13.9 24.1L16.6 22.9L17.7 25.2Z" fill="#233447"/>
                          <path d="M22.3 25.2L23.4 22.9L26.1 24.1L22.3 25.2Z" fill="#233447"/>
                          <path d="M13.4 32.5L14 27L9.8 27.1L13.4 32.5Z" fill="#CC6228"/>
                          <path d="M26 27L26.6 32.5L30.2 27.1L26 27Z" fill="#CC6228"/>
                          <path d="M29.2 20.4L21.8 20.7L22.3 25.2L23.4 22.9L26.1 24.1L29.2 20.4Z" fill="#CC6228"/>
                          <path d="M13.9 24.1L16.6 22.9L17.7 25.2L18.2 20.7L10.8 20.4L13.9 24.1Z" fill="#CC6228"/>
                          <path d="M10.8 20.4L14 27L13.9 24.1L10.8 20.4Z" fill="#E27625"/>
                          <path d="M26.1 24.1L26 27L29.2 20.4L26.1 24.1Z" fill="#E27625"/>
                          <path d="M18.2 20.7L17.7 25.2L18.3 28.5L18.5 23.2L18.2 20.7Z" fill="#E27625"/>
                          <path d="M21.8 20.7L21.5 23.2L21.7 28.5L22.3 25.2L21.8 20.7Z" fill="#E27625"/>
                          <path d="M22.3 25.2L21.7 28.5L22.1 30.3L26 27L26.1 24.1L22.3 25.2Z" fill="#F5841F"/>
                          <path d="M13.9 24.1L14 27L17.9 30.3L18.3 28.5L17.7 25.2L13.9 24.1Z" fill="#F5841F"/>
                          <path d="M22.4 34.5L22.5 33.5L22.1 33.2H17.9L17.5 33.5L17.6 34.5L13.4 32.5L14.8 33.7L17.9 35.8H22.1L25.2 33.7L26.6 32.5L22.4 34.5Z" fill="#C0AC9D"/>
                          <path d="M22.1 30.3L21.7 28.5H18.3L17.9 30.3L17.5 33.5L17.9 33.2H22.1L22.5 33.5L22.1 30.3Z" fill="#161616"/>
                          <path d="M35.8 14L36.9 8.9L35.1 3.5L22.1 13L27 17.1L34 19.1L35.9 16.9L35.1 16.3L36.4 15.1L35.4 14.3L36.7 13.3L35.8 14Z" fill="#763E1A"/>
                          <path d="M3.1 8.9L4.2 14L3.3 13.3L4.6 14.3L3.6 15.1L4.9 16.3L4.1 16.9L6 19.1L13 17.1L17.9 13L4.9 3.5L3.1 8.9Z" fill="#763E1A"/>
                          <path d="M34 19.1L27 17.1L29.2 20.4L26 27L30.2 26.9H36.5L34 19.1Z" fill="#F5841F"/>
                          <path d="M13 17.1L6 19.1L3.5 26.9H9.8L14 27L10.8 20.4L13 17.1Z" fill="#F5841F"/>
                          <path d="M21.8 20.7L22.1 13L24.3 7.5H15.7L17.9 13L18.2 20.7L18.3 23.2V28.5H21.7V23.2L21.8 20.7Z" fill="#F5841F"/>
                        </svg>
                        {/* BNB Chain */}
                        <svg className="w-4 h-4" viewBox="0 0 126 126" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M38.4 53.9L63 29.3L87.7 53.9L102.2 39.4L63 0L23.9 39.4L38.4 53.9Z" fill="#F0B90B"/>
                          <path d="M0 63L14.5 48.5L29 63L14.5 77.5L0 63Z" fill="#F0B90B"/>
                          <path d="M38.4 72.1L63 96.7L87.7 72.1L102.2 86.5L63 126L23.9 86.6L38.4 72.1Z" fill="#F0B90B"/>
                          <path d="M97 63L111.5 48.5L126 63L111.5 77.5L97 63Z" fill="#F0B90B"/>
                          <path d="M77.6 63L63 48.4L52.2 59.2L50.9 60.5L48.4 63L63 77.6L77.6 63Z" fill="#F0B90B"/>
                        </svg>
                        {/* Base */}
                        <svg className="w-4 h-4" viewBox="0 0 146 146" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="73" cy="73" r="73" fill="#0052FF"/>
                          <path d="M73.323 123.729C101.617 123.729 124.553 100.832 124.553 72.5875C124.553 44.343 101.617 21.4463 73.323 21.4463C46.4795 21.4463 24.4581 42.0558 22.271 68.2887H89.9859V76.8864H22.271C24.4581 103.119 46.4795 123.729 73.323 123.729Z" fill="white"/>
                        </svg>
                        <span className="text-gray-500 text-xs">• Fee: 0.5%</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
              </button>

              {/* Mobile Money */}
              <button
                onClick={() => toast.info("Mobile Money coming soon!")}
                className="w-full p-4 bg-[#1a1f26] border border-gray-700 rounded-xl text-left hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border border-gray-600 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">Mobile Money</span>
                        <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-[10px] rounded-full">Coming Soon</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {/* Yellow Card Official Logo */}
                        <svg className="h-5 w-16" viewBox="0 0 2977 680" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M368.055 247.859C368.055 110.996 479.005 0.0458984 615.868 0.0458984H680.299V432.232C680.299 569.096 569.35 680.046 432.486 680.046H368.055V247.859Z" fill="#FFCF33"/>
                          <path d="M0.296875 212.174C0.296875 349.038 111.247 459.987 248.11 459.987H312.542V247.859C312.542 110.996 201.592 0.0458984 64.7283 0.0458984H0.296875V212.174Z" fill="#FFCF33"/>
                          <path d="M312.54 458.182L2.17969 0.0458984H64.7262C201.59 0.0458984 312.54 110.996 312.54 247.859V458.182Z" fill="#FFD755"/>
                          <path d="M1167.48 367.801C1304.35 367.801 1415.3 478.751 1415.3 615.614V680.046H983.111C846.247 680.046 735.297 569.096 735.297 432.232V367.801H1167.48Z" fill="#4FA58C"/>
                          <path d="M1324.72 680.045L1113.2 367.8H1167.48C1304.34 367.8 1415.29 478.75 1415.29 615.614V680.045H1324.72Z" fill="#6CB49F"/>
                          <path d="M1167.48 312.291C1304.35 312.291 1415.3 201.341 1415.3 64.4778V0.0463867H983.111C846.247 0.0463867 735.297 110.996 735.297 247.86V312.291H1167.48Z" fill="#492B7C"/>
                          <path d="M1075.59 312.291L879.422 22.7148C910.967 8.16343 946.09 0.0463867 983.109 0.0463867H1415.3V64.4778C1415.3 201.341 1304.35 312.291 1167.48 312.291H1075.59Z" fill="#674E92"/>
                          <path d="M2552 368V680H2475.66V653.394C2460.76 671.131 2438.41 680 2408.61 680C2387.8 680 2368.82 675.214 2351.67 665.641C2334.52 655.787 2320.88 641.85 2310.76 623.831C2300.92 605.812 2296 584.977 2296 561.327C2296 537.677 2300.92 516.983 2310.76 499.245C2320.88 481.226 2334.52 467.43 2351.67 457.858C2368.82 448.285 2387.8 443.499 2408.61 443.499C2435.88 443.499 2456.97 451.382 2471.87 467.149V417C2471.87 389.938 2493.81 368 2520.87 368H2552ZM2425.48 616.229C2439.25 616.229 2450.64 611.443 2459.64 601.87C2468.63 592.016 2473.13 578.501 2473.13 561.327C2473.13 544.434 2468.63 531.201 2459.64 521.628C2450.92 512.056 2439.53 507.269 2425.48 507.269C2411.42 507.269 2399.89 512.056 2390.89 521.628C2381.9 531.201 2377.4 544.434 2377.4 561.327C2377.4 578.501 2381.9 592.016 2390.89 601.87C2399.89 611.443 2411.42 616.229 2425.48 616.229Z" fill="white"/>
                          <path d="M2213.29 474.829C2221.54 464.22 2232.22 456.334 2245.31 451.172C2258.69 445.724 2273.92 443 2291 443V516.552C2283.6 515.691 2277.48 515.261 2272.64 515.261C2255.27 515.261 2241.61 519.993 2231.65 529.456C2221.97 538.918 2217.13 553.399 2217.13 572.898V680H2136V443H2213.29V474.829Z" fill="white"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M1910.41 664.543C1926.8 674.848 1945.36 680 1966.07 680C1981.23 680 1994.99 677.034 2007.36 671.101C2015.35 667.268 2022.3 662.524 2028.23 656.868V680H2105V443H2028.23V466.587C2022.11 460.685 2015 455.789 2006.89 451.899C1994.83 445.966 1981.23 443 1966.07 443C1945.36 443 1926.8 448.152 1910.41 458.457C1894.33 468.761 1881.5 482.812 1871.92 500.611C1862.64 518.409 1858 538.706 1858 561.5C1858 584.294 1862.64 604.591 1871.92 622.389C1881.5 640.188 1894.33 654.239 1910.41 664.543ZM2017.1 600.375C2007.82 610.368 1995.61 615.364 1980.45 615.364C1970.87 615.364 1962.21 613.022 1954.48 608.338C1946.75 603.654 1940.72 597.253 1936.39 589.134C1932.06 581.016 1929.9 571.804 1929.9 561.5C1929.9 550.883 1932.06 541.516 1936.39 533.397C1941.03 525.279 1947.06 519.034 1954.48 514.662C1962.21 509.978 1971.02 507.636 1980.92 507.636C1990.81 507.636 1999.47 509.978 2006.89 514.662C2014.62 519.034 2020.5 525.279 2024.52 533.397C2028.85 541.516 2031.01 550.883 2031.01 561.5C2031.01 577.113 2026.37 590.071 2017.1 600.375Z" fill="white"/>
                          <path d="M1729 680C1697.57 680 1669.29 673.429 1644.14 660.286C1619.29 646.857 1599.71 628.286 1585.43 604.571C1571.14 580.857 1564 554 1564 524C1564 494 1571.14 467.143 1585.43 443.429C1599.71 419.714 1619.29 401.286 1644.14 388.143C1669.29 374.714 1697.57 368 1729 368C1756.43 368 1781.14 372.857 1803.14 382.571C1825.14 392.286 1843.43 406.286 1858 424.571L1804 473.429C1784.57 450 1761 438.286 1733.29 438.286C1717 438.286 1702.43 441.857 1689.57 449C1677 456.143 1667.14 466.286 1660 479.429C1653.14 492.286 1649.71 507.143 1649.71 524C1649.71 540.857 1653.14 555.857 1660 569C1667.14 581.857 1677 591.857 1689.57 599C1702.43 606.143 1717 609.714 1733.29 609.714C1761 609.714 1784.57 598 1804 574.571L1858 623.429C1843.43 641.714 1825.14 655.714 1803.14 665.429C1781.14 675.143 1756.43 680 1729 680Z" fill="white"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M2899.14 311L2977.14 72.0747H2905.01L2861.94 207.316L2819.99 72H2751.77L2708.7 206.069L2667.13 72.0747H2589.87L2667.86 311H2744.7L2784.23 190.909L2822.28 311H2899.14Z" fill="white"/>
                          <path d="M2464.5 312C2439.01 312 2416 306.721 2395.49 296.163C2374.98 285.605 2358.86 270.941 2347.14 252.171C2335.71 233.401 2330 212.138 2330 188.382C2330 164.92 2335.71 143.804 2347.14 125.034C2358.86 106.264 2374.83 91.7465 2395.05 81.4816C2415.56 70.9236 2438.71 65.6445 2464.5 65.6445C2490.29 65.6445 2513.44 70.9236 2533.95 81.4816C2554.46 91.7465 2570.43 106.264 2581.86 125.034C2593.29 143.51 2599 164.627 2599 188.382C2599 212.138 2593.29 233.401 2581.86 252.171C2570.43 270.941 2554.46 285.605 2533.95 296.163C2513.44 306.721 2490.29 312 2464.5 312ZM2464.5 245.572C2479.15 245.572 2491.16 240.586 2500.54 230.615C2509.92 220.35 2514.61 206.272 2514.61 188.382C2514.61 170.785 2509.92 157.001 2500.54 147.03C2491.16 137.058 2479.15 132.072 2464.5 132.072C2449.85 132.072 2437.83 137.058 2428.46 147.03C2419.08 157.001 2414.39 170.785 2414.39 188.382C2414.39 206.272 2419.08 220.35 2428.46 230.615C2437.83 240.586 2449.85 245.572 2464.5 245.572Z" fill="white"/>
                          <path d="M2100.78 0H2135.3C2162.36 0 2184.3 21.938 2184.3 49V312H2100.78V0Z" fill="white"/>
                          <path d="M2223 0H2257.51C2284.58 0 2306.51 21.938 2306.51 49V312H2223V0Z" fill="white"/>
                          <path d="M2077.98 189.262C2077.98 189.849 2077.54 196.741 2076.66 209.938H1903.48C1907 222.256 1913.74 231.788 1923.7 238.533C1933.96 244.985 1946.71 248.211 1961.94 248.211C1973.37 248.211 1983.19 246.598 1991.39 243.372C1999.89 240.146 2008.39 234.867 2016.89 227.535L2060.84 273.287C2037.69 299.096 2003.85 312 1959.31 312C1931.47 312 1907 306.721 1885.9 296.163C1864.8 285.605 1848.39 270.941 1836.67 252.171C1825.24 233.401 1819.53 212.138 1819.53 188.382C1819.53 164.92 1825.1 143.95 1836.23 125.474C1847.66 106.704 1863.34 92.0397 1883.26 81.4816C1903.19 70.9236 1925.61 65.6445 1950.52 65.6445C1974.25 65.6445 1995.79 70.6303 2015.13 80.6018C2034.47 90.2801 2049.71 104.504 2060.84 123.274C2072.27 141.751 2077.98 163.747 2077.98 189.262ZM1950.95 125.034C1938.06 125.034 1927.22 128.7 1918.43 136.032C1909.93 143.364 1904.51 153.335 1902.17 165.946H1999.74C1997.4 153.335 1991.83 143.364 1983.04 136.032C1974.54 128.7 1963.85 125.034 1950.95 125.034Z" fill="white"/>
                          <path d="M1740.39 197.524V311.794H1653.36V196.204L1536 0H1609.13C1620.75 0 1631.51 6.11245 1637.47 16.0923L1700.83 122.298L1764.19 16.0923C1770.15 6.11248 1780.91 0 1792.53 0H1858.19L1740.39 197.524Z" fill="white"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
              </button>

              {/* Card */}
              <button
                onClick={() => toast.info("Credit/Debit Card coming soon!")}
                className="w-full p-4 bg-[#1a1f26] border border-gray-700 rounded-xl text-left hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border border-gray-600 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">Credit/Debit Card</span>
                        <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-[10px] rounded-full">Coming Soon</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {/* Visa Logo */}
                        <svg className="h-4 w-auto" viewBox="0.5 0.5 999 323.684" xmlns="http://www.w3.org/2000/svg">
                          <path d="M651.185.5c-70.933 0-134.322 36.766-134.322 104.694 0 77.9 112.423 83.28 112.423 122.415 0 16.478-18.884 31.229-51.137 31.229-45.773 0-79.984-20.611-79.984-20.611l-14.638 68.547s39.41 17.41 91.734 17.41c77.552 0 138.576-38.572 138.576-107.66 0-82.316-112.89-87.537-112.89-123.86 0-12.91 15.501-27.053 47.662-27.053 36.286 0 65.892 14.99 65.892 14.99l14.326-66.204S696.614.5 651.185.5zM2.218 5.497L.5 15.49s29.842 5.461 56.719 16.356c34.606 12.492 37.072 19.765 42.9 42.353l63.51 244.832h85.138L379.927 5.497h-84.942L210.707 218.67l-34.39-180.696c-3.154-20.68-19.13-32.477-38.685-32.477H2.218zm411.865 0L347.449 319.03h80.999l66.4-313.534h-80.765zm451.759 0c-19.532 0-29.88 10.457-37.474 28.73L709.699 319.03h84.942l16.434-47.468h103.483l9.994 47.468H999.5L934.115 5.497h-68.273zm11.047 84.707l25.178 117.653h-67.454z" fill="white"/>
                        </svg>
                        {/* Mastercard Logo */}
                        <svg className="h-5 w-auto" viewBox="0 0 152 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="101" cy="50" r="50" fill="#F79E1B"/>
                          <circle cx="51" cy="50" r="50" fill="#EB001B"/>
                          <path d="M76 15.36C65.7 23.56 59 36.04 59 50C59 63.96 65.7 76.44 76 84.64C86.3 76.44 93 63.96 93 50C93 36.04 86.3 23.56 76 15.36Z" fill="#FF5F00"/>
                        </svg>
                      </div>
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
              {/* Currency Selector */}
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Currency</label>
                <select
                  value={currency.code}
                  onChange={(e) => setCurrency(currencies.find(c => c.code === e.target.value) || currencies[0])}
                  className="w-full p-3 bg-[#1a1f26] border border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Amount ({currency.code})</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{currency.symbol}</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '12px',
                      paddingLeft: currency.symbol.length > 1 ? '48px' : '32px',
                      backgroundColor: '#1a1f26',
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '18px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {isAmountValid && (
                <div style={{ padding: '16px', backgroundColor: '#1a1f26', borderRadius: '12px' }}>
                  <div className="flex justify-between mb-3">
                    <span style={{ color: '#9ca3af', fontSize: '14px' }}>Amount</span>
                    <span style={{ color: '#fff' }}>{currency.symbol}{Number(amount).toLocaleString()}</span>
                  </div>
                  {currency.code !== "USD" && (
                    <div className="flex justify-between mb-3">
                      <span style={{ color: '#9ca3af', fontSize: '14px' }}>Equivalent (USDT)</span>
                      <span style={{ color: '#fff' }}>USDT {amountInUSD.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between mb-3">
                    <span style={{ color: '#9ca3af', fontSize: '14px' }}>Fee ({method === "crypto" ? "0.5%" : method === "mobile" ? "1.2%" : "2.9%"})</span>
                    <span style={{ color: '#9ca3af' }}>-${(amountInUSD * (method === "crypto" ? 0.005 : method === "mobile" ? 0.012 : 0.029)).toFixed(2)}</span>
                  </div>
                  <div style={{ borderTop: '1px solid #374151', paddingTop: '12px', marginTop: '4px' }} className="flex justify-between">
                    <span style={{ color: '#fff', fontSize: '14px' }}>You'll receive</span>
                    <span style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>USDT {(amountInUSD * (1 - (method === "crypto" ? 0.005 : method === "mobile" ? 0.012 : 0.029))).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => isAmountValid && setStep(3)}
                disabled={!isAmountValid}
                style={{
                  backgroundColor: isAmountValid ? '#06f6ff' : '#334155',
                  color: isAmountValid ? 'black' : 'white',
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
                <div className="space-y-4">
                  {/* USDT Amount Input */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Amount (USDT)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">USDT</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        style={{
                          width: '100%',
                          padding: '12px',
                          paddingLeft: '60px',
                          backgroundColor: '#1a1f26',
                          border: '1px solid #374151',
                          borderRadius: '12px',
                          color: 'white',
                          fontSize: '18px',
                          outline: 'none'
                        }}
                      />
                    </div>
                    {amount && Number(amount) > 0 && (
                      <p className="text-gray-500 text-xs mt-1">
                        ≈ ${Number(amount).toFixed(2)} USD
                      </p>
                    )}
                  </div>

                  {/* Network Selection */}
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Select Network</label>
                    <select
                      value={selectedNetwork.id}
                      onChange={(e) => setSelectedNetwork(networks.find(n => n.id === e.target.value) || networks[0])}
                      className="w-full p-3 bg-[#1a1f26] border border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                    >
                      {networks.map((network) => (
                        <option key={network.id} value={network.id}>
                          {network.name} - {network.token}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Address */}
                  {amount && Number(amount) > 0 && (
                    <div className="p-4 bg-[#1a1f26] rounded-xl border border-gray-700 space-y-3">
                      <p className="text-gray-300 text-sm text-center">
                        Send <span className="text-cyan-400 font-bold">USDT {Number(amount).toFixed(2)}</span> to:
                      </p>
                      <div className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
                        <code className="text-cyan-400 text-xs flex-1 break-all">{selectedNetwork.address}</code>
                        <button onClick={handleCopyAddress} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                        </button>
                      </div>
                      <p className="text-gray-500 text-xs text-center">
                        Min: {selectedNetwork.minDeposit} USDT • Arrival: {selectedNetwork.estimatedTime}
                      </p>
                    </div>
                  )}

                  {/* Warning */}
                  <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-yellow-500/80 text-xs">
                      Only send <span className="font-bold">{selectedNetwork.token}</span> on <span className="font-bold">{selectedNetwork.name}</span>. Wrong network = lost funds.
                    </p>
                  </div>

                  {/* Done Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={!amount || Number(amount) <= 0}
                    style={{
                      backgroundColor: amount && Number(amount) > 0 ? '#06f6ff' : '#334155',
                      color: amount && Number(amount) > 0 ? 'black' : 'white',
                      padding: '12px',
                      borderRadius: '12px',
                      width: '100%',
                      fontWeight: 600,
                      cursor: amount && Number(amount) > 0 ? 'pointer' : 'not-allowed'
                    }}
                  >
                    I've Sent the Payment
                  </button>
                </div>
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
                      backgroundColor: provider && phoneNumber ? '#06f6ff' : '#334155',
                      color: provider && phoneNumber ? 'black' : 'white',
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
                      backgroundColor: cardNumber && cardName && cardExpiry && cardCVV ? '#06f6ff' : '#334155',
                      color: cardNumber && cardName && cardExpiry && cardCVV ? 'black' : 'white',
                      padding: '12px',
                      borderRadius: '12px',
                      width: '100%',
                      fontWeight: 600,
                      cursor: cardNumber && cardName && cardExpiry && cardCVV ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Pay {currency.symbol}{Number(amount).toLocaleString()}
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
