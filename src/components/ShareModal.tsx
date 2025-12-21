import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Copy, Check, Share2, MessageCircle, Send, Facebook, QrCode, Zap } from 'lucide-react';
import { BsTwitterX } from "react-icons/bs";
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: {
    id: string;
    claim: string;
    category: string;
    yesOdds: number;
    noOdds: number;
    totalPool: number;
    imageUrl?: string;
  } | null;
}

export default function ShareModal({ isOpen, onClose, market }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render if market is null
  if (!market) {
    return null;
  }
  
  const shareUrl = `https://blockcast.app/market/${market.id}?ref=user123`;
  const shareText = `🎯 Check out this prediction market on Blockcast!\n\n"${market.claim}"\n\nYES: ${market.yesOdds}x | NO: ${market.noOdds}x\nTotal Pool: $${(market.totalPool / 1000).toFixed(0)}K\n\nJoin me and let's see who predicts better! 🚀`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = (platform: string) => {
    setSelectedPlatform(platform);
    
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    let shareLink = '';
    
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      default:
        return;
    }
    
    window.open(shareLink, '_blank', 'width=600,height=400');
    setTimeout(() => setSelectedPlatform(null), 1000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Blockcast Prediction Market',
          text: shareText,
          url: shareUrl,
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      handleCopyLink();
    }
  };

  console.log('ShareModal rendering, isOpen:', isOpen, 'market:', market?.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md"
        style={isMobile ? {
          position: 'fixed',
          top: '60px',
          left: '16px',
          right: '16px',
          bottom: '70px',
          transform: 'none',
        } : {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxHeight: '90vh',
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Market
          </DialogTitle>
          <DialogDescription>
            Invite friends to bet on this market and earn rewards together
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-6">
          {/* Market Preview */}
          <div className="p-2 sm:p-4 bg-muted/30 rounded-lg">
            <Badge className="mb-1 sm:mb-2 bg-primary/20 text-primary border-primary/30 text-[10px] sm:text-xs">
              {market.category}
            </Badge>
            <h3 className="font-semibold mb-2 line-clamp-2 text-xs sm:text-sm">
              {market.claim}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-1.5 sm:p-2 bg-primary/10 rounded">
                <span className="text-xs font-semibold text-primary">YES {market.yesOdds}x</span>
              </div>
              <div className="text-center p-1.5 sm:p-2 bg-secondary/10 rounded">
                <span className="text-xs font-semibold text-secondary">NO {market.noOdds}x</span>
              </div>
            </div>
          </div>

          {/* Reward Banner - hidden on mobile */}
          <div className="hidden sm:block p-3 bg-gradient-to-r from-green-400/10 to-primary/10 rounded-lg border border-green-400/30">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-green-400" />
              <span className="text-sm font-semibold text-green-400">
                Referral Bonus
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Earn 0.1 USDT when your friend places their first bet!
            </p>
          </div>

          {/* Share Link */}
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="bg-muted text-muted-foreground text-[10px] sm:text-xs h-8 sm:h-10"
            />
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className="shrink-0 h-8 sm:h-10"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Social Platforms */}
          <div>
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" onClick={() => handleShare("twitter")} className="h-9 px-0" disabled={selectedPlatform === "twitter"}>
                <BsTwitterX className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => handleShare("facebook")} className="h-9 px-0" disabled={selectedPlatform === "facebook"}>
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => handleShare("whatsapp")} className="h-9 px-0" disabled={selectedPlatform === "whatsapp"}>
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => handleShare("telegram")} className="h-9 px-0" disabled={selectedPlatform === "telegram"}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Native Share / Quick Actions */}
          <div className="flex gap-2">
            <Button onClick={handleNativeShare} className="flex-1 gap-2 h-9 text-sm">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1 h-9 text-sm">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}