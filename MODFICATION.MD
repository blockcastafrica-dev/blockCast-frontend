# BlockCast v2 - Recent Modifications (Last 5 Days)

## Overview

This document summarizes all major updates made to the BlockCast v2 codebase in the past 5 days based on GitHub commits.

---

## 1. ShareModal Redesign

**File:** `src/components/ShareModal.tsx` (211 lines)

### Changes:
- Complete redesign with modern, simple UI
- Removed Dialog component, uses custom fixed-position modal
- Fixed progress bar to match market card percentages
- Aligned description text to the left

### Current Features:
- Market preview card with:
  - Category badge (cyan)
  - Progress bar matching market card percentages (True/False pools)
  - Percentage labels on each side
- Social share buttons: X (Twitter), WhatsApp, Telegram, Facebook with brand colors
- Copy link with input field and copy button (turns green on copy)
- Close button with cyan hover effect
- Dark theme (#0f1419 background, blur backdrop)

---

## 2. WithdrawWallet Modal

**File:** `src/components/WithdrawWallet.tsx` (384 lines)

### Commits:
- `50001cf` - Redesign WithdrawWallet to match FundWalletModal UI
- `2ddcd0f` - Rewrite WithdrawWallet to match FundWalletModal structure

### Changes:
| Feature | Before | After |
|---------|--------|-------|
| Steps | 3 steps | 2 steps |
| Payment Methods | Complex multi-currency support | Simple method selection |
| Currency Selector | USD, NGN, KES, GHS, ZAR | Removed (USDT only) |
| Mobile Money/Card | Full forms | "Coming Soon" toast |
| Network icons | Emoji icons | Removed |
| Bank Transfer | Supported | Removed |
| Lines of Code | 729 lines | 384 lines |

### Current Features:

**Step 1: Method Selection**
- Crypto Wallet - "Popular" badge, MetaMask/BNB/Base icons, 0.5% fee
- Mobile Money - Yellow Card logo, "Coming Soon" badge, 1.2% fee
- Credit/Debit Card - "Coming Soon" badge, 2.9% fee
- Security notice with Shield icon

**Step 2: Crypto Withdrawal**
- Network selector (BEP20, ERC20, Base, TRC20)
- Wallet address input
- Amount input with min/fee display
- Fee summary (Amount, Network fee, You'll receive)
- Warning about wrong addresses
- Cyan "Withdraw" button

### Network Options:
| Network | Token | Fee | Min Withdraw | Time |
|---------|-------|-----|--------------|------|
| BNB Smart Chain | USDT (BEP20) | 0.5 USDT | 10 USDT | ~3 min |
| Ethereum | USDT (ERC20) | 5 USDT | 50 USDT | ~5 min |
| Base | USDT (Base) | 0.3 USDT | 10 USDT | ~2 min |
| Tron | USDT (TRC20) | 1 USDT | 5 USDT | ~3 min |

---

## 3. FundWalletModal Overhaul

**File:** `src/components/FundWalletModal.tsx` (673 lines)

### Changes:
- Created new modal with proper mobile support and 3 payment methods
- Added Yellow Card logo integration
- Improved close button hover effect
- Clean fee summary design (neutral colors, no distracting styling)
- Full-screen modal option for better mobile experience
- Proper cyan color scheme (#06b6d4) for action buttons
- Fixed Continue button states (cyan when amount entered)
- Dynamic spacing for currency symbol

### Current Features:

**3-Step Flow:**
1. Select Method
2. Enter Amount
3. Payment Details

**Payment Methods:**
| Method | Fee | Status |
|--------|-----|--------|
| Crypto Wallet (MetaMask, BNB, Base) | 0.5% | Active |
| Mobile Money (Yellow Card) | 1.2% | Coming Soon |
| Credit/Debit Card (Visa, Mastercard) | 2.9% | Coming Soon |

**Multi-Network Crypto Support:**
| Network | Token | Min Deposit | Time |
|---------|-------|-------------|------|
| BNB Smart Chain | USDT (BEP20) | $10 | ~3 mins |
| Ethereum | USDT (ERC20) | $50 | ~5 mins |
| Base | USDT (Base) | $10 | ~2 mins |
| Tron | USDT (TRC20) | $5 | ~3 mins |

**Multi-Currency Support:**
- USD ($), NGN (₦), KES (KSh), GHS (₵), ZAR (R)

---

## 4. ProbabilityChart Updates

**File:** `src/components/ProbabilityChart.tsx` (307 lines)

### Commits:
- `a260a70` - Added selected state styling for time period buttons
- `55d8bba` - Fix ProbabilityChart to fill full width and reflect actual betting trends

### Changes (commit `a260a70`):
- Added selected state styling for time period buttons
- Active time range button (24H, 7D, 30D, ALL) now has cyan background (#06b6d4) with white text
- Time range buttons use consistent pill/rounded style with hover effects

### Changes (commit `55d8bba`):
- **Full Width Fix:** Chart now fills entire container width (removed 3-column grid constraint)
- **Chart Margins:** Set `margin.right: 0` and `YAxis width: 35px` for optimal space usage
- **Realistic Trend Data:** Complete rewrite of `generateChartData` function:
  - Starts from 50/50 (simulating market opening)
  - Progressively trends toward current True/False pool percentages
  - Uses quadratic easing (slow start, accelerates) for realistic momentum
  - Adds seeded fluctuations (`Math.sin(hoursAgo * 0.1) * 3`) for natural appearance
  - Final data point always matches exact current pool percentages
  - Values clamped between 5% and 95%

### Trend Behavior:
| Current True % | Chart Shows |
|----------------|-------------|
| 70% | Upward trend from 50% → 70% |
| 30% | Downward trend from 50% → 30% |
| 50% | Flat/stable line around 50% |

### Current Features:
- True/False percentages with cyan (#22d3ee) and purple (#7c3aed) colors
- Trend indicator (up/down arrow with percentage change) - now reflects actual pool movement
- Line chart with responsive height (48px mobile → 72px desktop)
- Action buttons: Like, Bookmark, Share
- BlockCast watermark logo

---

## 5. MarketPage Layout Updates

**File:** `src/components/MarketPage.tsx` (1528 lines)

### Commits:
- `c01674c` - Two-column flex layout for desktop
- `55d8bba` - Fix chart container to use full width
- `f0ee2d7` - Add mobile sticky betting bar above footer

### Changes (commit `c01674c`):
- Two-column flex layout for desktop
- Left column: All content (header, chart, tabs)
- Right column: Betting modal (sticky, 380px width)
- 60px gap between chart section and betting modal
- Sticky betting modal with `top: 100px` offset for navbar clearance
- Max width container (7xl = 1280px) for better desktop presentation

### Changes (commit `55d8bba`):
- **Removed 3-column grid:** Changed from `grid lg:grid-cols-3` with `lg:col-span-2` to simple vertical stack
- **Full width chart:** ProbabilityChart now wrapped in `<div className="w-full">` for proper expansion
- **Layout structure:** Changed to `space-y-4 md:space-y-5 lg:space-y-6` for consistent vertical spacing

### Changes (commit `f0ee2d7`):
- **Mobile Sticky Betting Bar:** Fixed position bar above mobile footer (`bottom: 70px`)
- **Progress Bar:** Cyan→Purple gradient matching market cards with white percentage labels
- **Pool Buttons:** Display volume in $K format (e.g., "$1050.0K", "$450.0K")
- **Button Styling:** Same as desktop - pill shape (`rounded-full`), gradient background when selected
- **Glow Effects:** Cyan glow for True, Purple glow for False when selected
- **Container:** Dark background (`#0f0f15`) with border for visibility
- **Visibility:** Only shows on mobile (`lg:hidden`)

### Changes (commit `a98839f`):
- **Mobile Betting Modal:** Full-screen modal that opens when clicking True/False buttons in sticky bar
- **Header:** Market image, title, and X close button
- **Buy/Sell Tabs:** Toggle between buy and sell modes with underline indicator
- **Progress Bar:** Cyan→Purple gradient with percentages on both sides
- **Pick a Side:** TRUE/FALSE pill buttons matching desktop style
  - `rounded-full` shape
  - Cyan gradient + glow for TRUE when selected
  - Purple gradient + glow for FALSE when selected
  - Gray with hover effect when unselected
- **Amount Input:** Dollar prefix, available balance display
- **Market Info:** Price change, Shares, Avg. price
- **Fee Info:** 3% fee, Max profit (emerald color), Max payout
- **Cast Position Button:**
  - Cyan (#06f6ff) with black text when amount entered
  - Gray (#334155) with muted text when disabled
- **State Management:** `showMobileBetModal` state to control visibility

### Changes (commit `c1d98c4`):
- **Hide Sticky Bar When Modal Open:** Added `!showMobileBetModal` condition to hide bottom sticky bar when betting modal is displayed
- **Modal Positioned Above Footer:** Changed from `inset-0` to `bottom: 70px` so modal doesn't overlap footer menu
- **Cast Position Button Visibility:** Button now properly visible within modal container above footer

### Changes (commit `7ab69d4`):
- **Buy/Sell Tabs Styling:** Matched desktop version with `gap-4`, `text-base font-semibold`, thicker underline (`h-1 bg-primary`)

### Changes (commit `2303151`):
- **Header Redesign:** X close button moved to own row, larger market image (14x14), bigger title (text-lg font-bold)
- **Tabs Outside Scrollable Area:** Buy/Sell tabs fixed below title for better UX

### Changes (commit `8d2d92b`):
- **Modal Position:** Lowered modal (`top: 120px`) for better visibility with rounded top corners
- **X Close Button:** Absolute positioned top-right with cyan hover effect (#06f6ff border)
- **Layout Spacing:** Spacer div for X button, increased padding (`px-6`) for market title and tabs
- **Backdrop Overlay:** Semi-transparent backdrop (`bg-black/50`) - click outside to close modal

### Changes (commits `c7730a9`, `6aa3b76`, `b28f4ce`, `72c627e`, `670a2f5`, `9903f43`, `5ae834c`, `477acf1`, `03d54a3`, `d9a15b2`):
- **Mobile Betting UI Background:** Updated to match FundWalletModal styling with `#0f1419` background
- **Border Styling:** Changed to `#1f2937` border for mobile betting UI
- **True Button Color:** Updated to match desktop cyan-400 styling with `rgba(34, 211, 238, ...)` gradient, border, and shadow
- **Desktop Betting Sidebar:** Kept original gradient styling (`bg-gradient-to-b from-zinc-950 to-black`)
- **Percentage Figures:** Changed desktop sidebar percentage text (70%/30%) to white

### Changes (commit `830225c`):
- **TRUE/FALSE Buttons:** Increased padding (`py-3` → `py-4`) and gap (`gap-3` → `gap-4`) for better touch targets
- **Pick a Side Section:** Increased spacing (`space-y-2` → `space-y-3`)
- **Amount Section:** Increased spacing (`space-y-2` → `space-y-3`)
- **Available Balance Badge:** Made taller (`py-1` → `py-1.5`)
- **Market Info Section:** Added `mt-4` margin to push price details (shares, avg price, fee) lower
- **Enter Amount Button:** Adjusted margin (`mt-14`) for better positioning

### Current Features:
- ProbabilityChart integration with share functionality (now full width)
- Tabs: Dispute, Overview, Activity, AI Analysis, Comments
- Buy/Sell interface with:
  - Percentage bar (gradient)
  - TRUE/FALSE pill buttons with glow effects
  - Amount input with USDT prefix
  - Price change, shares, avg price calculations
  - Fee (3%), max profit, max payout display
- ShareModal integration

---

## 6. BettingMarkets (Market Card Progress Bar)

**File:** `src/components/BettingMarkets.tsx` (1410 lines)

### Progress Bar Styling:
```css
/* True (left side) */
background: linear-gradient(90deg,
  rgba(34, 211, 238, 0.5) 0%,
  rgba(6, 246, 255, 0.6) 50%,
  rgba(167, 139, 250, 0.3) 100%
);

/* False (right side) */
background: linear-gradient(90deg,
  rgba(167, 139, 250, 0.3) 0%,
  rgba(139, 92, 246, 0.5) 50%,
  rgba(124, 58, 237, 0.6) 100%
);
```

### Current Features:
- 31 active markets across categories (Entertainment, Gossip, Finance, Politics, Sports, Technology, Climate, Health, Business, Brand)
- Market cards with:
  - Image with country/region badge
  - Gradient progress bar (cyan → purple)
  - True/False betting buttons with odds
  - Category badge, Pool amount, Expiry timer
- Search and filter by category/trending/type
- Bet dialog with glow effects on True/False selection
- Share modal integration

---

## 7. Mobile Modal Positioning Fixes

### Extensive Iterations:
- Numerous commits to fix modal positioning between header and footer
- Used various approaches: top/bottom positioning, inline styles, Tailwind classes
- Ensured modals fit on screen without excessive scrolling
- Fixed dialog visibility issues on mobile devices

---

## 8. UI/UX Improvements

- Improved layout spacing between chart and betting modal
- Better wallet dialog spacing and layout
- Payment method icons changed to circles with increased size
- Increased chunk size warning limit to 1000kb (build optimization)

---

## UI Design Patterns

### Colors:
- **Primary/True:** Cyan (#06f6ff, #22d3ee, #06b6d4)
- **Secondary/False:** Purple (#7c3aed, #c084fc)
- **Background:** Dark (#0f1419)
- **Cards:** #1a1f26
- **Mobile Betting UI:** Dark (#0f1419) with border (#1f2937)

### Progress Bars:
- Gradient from cyan → purple based on pool percentages

### Buttons:
- Cyan hover effects
- Glow shadows on active states
- Disabled state: gray (#334155)

### Modals:
- Dark theme (#0f1419 background)
- Blur backdrop (4px)
- 16px rounded corners
- Close button with cyan border on hover

---

## File Summary

| File | Lines | Description |
|------|-------|-------------|
| `ShareModal.tsx` | 211 | Social sharing modal |
| `WithdrawWallet.tsx` | 384 | Withdrawal modal |
| `FundWalletModal.tsx` | 673 | Deposit modal |
| `ProbabilityChart.tsx` | 307 | Market chart component |
| `MarketPage.tsx` | 1832 | Individual market page |
| `BettingMarkets.tsx` | 1410 | Markets list/grid |

---

## 9. Betting Modal Buy/Sell Interface Improvements

**Files:** `src/components/MarketPage.tsx`, `src/components/BettingMarkets.tsx`

### Commits:
- `f9d1f80` - Fix betting modal to show current odds instead of duplicate price change
- `9f9aaab` - Add cyan border to amount input when value is entered
- `0ab8a9b` - Differentiate Buy and Sell interfaces in betting modal

### Changes:

**Fixed "Price change" duplicate display:**
- Changed from showing same value twice (`$1.43 → $1.43`) to single "Current odds" value (`1.43x`)

**Amount Input Styling:**
- Cyan border (#06b6d4) appears when user enters a value
- Transparent background with white text
- No border when empty

**Buy Interface (Desktop & Mobile):**
| Field | Value |
|-------|-------|
| Current odds | `{yesOdds/noOdds}x` |
| Shares | Calculated shares |
| Avg. price | Amount / Shares |
| Fee | 3% |
| Max profit | Profit amount + percentage |
| Max payout | Total potential return |
| Button | "Buy Position" (cyan #06f6ff) |

**Sell Interface (Desktop & Mobile):**
| Field | Value |
|-------|-------|
| Price per share | `${ 1 / odds }` (e.g., $0.70) |
| Shares to sell | Calculated shares |
| Est. return | Amount entered |
| Fee | 3% |
| Net proceeds | Amount × 0.97 (after fee) |
| Button | "Sell Position" (red #ef4444) |

### Mobile Modal:
- Conditional rendering based on `castInterface` state ("buy" or "sell")
- Different content sections for each mode
- Button color changes: cyan for Buy, red for Sell

### Input Styling Consistency (commit `d134f15`):
- Matched BettingMarkets.tsx input with MarketPage.tsx styling
- Dark gray background (`bg-zinc-900/80`)
- Border styling (`border-2 border-zinc-700/50`)
- Rounded corners (`rounded-xl md:rounded-2xl lg:rounded-2xl`)
- Gray placeholder text (`placeholder:text-zinc-500`)
- Responsive height (`h-12 md:h-14 lg:h-16`)
- Responsive font size (`text-lg md:text-xl lg:text-2xl`)
- USDT label with consistent positioning (`left: 20px`)
- USDT label color changed to white (commit `d91baa0`)

### Betting Modal Redesign (commit `954e844`):
- Complete redesign to match MarketPage modal style
- Custom modal with solid dark background (`#0f1419`)
- Header with title and X close button (cyan border on hover)
- Market claim section with source info and market image (commit `edde6c5`):
  - 48x48px rounded image (`w-12 h-12 rounded-lg`)
  - Flexbox layout with image on left, text on right
  - Image only shown if `selectedMarket.imageUrl` exists
- Percentage bar with cyan→purple gradient showing pool distribution
- Pick a side (TRUE/FALSE) buttons with glow effects
- Amount input with:
  - USDT label and input at proportional 18px font size
  - Cyan border highlight (`#06b6d4`) when value entered
  - Dark background (`bg-zinc-900/80`)
- Market Info section (Current odds, Shares, Avg. price)
- Fee Info section (Fee, Max profit in emerald, Max payout)
- Dynamic Cast Position button:
  - Cyan (`#06f6ff`) with black text when active
  - Gray (`#334155`) when disabled
  - Shows "Enter amount" / "Insufficient balance" / "Cast Position"

---

*Last Updated: December 27, 2025*
