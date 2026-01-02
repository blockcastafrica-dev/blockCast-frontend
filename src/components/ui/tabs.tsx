"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs@1.1.3";

import { cn } from "./utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-auto w-full items-center justify-start gap-1 border-b border-zinc-800 pb-0",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "cursor-pointer px-4 py-3 text-sm font-medium text-muted-foreground transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={(el) => {
        if (el) {
          const updateActive = () => {
            setIsActive(el.getAttribute('data-state') === 'active');
          };
          updateActive();
          const observer = new MutationObserver(updateActive);
          observer.observe(el, { attributes: true, attributeFilter: ['data-state'] });
        }
      }}
      style={{
        color: isActive ? '#06f6ff' : (isHovered ? '#ffffff' : '#a1a1aa')
      }}
      {...props}
    >
      <span
        className="flex items-center gap-2 pb-1"
        style={{
          borderBottom: isActive ? '2px solid #06f6ff' : (isHovered ? '2px solid rgba(6, 246, 255, 0.5)' : 'none')
        }}
      >
        {children}
      </span>
    </TabsPrimitive.Trigger>
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
