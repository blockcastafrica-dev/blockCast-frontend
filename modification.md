# Modification Log

## 2026-01-02 - Sell Interface Overhaul

### Changes to `src/components/MarketPage.tsx`

**Problem:** The sell interface was using the same calculations as the buy interface, which was incorrect. When selling, users need to see their current holdings, the current market price, and their profit/loss.

**Solution:** Implemented proper sell logic with distinct calculations:

#### New Types Added:
- `SellCalculation` - Interface for sell-specific calculations
- `UserPosition` - Interface for tracking user's share holdings and cost basis
- `SELL_FEE_PERCENTAGE = 0.03` (3% trading fee on sales)

#### New State & Functions:
- `sellCalculation` - State for sell calculation results
- `sellAmount` - State for shares to sell input
- `userPositions` - Mock data for user's share holdings
- `getUserPosition()` - Helper to get user's position for selected outcome
- `calculateSellProceeds()` - Calculates sell proceeds with proper logic
- `handleSellAmountChange()` - Handler for sell amount input

#### Sell Calculation Logic:
- **Current price** = probability percentage / 100 (e.g., 30% = $0.30)
- **Gross proceeds** = shares to sell × current price
- **Trading fee** = 3% of gross proceeds
- **Net proceeds** = gross proceeds - fee
- **Profit/Loss** = net proceeds - (shares × average cost basis)

#### UI Changes (Mobile & Desktop):
- Shows "Your shares: X" instead of "Available USDT"
- Input accepts shares count instead of USDT amount
- Quick sell buttons: 25%, 50%, 75%, Max
- Displays:
  - Outcome name
  - Current sell price
  - Average cost basis (what user paid per share)
  - Gross proceeds
  - Trading fee (3%)
  - Net proceeds
  - Profit/Loss with percentage (green if profit, red if loss)
- Validation checks against user's owned shares (not USDT balance)
