import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Upcoming Events Data
const upcomingEvents = [
  {
    id: "1",
    title: "CBN Interest Rate",
    month: "JAN",
    date: new Date("2025-01-30"),
    country: "NG",
    countryFlag: "🇳🇬",
    forecast: "27.5%",
  },
  {
    id: "2",
    title: "SA GDP Report Q4",
    month: "FEB",
    date: new Date("2025-02-05"),
    country: "ZA",
    countryFlag: "🇿🇦",
    forecast: "1.2%",
  },
  {
    id: "3",
    title: "Kenya Inflation Data",
    month: "FEB",
    date: new Date("2025-02-12"),
    country: "KE",
    countryFlag: "🇰🇪",
    forecast: "6.8%",
  },
  {
    id: "4",
    title: "Morocco Trade Balance",
    month: "FEB",
    date: new Date("2025-02-18"),
    country: "MA",
    countryFlag: "🇲🇦",
    forecast: "-$2.1B",
  },
  {
    id: "5",
    title: "Ghana Cocoa Export",
    month: "MAR",
    date: new Date("2025-03-10"),
    country: "GH",
    countryFlag: "🇬🇭",
    forecast: "+15%",
  },
];

// News Articles Data
const newsArticles = [
  {
    id: "1",
    title: "Nigeria's Inflation Rate Hits 28.9% in December...",
    source: "Reuters.com",
    timestamp: "2 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    title: "South Africa's Load Shedding Reduced to Stage 2...",
    source: "BusinessDay.com",
    timestamp: "4 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=100&h=100&fit=crop",
  },
  {
    id: "3",
    title: "Kenya's M-Pesa Processes Record $50B in 2024...",
    source: "TechCabal.com",
    timestamp: "6 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
  },
  {
    id: "4",
    title: "Morocco Signs $10B Renewable Energy Deal with...",
    source: "AfricaNews.com",
    timestamp: "8 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=100&h=100&fit=crop",
  },
  {
    id: "5",
    title: "Ghana Cocoa Production Up 15% Despite Climate...",
    source: "Bloomberg.com",
    timestamp: "10 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=100&h=100&fit=crop",
  },
];

// Market Events Data
const marketEvents = [
  {
    id: "1",
    time: "19:00 PM, Jan 30",
    impact: "high",
    country: "NG",
    countryFlag: "🇳🇬",
    market: "CBN Interest Rate Decision",
    marketMonth: "JAN",
    previous: "27.5%",
    forecast: "27.5%",
    expanded: true,
    options: [
      { label: "No change", change: 0.34, volume: "29.55M", odds: "87.2%" },
      { label: "25 bps increase", change: -5.51, volume: "27.28M", odds: "12%" },
      { label: "Decrease", change: -7.14, volume: "199.93M", odds: "1.3%" },
      { label: "50+ bps increase", change: -20, volume: "720.97M", odds: "1.2%" },
    ],
  },
  {
    id: "2",
    time: "14:00 PM, Feb 5",
    impact: "high",
    country: "ZA",
    countryFlag: "🇿🇦",
    market: "SA Unemployment Rate",
    marketMonth: "FEB",
    previous: "32.1%",
    forecast: "31.5%",
    expanded: false,
    options: [
      { label: "Below 30%", change: -8, volume: "8.2M", odds: "2.1%" },
      { label: "30-31%", change: 12, volume: "28.4M", odds: "15.8%" },
      { label: "31-32%", change: 5.2, volume: "67.8M", odds: "58.4%" },
      { label: "Above 32%", change: -3.1, volume: "22.1M", odds: "23.7%" },
    ],
  },
  {
    id: "3",
    time: "10:00 AM, Feb 12",
    impact: "medium",
    country: "KE",
    countryFlag: "🇰🇪",
    market: "Kenya GDP Growth 2024",
    marketMonth: "FEB",
    previous: "5.0%",
    forecast: "5.2%",
    expanded: false,
    options: [
      { label: "Below 4.5%", change: -22, volume: "5.1M", odds: "4.2%" },
      { label: "4.5-5%", change: 8.5, volume: "18.9M", odds: "22.1%" },
      { label: "5-5.5%", change: 2.1, volume: "52.3M", odds: "52.8%" },
      { label: "Above 5.5%", change: 15, volume: "15.6M", odds: "20.9%" },
    ],
  },
];

