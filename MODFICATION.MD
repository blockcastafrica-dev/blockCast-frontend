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
- Amount input with min/fee display and cyan border highlight when value entered
- Fee summary (Amount, Network fee, You'll receive)
- Warning about wrong addresses
- Cyan "Withdraw" button

### Amount Input Styling (Crypto Method):
- USDT label: White text, positioned left inside input (`left-4`)
- Input padding: `paddingLeft: 60px` to accommodate label
- Border: 2px solid
- Active (with value): Cyan border (`#06b6d4`)
- Inactive (empty): Zinc border (`rgba(63, 63, 70, 0.5)`)
- Matches FundWalletModal and BettingMarkets input styling pattern

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
- Cyan border highlight on amount input when value is entered (matching betting platform style)

### Amount Input Styling (Crypto Method):
- USDT label: White text, positioned left inside input (`left-4`)
- Input padding: `paddingLeft: 60px` to accommodate label
- Border: 2px solid
- Active (with value): Cyan border (`#06b6d4`)
- Inactive (empty): Zinc border (`rgba(63, 63, 70, 0.5)`)
- Matches BettingMarkets.tsx input styling pattern

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
- Fee Info section (Fee on winnings, Max profit in emerald, Max payout)
- Dynamic Cast Position button:
  - Cyan (`#06f6ff`) with black text when active
  - Gray (`#334155`) when disabled
  - Shows "Enter amount" / "Insufficient balance" / "Cast Position"

### Fee Calculation Fix (commit `2331c93`):

**Files:** `src/components/MarketPage.tsx`, `src/components/BettingMarkets.tsx`

**Issue:** Fee was incorrectly calculated on gross payout instead of winnings only.

**Before (incorrect):**
```javascript
const fee = grossPayout * 0.03;  // 3% of total payout
```

**After (correct):**
```javascript
const grossProfit = grossPayout - amount;
const fee = grossProfit * 0.03;  // 3% of winnings only
```

**Example Calculation (1 USDT bet at 1.43x odds):**
| Step | Before | After |
|------|--------|-------|
| Gross Payout | $1.43 | $1.43 |
| Gross Profit | $0.43 | $0.43 |
| Fee (3%) | $0.04 (on payout) | $0.01 (on winnings) |
| Max Payout | $1.39 | $1.42 |
| Max Profit | $0.39 (39%) | $0.42 (42%) |

**Locations Fixed:**
- `MarketPage.tsx:197` - calculateProfit function
- `BettingMarkets.tsx:1414` - Market Info calculation
- `BettingMarkets.tsx:1446` - Fee Info calculation

---

## 10. FAQ Page Redesign (Kalshi-Style)

**File:** `src/pages/HelpCenterPage.tsx`

### Commits:
- `0ee9e0c` - Redesign Help Center as modern FAQ with FundWallet styling
- `edd045d` - Redesign FAQ page with Kalshi-style layout
- `edcdd9a` - Update FAQ page title and styling
- `a5def4f` - Add hover highlight effect to FAQ questions
- `1c824b3` - Add hover highlight with BlockCast color scheme
- `ffced16` - Redesign FAQ page header with cyan banner

### Changes:
- Complete redesign inspired by Kalshi FAQ layout
- Full-width cyan hero banner like Kalshi
- Clean, minimal accordion-style questions
- Category sections with clear separation
- Removed filter pills for cleaner look

### Design Elements:

**Hero Banner:**
- Full-width cyan background (`#06b6d4`)
- Centered title: "Frequently Asked Questions" (42px, black, bold)
- Subtitle: "Find answers to your questions" (18px, black/60%)
- Padding: 64px vertical

**Section Titles (General, Verification, Markets):**
- Size: 28px (mobile) / 36px (desktop)
- Font weight: Semibold
- Margin top: 8 (mt-8)
- Margin bottom: 6 (mb-6)
- Large spacing between sections (space-y-32 / space-y-40)

**Question Items:**
- Arrow icon (ChevronDown) rotates: -90° closed, 0° open
- Arrow turns cyan on hover (cyan-400)
- Text: 17px font-medium, white color
- Hover effect: Rounded background highlight (#2d3748)
- Expanded state: Same background (#2d3748)
- JavaScript onMouseEnter/onMouseLeave for reliable hover
- Space between questions: space-y-2

**Answer Text:**
- Size: 15px
- Color: zinc-300
- Left margin aligned with question text (ml-9)
- Padding: px-4 pb-4

### FAQ Categories:
| Category | Questions |
|----------|-----------|
| General | 8 questions (What is a prediction market, How does the platform work, Is this gambling, How is my money protected, What fees are charged, What currencies/payment methods, Where can I learn more) |
| Verification | 4 questions (How are market outcomes verified, Who decides the final outcome, Can outcomes be disputed, Is the platform regulated) |
| Markets | 7 questions (What types of markets available, Why use prediction markets, How are prices determined, How do payouts work, Can I exit a position, What are the risks) |

### FAQ Accordion Behavior:
- Auto-close: Opening a new question automatically closes the previously open one
- Full-item clickable: Entire question area is clickable (cursor pointer on hover)
- Smooth transitions for expand/collapse

### AI Verification:
- Uses Google Gemini and Perplexity for AI-assisted data analysis

### Interaction States:
- **Hover:** Rounded background highlight (#2d3748), arrow turns cyan
- **Expanded:** Same background (#2d3748), arrow points down
- **Collapsed:** No background, arrow points right, white text

### Layout:
- Max width: 6xl (1152px)
- Padding: px-5 py-16 (mobile) / py-24 (desktop)
- Full width responsive design

---

## 11. Footer & Navigation Updates

**Files:**
- `src/components/Footer.tsx`
- `src/components/NavAccordion.tsx`
- `src/components/FooterAccordion.tsx`

### Commits:
- `c75b8fd` - Rename Help Center to FAQ in footer and mobile menu

### Changes:
- Renamed "Help Center" to "FAQ" across all navigation
- Desktop footer: Updated Resources section
- Mobile side menu: Updated Support & Legal section
- All links now point to `/help` route (FAQ page)

---

## 12. Contact Page Redesign

**File:** `src/pages/ContactPage.tsx`

### Commits:
- `0257c5b` - Redesign Contact page with FundWalletModal style
- `4436ba1` - Remove urgent misinformation alert section
- `682fbe6` - Remove email icon from header
- `ee5aaa1` - Fix header left alignment on desktop
- `b50a2bf` - Add full stop to subtitle
- `fd72518` - Remove icon from Send us a Message section
- `ead3b24` - Make Contact Information icon background round
- `ff4328f` - Update card backgrounds to brand color (#1a1f26)

### Changes:
- Complete redesign to match FundWalletModal and modal styling
- Dark theme page background (`#0f1419`)
- Card backgrounds (`#1a1f26`) with border (`#1f2937`)
- Cyan accent colors for interactive elements

### Design Elements:

**Header:**
- Title: 36px, bold, white, left-aligned on desktop
- Subtitle: 16px, gray (#9ca3af), left-aligned on desktop

**Contact Form:**
- Input fields with cyan border highlight on focus/value
- Dark input background (`#1a1f26`)
- Border: 2px solid, zinc when empty, cyan (`#06b6d4`) when filled
- Dropdown with custom ChevronDown icon
- Cyan submit button with hover effect

**Form Fields:**
- Full Name, Email Address (side by side on desktop)
- Inquiry Type (dropdown)
- Subject
- Message (textarea)

**Contact Information Card:**
- Round gradient icon (cyan → purple) header
- Email (cyan icon)
- Community (purple icon)
- Response Time (green icon)
- Headquarters (yellow icon)

**Social Media Buttons:**
- X (Twitter), Discord, Telegram
- Hover: cyan border + cyan background tint

**Security Notice:**
- Shield icon with privacy message
- Dark card background (`#1a1f26`)

### Removed:

- FAQ section (now on separate FAQ page)
- Quick Actions buttons
- Old card-based UI components
- Header email icon with gradient background
- Urgent misinformation alert section
- "Send us a Message" section icon

---

## 13. Category Pills Redesign

**File:** `src/components/BettingMarkets.tsx`

### Commits:
- `6b7cdaf` - Replace category dropdown with horizontal pill buttons

### Changes:
- Replaced "All Categories" dropdown select with horizontal scrollable pill buttons
- Categories now displayed as clickable pill-shaped buttons in a row below search bar
- Removed category dropdown from the filter row (kept Trending and All Types dropdowns)

### Design Elements:

**Category Pills Row:**
- Horizontal scrollable container (`overflow-x-auto`)
- Gap between pills: 8px (mobile) / 12px (desktop)
- Margin top: 16px (`mt-4`)

**Selected State:**
| Property | Value |
|----------|-------|
| Background | Cyan (`#06f6ff`) |
| Text Color | Black (`#000000`) |
| Border | Cyan (`#06f6ff`) |
| Shadow | Cyan glow (`0 4px 6px -1px rgba(6, 246, 255, 0.3)`) |

**Unselected State:**
| Property | Value |
|----------|-------|
| Background | Transparent |
| Text Color | White (`#ffffff`) |
| Border | Gray (`#444`) |
| Hover Border | Cyan (`#06f6ff`) |

**Button Styling:**
- Padding: `px-4 py-2` (mobile) / `px-6 py-2.5` (desktop)
- Border radius: Full (`rounded-full`)
- Font: Medium weight, 14px (mobile) / 16px (desktop)
- Transition: 200ms for smooth hover effects
- White-space: `nowrap` to prevent text wrapping

### Categories Displayed:
- All (default selected)
- Dynamic categories from markets (Entertainment, Gossip, Finance, Politics, Sports, Technology, Climate, Health, Business, Brand, etc.)

---

## 14. Create Market Button & Modal Pill Styling

**Files:** `src/components/BettingMarkets.tsx`, `src/components/CreateMarketModal.tsx`

### Commits:
- `0cc4018` - Update Create Market button and modal with pill button styling

### Changes:

**Create Market Button (BettingMarkets.tsx):**
- Changed from cyan background to pill style matching category buttons
- Transparent background with gray border (`#444`)
- White text
- Cyan border on hover (`#06f6ff`) using `onMouseEnter`/`onMouseLeave` handlers
- Added document icon with plus sign
- Rounded pill shape (`rounded-full`)

**Create Market Modal (CreateMarketModal.tsx) - Step 2:**

| Element | Before | After |
|---------|--------|-------|
| Categories | 2-column grid with filled backgrounds | Horizontal flex-wrap pill buttons |
| Subcategories | Rounded-lg with tinted backgrounds | Rounded-full pill buttons |
| Market Type | 2-column grid cards with descriptions | Simple pill buttons (Present/Future) |

**Pill Button Styling (Applied to all selections):**

| State | Background | Text | Border | Shadow |
|-------|------------|------|--------|--------|
| Selected | Cyan (`#06f6ff`) | Black (`#000000`) | Cyan | Cyan glow |
| Unselected | Transparent | White (`#ffffff`) | Gray (`#444`) | None |
| Hover | Transparent | White | Cyan (`#06f6ff`) | None |

**Button Properties:**
- Padding: `px-4 py-2`
- Border radius: `rounded-full`
- Font: 14px, medium weight
- Transition: 200ms

---

## 15. Connect Wallet Modal & Button

**Files:** `src/components/TopNavigation.tsx`, `src/components/ConnectWalletModal.tsx` (new)

### Commits:
- `345ca24` - Add Connect Wallet modal with wallet and social login options
- `7a4501e` - Fix More Wallets button to match other wallet options styling

### Changes:

**TopNavigation.tsx:**
- Replaced "Login" and "Sign Up" buttons with single "Connect Wallet" button
- Button styled with cyan background (`#06f6ff`), black text, rounded-full
- Wallet icon added to button
- Integrated ConnectWalletModal component

**ConnectWalletModal.tsx (New Component):**

### Modal Design (Matching Fund Wallet Style):
| Property | Value |
|----------|-------|
| Background | `#0f1419` |
| Border | `1px solid #1f2937` |
| Border Radius | `16px` |
| Max Width | `480px` |
| Z-Index | `99999` |

### Header:
- Gradient icon container (cyan to purple)
- Dynamic title based on current view
- Close button with cyan hover effect

### Views:

**1. Main View:**
- Wallet options: Binance Wallet, MetaMask, OKX Wallet
- "More Wallets" button (same styling as wallet options, with + icon)
- "OR" divider
- "Login with Social Account" button
- Terms checkbox (centered)

**2. More Wallets View:**
- All wallets: Binance, MetaMask, OKX, Trust Wallet, Coinbase, Phantom
- Back button to return to main

**3. Social Login View:**
- Google (white background)
- Apple (black background)
- X/Twitter (black background)
- Discord (purple background `#5865F2`)
- Telegram (blue background `#26A5E4`)

### Wallet Detection:
Auto-detects installed wallets and shows "Detected" badge:
- MetaMask: `window.ethereum?.isMetaMask`
- Binance: `window.BinanceChain`
- OKX: `window.okxwallet`
- Trust Wallet: `window.trustwallet`
- Coinbase: `window.coinbaseWalletExtension`
- Phantom: `window.phantom?.solana`

### Terms Agreement:
- Checkbox must be checked before connecting
- Links to Privacy and Terms of Use pages
- Wallet/social buttons disabled until agreed

### Card Styling:
| Property | Value |
|----------|-------|
| Background | `#1a1f26` |
| Border | `1px solid` gray-700 |
| Border Radius | `rounded-xl` |
| Hover | `border-cyan-500/50` |

---

## 16. Deposit Button Rename

**Files:** `src/components/TopNavigation.tsx`, `src/components/Settings.tsx`

### Commits:
- `b1114c4` - Change Add Funds button to + Deposit

### Changes:
- Renamed "+ Add Funds" button to "+ Deposit"
- Updated in TopNavigation (header) and Settings (wallet section)
- Simplified button content to single text span

---

*Last Updated: December 29, 2025*
