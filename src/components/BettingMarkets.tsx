import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { TrendingUp, TrendingDown, Users, Clock, Target, Star, MessageCircle, Filter, ChevronDown, Share2, Heart, Bookmark, Zap, Globe, Shield, Search, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import ShareModal from '@/components/ShareModal';
import CreateMarketModal from '@/components/CreateMarketModal';
import { useNavigate } from 'react-router-dom';

export interface BettingMarket {
  id: string;
  claim: string;
  claimTranslations?: {
    en: string;
    fr: string;
    sw: string;
  };
  category: string;
  subcategory?: string;
  source: string;
  description: string;
  descriptionTranslations?: {
    en: string;
    fr: string;
    sw: string;
  };
  totalPool: number;
  yesPool: number;
  noPool: number;
  yesOdds: number;
  noOdds: number;
  totalCasters: number;
  expiresAt: Date;
  status: 'active' | 'resolving' | 'resolved';
  resolution?: 'yes' | 'no';
  trending: boolean;
  imageUrl?: string;
  country?: string;
  region?: string;
  marketType: 'present' | 'future';
  confidenceLevel: 'high' | 'medium' | 'low';
  disputable?: boolean;
}

interface BettingMarketsProps {
  onPlaceBet: (marketId: string, position: 'yes' | 'no', amount: number) => void;
  userBalance: number;
  onMarketSelect?: (market: BettingMarket) => void;
  markets?: BettingMarket[];
}

// Comprehensive 25+ markets with clear category classification
export const realTimeMarkets: BettingMarket[] = [
  // ENTERTAINMENT CATEGORY (4 markets)
  {
    id: "ent-nollywood-2025",
    claim: "Will Nollywood produce over 2,500 films in 2025?",
    claimTranslations: {
      en: "Will Nollywood produce over 2,500 films in 2025?",
      fr: "Nollywood produira-t-il plus de 2 500 films en 2025?",
      sw: "Je, Nollywood itazalisha filamu zaidi ya 2,500 mnamo 2025?",
    },
    category: "Entertainment",
    subcategory: "Film Industry",
    source: "Nigerian Film Corporation",
    description:
      "Truth verification on Nollywood's ambitious production targets amid growing digital streaming demand and international recognition.",
    totalPool: 1850000,
    yesPool: 1110000,
    noPool: 740000,
    yesOdds: 1.67,
    noOdds: 2.5,
    totalCasters: 14230,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: true,
    country: "Nigeria",
    region: "West Africa",
    marketType: "future",
    confidenceLevel: "high",
    disputable: false,
    imageUrl:
      "https://images.unsplash.com/photo-1547573874-513e5ddbc0ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub2xseXdvb2QlMjBmaWxtJTIwcHJvZHVjdGlvbiUyMG5pZ2VyaWF8ZW58MXx8fHwxNzU1Nzg3NjUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "ent-grammy-african-2025",
    claim:
      "Will an African artist win a Grammy in the Global Music category in 2025?",
    category: "Entertainment",
    subcategory: "Music Awards",
    source: "Recording Academy",
    description:
      "Community truth verification on African music's global recognition at the Grammy Awards 2025.",
    totalPool: 2340000,
    yesPool: 1638000,
    noPool: 702000,
    yesOdds: 1.43,
    noOdds: 3.33,
    totalCasters: 18940,
    expiresAt: new Date("2025-02-02"),
    status: "active",
    trending: true,
    region: "Continental Africa",
    marketType: "future",
    confidenceLevel: "medium",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1714738045959-3bd0634bdce2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbXVzaWMlMjBhcnRpc3QlMjBwZXJmb3JtYW5jZXxlbnwxfHx8fDE3NTU3ODc2NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "ent-afcon-viewership-2025",
    claim: "Will AFCON 2025 achieve over 1 billion global viewers?",
    category: "Entertainment",
    subcategory: "Sports Broadcasting",
    source: "CAF Broadcasting",
    description:
      "Verification of projected viewership numbers for the Africa Cup of Nations 2025 tournament.",
    totalPool: 1420000,
    yesPool: 852000,
    noPool: 568000,
    yesOdds: 1.67,
    noOdds: 2.5,
    totalCasters: 11560,
    expiresAt: new Date("2025-07-31"),
    status: "active",
    trending: false,
    region: "Continental Africa",
    marketType: "future",
    confidenceLevel: "medium",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1506185386801-3d7bc0ddd2bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2ElMjBjdXIlMjBuYXRpb25zJTIwZm9vdGJhbGx8ZW58MXx8fHwxNzU1Nzg3NjYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "ent-amapiano-global-2025",
    claim: "Will Amapiano music reach #1 on Billboard Global 200 in 2025?",
    category: "Entertainment",
    subcategory: "Music Charts",
    source: "Billboard",
    description:
      "Tracking the global rise of South African Amapiano genre and its potential chart dominance.",
    totalPool: 980000,
    yesPool: 294000,
    noPool: 686000,
    yesOdds: 3.33,
    noOdds: 1.43,
    totalCasters: 8920,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: false,
    country: "South Africa",
    region: "Southern Africa",
    marketType: "future",
    confidenceLevel: "low",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1721470551297-2016fde7673b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWFwaWFubyUyMHNvdXRoJTIwYWZyaWNhbiUyMG11c2ljfGVufDF8fHx8MTc1NTc4NzY2NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },

  // CELEBRITY GOSSIP CATEGORY (3 markets)
  {
    id: "celeb-wizkid-collab-2025",
    claim:
      "Will Wizkid announce a collaboration with a major Hollywood artist in 2025?",
    category: "Gossip",
    subcategory: "Music Collaborations",
    source: "Entertainment Weekly Africa",
    description:
      "Truth market on African music star Wizkid's potential international collaborations.",
    totalPool: 1670000,
    yesPool: 1002000,
    noPool: 668000,
    yesOdds: 1.67,
    noOdds: 2.5,
    totalCasters: 12580,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: false,
    country: "Nigeria",
    region: "West Africa",
    marketType: "future",
    confidenceLevel: "medium",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1682358061383-ee32b66f9c8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdlcmlhbiUyMG11c2ljJTIwYXJ0aXN0JTIwcmVjb3JkaW5nfGVufDF8fHx8MTc1NTc4NzY2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "celeb-lupita-marvel-2025",
    claim:
      "Will Lupita Nyong'o star in a major Marvel or DC project announcement in 2025?",
    category: "Gossip",
    subcategory: "Film Casting",
    source: "Variety Entertainment",
    description:
      "Community verification on Kenyan-Mexican actress Lupita Nyong'o's potential superhero roles.",
    totalPool: 1920000,
    yesPool: 960000,
    noPool: 960000,
    yesOdds: 2.0,
    noOdds: 2.0,
    totalCasters: 15670,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: true,
    country: "Kenya",
    region: "East Africa",
    marketType: "future",
    confidenceLevel: "medium",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1635418914759-90f2bd6d2e79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYWN0cmVzcyUyMGhvbGx5d29vZCUyMGZpbG18ZW58MXx8fHwxNzU1Nzg3NjcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "celeb-black-panther-3-2025",
    claim:
      "Will Black Panther 3 be officially announced with an African director in 2025?",
    category: "Gossip",
    subcategory: "Film Announcements",
    source: "Marvel Studios",
    description:
      "Speculation on the continuation of the Black Panther franchise with African representation.",
    totalPool: 2100000,
    yesPool: 1470000,
    noPool: 630000,
    yesOdds: 1.43,
    noOdds: 3.33,
    totalCasters: 17890,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: true,
    region: "Continental Africa",
    marketType: "future",
    confidenceLevel: "low",
    disputable: false,
    imageUrl:
      "https://images.unsplash.com/photo-1631387019069-2ff599943f9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXBlcmhlcm8lMjBtb3ZpZSUyMGZpbG1pbmclMjBwcm9kdWN0aW9ufGVufDF8fHx8MTc1NTc4NzY3NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },

  // FINANCE CATEGORY (4 markets)
  {
    id: "fin-nigeria-crypto-adoption-2025",
    claim:
      "Will cryptocurrency adoption in Nigeria exceed 40% of adults by end of 2025?",
    category: "Finance",
    subcategory: "Cryptocurrency",
    source: "Central Bank of Nigeria",
    description:
      "Truth verification on Nigeria's digital currency adoption amid regulatory changes.",
    totalPool: 3450000,
    yesPool: 2415000,
    noPool: 1035000,
    yesOdds: 1.43,
    noOdds: 3.33,
    totalCasters: 22870,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: true,
    country: "Nigeria",
    region: "West Africa",
    marketType: "future",
    confidenceLevel: "high",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1629193382974-f478714dba26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXRjb2luJTIwY3J5cHRvY3VycmVuY3klMjBuaWdlcmlhfGVufDF8fHx8MTc1NTc4NzY4Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "fin-jse-record-high-2025",
    claim:
      "Will the Johannesburg Stock Exchange reach a new all-time high in 2025?",
    category: "Finance",
    subcategory: "Stock Markets",
    source: "Johannesburg Stock Exchange",
    description:
      "Market truth verification on JSE performance amid South African economic recovery.",
    totalPool: 2890000,
    yesPool: 1445000,
    noPool: 1445000,
    yesOdds: 2.0,
    noOdds: 2.0,
    totalCasters: 17340,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: false,
    country: "South Africa",
    region: "Southern Africa",
    marketType: "future",
    confidenceLevel: "medium",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1682796085204-a1edd2cd9ed9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb2hhbm5lc2J1cmclMjBzdG9jayUyBGV4Y2hhbmdlJTIwdHJhZGluZ3xlbnwxfHx8fDE3NTU3ODc2ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "fin-afdb-funding-2025",
    claim:
      "Will the African Development Bank approve over $50 billion in project funding in 2025?",
    category: "Finance",
    subcategory: "Development Finance",
    source: "African Development Bank",
    description:
      "Tracking continental development funding commitments for infrastructure and economic growth.",
    totalPool: 1890000,
    yesPool: 1323000,
    noPool: 567000,
    yesOdds: 1.43,
    noOdds: 3.33,
    totalCasters: 14670,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: false,
    region: "Continental Africa",
    marketType: "future",
    confidenceLevel: "high",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1678693362793-e2fffac536d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwZGV2ZWxvcG1lbnQlMjBiYW5rJTIwZnVuZGluZ3xlbnwxfHx8fDE3NTU3ODc2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "fin-morocco-gdp-growth-2025",
    claim: "Will Morocco's GDP growth exceed 5% in 2025?",
    category: "Finance",
    subcategory: "Economic Growth",
    source: "Bank Al-Maghrib",
    description:
      "Economic truth verification on Morocco's growth targets amid global market conditions.",
    totalPool: 1450000,
    yesPool: 870000,
    noPool: 580000,
    yesOdds: 1.67,
    noOdds: 2.5,
    totalCasters: 11230,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: false,
    country: "Morocco",
    region: "North Africa",
    marketType: "future",
    confidenceLevel: "medium",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1617259945518-9ca4253a1e34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3JvY2NvJTIwZWNvbm9taWMlMjBncm93dGglMjBidXNpbmVzc3xlbnwxfHx8fDE3NTU3ODc2OTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },

  // POLITICS CATEGORY (4 markets)
  {
    id: "pol-ghana-early-elections-2025",
    claim: "Will Ghana hold early elections before the scheduled 2028 date?",
    category: "Politics",
    subcategory: "Elections",
    source: "Electoral Commission of Ghana",
    description:
      "Political truth verification on Ghana's electoral timeline amid governance challenges.",
    totalPool: 2100000,
    yesPool: 630000,
    noPool: 1470000,
    yesOdds: 3.33,
    noOdds: 1.43,
    totalCasters: 16890,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: false,
    country: "Ghana",
    region: "West Africa",
    marketType: "future",
    confidenceLevel: "low",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1551190128-5de006042750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaGFuYSUyMGVsZWN0aW9ucyUyMHZvdGluZyUyMGRlbW9jcmFjeXxlbnwxfHx8fDE3NTU3ODc3MDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "pol-au-currency-initiative-2025",
    claim:
      "Will the African Union announce a new continental currency initiative in 2025?",
    category: "Politics",
    subcategory: "Continental Integration",
    source: "African Union Commission",
    description:
      "Continental truth verification on AU monetary integration plans and implementation timeline.",
    totalPool: 4200000,
    yesPool: 1260000,
    noPool: 2940000,
    yesOdds: 3.33,
    noOdds: 1.43,
    totalCasters: 28450,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: true,
    region: "Continental Africa",
    marketType: "future",
    confidenceLevel: "medium",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1742996111692-2d924f12a058?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwdW5pb24lMjBtZWV0aW5nJTIwY29uZmVyZW5jZXxlbnwxfHx8fDE3NTU3ODc3MDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "pol-south-africa-energy-crisis-2025",
    claim: "Will South Africa end load-shedding permanently by end of 2025?",
    category: "Politics",
    subcategory: "Energy Policy",
    source: "Eskom Holdings",
    description:
      "Verification of South Africa's commitment to solving its electricity crisis through renewable energy.",
    totalPool: 3100000,
    yesPool: 930000,
    noPool: 2170000,
    yesOdds: 3.33,
    noOdds: 1.43,
    totalCasters: 21450,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: true,
    country: "South Africa",
    region: "Southern Africa",
    marketType: "future",
    confidenceLevel: "low",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1719256383688-305c0c00d179?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3V0aCUyMGFmcmljYSUyMGVuZXJneSUyMHNvbGFyJTIwcG93ZXJ8ZW58MXx8fHwxNzU1Nzg3NzEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "pol-kenya-constitutional-reform-2025",
    claim:
      "Will Kenya pass major constitutional reforms regarding devolution in 2025?",
    category: "Politics",
    subcategory: "Constitutional Law",
    source: "Parliament of Kenya",
    description:
      "Truth verification on proposed constitutional changes affecting county governments.",
    totalPool: 1650000,
    yesPool: 990000,
    noPool: 660000,
    yesOdds: 1.67,
    noOdds: 2.5,
    totalCasters: 13450,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: false,
    country: "Kenya",
    region: "East Africa",
    marketType: "future",
    confidenceLevel: "medium",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1735886161697-b868f22f7dcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZW55YSUyMHBhcmxpYW1lbnQlMjBjb25zdGl0dXRpb25hbCUyMHJlZm9ybXxlbnwxfHx8fDE3NTU3ODc3MTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },

  // SPORTS CATEGORY (4 markets)
  {
    id: "sport-afcon-morocco-host-2025",
    claim: "Will Morocco host the Africa Cup of Nations finals in 2025?",
    category: "Sports",
    subcategory: "Football Tournaments",
    source: "Confederation of African Football",
    description:
      "Sports truth verification on AFCON 2025 hosting arrangements and Morocco's readiness.",
    totalPool: 2750000,
    yesPool: 1925000,
    noPool: 825000,
    yesOdds: 1.43,
    noOdds: 3.33,
    totalCasters: 19870,
    expiresAt: new Date("2025-06-30"),
    status: "active",
    trending: true,
    country: "Morocco",
    region: "North Africa",
    marketType: "future",
    confidenceLevel: "high",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1560805004-334414e8f2c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3JvY2NvJTIwZm9vdGJhbGwlMjBzdGFkaXVtJTIwc3BvcnRzfGVufDF8fHx8MTc1NTc4NzcyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "sport-sadio-mane-goals-2025",
    claim:
      "Will Sadio Mané score over 25 goals across all competitions in 2025?",
    category: "Sports",
    subcategory: "Player Performance",
    source: "CAF Sports Analytics",
    description:
      "Player performance truth verification on Senegalese football star Sadio Mané's scoring prospects.",
    totalPool: 1890000,
    yesPool: 1323000,
    noPool: 567000,
    yesOdds: 1.43,
    noOdds: 3.33,
    totalCasters: 14670,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: false,
    country: "Senegal",
    region: "West Africa",
    marketType: "future",
    confidenceLevel: "medium",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1506185386801-3d7bc0ddd2bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwZm9vdGJhbGwlMjBwbGF5ZXIlMjBjZWxlYnJhdGlvbnxlbnwxfHx8fDE3NTU3ODc3Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "sport-nigeria-world-cup-qualifier-2025",
    claim:
      "Will Nigeria qualify for the 2026 FIFA World Cup without losing a match?",
    category: "Sports",
    subcategory: "World Cup Qualifiers",
    source: "FIFA",
    description:
      "Truth verification on Nigeria's perfect qualification campaign for the 2026 World Cup.",
    totalPool: 2200000,
    yesPool: 660000,
    noPool: 1540000,
    yesOdds: 3.33,
    noOdds: 1.43,
    totalCasters: 16780,
    expiresAt: new Date("2025-11-30"),
    status: "active",
    trending: false,
    country: "Nigeria",
    region: "West Africa",
    marketType: "future",
    confidenceLevel: "low",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1604212563354-546134b8004f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdlcmlhJTIwZm9vdGJhbGwlMjB0ZWFtJTIwd29ybGQlMjBjdXB8ZW58MXx8fHwxNzU1Nzg3NzM0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "sport-south-africa-rugby-championship-2025",
    claim: "Will South Africa win the Rugby Championship in 2025?",
    category: "Sports",
    subcategory: "Rugby",
    source: "SANZAAR",
    description:
      "Truth verification on South Africa's Springboks winning the Rugby Championship title.",
    totalPool: 1560000,
    yesPool: 1092000,
    noPool: 468000,
    yesOdds: 1.43,
    noOdds: 3.33,
    totalCasters: 12340,
    expiresAt: new Date("2025-09-30"),
    status: "active",
    trending: false,
    country: "South Africa",
    region: "Southern Africa",
    marketType: "future",
    confidenceLevel: "medium",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1613332237072-172e05bf1b3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3V0aCUyMGFmcmljYSUyMHJ1Z2J5JTIwY2hhbXBpb25zaGlwfGVufDF8fHx8MTc1NTc4NzczOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },

  // TECHNOLOGY CATEGORY (3 markets)
  {
    id: "tech-starlink-africa-expansion-2025",
    claim:
      "Will Starlink be available in over 30 African countries by end of 2025?",
    category: "Technology",
    subcategory: "Satellite Internet",
    source: "SpaceX Communications",
    description:
      "Tech truth verification on satellite internet expansion across Africa and regulatory approvals.",
    totalPool: 3200000,
    yesPool: 2240000,
    noPool: 960000,
    yesOdds: 1.43,
    noOdds: 3.33,
    totalCasters: 21450,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: true,
    region: "Continental Africa",
    marketType: "future",
    confidenceLevel: "high",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1679068008949-12852e5fca5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYXRlbGxpdGUlMjBpbnRlcm5ldCUyMHRlY2hub2xvZ3klMjBhZnJpY2F8ZW58MXx8fHwxNzU1Nzg3NzQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "tech-mpesa-expansion-2025",
    claim: "Will M-Pesa expand to 5 new African countries in 2025?",
    category: "Technology",
    subcategory: "Mobile Payments",
    source: "Safaricom PLC",
    description:
      "Mobile payment truth verification on M-Pesa's continental expansion strategy.",
    totalPool: 2450000,
    yesPool: 1715000,
    noPool: 735000,
    yesOdds: 1.43,
    noOdds: 3.33,
    totalCasters: 18920,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: false,
    country: "Kenya",
    region: "East Africa",
    marketType: "future",
    confidenceLevel: "medium",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1576814547952-f8531781d7ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHw1ZyUyMG5ldHdvcmslMjB0b3dlciUyMG5pZ2VyaWF8ZW58MXx8fHwxNzU1Nzg3NzUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "tech-nigeria-5g-coverage-2025",
    claim: "Will Nigeria achieve 50% 5G network coverage by end of 2025?",
    category: "Technology",
    subcategory: "5G Networks",
    source: "Nigerian Communications Commission",
    description:
      "Verification of Nigeria's ambitious 5G rollout targets and infrastructure development.",
    totalPool: 1780000,
    yesPool: 534000,
    noPool: 1246000,
    yesOdds: 3.33,
    noOdds: 1.43,
    totalCasters: 14560,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: false,
    country: "Nigeria",
    region: "West Africa",
    marketType: "future",
    confidenceLevel: "low",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1738197266189-6f0994d55960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHw1ZyUyMG5ldHdvcmsgJTIwdG93ZXIlMjBuaWdlcmlhfGVufDF8fHx8MTc1NTc4Nzg1Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },

  // CLIMATE CATEGORY (2 markets)
  {
    id: "climate-great-green-wall-2025",
    claim: "Will the Great Green Wall project plant 10 million trees in 2025?",
    category: "Climate",
    subcategory: "Reforestation",
    source: "African Union Great Green Wall",
    description:
      "Environmental truth verification on Africa's massive reforestation project progress.",
    totalPool: 2890000,
    yesPool: 2023000,
    noPool: 867000,
    yesOdds: 1.43,
    noOdds: 3.33,
    totalCasters: 20340,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: true,
    region: "Sahel Region",
    marketType: "future",
    confidenceLevel: "high",
    disputable: false,
    imageUrl:
      "https://images.unsplash.com/photo-1584133554595-b8748fd1ce47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmVlJTIwcGxhbnRpbmclMjByZWZvcmVzdGF0aW9uJTIwYWZyaWNhfGVufDF8fHx8MTc1NTc4Nzc1Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "climate-cop30-africa-commitments-2025",
    claim:
      "Will African nations commit to 50% renewable energy by 2030 at COP30?",
    category: "Climate",
    subcategory: "Climate Policy",
    source: "UN Climate Change",
    description:
      "Truth verification on African countries' renewable energy commitments at COP30.",
    totalPool: 2100000,
    yesPool: 1470000,
    noPool: 630000,
    yesOdds: 1.43,
    noOdds: 3.33,
    totalCasters: 17890,
    expiresAt: new Date("2025-11-30"),
    status: "active",
    trending: false,
    region: "Continental Africa",
    marketType: "future",
    confidenceLevel: "medium",
    disputable: false,
    imageUrl:
      "https://images.unsplash.com/photo-1719256383688-305c0c00d179?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZW5ld2FibGUlMjBlbmVyZ3klMjBzb2xhciUyMHBhbmVscyUyMGFmcmljYXxlbnwxfHx8fDE3NTU3ODc3NjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },

  // HEALTH CATEGORY (3 markets)
  {
    id: "health-malaria-reduction-2025",
    claim: "Will malaria cases in sub-Saharan Africa decrease by 15% in 2025?",
    category: "Health",
    subcategory: "Disease Control",
    source: "World Health Organization Africa",
    description:
      "Public health truth verification on malaria reduction efforts and new prevention technologies.",
    totalPool: 1950000,
    yesPool: 1365000,
    noPool: 585000,
    yesOdds: 1.43,
    noOdds: 3.33,
    totalCasters: 16780,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: false,
    region: "Sub-Saharan Africa",
    marketType: "future",
    confidenceLevel: "medium",
    disputable: false,
    imageUrl:
      "https://images.unsplash.com/photo-1634710664586-fe890319a9fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwaGVhbHRoY2FyZSUyMG1hbGFyaWElMjBwcmV2ZW50aW9ufGVufDF8fHx8MTc1NTc4Nzc2NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "health-covid-vaccination-africa-2025",
    claim:
      "Will African countries achieve 80% COVID-19 vaccination rate by end of 2025?",
    category: "Health",
    subcategory: "Vaccination Programs",
    source: "Africa CDC",
    description:
      "Truth verification on continental vaccination targets and healthcare infrastructure capacity.",
    totalPool: 2340000,
    yesPool: 702000,
    noPool: 1638000,
    yesOdds: 3.33,
    noOdds: 1.43,
    totalCasters: 18940,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: false,
    region: "Continental Africa",
    marketType: "future",
    confidenceLevel: "low",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1646457414481-60c356d88021?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3ZpZCUyMHZhY2NpbmF0aW9uJTIwYWZyaWNhJTIwaGVhbHRoY2FyZXxlbnwxfHx8fDE3NTU3ODc3Njl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "health-maternal-mortality-reduction-2025",
    claim:
      "Will maternal mortality rates in West Africa decrease by 20% in 2025?",
    category: "Health",
    subcategory: "Maternal Health",
    source: "World Health Organization Africa",
    description:
      "Truth verification on maternal health improvements through better healthcare access and education.",
    totalPool: 1450000,
    yesPool: 1015000,
    noPool: 435000,
    yesOdds: 1.43,
    noOdds: 3.33,
    totalCasters: 12890,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: false,
    region: "West Africa",
    marketType: "future",
    confidenceLevel: "medium",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1584433615985-a5b7e04b0e96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRlcm5hbCUyMGhlYWx0aCUyMGFmcmljYSUyMGNhcmV8ZW58MXx8fHwxNzU1Nzg3Nzc4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },

  // BUSINESS CATEGORY (2 markets)
  {
    id: "biz-african-startups-2025",
    claim: "Will African tech startups raise over $5 billion in funding in 2025?",
    category: "Business",
    subcategory: "Startup Funding",
    source: "African Tech Ecosystem",
    description:
      "Tracking venture capital investment in African technology startups for 2025.",
    totalPool: 1890000,
    yesPool: 1323000,
    noPool: 567000,
    yesOdds: 1.43,
    noOdds: 3.33,
    totalCasters: 14670,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: false,
    region: "Continental Africa",
    marketType: "future",
    confidenceLevel: "medium",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwc3RhcnR1cCUyMGJ1c2luZXNzfGVufDF8fHx8MTc1NTc4Nzc4Mnww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "biz-lagos-tech-hub-2025",
    claim: "Will Lagos become Africa's leading tech hub by end of 2025?",
    category: "Business",
    subcategory: "Tech Ecosystem",
    source: "African Business Review",
    description:
      "Verification on Lagos overtaking other African cities in tech innovation and startup growth.",
    totalPool: 1560000,
    yesPool: 1092000,
    noPool: 468000,
    yesOdds: 1.43,
    noOdds: 3.33,
    totalCasters: 12340,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: false,
    country: "Nigeria",
    region: "West Africa",
    marketType: "future",
    confidenceLevel: "medium",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWdvcyUyMGNpdHklMjBidXNpbmVzc3xlbnwxfHx8fDE3NTU3ODc3ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },

  // BRAND CATEGORY (2 markets)
  {
    id: "brand-jumia-expansion-2025",
    claim: "Will Jumia expand to 5 new African countries in 2025?",
    category: "Brand",
    subcategory: "E-commerce",
    source: "Jumia Technologies",
    description:
      "Truth verification on Jumia's expansion strategy across African markets.",
    totalPool: 1780000,
    yesPool: 1246000,
    noPool: 534000,
    yesOdds: 1.43,
    noOdds: 3.33,
    totalCasters: 14560,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: true,
    region: "Continental Africa",
    marketType: "future",
    confidenceLevel: "high",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBhZnJpY2F8ZW58MXx8fHwxNzU1Nzg3NzkwfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "brand-mtn-5g-rollout-2025",
    claim: "Will MTN complete 5G rollout in 10 African countries by 2025?",
    category: "Brand",
    subcategory: "Telecommunications",
    source: "MTN Group",
    description:
      "Verification of MTN's 5G network expansion plans across Africa.",
    totalPool: 2100000,
    yesPool: 1470000,
    noPool: 630000,
    yesOdds: 1.43,
    noOdds: 3.33,
    totalCasters: 17890,
    expiresAt: new Date("2025-12-31"),
    status: "active",
    trending: false,
    region: "Continental Africa",
    marketType: "future",
    confidenceLevel: "medium",
    disputable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHw1ZyUyMG5ldHdvcmslMjB0ZWxlY29tfGVufDF8fHx8MTc1NTc4Nzc5NHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

export default function BettingMarkets({ onPlaceBet, userBalance, markets = realTimeMarkets }: BettingMarketsProps) {
  const [showBetDialog, setShowBetDialog] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<BettingMarket | null>(null);
  const [betPosition, setBetPosition] = useState<'yes' | 'no'>('yes');
  const [betAmount, setBetAmount] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCreateMarketModal, setShowCreateMarketModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedConfidence, setSelectedConfidence] = useState('all');
  const { language } = useLanguage();
  const navigate = useNavigate();

  // const handleNavigate = ( marketId: string, market: string = '') => {
  //   navigate(`/markets/${marketId}`);
  //   console.log(market)
  // };


  // Filter markets
  const filteredMarkets = markets.filter(market => {
    const matchesSearch = market.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         market.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         market.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || market.category === selectedCategory;
    const matchesCountry = selectedCountry === 'all' || market.country === selectedCountry || market.region === selectedCountry;
    const matchesConfidence = selectedConfidence === 'all' || market.confidenceLevel === selectedConfidence;
    
    return matchesSearch && matchesCategory && matchesCountry && matchesConfidence;
  });

  // Sort markets (trending first, then by total pool)
  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    if (a.trending && !b.trending) return -1;
    if (!a.trending && b.trending) return 1;
    return b.totalPool - a.totalPool;
  });

  // Get unique categories and countries for filters
  const categories = ['all', ...Array.from(new Set(markets.map(m => m.category)))];
  const countries = ['all', ...Array.from(new Set(markets.map(m => m.country || m.region).filter(Boolean)))];

  const handleOpenBetDialog = (market: BettingMarket, position: 'yes' | 'no') => {
    setSelectedMarket(market);
    setBetPosition(position);
    setBetAmount('');
    setShowBetDialog(true);
  };

  const handlePlaceBet = async () => {
    if (!selectedMarket || !betAmount) return;
    
    const amount = parseFloat(betAmount);
    if (amount <= 0 || amount > userBalance) {
      toast.error('Invalid amount or insufficient balance');
      return;
    }

    try {
      await onPlaceBet(selectedMarket.id, betPosition, amount);
      setShowBetDialog(false);
      toast.success(`Truth position cast successfully on: ${selectedMarket.claim.substring(0, 50)}...`);
    } catch (error) {
      toast.error('Failed to cast position. Please try again.');
    }
  };

  const handleShareMarket = (market: BettingMarket) => {
    setSelectedMarket(market);
    setShowShareModal(true);
  };

  const formatTimeRemaining = (expiresAt: Date): string => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  const getClaimText = (market: BettingMarket): string => {
    if (language !== 'en' && market.claimTranslations) {
      return market.claimTranslations[language] || market.claim;
    }
    return market.claim;
  };

  return (
    <div className="space-y-6">
      {/* Hero Section - Enhanced Mobile Layout */}
      <div className="py-3 md:py-5 lg:py-8">
        <div className="text-center mb-3 md:mb-4 lg:mb-6">
          {/* Truth Markets heading removed as per requirements */}
        </div>

        {/* Search and Filters - Horizontal Layout Matching Image */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 md:gap-4 lg:gap-4">
          {/* Search Bar - Left Side */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="markets-search-input"
                placeholder="Search markets, categories, or sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 md:h-10 lg:h-11 bg-background/50 border-primary/30 focus:border-primary text-sm md:text-base lg:text-base"
              />
            </div>
          </div>

          {/* Filter Dropdowns - Center */}
          <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger
                className="w-full sm:w-36 md:w-40 lg:w-40 flex-1 h-9 md:h-10 lg:h-11 bg-background/50 border-primary/30 text-xs md:text-sm lg:text-sm"
                {...({} as any)}
              >
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value="trending" onValueChange={() => {}}>
              <SelectTrigger
                className="w-full sm:w-36 md:w-40 lg:w-40 flex-1 h-9 md:h-10 lg:h-11 bg-background/50 border-primary/30 text-xs md:text-sm lg:text-sm"
                {...({} as any)}
              >
                <SelectValue placeholder="Trending" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
              </SelectContent>
            </Select>

            <Select value="all" onValueChange={() => {}}>
              <SelectTrigger
                className="w-full sm:w-36 md:w-40 lg:w-40 flex-1 h-9 md:h-10 lg:h-11 bg-background/50 border-primary/30 text-xs md:text-sm lg:text-sm"
                {...({} as any)}
              >
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="future">Future</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Markets Counter and Create Button - Right Side */}
          <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-muted-foreground">
                31 Active Markets
              </span>
            </div>
            <Button
              className="font-medium gap-2 h-9 md:h-10 lg:h-11 px-3 md:px-4 lg:px-4 text-xs md:text-sm lg:text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#06f6ff', color: '#000000' }}
              onClick={() => setShowCreateMarketModal(true)}
            >
              <span className="text-base md:text-lg lg:text-lg">+</span>
              Create Market
            </Button>
          </div>
        </div>
      </div>

      {/* Markets Grid - Responsive */}
      {sortedMarkets.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No markets found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {sortedMarkets.map((market) => (
            <div
              key={market.id}
              className={`relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border border-border hover:border-primary/50 rounded-xl bg-transparent`}
              onClick={() => navigate(`/market/${market.id}`)}
            >
              {/* ${market.trending ? "trending-corner" : ""} */}
              {/* {market.trending && (
                <div className="absolute top-0 left-0 z-10">
                  <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-2 py-1 text-xs font-bold transform -rotate-45 translate-x-[-8px] translate-y-[10px] shadow-lg">
                    TRENDING
                  </div>
                </div>
              )} */}
              {market.imageUrl && (
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={market.imageUrl}
                    alt={market.claim}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                  {/* Confidence Badge */}
                  {/* <Badge
                    className={`absolute top-2 right-2 text-xs px-2 py-1 ${
                      market.confidenceLevel === "high"
                        ? "bg-green-500/90 text-white"
                        : market.confidenceLevel === "medium"
                        ? "bg-yellow-500/90 text-white"
                        : "bg-red-500/90 text-white"
                    }`}
                  >
                    {market.confidenceLevel.toUpperCase()}
                  </Badge> */}

                  {/* Country/Region Badge */}
                  {(market.country || market.region) && (
                    <Badge
                      variant="secondary"
                      className="absolute top-2 left-2 text-xs bg-background/90 text-foreground"
                    >
                      {market.country || market.region}
                    </Badge>
                  )}
                </div>
              )}
              <CardHeader className="pb-2">
                {/* 1. Market Title - Well Aligned */}
                <div className="relative mb-3 flex items-start gap-2">
                  <CardTitle className="text-xs sm:text-sm md:text-base lg:text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors text-left flex-1">
                    {getClaimText(market)}
                  </CardTitle>
                  {/* Share Button - Aligned with Title */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      console.log('Share button clicked for market:', market.id);
                      handleShareMarket(market);
                    }}
                    className="h-8 w-8 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0"
                    {...({} as any)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 2. Progress Bar with Inline Percentages */}
                <div className="flex items-center gap-2">
                  {/* Left Percentage (True) */}
                  <span className="text-xs text-white shrink-0 min-w-[40px] text-left">
                    {((market.yesPool / market.totalPool) * 100).toFixed(1)}%
                  </span>

                  {/* Progress Bar */}
                  <div className="flex-1 rounded-full h-3 overflow-hidden flex shadow-lg shadow-cyan-500/10">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(market.yesPool / market.totalPool) * 100}%`,
                        background: 'linear-gradient(90deg, rgba(34, 211, 238, 0.5) 0%, rgba(6, 246, 255, 0.6) 50%, rgba(167, 139, 250, 0.3) 100%)',
                      }}
                    />
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(market.noPool / market.totalPool) * 100}%`,
                        background: 'linear-gradient(90deg, rgba(167, 139, 250, 0.3) 0%, rgba(139, 92, 246, 0.5) 50%, rgba(124, 58, 237, 0.6) 100%)',
                      }}
                    />
                  </div>

                  {/* Right Percentage (False) */}
                  <span className="text-xs text-white shrink-0 min-w-[40px] text-right">
                    {((market.noPool / market.totalPool) * 100).toFixed(1)}%
                  </span>
                </div>

                {/* 4. Betting Buttons - Mobile Optimized */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenBetDialog(market, "yes");
                    }}
                    className="flex-1 bg-transparent border-2 border-primary/50 hover:border-primary hover:bg-primary/5 text-primary hover:text-primary h-9 md:h-10 lg:h-10 text-xs md:text-sm lg:text-sm font-bold uppercase tracking-wide shadow-lg shadow-primary/20 transition-all"
                    {...({} as any)}
                  >
                    <TrendingUp className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-3.5 lg:w-3.5 mr-1" />
                    True {market.yesOdds.toFixed(2)}x
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenBetDialog(market, "no");
                    }}
                    className="flex-1 bg-transparent border-2 border-secondary/50 hover:border-secondary hover:bg-secondary/5 text-secondary hover:text-secondary h-9 md:h-10 lg:h-10 text-xs md:text-sm lg:text-sm font-bold uppercase tracking-wide shadow-lg shadow-secondary/20 transition-all"
                    {...({} as any)}
                  >
                    <TrendingDown className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-3.5 lg:w-3.5 mr-1" />
                    False {market.noOdds.toFixed(2)}x
                  </Button>
                </div>

                {/* Separator Line */}
                <div className="h-px bg-border"></div>

                {/* 5. Market Info - Category, Pool, Expire, Disputable (Below Buttons) */}
                <div className="flex items-center justify-between gap-2 min-h-[24px]">
                  {/* Left Side: Category, Disputable */}
                  <div className="flex items-center gap-2 flex-1">
                    {/* Category */}
                    <Badge variant="outline" className="text-[10px] sm:text-xs md:text-xs lg:text-xs h-5 md:h-6 lg:h-6 px-1.5 md:px-2 lg:px-2 flex items-center shrink-0 whitespace-nowrap">
                      {market.category}
                    </Badge>

                    {/* Disputable */}
                    {market.disputable && (
                      <Badge className="text-[10px] sm:text-xs md:text-xs lg:text-xs h-5 md:h-6 lg:h-6 px-1.5 md:px-2 lg:px-2 flex items-center bg-yellow-100 text-yellow-800 border-yellow-300 shrink-0 whitespace-nowrap">
                        Disputable
                      </Badge>
                    )}
                  </div>

                  {/* Right Side: Pool and Expire Date */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Total Pool */}
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs md:text-xs lg:text-xs whitespace-nowrap h-5 md:h-6 lg:h-6">
                      <span className="text-muted-foreground">Pool:</span>
                      <span className="font-semibold">
                        {formatCurrency(market.totalPool)} USDT
                      </span>
                    </div>

                    {/* Expire Date */}
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs md:text-xs lg:text-xs whitespace-nowrap h-5 md:h-6 lg:h-6">
                      <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 lg:h-3 lg:w-3 shrink-0" />
                      <span className="text-muted-foreground">
                        {formatTimeRemaining(market.expiresAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          ))}
        </div>
      )}

      {/* Bet Dialog */}
      {showBetDialog && selectedMarket && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setShowBetDialog(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl md:rounded-3xl border border-zinc-800/50 shadow-2xl overflow-hidden" style={{ backgroundColor: '#0f1419' }}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-800/30">
                <h2 className="text-lg font-bold text-white">Cast Your Truth Position</h2>
                <button
                  type="button"
                  onClick={() => setShowBetDialog(false)}
                  className="h-9 w-9 p-0 flex items-center justify-center rounded-xl border-2 border-transparent transition-all group"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#06f6ff';
                    e.currentTarget.style.backgroundColor = '#1a1f26';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <X className="h-5 w-5 text-gray-400 group-hover:text-gray-300" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 md:p-5 lg:p-6 space-y-4">
                {/* Market Claim */}
                <div className="flex items-start gap-3 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                  {selectedMarket.imageUrl && (
                    <img
                      src={selectedMarket.imageUrl}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm">{selectedMarket.claim}</p>
                    <p className="text-xs text-zinc-500 mt-1">Source: {selectedMarket.source}</p>
                  </div>
                </div>

                {/* Percentage Bar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">{Math.round((selectedMarket.yesPool / selectedMarket.totalPool) * 100)}%</span>
                    <span className="text-2xl font-bold text-white">{Math.round((selectedMarket.noPool / selectedMarket.totalPool) * 100)}%</span>
                  </div>
                  <div className="rounded-full h-3 overflow-hidden flex shadow-lg shadow-cyan-500/10 border border-zinc-800/50">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(selectedMarket.yesPool / selectedMarket.totalPool) * 100}%`,
                        background: 'linear-gradient(90deg, rgba(34, 211, 238, 0.5) 0%, rgba(6, 246, 255, 0.6) 50%, rgba(167, 139, 250, 0.3) 100%)'
                      }}
                    />
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(selectedMarket.noPool / selectedMarket.totalPool) * 100}%`,
                        background: 'linear-gradient(90deg, rgba(167, 139, 250, 0.3) 0%, rgba(139, 92, 246, 0.5) 50%, rgba(124, 58, 237, 0.6) 100%)'
                      }}
                    />
                  </div>
                </div>

                {/* Pick a Side */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-white text-left">Pick a side</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setBetPosition("yes")}
                      className={`py-3 px-4 rounded-full text-base font-bold transition-all text-center cursor-pointer ${
                        betPosition === "yes"
                          ? "border-2 shadow-lg"
                          : "bg-zinc-900/80 border-2 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800/80"
                      }`}
                      style={betPosition === "yes" ? {
                        background: 'linear-gradient(to bottom right, rgba(34, 211, 238, 0.2), rgba(37, 99, 235, 0.1))',
                        borderColor: 'rgba(34, 211, 238, 0.6)',
                        color: '#22d3ee',
                        boxShadow: '0 10px 15px -3px rgba(34, 211, 238, 0.25)'
                      } : {}}
                    >
                      TRUE
                    </button>
                    <button
                      onClick={() => setBetPosition("no")}
                      className={`py-3 px-4 rounded-full text-base font-bold transition-all text-center cursor-pointer ${
                        betPosition === "no"
                          ? "border-2 shadow-lg"
                          : "bg-zinc-900/80 border-2 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800/80"
                      }`}
                      style={betPosition === "no" ? {
                        background: 'linear-gradient(to bottom right, rgba(192, 132, 252, 0.2), rgba(168, 85, 247, 0.1))',
                        borderColor: 'rgba(192, 132, 252, 0.6)',
                        color: '#7c3aed',
                        boxShadow: '0 10px 15px -3px rgba(192, 132, 252, 0.25)'
                      } : {}}
                    >
                      FALSE
                    </button>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white text-left">Amount</h3>
                    <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-700/50 text-zinc-300">
                      Available USDT {userBalance.toFixed(2)}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute top-1/2 -translate-y-1/2 font-semibold text-zinc-400 pointer-events-none" style={{ left: '20px', fontSize: '18px' }}>
                      USDT
                    </span>
                    <Input
                      id="betAmount"
                      type="text"
                      value={betAmount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        setBetAmount(value);
                      }}
                      placeholder="0.00"
                      className="w-full h-14 pr-4 font-bold text-white text-left bg-zinc-900/80 border-2 rounded-xl focus:ring-0 transition-all placeholder:text-zinc-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      style={{
                        paddingLeft: '90px',
                        fontSize: '18px',
                        borderColor: betAmount ? '#06b6d4' : 'rgba(63, 63, 70, 0.5)'
                      }}
                    />
                  </div>
                </div>

                {/* Market Info */}
                <div className="space-y-3 py-4 border-t border-zinc-800/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Current odds</span>
                    <span className="text-sm font-medium text-white">
                      {(betPosition === "yes" ? selectedMarket.yesOdds : selectedMarket.noOdds).toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Shares</span>
                    <span className="text-sm font-medium text-white">
                      {betAmount ? Math.floor(parseFloat(betAmount) / (betPosition === "yes" ? selectedMarket.yesOdds : selectedMarket.noOdds)) : 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Avg. price</span>
                    <span className="text-sm font-medium text-white">
                      {betAmount ? (parseFloat(betAmount) / Math.max(1, Math.floor(parseFloat(betAmount) / (betPosition === "yes" ? selectedMarket.yesOdds : selectedMarket.noOdds)))).toFixed(2) : "0.00"} USDT
                    </span>
                  </div>
                </div>

                {/* Fee Info */}
                <div className="space-y-3 py-4 border-t border-zinc-800/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Fee</span>
                    <span className="text-sm font-medium text-white">3%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Max profit</span>
                    <span className="text-sm font-semibold text-emerald-400">
                      {betAmount ? (
                        parseFloat(betAmount) * (betPosition === "yes" ? selectedMarket.yesOdds : selectedMarket.noOdds) - parseFloat(betAmount)
                      ).toFixed(2) : "0.00"} USDT ({betAmount ? (
                        ((parseFloat(betAmount) * (betPosition === "yes" ? selectedMarket.yesOdds : selectedMarket.noOdds) - parseFloat(betAmount)) / parseFloat(betAmount)) * 100
                      ).toFixed(2) : "0.00"}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Max payout</span>
                    <span className="text-sm font-medium text-white">
                      {betAmount ? (parseFloat(betAmount) * (betPosition === "yes" ? selectedMarket.yesOdds : selectedMarket.noOdds)).toFixed(2) : "0.00"} USDT
                    </span>
                  </div>
                </div>

                {/* Cast Position Button */}
                <Button
                  onClick={handlePlaceBet}
                  disabled={!betAmount || parseFloat(betAmount) > userBalance}
                  className="w-full h-14 text-lg font-bold rounded-xl cursor-pointer"
                  style={{
                    backgroundColor: !betAmount || parseFloat(betAmount) > userBalance ? '#334155' : '#06f6ff',
                    color: !betAmount || parseFloat(betAmount) > userBalance ? '#94a3b8' : '#000000'
                  }}
                >
                  {!betAmount ? 'Enter amount' : parseFloat(betAmount) > userBalance ? 'Insufficient balance' : 'Cast Position'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedMarket(null);
          }}
          market={selectedMarket}
        />
      )}

      {/* Create Market Modal */}
      <CreateMarketModal
        isOpen={showCreateMarketModal}
        onClose={() => setShowCreateMarketModal(false)}
        onCreateMarket={(market) => {
          console.log('New market created:', market);
          // TODO: Add market to backend/state
        }}
      />
    </div>
  );
}