// Region filters
const regionFilters = [
  { value: "all", label: "All" },
  { value: "north", label: "North" },
  { value: "west", label: "West" },
  { value: "central", label: "Central" },
  { value: "east", label: "East" },
  { value: "south", label: "South" },
];

const categoryFilters = [
  { value: "rates", label: "Rates" },
  { value: "commodities", label: "Commodities" },
];

export default function NewsRoom() {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({ "1": true });
  const navigate = useNavigate();

  // Calculate days until event
  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Toggle event expansion
  const toggleExpand = (eventId: string) => {
    setExpandedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  // Get impact indicator bars
  const getImpactBars = (impact: string) => {
    const isHigh = impact === "high";
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-1 h-4 rounded-sm"
            style={{ backgroundColor: isHigh ? '#22c55e' : (i <= 3 ? '#eab308' : '#374151') }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      {/* Top Section: Calendar, Map, News */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Calendar Section */}
        <div className="lg:col-span-3 rounded-xl border border-zinc-800 p-4" style={{ backgroundColor: '#141414' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-base font-semibold text-white">Calendar</span>
            <span className="text-xs text-zinc-400">Africa</span>
          </div>

          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 py-2 border-b border-zinc-800/50 last:border-0"
              >
                {/* Days Box */}
                <div className="text-center min-w-[40px] p-1.5 rounded" style={{ backgroundColor: '#252525' }}>
                  <div className="text-sm font-bold text-white">{getDaysUntil(event.date)}</div>
                  <div className="text-[10px] text-zinc-500">Days</div>
                </div>

                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{event.title}</div>
                  <div className="text-xs text-zinc-500">Forecast: {event.forecast}</div>
                </div>

                {/* Month & Flag */}
                <div className="text-right">
                  <div className="text-xs text-zinc-500">{event.month}</div>
                  <div className="text-sm">{event.countryFlag} {event.country}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Section */}
        <div className="lg:col-span-5 rounded-xl border border-zinc-800 p-4 relative" style={{ backgroundColor: '#0a0a0a', minHeight: '320px' }}>
          {/* Interactive Africa Map using real SVG map */}
          <div className="w-full h-[280px] flex items-center justify-center relative">
            <div className="relative">
              {/* Real Africa SVG Map from Wikimedia Commons */}
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/8/86/Africa_%28orthographic_projection%29.svg"
                alt="Africa Map"
                className="w-[280px] h-[280px] object-contain"
                style={{
                  filter: 'brightness(0.4) saturate(0)',
                }}
              />

              {/* Interactive overlay regions */}
              <svg
                viewBox="0 0 280 280"
                className="absolute inset-0 w-[280px] h-[280px]"
              >
                {/* North Africa clickable region */}
                <path
                  d="M70,60 L210,60 L220,90 L200,110 L160,115 L120,110 L80,100 L60,80 Z"
                  fill={selectedRegion === 'north' ? 'rgba(6, 246, 255, 0.4)' : selectedRegion === 'all' ? 'rgba(6, 246, 255, 0.2)' : 'transparent'}
                  stroke={selectedRegion === 'north' ? '#06f6ff' : 'transparent'}
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-300 hover:fill-[rgba(6,246,255,0.3)]"
                  onClick={() => setSelectedRegion('north')}
                />

                {/* West Africa clickable region */}
                <path
                  d="M60,100 L120,110 L130,140 L120,165 L90,170 L65,155 L55,125 Z"
                  fill={selectedRegion === 'west' ? 'rgba(6, 246, 255, 0.4)' : selectedRegion === 'all' ? 'rgba(6, 246, 255, 0.2)' : 'transparent'}
                  stroke={selectedRegion === 'west' ? '#06f6ff' : 'transparent'}
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-300 hover:fill-[rgba(6,246,255,0.3)]"
                  onClick={() => setSelectedRegion('west')}
                />

                {/* East Africa clickable region */}
                <path
                  d="M160,115 L200,110 L220,90 L230,120 L225,160 L200,190 L175,185 L160,160 L155,130 Z"
                  fill={selectedRegion === 'east' ? 'rgba(6, 246, 255, 0.4)' : selectedRegion === 'all' ? 'rgba(6, 246, 255, 0.2)' : 'transparent'}
                  stroke={selectedRegion === 'east' ? '#06f6ff' : 'transparent'}
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-300 hover:fill-[rgba(6,246,255,0.3)]"
                  onClick={() => setSelectedRegion('east')}
                />

                {/* Central Africa region */}
                <path
                  d="M120,110 L160,115 L155,130 L160,160 L150,185 L120,190 L100,175 L100,150 L120,140 Z"
                  fill={selectedRegion === 'central' ? 'rgba(6, 246, 255, 0.4)' : selectedRegion === 'all' ? 'rgba(6, 246, 255, 0.2)' : 'transparent'}
                  stroke={selectedRegion === 'central' ? '#06f6ff' : 'transparent'}
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-300 hover:fill-[rgba(6,246,255,0.3)]"
                  onClick={() => setSelectedRegion('central')}
                />

                {/* Southern Africa clickable region */}
                <path
                  d="M100,175 L120,190 L150,185 L175,185 L180,210 L165,240 L130,250 L95,235 L85,200 Z"
                  fill={selectedRegion === 'south' ? 'rgba(6, 246, 255, 0.4)' : selectedRegion === 'all' ? 'rgba(6, 246, 255, 0.2)' : 'transparent'}
                  stroke={selectedRegion === 'south' ? '#06f6ff' : 'transparent'}
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-300 hover:fill-[rgba(6,246,255,0.3)]"
                  onClick={() => setSelectedRegion('south')}
                />

                {/* Region highlight indicators */}
                {selectedRegion === 'north' && (
                  <circle cx="150" cy="85" r="6" fill="#06f6ff" className="animate-pulse" />
                )}
                {selectedRegion === 'west' && (
                  <circle cx="90" cy="135" r="6" fill="#06f6ff" className="animate-pulse" />
                )}
                {selectedRegion === 'central' && (
                  <circle cx="130" cy="150" r="6" fill="#06f6ff" className="animate-pulse" />
                )}
                {selectedRegion === 'east' && (
                  <circle cx="195" cy="150" r="6" fill="#06f6ff" className="animate-pulse" />
                )}
                {selectedRegion === 'south' && (
                  <circle cx="135" cy="215" r="6" fill="#06f6ff" className="animate-pulse" />
                )}
              </svg>
            </div>
          </div>

          {/* Region Selector Pills */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1 bg-zinc-900/95 rounded-full p-1 backdrop-blur-sm">
            {["All", "North", "West", "Central", "East", "South"].map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region.toLowerCase())}
                className="px-4 py-1.5 text-xs font-medium rounded-full transition-all"
                style={{
                  backgroundColor: selectedRegion === region.toLowerCase() ? '#06f6ff' : 'transparent',
                  color: selectedRegion === region.toLowerCase() ? '#000' : '#fff',
                }}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* News Section */}
        <div className="lg:col-span-4 rounded-xl border border-zinc-800 p-4 relative overflow-hidden" style={{ backgroundColor: '#141414' }}>
          {/* Diagonal lines decoration */}
          <div className="absolute top-2 right-2 opacity-20 pointer-events-none">
            <svg width="80" height="100" viewBox="0 0 80 100">
              {Array.from({ length: 20 }).map((_, i) => (
                <line
                  key={i}
                  x1={(i % 5) * 16}
                  y1={Math.floor(i / 5) * 25}
                  x2={(i % 5) * 16 + 12}
                  y2={Math.floor(i / 5) * 25 + 18}
                  stroke="#fff"
                  strokeWidth="2"
                />
              ))}
            </svg>
          </div>

          {/* Header with highlight */}
          <div className="mb-4">
            <span
              className="text-sm font-medium px-2 py-1 rounded"
              style={{ backgroundColor: '#06f6ff', color: '#000' }}
            >
              Africa News
            </span>
          </div>

          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {newsArticles.map((article) => (
              <div
                key={article.id}
                className="flex gap-3 cursor-pointer hover:bg-zinc-800/30 rounded-lg p-1 transition-colors"
              >
                <img
                  src={article.imageUrl}
                  alt=""
                  className="w-14 h-14 rounded object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm text-cyan-400 line-clamp-2 leading-tight">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-zinc-500">{article.source}</span>
                    <span className="text-xs text-zinc-600">{article.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {regionFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedRegion(filter.value)}
            className="px-5 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: selectedRegion === filter.value ? '#eab308' : '#252525',
              color: selectedRegion === filter.value ? '#000' : '#fff',
            }}
          >
            {filter.label}
          </button>
        ))}
        {categoryFilters.map((filter) => (
          <button
            key={filter.value}
            className="px-5 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: '#252525',
              color: '#fff',
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Market Events Table */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden" style={{ backgroundColor: '#141414' }}>
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-zinc-800 text-xs text-zinc-500">
          <div className="col-span-2">Time</div>
          <div className="col-span-1">Impact</div>
          <div className="col-span-1">Country</div>
          <div className="col-span-3">Market</div>
          <div className="col-span-1 text-center">Previous</div>
          <div className="col-span-1 text-center underline">Forecast</div>
          <div className="col-span-3 text-right">Chance</div>
        </div>

        {/* Table Body */}
        {marketEvents.map((event) => (
          <div key={event.id} className="border-b border-zinc-800 last:border-b-0">
            {/* Event Header Row */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-zinc-800/20">
              <div className="col-span-2 text-sm text-white">{event.time}</div>
              <div className="col-span-1">{getImpactBars(event.impact)}</div>
              <div className="col-span-1 flex items-center gap-1">
                <span>{event.countryFlag}</span>
                <span className="text-xs text-zinc-400">{event.country}</span>
              </div>
              <div className="col-span-3">
                <span className="text-sm text-white">{event.market}</span>
                <span className="text-xs text-zinc-500 ml-2">{event.marketMonth}</span>
              </div>
              <div className="col-span-1 text-sm text-zinc-400 text-center">{event.previous}</div>
              <div className="col-span-1 text-sm text-zinc-400 text-center">{event.forecast}</div>
              <div className="col-span-3 flex items-center justify-end gap-2">
                <span className="text-xs text-zinc-500">24 hr change</span>
                <span className="text-xs text-zinc-500">Total Volume</span>
                <button
                  onClick={() => toggleExpand(event.id)}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-full text-sm"
                  style={{ backgroundColor: '#2a2a2a' }}
                >
                  <span className="text-cyan-400">{event.options.length} Markets</span>
                  {expandedEvents[event.id] ? (
                    <ChevronUp className="h-4 w-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded Options */}
            {expandedEvents[event.id] && (
              <div style={{ backgroundColor: '#0d0d0d' }}>
                {event.options.map((option, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 px-4 py-3 items-center border-t border-zinc-800/50 hover:bg-zinc-800/30"
                  >
                    <div className="col-span-2" />
                    <div className="col-span-2 text-sm text-white">{option.label}</div>
                    <div className="col-span-3">
                      {/* Mini Chart */}
                      <div className="h-6 flex items-center">
                        <svg className="w-full h-full" viewBox="0 0 120 24" preserveAspectRatio="none">
                          <path
                            d={`M0,12 ${Array.from({ length: 20 }).map((_, i) =>
                              `L${i * 6},${12 + (Math.random() - 0.5) * 8}`
                            ).join(' ')}`}
                            fill="none"
                            stroke={option.change >= 0 ? '#22c55e' : '#f97316'}
                            strokeWidth="1.5"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <span className={`text-sm flex items-center gap-0.5 ${option.change >= 0 ? 'text-green-400' : 'text-orange-400'}`}>
                        {option.change >= 0 ? '↑' : '↓'} {Math.abs(option.change)}%
                      </span>
                    </div>
                    <div className="col-span-1 text-xs text-zinc-500">Vol. {option.volume}</div>
                    <div className="col-span-1 text-sm font-medium text-white">{option.odds}</div>
                    <div className="col-span-2 flex items-center gap-2 justify-end">
                      <Button
                        size="sm"
                        className="h-7 px-5 text-xs font-bold rounded"
                        style={{ backgroundColor: '#22c55e', color: '#000' }}
                        onClick={() => navigate('/')}
                      >
                        YES
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 px-5 text-xs font-bold rounded"
                        style={{ backgroundColor: '#374151', color: '#fff' }}
                        onClick={() => navigate('/')}
                      >
                        NO
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
