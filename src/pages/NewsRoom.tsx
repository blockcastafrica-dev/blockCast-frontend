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
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

// GeoJSON URLs for maps
const WORLD_GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Country codes by region
const africaCountries = [
  "DZA", "AGO", "BEN", "BWA", "BFA", "BDI", "CMR", "CPV", "CAF", "TCD", "COM", "COG", "COD", "CIV", "DJI", "EGY", "GNQ", "ERI", "ETH", "GAB", "GMB", "GHA", "GIN", "GNB", "KEN", "LSO", "LBR", "LBY", "MDG", "MWI", "MLI", "MRT", "MUS", "MAR", "MOZ", "NAM", "NER", "NGA", "RWA", "STP", "SEN", "SYC", "SLE", "SOM", "ZAF", "SSD", "SDN", "SWZ", "TZA", "TGO", "TUN", "UGA", "ZMB", "ZWE"
];
const usCountries = ["USA"];
const europeCountries = [
  "ALB", "AND", "AUT", "BLR", "BEL", "BIH", "BGR", "HRV", "CYP", "CZE", "DNK", "EST", "FIN", "FRA", "DEU", "GRC", "HUN", "ISL", "IRL", "ITA", "XKX", "LVA", "LIE", "LTU", "LUX", "MKD", "MLT", "MDA", "MCO", "MNE", "NLD", "NOR", "POL", "PRT", "ROU", "RUS", "SMR", "SRB", "SVK", "SVN", "ESP", "SWE", "CHE", "UKR", "GBR", "VAT"
];

// Map center and zoom for each continent
const mapConfig: Record<string, { center: [number, number]; zoom: number }> = {
  world: { center: [0, 20], zoom: 1 },
  africa: { center: [20, 5], zoom: 2.5 },
  us: { center: [-98, 39], zoom: 4 },
  europe: { center: [15, 54], zoom: 3.5 },
};

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
  { value: "africa", label: "Africa" },
  { value: "us", label: "US" },
  { value: "europe", label: "Europe" },
];

const categoryFilters = [
  { value: "rates", label: "Rates" },
  { value: "commodities", label: "Commodities" },
];

