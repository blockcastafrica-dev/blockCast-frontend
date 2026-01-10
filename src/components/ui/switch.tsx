"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch@1.1.3";

import { cn } from "./utils";

function Switch({
  className,
  checked,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      checked={checked}
      className={cn(
        "peer relative inline-flex shrink-0 items-center rounded-full transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      style={{ width: '36px', height: '20px' }}
      {...props}
    >
      <SwitchPrimitive.Thumb
        style={{
          display: 'block',
          width: '16px',
          height: '16px',
          backgroundColor: 'white',
          borderRadius: '9999px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          transition: 'transform 200ms',
          transform: checked ? 'translateX(18px)' : 'translateX(2px)',
        }}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
