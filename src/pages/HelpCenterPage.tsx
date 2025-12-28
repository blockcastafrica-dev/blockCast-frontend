import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function HelpCenterPage() {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  const faqItems: FAQItem[] = [
    {
      category: 'General',
      question: 'What is a prediction market?',
      answer: 'A prediction market is a platform where users forecast the outcome of real-world events by trading on clearly defined questions (for example: Will X happen before Y date?). Market prices reflect the collective probability assigned by participants.'
    },
    {
      category: 'General',
      question: 'How does the platform work?',
      answer: 'Each market has predefined outcomes (usually Yes / No or True / False). Users take positions on the outcome they believe will occur. Prices move based on supply and demand. When the event resolves, correct positions receive payouts.'
    },
    {
      category: 'General',
      question: 'Is this gambling?',
      answer: 'No. Prediction markets are information and forecasting markets, not games of chance. Prices are driven by research, news, and collective intelligence rather than randomness.'
    },
    {
      category: 'General',
      question: 'How is my money protected?',
      answer: 'The platform uses secure infrastructure and encryption, segregation of user funds, and transparent settlement mechanisms. Security and user protection are core priorities.'
    },
    {
      category: 'General',
      question: 'What fees are charged?',
      answer: 'Fees may include a small fee on winning payouts and network or transaction fees (where applicable). All fees are clearly disclosed before confirming any trade.'
    },
    {
      category: 'General',
      question: 'What currencies or payment methods are supported?',
      answer: 'Depending on the platform and your region, we may support fiat currencies, stablecoins or other digital assets, and local payment methods. When fiat currencies are used, they are converted into digital assets such as stablecoins pegged to the US dollar before being used on the platform. This ensures consistent pricing, transparent settlement, and efficient market operations. All supported options and conversion details are clearly displayed during deposits and withdrawals.'
    },
    {
      category: 'General',
      question: 'Where can I learn more?',
      answer: 'You can explore market explanations inside the platform, educational guides and resources, and how it work and support channels. Our goal is to make forecasting transparent, accessible, and engaging.'
    },
    {
      category: 'Verification',
      question: 'How are market outcomes verified?',
      answer: 'Each market specifies its official resolution sources before opening, which may include government or institutional data, recognized media outlets, and independent, verifiable public records. Markets are resolved strictly based on these predefined sources.'
    },
    {
      category: 'Verification',
      question: 'Who decides the final outcome?',
      answer: 'Outcomes are determined using predefined trusted sources, structured verification processes, and in some cases, AI-assisted data analysis using Google Gemini and Perplexity. Human oversight is applied where judgment or interpretation is required.'
    },
    {
      category: 'Verification',
      question: 'Can outcomes be disputed?',
      answer: 'Yes. If you believe a market was resolved incorrectly, you may submit a dispute during the designated dispute window with supporting evidence. All disputes are reviewed according to platform rules.'
    },
    {
      category: 'Verification',
      question: 'Is the platform regulated?',
      answer: 'Regulatory status depends on jurisdiction. The platform operates in compliance with applicable laws and may restrict access where required.'
    },
    {
      category: 'Markets',
      question: 'What types of markets are available?',
      answer: 'Markets may include: Politics & public policy, Economics & finance, Sports & entertainment, Technology & innovation, Culture, media, and global events. Available categories may vary by region and regulation.'
    },
    {
      category: 'Markets',
      question: 'Why use prediction markets instead of polls or experts?',
      answer: 'Prediction markets update in real time, reward accuracy not opinions, aggregate thousands of independent signals, and reduce bias through financial incentives. They turn information into actionable probabilities.'
    },
    {
      category: 'Markets',
      question: 'How are prices determined?',
      answer: 'Prices are set by the market itself. As users buy or sell positions, prices adjust automatically, acting as a real-time probability estimate of the outcome.'
    },
    {
      category: 'Markets',
      question: 'How do payouts work?',
      answer: 'Each correct position settles at a fixed value (e.g. $1 or equivalent). Profit = payout minus the price you paid. Payouts are credited automatically after resolution.'
    },
    {
      category: 'Markets',
      question: 'Can I exit a position before resolution?',
      answer: 'Yes. You can usually sell your position at the current market price before the event resolves, allowing you to lock in profits or limit losses.'
    },
    {
      category: 'Markets',
      question: 'What are the risks?',
      answer: 'Participation involves financial risk. If your prediction is incorrect, you may lose the amount you committed. Only participate with funds you can afford to lose.'
    }
  ];

  const toggleItem = (index: number) => {
    setExpandedItems(prev =>
      prev[index] ? {} : { [index]: true }
    );
  };

  const groupedItems = faqItems.reduce((acc, item) => {
    const originalIndex = faqItems.findIndex(f => f.question === item.question);
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push({ ...item, originalIndex });
    return acc;
  }, {} as Record<string, (FAQItem & { originalIndex: number })[]>);

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div style={{ backgroundColor: '#06b6d4', width: '100%', padding: '64px 20px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: 'black', letterSpacing: '-0.02em' }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: '18px', marginTop: '12px' }}>
            Find Answers to your Questions
          </p>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-5 py-16 md:py-24">

        {/* FAQ Sections */}
        <div className="space-y-32 md:space-y-40">
          {Object.entries(groupedItems).map(([category, items]) => (
            <section key={category}>
              {/* Section Title */}
              <h2 className="text-[28px] md:text-[36px] font-semibold text-white mb-6 mt-8 tracking-[-0.02em]">
                {category}
              </h2>

              {/* Questions */}
              <div className="space-y-2">
                {items.map((item) => {
                  const isExpanded = expandedItems[item.originalIndex];

                  return (
                    <div
                      key={item.originalIndex}
                      className="rounded-xl transition-all duration-200 cursor-pointer"
                      style={{ backgroundColor: isExpanded ? '#2d3748' : undefined }}
                      onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.backgroundColor = '#2d3748'; }}
                      onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.backgroundColor = ''; }}
                      onClick={() => toggleItem(item.originalIndex)}
                    >
                      <div
                        className="w-full py-4 px-4 flex items-center gap-4 text-left focus:outline-none group"
                      >
                        <ChevronDown
                          className="w-5 h-5 text-zinc-500 group-hover:text-cyan-400 transition-all duration-200"
                          strokeWidth={2}
                          style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                        />
                        <span className="text-[17px] font-medium text-white">
                          {item.question}
                        </span>
                      </div>

                      {isExpanded && (
                        <p className="px-4 pb-4 pt-0 ml-9 text-[15px] text-zinc-300 leading-relaxed">
                          {item.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