export default function NewsRoom() {
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [selectedSubRegion, setSelectedSubRegion] = useState<string | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({ "1": true });
  const navigate = useNavigate();

  // Get the current effective region for filtering
  const selectedRegion = selectedSubRegion || selectedContinent || 'all';

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
          {/* Interactive Map - World or Zoomed Continent */}
          <div className="w-full h-[280px] flex items-center justify-center relative overflow-hidden">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                center: mapConfig[selectedContinent || 'world'].center,
                scale: selectedContinent ? (selectedContinent === 'us' ? 400 : selectedContinent === 'europe' ? 350 : 300) : 100,
              }}
              style={{ width: '100%', height: '100%' }}
            >
              <Geographies geography={WORLD_GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryCode = geo.properties.ISO_A3 || geo.id;

                    // Determine if country should be highlighted based on selected continent
                    let isInSelectedContinent = false;
                    let fillColor = 'rgba(50, 50, 50, 0.5)';

                    if (!selectedContinent) {
                      // World view - highlight all three regions
                      if (africaCountries.includes(countryCode)) {
                        fillColor = 'rgba(6, 246, 255, 0.3)';
                      } else if (usCountries.includes(countryCode)) {
                        fillColor = 'rgba(6, 246, 255, 0.3)';
                      } else if (europeCountries.includes(countryCode)) {
                        fillColor = 'rgba(6, 246, 255, 0.3)';
                      }
                    } else if (selectedContinent === 'africa') {
                      isInSelectedContinent = africaCountries.includes(countryCode);
                      fillColor = isInSelectedContinent ? 'rgba(6, 246, 255, 0.4)' : 'rgba(30, 30, 30, 0.3)';
                    } else if (selectedContinent === 'us') {
                      isInSelectedContinent = usCountries.includes(countryCode);
                      fillColor = isInSelectedContinent ? 'rgba(6, 246, 255, 0.4)' : 'rgba(30, 30, 30, 0.3)';
                    } else if (selectedContinent === 'europe') {
                      isInSelectedContinent = europeCountries.includes(countryCode);
                      fillColor = isInSelectedContinent ? 'rgba(6, 246, 255, 0.4)' : 'rgba(30, 30, 30, 0.3)';
                    }

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fillColor}
                        stroke="rgba(6, 246, 255, 0.2)"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: 'none' },
                          hover: {
                            fill: isInSelectedContinent || !selectedContinent ? 'rgba(6, 246, 255, 0.5)' : fillColor,
                            outline: 'none'
                          },
                          pressed: { outline: 'none' },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>

          {/* Region Selector Pills */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-4 bg-zinc-900/95 rounded-full p-1.5 backdrop-blur-sm z-20">
            {/* Back to World button when zoomed */}
            {selectedContinent && (
              <button
                onClick={() => { setSelectedContinent(null); setSelectedSubRegion(null); }}
                className="px-4 py-2 text-sm font-medium rounded-full transition-all bg-zinc-700 text-white hover:bg-zinc-600"
              >
                ← World
              </button>
            )}

            {/* World view pills */}
            {!selectedContinent && ["All", "Africa", "US", "Europe"].map((region, index) => (
              <button
                key={region}
                onClick={() => {
                  if (region !== 'All') {
                    setSelectedContinent(region.toLowerCase());
                    setSelectedSubRegion(null);
                  }
                }}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-all cursor-pointer ${index !== 0 ? 'hover:bg-[#06f6ff] hover:text-black active:bg-[#05d4d9]' : ''}`}
                style={{
                  backgroundColor: index === 0 ? '#06f6ff' : 'transparent',
                  color: index === 0 ? '#000' : '#fff'
                }}
              >
                {region}
              </button>
            ))}

            {/* Africa sub-regions */}
            {selectedContinent === 'africa' && ["All", "North", "West", "Central", "East", "South"].map((region) => (
              <button
                key={region}
                onClick={() => setSelectedSubRegion(region === 'All' ? null : region.toLowerCase())}
                className="px-4 py-2 text-sm font-medium rounded-full transition-all"
                style={{
                  backgroundColor: (region === 'All' && !selectedSubRegion) || selectedSubRegion === region.toLowerCase() ? '#06f6ff' : 'transparent',
                  color: (region === 'All' && !selectedSubRegion) || selectedSubRegion === region.toLowerCase() ? '#000' : '#fff',
                }}
              >
                {region}
              </button>
            ))}

            {/* US sub-regions */}
            {selectedContinent === 'us' && ["All", "Northeast", "Midwest", "West", "South"].map((region) => (
              <button
                key={region}
                onClick={() => setSelectedSubRegion(region === 'All' ? null : (region === 'West' ? 'west-us' : region === 'South' ? 'south-us' : region.toLowerCase()))}
                className="px-4 py-2 text-sm font-medium rounded-full transition-all"
                style={{
                  backgroundColor: (region === 'All' && !selectedSubRegion) ||
                    selectedSubRegion === region.toLowerCase() ||
                    selectedSubRegion === 'west-us' && region === 'West' ||
                    selectedSubRegion === 'south-us' && region === 'South' ? '#06f6ff' : 'transparent',
                  color: (region === 'All' && !selectedSubRegion) ||
                    selectedSubRegion === region.toLowerCase() ||
                    selectedSubRegion === 'west-us' && region === 'West' ||
                    selectedSubRegion === 'south-us' && region === 'South' ? '#000' : '#fff',
                }}
              >
                {region}
              </button>
            ))}

            {/* Europe sub-regions */}
            {selectedContinent === 'europe' && ["All", "North", "West", "East", "South"].map((region) => (
              <button
                key={region}
                onClick={() => setSelectedSubRegion(region === 'All' ? null : `${region.toLowerCase()}-eu`)}
                className="px-4 py-2 text-sm font-medium rounded-full transition-all"
                style={{
                  backgroundColor: (region === 'All' && !selectedSubRegion) || selectedSubRegion === `${region.toLowerCase()}-eu` ? '#06f6ff' : 'transparent',
                  color: (region === 'All' && !selectedSubRegion) || selectedSubRegion === `${region.toLowerCase()}-eu` ? '#000' : '#fff',
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
            onClick={() => {
              if (filter.value === 'all') {
                setSelectedContinent(null);
                setSelectedSubRegion(null);
              } else {
                setSelectedContinent(filter.value);
                setSelectedSubRegion(null);
              }
            }}
            className="px-5 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: (filter.value === 'all' && !selectedContinent) || selectedContinent === filter.value ? '#eab308' : '#252525',
              color: (filter.value === 'all' && !selectedContinent) || selectedContinent === filter.value ? '#000' : '#fff',
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
