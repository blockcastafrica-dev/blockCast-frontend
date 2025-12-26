import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowUp, ArrowDown, Share2, Heart, Bookmark } from 'lucide-react';
import blockcastLogo from '@/assets/blockcast logo dark BG.svg';

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
  onBookmarkToggle
}: ProbabilityChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7D');

  // Generate chart data based on current percentages
  const chartData = useMemo(() => {
    return generateChartData(yesPercentage, noPercentage);
  }, [yesPercentage, noPercentage]);

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

  // Calculate trend
  const firstYes = filteredData[0]?.yes || yesPercentage;
  const lastYes = filteredData[filteredData.length - 1]?.yes || yesPercentage;
  const trend = lastYes - firstYes;
  const trendPercentage = Math.abs(trend).toFixed(1);
  const isPositive = trend >= 0;

  // Determine which outcome is leading
  const isNoLeading = noPercentage > yesPercentage;
  const leadingOutcome = isNoLeading ? 'False' : 'True';
  const leadingPercentage = isNoLeading ? noPercentage : yesPercentage;

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
      {/* Current Prediction Header */}
      <div className="flex items-start justify-between gap-2 md:gap-3 lg:gap-4">
        <div className="flex-shrink-0">
          <div className="flex items-center gap-1.5 md:gap-2 lg:gap-2">
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              {leadingOutcome}
            </span>
            <div className="flex items-center gap-0.5 md:gap-1 lg:gap-1 text-emerald-400 text-xs md:text-sm lg:text-sm">
              {isPositive ? <ArrowUp className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-4 lg:w-4" /> : <ArrowDown className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-4 lg:w-4" />}
              <span>{trendPercentage}%</span>
            </div>
          </div>
          <div className="text-slate-400 text-xs md:text-sm lg:text-sm mt-0.5 md:mt-1 lg:mt-1">
            {leadingPercentage.toFixed(1)}% chance
          </div>
        </div>

        {/* Legend & Actions */}
        <div className="flex flex-col items-end gap-1.5 md:gap-2 lg:gap-2">
          <div className="flex items-center gap-2 md:gap-3 lg:gap-4 text-xs md:text-sm lg:text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22d3ee' }}></div>
              <span className="text-slate-300">True {yesPercentage.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#7c3aed' }}></div>
              <span className="text-slate-300">False {noPercentage.toFixed(1)}%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-0.5 md:gap-1 lg:gap-1">
            {onLikeToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLikeToggle}
                className={`text-slate-400 hover:text-white h-7 md:h-8 lg:h-8 px-2 md:px-3 lg:px-3 text-xs md:text-sm lg:text-sm ${isLiked ? 'text-red-500' : ''}`}
              >
                <Heart className={`h-3.5 w-3.5 md:h-4 md:w-4 lg:h-4 lg:w-4 mr-1 md:mr-1.5 lg:mr-1.5 ${isLiked ? 'fill-current' : ''}`} />
                {likeCount}
              </Button>
            )}

            {onBookmarkToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBookmarkToggle}
                className="text-slate-400 hover:text-white h-7 md:h-8 lg:h-8 px-1.5 md:px-2 lg:px-2"
              >
                <Bookmark className={`h-3.5 w-3.5 md:h-4 md:w-4 lg:h-4 lg:w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
            )}

            {onShare && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onShare}
                className="text-slate-400 hover:text-white h-7 md:h-8 lg:h-8 px-2 md:px-3 lg:px-3 text-xs md:text-sm lg:text-sm"
              >
                <Share2 className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-4 lg:w-4 mr-1 md:mr-1.5 lg:mr-1.5" />
                Share
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Separator */}
      <Separator className="my-3 md:my-4 lg:my-4" />

      {/* Time range selector with Logo */}
      <div className="flex items-center justify-between mb-3 md:mb-4 lg:mb-4">
        <div className="flex items-center gap-1.5 md:gap-2 lg:gap-2 overflow-x-auto">
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

        {/* BlockCast Logo - Watermark Style */}
        <div className="flex-shrink-0 opacity-15 grayscale">
          <img src={blockcastLogo} alt="BlockCast" className="h-5 md:h-6 lg:h-6 w-auto" />
        </div>
      </div>

      {/* Chart */}
      <div className="w-full bg-black/30 rounded-lg p-3 md:p-4 lg:p-4 relative">
        <div className="h-48 md:h-56 lg:h-72 w-full">
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
                domain={[0, 100]}
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
              />
              <Line
                dataKey="yes"
                stroke="#22d3ee"
                strokeWidth={3}
                dot={false}
                name="True"
              />
              <Line
                dataKey="no"
                stroke="#7c3aed"
                strokeWidth={3}
                dot={false}
                name="False"
              />
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
