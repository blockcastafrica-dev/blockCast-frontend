import { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { Badge } from "@/components/ui/badge";

// GeoJSON URLs for maps - using Natural Earth TopoJSON
const WORLD_GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

// Mapping from numeric country IDs (UN M49) to ISO_A3 codes - comprehensive list
// Include both with and without leading zeros for compatibility
const countryIdToISO: Record<string, string> = {
  // Africa (with and without leading zeros)
  "12": "DZA", "012": "DZA", "DZA": "DZA",
  "24": "AGO", "024": "AGO", "AGO": "AGO",
  "204": "BEN", "BEN": "BEN",
  "72": "BWA", "072": "BWA", "BWA": "BWA",
  "854": "BFA", "BFA": "BFA",
  "108": "BDI", "BDI": "BDI",
  "120": "CMR", "CMR": "CMR",
  "132": "CPV", "CPV": "CPV",
  "140": "CAF", "CAF": "CAF",
  "148": "TCD", "TCD": "TCD",
  "174": "COM", "COM": "COM",
  "178": "COG", "COG": "COG",
  "180": "COD", "COD": "COD",
  "384": "CIV", "CIV": "CIV",
  "262": "DJI", "DJI": "DJI",
  "818": "EGY", "EGY": "EGY",
  "226": "GNQ", "GNQ": "GNQ",
  "232": "ERI", "ERI": "ERI",
  "231": "ETH", "ETH": "ETH",
  "266": "GAB", "GAB": "GAB",
  "270": "GMB", "GMB": "GMB",
  "288": "GHA", "GHA": "GHA",
  "324": "GIN", "GIN": "GIN",
  "624": "GNB", "GNB": "GNB",
  "404": "KEN", "KEN": "KEN",
  "426": "LSO", "LSO": "LSO",
  "430": "LBR", "LBR": "LBR",
  "434": "LBY", "LBY": "LBY",
  "450": "MDG", "MDG": "MDG",
  "454": "MWI", "MWI": "MWI",
  "466": "MLI", "MLI": "MLI",
  "478": "MRT", "MRT": "MRT",
  "480": "MUS", "MUS": "MUS",
  "504": "MAR", "MAR": "MAR",
  "508": "MOZ", "MOZ": "MOZ",
  "516": "NAM", "NAM": "NAM",
  "562": "NER", "NER": "NER",
  "566": "NGA", "NGA": "NGA",
  "646": "RWA", "RWA": "RWA",
  "678": "STP", "STP": "STP",
  "686": "SEN", "SEN": "SEN",
  "690": "SYC", "SYC": "SYC",
  "694": "SLE", "SLE": "SLE",
  "706": "SOM", "SOM": "SOM",
  "710": "ZAF", "ZAF": "ZAF",
  "728": "SSD", "SSD": "SSD",
  "729": "SDN", "736": "SDN", "SDN": "SDN",
  "748": "SWZ", "SWZ": "SWZ",
  "834": "TZA", "TZA": "TZA",
  "768": "TGO", "TGO": "TGO",
  "788": "TUN", "TUN": "TUN",
  "800": "UGA", "UGA": "UGA",
  "894": "ZMB", "ZMB": "ZMB",
  "716": "ZWE", "ZWE": "ZWE",
  "732": "ESH", "ESH": "ESH",
  // Europe
  "8": "ALB", "008": "ALB", "ALB": "ALB",
  "20": "AND", "020": "AND", "AND": "AND",
  "40": "AUT", "040": "AUT", "AUT": "AUT",
  "112": "BLR", "BLR": "BLR",
  "56": "BEL", "056": "BEL", "BEL": "BEL",
  "70": "BIH", "070": "BIH", "BIH": "BIH",
  "100": "BGR", "BGR": "BGR",
  "191": "HRV", "HRV": "HRV",
  "196": "CYP", "CYP": "CYP",
  "203": "CZE", "CZE": "CZE",
  "208": "DNK", "DNK": "DNK",
  "233": "EST", "EST": "EST",
  "246": "FIN", "FIN": "FIN",
  "250": "FRA", "FRA": "FRA",
  "276": "DEU", "DEU": "DEU",
  "300": "GRC", "GRC": "GRC",
  "348": "HUN", "HUN": "HUN",
  "352": "ISL", "ISL": "ISL",
  "372": "IRL", "IRL": "IRL",
  "380": "ITA", "ITA": "ITA",
  "383": "XKX", "-99": "XKX", "XKX": "XKX",
  "428": "LVA", "LVA": "LVA",
  "438": "LIE", "LIE": "LIE",
  "440": "LTU", "LTU": "LTU",
  "442": "LUX", "LUX": "LUX",
  "807": "MKD", "MKD": "MKD",
  "470": "MLT", "MLT": "MLT",
  "498": "MDA", "MDA": "MDA",
  "492": "MCO", "MCO": "MCO",
  "499": "MNE", "MNE": "MNE",
  "528": "NLD", "NLD": "NLD",
  "578": "NOR", "NOR": "NOR",
  "616": "POL", "POL": "POL",
  "620": "PRT", "PRT": "PRT",
  "642": "ROU", "ROU": "ROU",
  "643": "RUS", "RUS": "RUS",
  "674": "SMR", "SMR": "SMR",
  "688": "SRB", "SRB": "SRB",
  "703": "SVK", "SVK": "SVK",
  "705": "SVN", "SVN": "SVN",
  "724": "ESP", "ESP": "ESP",
  "752": "SWE", "SWE": "SWE",
  "756": "CHE", "CHE": "CHE",
  "804": "UKR", "UKR": "UKR",
  "826": "GBR", "GBR": "GBR",
  "336": "VAT", "VAT": "VAT",
  // Americas
  "124": "CAN", "CAN": "CAN",
  "484": "MEX", "MEX": "MEX",
  "840": "USA", "USA": "USA",
  "32": "ARG", "032": "ARG", "ARG": "ARG",
  "68": "BOL", "068": "BOL", "BOL": "BOL",
  "76": "BRA", "076": "BRA", "BRA": "BRA",
  "152": "CHL", "CHL": "CHL",
  "170": "COL", "COL": "COL",
  "188": "CRI", "CRI": "CRI",
  "192": "CUB", "CUB": "CUB",
  "214": "DOM", "DOM": "DOM",
  "218": "ECU", "ECU": "ECU",
  "222": "SLV", "SLV": "SLV",
  "320": "GTM", "GTM": "GTM",
  "328": "GUY", "GUY": "GUY",
  "332": "HTI", "HTI": "HTI",
  "340": "HND", "HND": "HND",
  "388": "JAM", "JAM": "JAM",
  "558": "NIC", "NIC": "NIC",
  "591": "PAN", "PAN": "PAN",
  "600": "PRY", "PRY": "PRY",
  "604": "PER", "PER": "PER",
  "630": "PRI", "PRI": "PRI",
  "740": "SUR", "SUR": "SUR",
  "858": "URY", "URY": "URY",
  "862": "VEN", "VEN": "VEN",
  "84": "BLZ", "084": "BLZ", "BLZ": "BLZ",
  // Other common countries
  "4": "AFG", "004": "AFG",
  "36": "AUS", "036": "AUS",
  "156": "CHN",
  "356": "IND",
  "392": "JPN",
  "682": "SAU",
  "792": "TUR",
  "784": "ARE",
};

// Country codes by region (using ISO_A3)
const africaCountries = [
  "DZA", "AGO", "BEN", "BWA", "BFA", "BDI", "CMR", "CPV", "CAF", "TCD", "COM", "COG", "COD", "CIV", "DJI", "EGY", "GNQ", "ERI", "ETH", "GAB", "GMB", "GHA", "GIN", "GNB", "KEN", "LSO", "LBR", "LBY", "MDG", "MWI", "MLI", "MRT", "MUS", "MAR", "MOZ", "NAM", "NER", "NGA", "RWA", "STP", "SEN", "SYC", "SLE", "SOM", "ZAF", "SSD", "SDN", "SWZ", "TZA", "TGO", "TUN", "UGA", "ZMB", "ZWE", "ESH"
];

// Africa sub-regions
const africaSubRegions: Record<string, string[]> = {
  north: ["DZA", "EGY", "LBY", "MAR", "TUN", "SDN", "ESH"],
  west: ["BEN", "BFA", "CPV", "CIV", "GMB", "GHA", "GIN", "GNB", "LBR", "MLI", "MRT", "NER", "NGA", "SEN", "SLE", "TGO"],
  central: ["AGO", "CMR", "CAF", "TCD", "COG", "COD", "GNQ", "GAB", "STP"],
  east: ["BDI", "COM", "DJI", "ERI", "ETH", "KEN", "MDG", "MWI", "MUS", "MOZ", "RWA", "SYC", "SOM", "SSD", "TZA", "UGA"],
  south: ["BWA", "LSO", "NAM", "ZAF", "SWZ", "ZMB", "ZWE"],
};

// America countries (North, Central, South America)
const americaCountries = [
  "USA", "CAN", "MEX", "GTM", "BLZ", "HND", "SLV", "NIC", "CRI", "PAN",
  "COL", "VEN", "ECU", "PER", "BOL", "BRA", "PRY", "URY", "ARG", "CHL",
  "GUY", "SUR", "CUB", "JAM", "HTI", "DOM", "PRI"
];

// America sub-regions
const americaSubRegions: Record<string, string[]> = {
  "north-am": ["USA", "CAN", "MEX"],
  "central-am": ["GTM", "BLZ", "HND", "SLV", "NIC", "CRI", "PAN", "CUB", "JAM", "HTI", "DOM", "PRI"],
  "south-am": ["COL", "VEN", "ECU", "PER", "BOL", "BRA", "PRY", "URY", "ARG", "CHL", "GUY", "SUR"],
};

const europeCountries = [
  "ALB", "AND", "AUT", "BLR", "BEL", "BIH", "BGR", "HRV", "CYP", "CZE", "DNK", "EST", "FIN", "FRA", "DEU", "GRC", "HUN", "ISL", "IRL", "ITA", "XKX", "LVA", "LIE", "LTU", "LUX", "MKD", "MLT", "MDA", "MCO", "MNE", "NLD", "NOR", "POL", "PRT", "ROU", "RUS", "SMR", "SRB", "SVK", "SVN", "ESP", "SWE", "CHE", "UKR", "GBR", "VAT"
];

// Europe sub-regions
const europeSubRegions: Record<string, string[]> = {
  "north-eu": ["DNK", "EST", "FIN", "ISL", "LVA", "LTU", "NOR", "SWE"],
  "west-eu": ["AUT", "BEL", "FRA", "DEU", "IRL", "LIE", "LUX", "MCO", "NLD", "CHE", "GBR"],
  "east-eu": ["BLR", "BGR", "CZE", "HUN", "MDA", "POL", "ROU", "RUS", "SVK", "UKR"],
  "south-eu": ["ALB", "AND", "BIH", "HRV", "CYP", "GRC", "ITA", "XKX", "MKD", "MLT", "MNE", "PRT", "SMR", "SRB", "SVN", "ESP", "VAT"],
};

// Map center and zoom for each continent
const mapConfig: Record<string, { center: [number, number]; zoom: number }> = {
  world: { center: [0, 20], zoom: 1 },
  africa: { center: [20, 5], zoom: 2.5 },
  america: { center: [-80, 10], zoom: 1.5 },
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

// Related Markets interface
interface RelatedMarket {
  id: string;
  claim: string;
  category: string;
  yesOdds: number;
  noOdds: number;
  totalPool: number;
  country?: string;
}

// News Article interface with related markets
interface NewsArticle {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  imageUrl: string;
  relatedMarkets: RelatedMarket[];
}

// News Articles Data by Region with Related Markets
const newsArticlesByRegion: Record<string, NewsArticle[]> = {
  africa: [
    {
      id: "af-1",
      title: "Nigeria's Inflation Rate Hits 28.9% in December...",
      source: "Reuters.com",
      timestamp: "2 hours ago",
      imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&h=100&fit=crop",
      relatedMarkets: [
        { id: "ng-inflation-1", claim: "Will Nigeria's inflation drop below 25% by Q2 2025?", category: "Finance", yesOdds: 2.1, noOdds: 1.8, totalPool: 125000, country: "Nigeria" },
        { id: "ng-naira-1", claim: "Will Naira strengthen to ₦1200/$ by March 2025?", category: "Finance", yesOdds: 3.2, noOdds: 1.4, totalPool: 89000, country: "Nigeria" },
      ],
    },
    {
      id: "af-2",
      title: "South Africa's Load Shedding Reduced to Stage 2...",
      source: "BusinessDay.com",
      timestamp: "4 hours ago",
      imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=100&h=100&fit=crop",
      relatedMarkets: [
        { id: "za-energy-1", claim: "Will South Africa end load shedding by mid-2025?", category: "Politics", yesOdds: 4.5, noOdds: 1.2, totalPool: 234000, country: "South Africa" },
      ],
    },
    {
      id: "af-3",
      title: "Kenya's M-Pesa Processes Record $50B in 2024...",
      source: "TechCabal.com",
      timestamp: "6 hours ago",
      imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
      relatedMarkets: [
        { id: "ke-fintech-1", claim: "Will M-Pesa reach $75B transaction volume in 2025?", category: "Technology", yesOdds: 1.6, noOdds: 2.4, totalPool: 156000, country: "Kenya" },
        { id: "ke-crypto-1", claim: "Will Kenya launch a CBDC in 2025?", category: "Finance", yesOdds: 2.8, noOdds: 1.5, totalPool: 78000, country: "Kenya" },
      ],
    },
    {
      id: "af-4",
      title: "Morocco Signs $10B Renewable Energy Deal with...",
      source: "AfricaNews.com",
      timestamp: "8 hours ago",
      imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=100&h=100&fit=crop",
      relatedMarkets: [
        { id: "ma-energy-1", claim: "Will Morocco achieve 52% renewable energy by 2030?", category: "Politics", yesOdds: 1.9, noOdds: 2.0, totalPool: 145000, country: "Morocco" },
      ],
    },
    {
      id: "af-5",
      title: "Ghana Cocoa Production Up 15% Despite Climate...",
      source: "Bloomberg.com",
      timestamp: "10 hours ago",
      imageUrl: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=100&h=100&fit=crop",
      relatedMarkets: [
        { id: "gh-cocoa-1", claim: "Will Ghana cocoa exports exceed $4B in 2025?", category: "Finance", yesOdds: 1.7, noOdds: 2.2, totalPool: 98000, country: "Ghana" },
      ],
    },
  ],
  america: [
    {
      id: "am-1",
      title: "Fed Signals Potential Rate Cuts in Q2 2025...",
      source: "CNBC.com",
      timestamp: "1 hour ago",
      imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&h=100&fit=crop",
      relatedMarkets: [
        { id: "us-fed-1", claim: "Will the Fed cut rates by 50bps in Q2 2025?", category: "Finance", yesOdds: 1.8, noOdds: 2.1, totalPool: 567000, country: "USA" },
        { id: "us-sp500-1", claim: "Will S&P 500 reach 5500 by June 2025?", category: "Finance", yesOdds: 2.0, noOdds: 1.9, totalPool: 345000, country: "USA" },
      ],
    },
    {
      id: "am-2",
      title: "Brazil's Petrobras Reports Record Oil Output...",
      source: "Reuters.com",
      timestamp: "3 hours ago",
      imageUrl: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=100&h=100&fit=crop",
      relatedMarkets: [
        { id: "br-oil-1", claim: "Will Brazil become top 5 oil producer by 2026?", category: "Finance", yesOdds: 1.5, noOdds: 2.7, totalPool: 234000, country: "Brazil" },
      ],
    },
    {
      id: "am-3",
      title: "Mexico's Nearshoring Boom Drives Manufacturing...",
      source: "Bloomberg.com",
      timestamp: "5 hours ago",
      imageUrl: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=100&h=100&fit=crop",
      relatedMarkets: [
        { id: "mx-trade-1", claim: "Will Mexico overtake China as top US trade partner?", category: "Politics", yesOdds: 1.4, noOdds: 3.0, totalPool: 189000, country: "Mexico" },
      ],
    },
    {
      id: "am-4",
      title: "Argentina's New Economic Reforms Show Early Signs...",
      source: "FT.com",
      timestamp: "7 hours ago",
      imageUrl: "https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=100&h=100&fit=crop",
      relatedMarkets: [
        { id: "ar-reform-1", claim: "Will Argentina's inflation drop below 100% in 2025?", category: "Finance", yesOdds: 2.3, noOdds: 1.7, totalPool: 156000, country: "Argentina" },
      ],
    },
    {
      id: "am-5",
      title: "Canada's Tech Sector Attracts $15B in Investment...",
      source: "TechCrunch.com",
      timestamp: "9 hours ago",
      imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=100&h=100&fit=crop",
      relatedMarkets: [
        { id: "ca-tech-1", claim: "Will Canada's tech sector create 100K jobs in 2025?", category: "Technology", yesOdds: 1.9, noOdds: 2.0, totalPool: 112000, country: "Canada" },
      ],
    },
  ],
  europe: [
    {
      id: "eu-1",
      title: "ECB Maintains Rates Amid Inflation Concerns...",
      source: "Reuters.com",
      timestamp: "1 hour ago",
      imageUrl: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=100&h=100&fit=crop",
      relatedMarkets: [
        { id: "eu-ecb-1", claim: "Will ECB cut rates before Q3 2025?", category: "Finance", yesOdds: 2.2, noOdds: 1.7, totalPool: 445000, country: "EU" },
        { id: "eu-euro-1", claim: "Will EUR/USD reach 1.15 by mid-2025?", category: "Finance", yesOdds: 2.5, noOdds: 1.6, totalPool: 289000, country: "EU" },
      ],
    },
    {
      id: "eu-2",
      title: "Germany's Manufacturing Sector Shows Recovery...",
      source: "DW.com",
      timestamp: "3 hours ago",
      imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop",
      relatedMarkets: [
        { id: "de-gdp-1", claim: "Will Germany avoid recession in 2025?", category: "Finance", yesOdds: 1.6, noOdds: 2.4, totalPool: 312000, country: "Germany" },
      ],
    },
    {
      id: "eu-3",
      title: "UK's Tech Industry Leads European Growth...",
      source: "BBC.com",
      timestamp: "5 hours ago",
      imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
      relatedMarkets: [
        { id: "uk-tech-1", claim: "Will UK tech valuations exceed $1T by 2026?", category: "Technology", yesOdds: 2.8, noOdds: 1.5, totalPool: 198000, country: "UK" },
      ],
    },
    {
      id: "eu-4",
      title: "France Unveils €50B Green Energy Investment Plan...",
      source: "LeMonde.fr",
      timestamp: "7 hours ago",
      imageUrl: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=100&h=100&fit=crop",
      relatedMarkets: [
        { id: "fr-energy-1", claim: "Will France achieve 40% renewable energy by 2030?", category: "Politics", yesOdds: 1.7, noOdds: 2.2, totalPool: 176000, country: "France" },
      ],
    },
    {
      id: "eu-5",
      title: "Spain's Tourism Revenue Hits All-Time High...",
      source: "ElPais.com",
      timestamp: "9 hours ago",
      imageUrl: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=100&h=100&fit=crop",
      relatedMarkets: [
        { id: "es-tourism-1", claim: "Will Spain welcome 100M tourists in 2025?", category: "Finance", yesOdds: 1.5, noOdds: 2.7, totalPool: 134000, country: "Spain" },
      ],
    },
  ],
};

export default function NewsRoom() {
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [selectedSubRegion, setSelectedSubRegion] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [selectedNewsRegion, setSelectedNewsRegion] = useState<string>("africa");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  // Calculate market counts per region
  const marketCounts = useMemo(() => {
    const counts: Record<string, number> = {
      africa: 0,
      america: 0,
      europe: 0,
    };

    Object.entries(newsArticlesByRegion).forEach(([region, articles]) => {
      articles.forEach(article => {
        counts[region] += article.relatedMarkets.length;
      });
    });

    return counts;
  }, []);

  // Continent marker positions (longitude, latitude)
  const continentMarkers = [
    { name: "Africa", coordinates: [20, 0] as [number, number], region: "africa" },
    { name: "America", coordinates: [-60, -5] as [number, number], region: "america" },
    { name: "Europe", coordinates: [15, 52] as [number, number], region: "europe" },
  ];

  // Get current marker to display based on selected continent
  const getCurrentMarker = () => {
    if (!selectedContinent) return continentMarkers;
    return continentMarkers.filter(m => m.region === selectedContinent);
  };

  // Format pool amount
  const formatPool = (amount: number) => {
    if (amount >= 1000000) return `USDT ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `USDT ${(amount / 1000).toFixed(0)}K`;
    return `USDT ${amount}`;
  };

  // Calculate days until event
  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-screen-2xl mx-auto" onClick={() => setExpandedArticle(null)}>
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Map */}
        <div className="rounded-xl border border-zinc-800 p-4 flex flex-col justify-center" style={{ backgroundColor: '#0a0a0a' }}>
          {/* Interactive Map - World or Zoomed Continent */}
          <div className="w-full h-[240px] flex items-center justify-center relative overflow-hidden">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                center: mapConfig[selectedContinent || 'world'].center,
                scale: selectedContinent ? (selectedContinent === 'america' ? 150 : selectedContinent === 'europe' ? 350 : 300) : 100,
              }}
              style={{ width: '100%', height: '100%' }}
            >
              <Geographies geography={WORLD_GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    // Get country code - convert numeric ID to ISO_A3
                    const geoId = geo.id?.toString() || '';
                    const countryCode = countryIdToISO[geoId] || geo.properties?.ISO_A3 || geo.properties?.iso_a3 || geoId;

                    // Determine if country should be highlighted based on selected continent and sub-region
                    let isInSelectedContinent = false;
                    let isInSelectedSubRegion = false;
                    let fillColor = 'rgba(50, 50, 50, 0.5)';

                    if (!selectedContinent) {
                      // World view - highlight all three regions
                      if (africaCountries.includes(countryCode)) {
                        fillColor = 'rgba(6, 246, 255, 0.3)';
                      } else if (americaCountries.includes(countryCode)) {
                        fillColor = 'rgba(6, 246, 255, 0.3)';
                      } else if (europeCountries.includes(countryCode)) {
                        fillColor = 'rgba(6, 246, 255, 0.3)';
                      }
                    } else if (selectedContinent === 'africa') {
                      isInSelectedContinent = africaCountries.includes(countryCode);

                      if (selectedSubRegion && africaSubRegions[selectedSubRegion]) {
                        isInSelectedSubRegion = africaSubRegions[selectedSubRegion].includes(countryCode);
                        if (isInSelectedSubRegion) {
                          fillColor = 'rgba(6, 246, 255, 0.7)';
                        } else if (isInSelectedContinent) {
                          fillColor = 'rgba(6, 246, 255, 0.2)';
                        } else {
                          fillColor = 'rgba(30, 30, 30, 0.3)';
                        }
                      } else {
                        fillColor = isInSelectedContinent ? 'rgba(6, 246, 255, 0.4)' : 'rgba(30, 30, 30, 0.3)';
                      }
                    } else if (selectedContinent === 'america') {
                      isInSelectedContinent = americaCountries.includes(countryCode);

                      if (selectedSubRegion && americaSubRegions[selectedSubRegion]) {
                        isInSelectedSubRegion = americaSubRegions[selectedSubRegion].includes(countryCode);
                        if (isInSelectedSubRegion) {
                          fillColor = 'rgba(6, 246, 255, 0.7)';
                        } else if (isInSelectedContinent) {
                          fillColor = 'rgba(6, 246, 255, 0.2)';
                        } else {
                          fillColor = 'rgba(30, 30, 30, 0.3)';
                        }
                      } else {
                        fillColor = isInSelectedContinent ? 'rgba(6, 246, 255, 0.4)' : 'rgba(30, 30, 30, 0.3)';
                      }
                    } else if (selectedContinent === 'europe') {
                      isInSelectedContinent = europeCountries.includes(countryCode);

                      if (selectedSubRegion && europeSubRegions[selectedSubRegion]) {
                        isInSelectedSubRegion = europeSubRegions[selectedSubRegion].includes(countryCode);
                        if (isInSelectedSubRegion) {
                          fillColor = 'rgba(6, 246, 255, 0.7)';
                        } else if (isInSelectedContinent) {
                          fillColor = 'rgba(6, 246, 255, 0.2)';
                        } else {
                          fillColor = 'rgba(30, 30, 30, 0.3)';
                        }
                      } else {
                        fillColor = isInSelectedContinent ? 'rgba(6, 246, 255, 0.4)' : 'rgba(30, 30, 30, 0.3)';
                      }
                    }

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fillColor}
                        stroke={isInSelectedSubRegion ? 'rgba(6, 246, 255, 0.6)' : 'rgba(6, 246, 255, 0.2)'}
                        strokeWidth={isInSelectedSubRegion ? 1 : 0.5}
                        style={{
                          default: { outline: 'none' },
                          hover: {
                            fill: isInSelectedSubRegion ? 'rgba(6, 246, 255, 0.8)' : (isInSelectedContinent || !selectedContinent ? 'rgba(6, 246, 255, 0.5)' : fillColor),
                            outline: 'none'
                          },
                          pressed: { outline: 'none' },
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {/* Market count markers */}
              {getCurrentMarker().map((marker) => (
                <Marker key={marker.name} coordinates={marker.coordinates}>
                  <g
                    onClick={() => {
                      if (!selectedContinent) {
                        setSelectedContinent(marker.region);
                        setSelectedSubRegion(null);
                      }
                    }}
                    style={{ cursor: selectedContinent ? 'default' : 'pointer' }}
                  >
                    <circle r={selectedContinent ? 20 : 16} fill="#a855f7" fillOpacity={0.95} />
                    <circle r={selectedContinent ? 20 : 16} fill="none" stroke="#fff" strokeWidth={2} />
                    <text
                      textAnchor="middle"
                      y={5}
                      style={{
                        fontFamily: 'system-ui',
                        fontSize: selectedContinent ? '14px' : '11px',
                        fontWeight: 'bold',
                        fill: '#fff',
                      }}
                    >
                      {marketCounts[marker.region]}
                    </text>
                  </g>
                </Marker>
              ))}
            </ComposableMap>
          </div>

          {/* Separator Line */}
          <div className="border-t border-zinc-800"></div>

          {/* Region Selector Pills - Centered */}
          <div className="flex-1 flex items-center justify-center py-4 px-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 md:gap-4 bg-zinc-900/95 rounded-full p-1.5 whitespace-nowrap">
            {/* Back to World button when zoomed */}
            {selectedContinent && (
              <button
                onClick={() => { setSelectedContinent(null); setSelectedSubRegion(null); }}
                className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-full transition-all bg-zinc-700 text-white hover:bg-zinc-600 cursor-pointer"
              >
                ← World
              </button>
            )}

            {/* Continent pills */}
            {!selectedContinent && ["Africa", "America", "Europe"].map((region) => (
              <button
                key={region}
                onClick={() => {
                  setSelectedContinent(region.toLowerCase());
                  setSelectedSubRegion(null);
                }}
                onMouseEnter={() => setHoveredButton(region)}
                onMouseLeave={() => setHoveredButton(null)}
                className="px-3 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-medium rounded-full transition-colors duration-200 cursor-pointer"
                style={{ color: hoveredButton === region ? '#06f6ff' : '#fff' }}
              >
                {region}
              </button>
            ))}

            {/* Africa sub-regions */}
            {selectedContinent === 'africa' && ["North", "West", "Central", "East", "South"].map((region) => (
              <button
                key={region}
                onClick={() => setSelectedSubRegion(region.toLowerCase())}
                onMouseEnter={() => setHoveredButton(`africa-${region}`)}
                onMouseLeave={() => setHoveredButton(null)}
                className="px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-full transition-colors duration-200 cursor-pointer"
                style={{
                  backgroundColor: selectedSubRegion === region.toLowerCase() ? '#06f6ff' : 'transparent',
                  color: selectedSubRegion === region.toLowerCase() ? '#000' : (hoveredButton === `africa-${region}` ? '#06f6ff' : '#fff'),
                }}
              >
                {region}
              </button>
            ))}

            {/* America sub-regions */}
            {selectedContinent === 'america' && ["North", "Central", "South"].map((region) => (
              <button
                key={region}
                onClick={() => setSelectedSubRegion(`${region.toLowerCase()}-am`)}
                onMouseEnter={() => setHoveredButton(`america-${region}`)}
                onMouseLeave={() => setHoveredButton(null)}
                className="px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-full transition-colors duration-200 cursor-pointer"
                style={{
                  backgroundColor: selectedSubRegion === `${region.toLowerCase()}-am` ? '#06f6ff' : 'transparent',
                  color: selectedSubRegion === `${region.toLowerCase()}-am` ? '#000' : (hoveredButton === `america-${region}` ? '#06f6ff' : '#fff'),
                }}
              >
                {region}
              </button>
            ))}

            {/* Europe sub-regions */}
            {selectedContinent === 'europe' && ["North", "West", "East", "South"].map((region) => (
              <button
                key={region}
                onClick={() => setSelectedSubRegion(`${region.toLowerCase()}-eu`)}
                onMouseEnter={() => setHoveredButton(`europe-${region}`)}
                onMouseLeave={() => setHoveredButton(null)}
                className="px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-full transition-colors duration-200 cursor-pointer"
                style={{
                  backgroundColor: selectedSubRegion === `${region.toLowerCase()}-eu` ? '#06f6ff' : 'transparent',
                  color: selectedSubRegion === `${region.toLowerCase()}-eu` ? '#000' : (hoveredButton === `europe-${region}` ? '#06f6ff' : '#fff'),
                }}
              >
                {region}
              </button>
            ))}
            </div>
          </div>
        </div>

        {/* Right Column - Calendar + News stacked */}
        <div className="flex flex-col gap-4">
          {/* Calendar Section */}
          <div className="rounded-xl border border-zinc-800 p-4" style={{ backgroundColor: '#141414' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-semibold text-white">Calendar</span>
              <span className="text-xs text-zinc-400">Upcoming Events</span>
            </div>

            <div className="space-y-2">
              {upcomingEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 py-2 border-b border-zinc-800/50 last:border-0"
                >
                  {/* Days Box */}
                  <div className="text-center min-w-[36px] p-1 rounded" style={{ backgroundColor: '#252525' }}>
                    <div className="text-sm font-bold text-white">{getDaysUntil(event.date)}</div>
                    <div className="text-[9px] text-zinc-500">Days</div>
                  </div>

                  {/* Event Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{event.title}</div>
                    <div className="text-xs text-zinc-500">Forecast: {event.forecast}</div>
                  </div>

                  {/* Flag */}
                  <div className="text-sm">{event.countryFlag}</div>
                </div>
              ))}
            </div>
          </div>

          {/* News Section */}
          <div className="rounded-xl border border-zinc-800 p-4 flex-1 overflow-hidden" style={{ backgroundColor: '#141414' }}>
            {/* Header with region tabs */}
            <div className="mb-3 flex gap-2">
              {["Africa", "America", "Europe"].map((region) => (
                <button
                  key={region}
                  onClick={() => { setSelectedNewsRegion(region.toLowerCase()); setExpandedArticle(null); }}
                  onMouseEnter={() => setHoveredButton(`news-${region}`)}
                  onMouseLeave={() => setHoveredButton(null)}
                  className="text-sm font-medium px-3 py-1 rounded transition-colors duration-200 cursor-pointer"
                  style={{
                    backgroundColor: selectedNewsRegion === region.toLowerCase() ? '#06f6ff' : 'transparent',
                    color: selectedNewsRegion === region.toLowerCase() ? '#000' : (hoveredButton === `news-${region}` ? '#06f6ff' : '#fff'),
                  }}
                >
                  {region}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {newsArticlesByRegion[selectedNewsRegion]?.slice(0, 5).map((article) => (
                <div key={article.id}>
                  {/* News Article */}
                  <div
                    onClick={(e) => { e.stopPropagation(); setExpandedArticle(expandedArticle === article.id ? null : article.id); }}
                    className={`flex gap-3 cursor-pointer rounded-lg p-2 transition-colors ${expandedArticle === article.id ? 'bg-zinc-800/50' : 'hover:bg-zinc-800/30'}`}
                  >
                    <img
                      src={article.imageUrl}
                      alt=""
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm text-cyan-400 line-clamp-2 leading-tight">
                          {article.title}
                        </h3>
                        <span
                          onMouseEnter={() => setHoveredButton(`markets-${article.id}`)}
                          onMouseLeave={() => setHoveredButton(null)}
                          className="text-xs cursor-pointer transition-colors duration-200 flex-shrink-0"
                          style={{ color: hoveredButton === `markets-${article.id}` ? '#06f6ff' : 'rgba(6, 246, 255, 0.6)' }}
                        >{article.relatedMarkets.length} {article.relatedMarkets.length === 1 ? 'market' : 'markets'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-zinc-500">{article.source}</span>
                        <span className="text-xs text-zinc-600">· {article.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Related Markets (Expanded) */}
                  {expandedArticle === article.id && (
                    <div onClick={(e) => e.stopPropagation()} className="mt-2 mb-3 p-3 rounded-lg border border-zinc-700/50" style={{ backgroundColor: '#1a1a1a' }}>
                      <div className="text-xs text-zinc-400 mb-2">Related Markets:</div>
                      <div className="space-y-3">
                        {article.relatedMarkets.map((market) => (
                          <div
                            key={market.id}
                            className="p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 cursor-pointer transition-colors"
                          >
                            <div className="text-xs text-white leading-tight mb-2">{market.claim}</div>
                            <div className="flex flex-wrap items-center gap-2 text-[10px]">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{market.category}</Badge>
                              <span className="text-[#06f6ff]">True {market.yesOdds.toFixed(2)}</span>
                              <span className="text-purple-500">False {market.noOdds.toFixed(2)}</span>
                              <div className="ml-auto text-center">
                                <div className="text-[9px] text-zinc-500">Market Pool</div>
                                <div className="text-zinc-300">{formatPool(market.totalPool)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
