import { BsTwitterX } from "react-icons/bs";
import { FaDiscord, FaTiktok, FaTelegramPlane } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const navigate = useNavigate();

  const handleLinkClick = (page: string) => {
    const routeMap: Record<string, string> = {
      privacy: "/privacy",
      terms: "/terms",
      contact: "/contact",
    };

    const route = routeMap[page];
    if (route) {
      navigate(route);
    } else if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <footer className="hidden lg:block bg-card/80 backdrop-blur-sm border-t border-border/50 fixed bottom-0 left-0 right-0 z-40">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left side - Company name, copyright, and links */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Blockcast</span>
            <span>© {new Date().getFullYear()}</span>
            <span className="text-muted-foreground/50">•</span>
            <button
              onClick={() => handleLinkClick("privacy")}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <span className="text-muted-foreground/50">•</span>
            <button
              onClick={() => handleLinkClick("terms")}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Terms of Use
            </button>
            <span className="text-muted-foreground/50">•</span>
            <button
              onClick={() => handleLinkClick("contact")}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Contact
            </button>
          </div>

          {/* Right side - Social icons */}
          <div className="flex items-center gap-1">
            <button
                onClick={() => window.open('https://x.com/BlockCastLive', '_blank')}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="X (Twitter)"
              >
                <BsTwitterX className="h-4 w-4" />
              </button>
              <button
                onClick={() => window.open('https://discord.gg/blockcast', '_blank')}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Discord"
              >
                <FaDiscord className="h-4 w-4" />
              </button>
              <button
                onClick={() => window.open('https://tiktok.com/@blockcast', '_blank')}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="TikTok"
              >
                <FaTiktok className="h-4 w-4" />
              </button>
              <button
                onClick={() => window.open('https://t.me/blockcast', '_blank')}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Telegram"
              >
                <FaTelegramPlane className="h-4 w-4" />
              </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
