import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowUp, ArrowDown, Share2, Heart, Bookmark } from 'lucide-react';
import blockcastLogo from '@/assets/blockcast logo dark BG.svg';

interface MarketOutcome {
  id: string;
  label: string;
  pool: number;
  odds: number;
  color?: string;
}

interface ProbabilityChartProps {
  yesPercentage: number;
  noPercentage: number;
  totalPool?: number;
  yesPool?: number;
  noPool?: number;
  onShare?: () => void;
  isLiked?: boolean;
  onLikeToggle?: () => void;
  likeCount?: number;
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
  isMultipleChoice?: boolean;
  outcomes?: MarketOutcome[];
}

// Generate realistic historical data based on current pool percentages
const generateChartData = (currentYes: number, currentNo: number) => {
  const data = [];
  const now = new Date();

  // Start from 50/50 and trend towards current percentages with realistic fluctuations
  const startYes = 50;
  const startNo = 50;

  // Calculate the direction and magnitude of trend
  const yesDiff = currentYes - startYes;
  const noDiff = currentNo - startNo;

  // Generate data points over 7 days with natural progression
  const hoursPoints = [168, 156, 144, 132, 120, 108, 96, 84, 72, 60, 48, 36, 24, 12, 6, 0];

  hoursPoints.forEach((hoursAgo, index) => {
    const progress = 1 - (hoursAgo / 168); // 0 at start, 1 at end

    // Add some randomness for realistic fluctuations (seeded by hoursAgo for consistency)
    const seed = Math.sin(hoursAgo * 0.1) * 3;
    const fluctuation = hoursAgo === 0 ? 0 : seed; // No fluctuation for current value

    // Calculate percentage with easing (starts slow, accelerates)
    const easedProgress = progress * progress; // Quadratic easing

    let yesPercent = startYes + (yesDiff * easedProgress) + fluctuation;
    let noPercent = 100 - yesPercent;

    // Ensure final point matches exactly
    if (hoursAgo === 0) {
      yesPercent = currentYes;
      noPercent = currentNo;
    }

    // Clamp values between 5 and 95
    yesPercent = Math.max(5, Math.min(95, yesPercent));
    noPercent = Math.max(5, Math.min(95, noPercent));

    const date = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      yes: Number(yesPercent.toFixed(1)),
      no: Number(noPercent.toFixed(1)),
      timestamp: date.getTime(),
    });
  });

  return data;
};

// Generate chart data for multiple choice outcomes
const generateMultipleChoiceChartData = (outcomes: MarketOutcome[], totalPool: number) => {
  const data = [];
  const now = new Date();
  const hoursPoints = [168, 156, 144, 132, 120, 108, 96, 84, 72, 60, 48, 36, 24, 12, 6, 0];

  // Calculate current percentages for each outcome
  const currentPercentages: Record<string, number> = {};
  outcomes.forEach(outcome => {
    currentPercentages[outcome.id] = (outcome.pool / totalPool) * 100;
  });

  // Start from equal distribution
  const startPercentage = 100 / outcomes.length;

  hoursPoints.forEach((hoursAgo) => {
    const progress = 1 - (hoursAgo / 168);
    const easedProgress = progress * progress;

    // Different fluctuation per outcome based on its index for variety
    const date = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    const dataPoint: Record<string, any> = {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: date.getTime(),
    };

    outcomes.forEach((outcome, index) => {
      // Use outcome index for varied fluctuation
      const seed = Math.sin(hoursAgo * 0.1 + index * 1.5) * 1.5;
      const fluctuation = hoursAgo === 0 ? 0 : seed;

      const diff = currentPercentages[outcome.id] - startPercentage;
      let percent = startPercentage + (diff * easedProgress) + fluctuation;

      // Final point must match exact current percentage
      if (hoursAgo === 0) {
        percent = currentPercentages[outcome.id];
      }

      // Clamp between 1 and 80 to keep lines visible but allow realistic ranges
      percent = Math.max(1, Math.min(80, percent));
      dataPoint[outcome.id] = Number(percent.toFixed(1));
    });

    data.push(dataPoint);
  });

  return data;
};

