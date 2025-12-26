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

**File:** `src/components/ProbabilityChart.tsx` (295 lines)

### Changes (commit `a260a70`):
- Added selected state styling for time period buttons
- Active time range button (24H, 7D, 30D, ALL) now has cyan background (#06b6d4) with white text
- Time range buttons use consistent pill/rounded style with hover effects

### Current Features:
- True/False percentages with cyan (#22d3ee) and purple (#7c3aed) colors
- Trend indicator (up/down arrow with percentage change)
- Line chart with responsive height (48px mobile → 72px desktop)
- Action buttons: Like, Bookmark, Share
- BlockCast watermark logo

---

## 5. MarketPage Layout Updates

**File:** `src/components/MarketPage.tsx` (1528 lines)

### Changes (commit `c01674c`):
- Two-column flex layout for desktop
- Left column: All content (header, chart, tabs)
- Right column: Betting modal (sticky, 380px width)
- 60px gap between chart section and betting modal
- Sticky betting modal with `top: 100px` offset for navbar clearance
- Max width container (7xl = 1280px) for better desktop presentation

### Current Features:
- ProbabilityChart integration with share functionality
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
| `ProbabilityChart.tsx` | 295 | Market chart component |
| `MarketPage.tsx` | 1528 | Individual market page |
| `BettingMarkets.tsx` | 1410 | Markets list/grid |

---

*Last Updated: December 26, 2025*
