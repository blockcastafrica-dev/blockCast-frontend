import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const accordionData = [
  { label: "About Blockcast", page: "about" },
  { label: "Contact Us", page: "contact" },
  { label: "Privacy Policy", page: "privacy" },
  { label: "Terms of Service", page: "terms" },
  { label: "FAQ", page: "help" },
];

const NavAccordion = ({ handleLinkClick, accordionTitle, data = accordionData }) => {
  const [toggleSupport, setToggleSupport] = useState(false);

  const handleToggleSupport = () => {
    setToggleSupport(!toggleSupport);
  };

  return (
    <div className="space-y-4 nav-accordion">
      <div
        onClick={handleToggleSupport}
        className="flex items-center justify-between cursor-pointer border p-2 bg-gradient-to-r from-primary/10 to-secondary/10"
      >
        <h4 className="font-semibold text-xs md:text-sm">{accordionTitle}</h4>
        <ChevronDown
          className={`h-5 w-5 transform transition-transform duration-300  ${
            toggleSupport ? "arrow" : ""
          }`}
        />
      </div>
      <div
        className={`space-y-2 overflow-hidden transition-all duration-500 ease-in-out ${
          toggleSupport ? "h-96 opacity-100" : "h-0 opacity-0"
          // toggleSupport ? "max-h-96 opacity-100" : "h-0 opacity-0"
        }`}
      >
        {data.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            onClick={() => handleLinkClick(item.page)}
            className="w-full justify-start h-auto px-2 py-1 md:py-2 text-muted-foreground hover:text-foreground cursor-pointer mb-0"
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default NavAccordion