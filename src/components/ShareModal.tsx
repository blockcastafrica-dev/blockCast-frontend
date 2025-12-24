import { useState } from 'react';
import { X, Share2, Copy, Check } from 'lucide-react';
import { BsTwitterX, BsWhatsapp, BsTelegram, BsFacebook } from "react-icons/bs";
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: {
    id: string;
    claim: string;
    category: string;
    yesPool: number;
    noPool: number;
    totalPool: number;
    imageUrl?: string;
  } | null;
}

export default function ShareModal({ isOpen, onClose, market }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !market) return null;

  const shareUrl = `https://blockcast.app/market/${market.id}`;
  const shareText = `Check out this prediction: "${market.claim}" on Blockcast!`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    const links: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    };

    window.open(links[platform], '_blank', 'width=600,height=400');
  };

  const socialButtons = [
    { id: 'twitter', icon: BsTwitterX, label: 'X', bg: '#000000' },
    { id: 'whatsapp', icon: BsWhatsapp, label: 'WhatsApp', bg: '#25D366' },
    { id: 'telegram', icon: BsTelegram, label: 'Telegram', bg: '#0088cc' },
    { id: 'facebook', icon: BsFacebook, label: 'Facebook', bg: '#1877F2' },
  ];

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
        onClick={onClose}
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
          maxWidth: '400px',
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
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500">
              <Share2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">Share Market</h2>
              <p className="text-gray-500 text-xs">Invite friends to predict</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 p-0 flex items-center justify-center rounded-xl border-2 border-transparent transition-all group"
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
        <div style={{ padding: '16px' }} className="space-y-4">
          {/* Market Preview */}
          <div className="p-3 bg-[#1a1f26] rounded-xl">
            <span className="text-[10px] text-cyan-400 uppercase tracking-wide">{market.category}</span>
            <p className="text-white text-sm mt-1 line-clamp-2">{market.claim}</p>

            {/* Progress Bar */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex flex-col items-center">
                <span className="text-xs text-cyan-400 font-medium">
                  {((market.yesPool / market.totalPool) * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-cyan-400">True</span>
              </div>
              <div className="flex-1 h-2 rounded-full overflow-hidden flex">
                <div
                  className="h-full"
                  style={{
                    width: `${(market.yesPool / market.totalPool) * 100}%`,
                    background: 'linear-gradient(90deg, rgba(34, 211, 238, 0.5) 0%, rgba(6, 246, 255, 0.6) 50%, rgba(167, 139, 250, 0.3) 100%)',
                  }}
                />
                <div
                  className="h-full"
                  style={{
                    width: `${(market.noPool / market.totalPool) * 100}%`,
                    background: 'linear-gradient(90deg, rgba(167, 139, 250, 0.3) 0%, rgba(139, 92, 246, 0.5) 50%, rgba(124, 58, 237, 0.6) 100%)',
                  }}
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-purple-400 font-medium">
                  {((market.noPool / market.totalPool) * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-purple-400">False</span>
              </div>
            </div>
          </div>

          {/* Share Link */}
          <div>
            <label className="text-gray-400 text-xs mb-2 block">Share Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 p-3 bg-[#1a1f26] border border-gray-700 rounded-xl text-gray-400 text-xs font-mono"
              />
              <button
                onClick={handleCopy}
                style={{
                  backgroundColor: copied ? '#10b981' : '#06f6ff',
                  color: copied ? 'white' : 'black',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 600,
                }}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Social Buttons */}
          <div>
            <label className="text-gray-400 text-xs mb-2 block">Share on</label>
            <div className="flex gap-2">
              {socialButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => handleShare(btn.id)}
                  className="flex-1 p-3 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                  style={{ backgroundColor: btn.bg }}
                >
                  <btn.icon className="w-5 h-5 text-white" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
