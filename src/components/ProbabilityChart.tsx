import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowUp, ArrowDown, Share2, Heart, Bookmark } from 'lucide-react';
import blockcastLogo from '/Users/camille/Desktop/dossier sans titre 2/dossier sans titre/blockcast logo dark BG.svg';

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

// Generate mock historical data for the chart with visible trends
const generateChartData = (currentYes: number, currentNo: number) => {
  const data = [];
  const now = new Date();

  // Mock data points showing a clear trend over 7 days
  const mockDataPoints = [
    { hoursAgo: 168, yesPercent: 45, noPercent: 55 }, // 7 days ago
    { hoursAgo: 156, yesPercent: 47, noPercent: 53 },
    { hoursAgo: 144, yesPercent: 48, noPercent: 52 }, // 6 days ago
    { hoursAgo: 132, yesPercent: 50, noPercent: 50 },
    { hoursAgo: 120, yesPercent: 52, noPercent: 48 }, // 5 days ago
    { hoursAgo: 108, yesPercent: 54, noPercent: 46 },
    { hoursAgo: 96, yesPercent: 56, noPercent: 44 },  // 4 days ago
    { hoursAgo: 84, yesPercent: 58, noPercent: 42 },
    { hoursAgo: 72, yesPercent: 60, noPercent: 40 },  // 3 days ago
    { hoursAgo: 60, yesPercent: 62, noPercent: 38 },
    { hoursAgo: 48, yesPercent: 64, noPercent: 36 },  // 2 days ago
    { hoursAgo: 36, yesPercent: 66, noPercent: 34 },
    { hoursAgo: 24, yesPercent: 68, noPercent: 32 },  // 1 day ago
    { hoursAgo: 12, yesPercent: 69, noPercent: 31 },
    { hoursAgo: 6, yesPercent: 69.5, noPercent: 30.5 },
    { hoursAgo: 0, yesPercent: currentYes, noPercent: currentNo }, // Now
  ];

  mockDataPoints.forEach(point => {
    const date = new Date(now.getTime() - point.hoursAgo * 60 * 60 * 1000);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      yes: Number(point.yesPercent.toFixed(1)),
      no: Number(point.noPercent.toFixed(1)),
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
  const leadingOutcome = isNoLeading ? 'No' : 'Yes';
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
    <div className="space-y-4">
      {/* Current Prediction Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-4xl sm:text-5xl font-bold">
              {leadingOutcome}
            </span>
            <div className="flex items-center gap-1 text-emerald-400 text-sm">
              {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              <span>{trendPercentage}%</span>
            </div>
          </div>
          <div className="text-slate-400 text-sm mt-1">
            {leadingPercentage.toFixed(1)}% chance
          </div>
        </div>

        {/* Legend & Actions */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22d3ee' }}></div>
              <span className="text-slate-300">Yes {yesPercentage.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#e879f9' }}></div>
              <span className="text-slate-300">No {noPercentage.toFixed(1)}%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {onLikeToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLikeToggle}
                className={`text-slate-400 hover:text-white h-8 px-3 ${isLiked ? 'text-red-500' : ''}`}
              >
                <Heart className={`h-4 w-4 mr-1.5 ${isLiked ? 'fill-current' : ''}`} />
                {likeCount}
              </Button>
            )}

            {onBookmarkToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBookmarkToggle}
                className="text-slate-400 hover:text-white h-8 px-2"
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
            )}

            {onShare && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onShare}
                className="text-slate-400 hover:text-white h-8 px-3"
              >
                <Share2 className="h-4 w-4 mr-1.5" />
                Share
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Separator */}
      <Separator className="my-4" />

      {/* Time range selector with Logo */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {timeRanges.map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={`flex-shrink-0 px-4 rounded-full ${
                timeRange === range
                  ? 'bg-white text-black hover:bg-white/90'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {range}
            </Button>
          ))}
        </div>

        {/* BlockCast Logo */}
        <div className="flex-shrink-0 opacity-30">
          <img src={blockcastLogo} alt="BlockCast" className="h-8 w-auto" />
        </div>
      </div>

      {/* Chart */}
      <div className="w-full bg-black/30 rounded-lg p-4 relative">

        {filteredData && filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={filteredData}
              margin={{ top: 10, right: 40, left: 0, bottom: 10 }}
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
                name="Yes"
              />
              <Line
                dataKey="no"
                stroke="#e879f9"
                strokeWidth={3}
                dot={false}
                name="No"
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
  );
}
