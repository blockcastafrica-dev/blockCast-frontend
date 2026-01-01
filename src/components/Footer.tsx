import { BsTwitterX } from "react-icons/bs";
import { FaDiscord, FaTiktok, FaTelegramPlane } from "react-icons/fa";
import { HiOutlineDocumentText } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import geminiLogo from "@/assets/gemini-logo.svg";

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
            <span className="text-muted-foreground/50">•</span>
            <button
              onClick={() => window.open('https://docs.google.com/document/d/1esCM5JK1aGh3r_IC4JoXU590GpnmYsAIMuHwRm7HXo0/edit?usp=drive_web&ouid=100361246679737946923', '_blank')}
              className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
            >
              <HiOutlineDocumentText className="h-4 w-4" />
              Docs
            </button>
          </div>

          {/* Right side - Powered by AI + Social icons */}
          <div className="flex items-center gap-4">
            {/* Powered by AI */}
            <div className="flex items-baseline gap-3 text-sm text-foreground">
              <span>Powered by</span>
              <img src={geminiLogo} alt="Gemini" className="h-4 self-center" />
              <span>&</span>
              <div className="flex items-center gap-1.5 self-center">
                <svg className="h-4 w-4" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M101.008 42L190.99 124.905L190.99 124.886L190.99 42.1913H208.506L208.506 125.276L298.891 42V136.524L336 136.524V272.866H299.005V357.035L208.506 277.525L208.506 357.948H190.99L190.99 278.836L101.11 358V272.866H64V136.524H101.008V42ZM177.785 153.826H81.5159V255.564H101.088V223.472L177.785 153.826ZM118.625 231.149V319.392L190.99 255.655L190.99 165.421L118.625 231.149ZM209.01 254.812V165.336L281.396 231.068V272.866H281.489V318.491L209.01 254.812ZM299.005 255.564H318.484V153.826L222.932 153.826L299.005 222.751V255.564ZM281.375 136.524V81.7983L221.977 136.524L281.375 136.524ZM177.921 136.524H118.524V81.7983L177.921 136.524Z" fill="currentColor"/>
                </svg>
                <span>Perplexity</span>
              </div>
            </div>

            <span className="text-muted-foreground/50">•</span>

            {/* Social icons */}
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
      </div>
    </footer>
  );
}
