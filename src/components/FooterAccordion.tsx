import React, { useState } from 'react'
import { Button } from "@/components/ui/button";

import { ChevronDown} from "lucide-react";

const FooterAccordion = ({ handleLinkClick, enableMobileHover = false }) => {
  const [toggleSupport, setToggleSupport] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

    const handleToggleSupport = () => {
      setToggleSupport(!toggleSupport);
    };

  // Mobile hover classes for dropdown items
  const mobileItemHover = enableMobileHover
    ? "rounded-md"
    : "";

  return (
    <div className="footer-accordion">
      <div
        onClick={handleToggleSupport}
        className="flex items-center justify-between gap-2 px-2 ml-2 cursor-pointer transition-all"
      >
        <span className="text-md text-muted-foreground transition-colors">
          Support & Legal
        </span>
        <ChevronDown
          className={`h-4 w-4 text-primary transform transition-transform duration-300 ${
            toggleSupport ? "arrow" : ""
          }`}
        />
      </div>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          toggleSupport ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
        }`}
      >
        {[
          { label: "About Blockcast", page: "about" },
          { label: "Contact Us", page: "contact" },
          { label: "Privacy Policy", page: "privacy" },
          { label: "Terms of Service", page: "terms" },
          { label: "Help Center", page: "contact" },
        ].map((item, index) => (
          <div
            key={item.label}
            onClick={() => handleLinkClick(item.page)}
            onMouseEnter={() => enableMobileHover && setHoveredItem(index)}
            onMouseLeave={() => enableMobileHover && setHoveredItem(null)}
            className={`flex items-center gap-2 px-2 ml-6 cursor-pointer py-1 transition-all ${mobileItemHover}`}
            style={
              enableMobileHover && hoveredItem === index
                ? { backgroundColor: 'rgba(6, 182, 212, 0.2)' }
                : {}
            }
          >
            <span
              className="text-sm text-muted-foreground transition-colors"
              style={
                enableMobileHover && hoveredItem === index
                  ? { color: '#06b6d4' }
                  : {}
              }
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FooterAccordion