type TimeRange = '24H' | '7D' | '30D' | 'ALL';

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}k`;
  }
  return `$${amount.toString()}`;
};

export default function ProbabilityChart({
  yesPercentage,
  noPercentage,
  totalPool,
  yesPool,
  noPool,
  onShare,
  isLiked,
  onLikeToggle,
  likeCount,
  isBookmarked,
  onBookmarkToggle,
  isMultipleChoice,
  outcomes
}: ProbabilityChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7D');

  // Generate chart data based on current percentages
  const chartData = useMemo(() => {
    if (isMultipleChoice && outcomes && outcomes.length > 0 && totalPool) {
      return generateMultipleChoiceChartData(outcomes, totalPool);
    }
    return generateChartData(yesPercentage, noPercentage);
  }, [yesPercentage, noPercentage, isMultipleChoice, outcomes, totalPool]);

  const timeRanges: TimeRange[] = ['24H', '7D', '30D', 'ALL'];

  const filteredData = useMemo(() => {
    const now = Date.now();
    const ranges = {
      '24H': 24 * 60 * 60 * 1000,
      '7D': 7 * 24 * 60 * 60 * 1000,
      '30D': 30 * 24 * 60 * 60 * 1000,
      'ALL': Infinity,
    };
    return chartData.filter(d => now - d.timestamp <= ranges[timeRange]);
  }, [chartData, timeRange]);

  // Calculate trend and leading outcome
  const { leadingOutcome, leadingPercentage, trend, trendPercentage, isPositive } = useMemo(() => {
    if (isMultipleChoice && outcomes && outcomes.length > 0 && totalPool) {
      // Find leading outcome for multiple choice
      const sorted = [...outcomes].sort((a, b) => b.pool - a.pool);
      const leading = sorted[0];
      const leadingPct = (leading.pool / totalPool) * 100;

      // Calculate trend for leading outcome
      const firstValue = filteredData[0]?.[leading.id] || leadingPct;
      const lastValue = filteredData[filteredData.length - 1]?.[leading.id] || leadingPct;
      const trendValue = lastValue - firstValue;

      return {
        leadingOutcome: leading.label,
        leadingPercentage: leadingPct,
        trend: trendValue,
        trendPercentage: Math.abs(trendValue).toFixed(1),
        isPositive: trendValue >= 0
      };
    }

    // Binary market logic
    const firstYes = filteredData[0]?.yes || yesPercentage;
    const lastYes = filteredData[filteredData.length - 1]?.yes || yesPercentage;
    const trendValue = lastYes - firstYes;
    const isNoLeading = noPercentage > yesPercentage;

    return {
      leadingOutcome: isNoLeading ? 'False' : 'True',
      leadingPercentage: isNoLeading ? noPercentage : yesPercentage,
      trend: trendValue,
      trendPercentage: Math.abs(trendValue).toFixed(1),
      isPositive: trendValue >= 0
    };
  }, [filteredData, yesPercentage, noPercentage, isMultipleChoice, outcomes, totalPool]);

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount.toFixed(0)}`;
  };

  return (
    <div className="space-y-3 md:space-y-4 lg:space-y-4">

      {/* Desktop only: Trend Info (left) + Legend (right) - same row */}
      <div className="hidden lg:flex items-end justify-between gap-4">
        {/* Trend Info */}
        <div>
          <div className="flex items-center gap-3">
            <span className="text-6xl lg:text-7xl font-bold">
              {leadingOutcome}
            </span>
            <div className="flex items-center gap-1.5 text-emerald-400 text-xl">
              {isPositive ? <ArrowUp className="h-7 w-7" /> : <ArrowDown className="h-7 w-7" />}
              <span>{trendPercentage}%</span>
            </div>
          </div>
          <div className="text-slate-400 text-xl mt-2">
            {leadingPercentage.toFixed(1)}% chance
          </div>
        </div>
        {/* Legend */}
        <div className="text-base">
          {isMultipleChoice && outcomes && outcomes.length > 0 && totalPool ? (
            <div className="flex items-center gap-6">
              {outcomes.slice(0, 4).map((outcome) => (
                <div key={outcome.id} className="flex items-center gap-2.5 whitespace-nowrap">
                  <span
                    className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: outcome.color || '#6B7280', minWidth: '12px', minHeight: '12px' }}
                  />
                  <span className="text-white font-medium">
                    {outcome.label} {((outcome.pool / totalPool) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5 whitespace-nowrap">
                <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#22d3ee', minWidth: '12px', minHeight: '12px' }} />
                <span className="text-white font-medium">True {yesPercentage.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2.5 whitespace-nowrap">
                <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#7c3aed', minWidth: '12px', minHeight: '12px' }} />
                <span className="text-white font-medium">False {noPercentage.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile/Tablet: Trend Info (left) + Legend (right) - just before separator */}
      <div className="flex items-end justify-between gap-3 lg:hidden">
        {/* Trend Info */}
        <div>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-5xl sm:text-6xl md:text-7xl font-bold">
              {leadingOutcome}
            </span>
            <div className="flex items-center gap-1 md:gap-1.5 text-emerald-400 text-base md:text-lg">
              {isPositive ? <ArrowUp className="h-5 w-5 md:h-6 md:w-6" /> : <ArrowDown className="h-5 w-5 md:h-6 md:w-6" />}
              <span>{trendPercentage}%</span>
            </div>
          </div>
          <div className="text-slate-400 text-base md:text-lg mt-1 md:mt-2">
            {leadingPercentage.toFixed(1)}% chance
          </div>
        </div>
        {/* Legend */}
        <div className="text-sm md:text-base">
          {isMultipleChoice && outcomes && outcomes.length > 0 && totalPool ? (
            <div className="flex flex-col items-end gap-1">
              {outcomes.slice(0, 4).map((outcome) => (
                <div key={outcome.id} className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-white font-medium">
                    {outcome.label} {((outcome.pool / totalPool) * 100).toFixed(1)}%
                  </span>
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: outcome.color || '#6B7280' }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-white font-medium">True {yesPercentage.toFixed(1)}%</span>
                <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#22d3ee' }} />
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-white font-medium">False {noPercentage.toFixed(1)}%</span>
                <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#7c3aed' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Separator */}
      <Separator className="my-3 md:my-4 lg:my-4" />

      {/* Time range selector with Logo + Action Buttons */}
      <div className="flex items-center justify-between mb-3 md:mb-4 lg:mb-4">
        <div className="flex items-center gap-1.5 md:gap-2 lg:gap-2 overflow-x-auto scrollbar-hide">
          {timeRanges.map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(range)}
              style={timeRange === range ? {
                background: '#06b6d4',
                color: 'white',
              } : {}}
              className={`flex-shrink-0 px-3 md:px-4 lg:px-4 rounded-full text-xs md:text-sm lg:text-sm ${
                timeRange === range
                  ? 'hover:brightness-110'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {range}
            </Button>
          ))}
        </div>

        {/* Action Buttons - Mobile/Tablet only */}
        <div className="flex items-center gap-1 md:gap-2 lg:hidden">
          {onLikeToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLikeToggle}
              className={`text-white hover:text-white h-9 md:h-10 px-3 md:px-4 text-sm md:text-base ${isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`h-5 w-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {likeCount}
            </Button>
          )}
          {onBookmarkToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBookmarkToggle}
              className="text-white hover:text-white h-9 md:h-10 px-2 md:px-3"
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          )}
          {onShare && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
              className="text-white hover:text-white h-9 md:h-10 px-3 md:px-4 text-sm md:text-base"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Share
            </Button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full bg-black/30 rounded-lg p-3 md:p-4 lg:p-4">
        <div style={{ height: '300px' }} className="w-full relative">
          {/* BlockCast Logo - Centered Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <img
              src={blockcastLogo}
              alt="BlockCast"
              className="h-32 md:h-40 lg:h-48 w-auto"
              style={{ opacity: 0.25, filter: 'grayscale(100%) brightness(0.5)' }}
            />
          </div>
        {filteredData && filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={isMultipleChoice ? [0, 60] : [0, 100]}
                tickFormatter={(value) => `${value}%`}
                orientation="right"
                width={35}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
              />
              {isMultipleChoice && outcomes && outcomes.length > 0 ? (
                // Multiple choice lines
                outcomes.map((outcome) => (
                  <Line
                    key={outcome.id}
                    dataKey={outcome.id}
                    stroke={outcome.color || '#6B7280'}
                    strokeWidth={1.5}
                    dot={false}
                    name={outcome.label}
                  />
                ))
              ) : (
                // Binary market lines
                <>
                  <Line
                    dataKey="yes"
                    stroke="#22d3ee"
                    strokeWidth={1.5}
                    dot={false}
                    name="True"
                  />
                  <Line
                    dataKey="no"
                    stroke="#7c3aed"
                    strokeWidth={1.5}
                    dot={false}
                    name="False"
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            No data available (Data points: {filteredData?.length || 0})
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
