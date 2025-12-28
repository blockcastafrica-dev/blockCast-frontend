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
      question: 'What is BlockCast?',
      answer: 'BlockCast is Africa\'s first AI-powered truth verification platform that combines community wisdom with advanced artificial intelligence to combat misinformation. Our AI analyzes claims against multiple sources while the community votes on truthfulness.'
    },
    {
      category: 'General',
      question: 'How do I create an account?',
      answer: 'Click the "Sign Up" button in the top right corner and follow the registration process. You\'ll need to provide your email, create a password, and verify your account through the confirmation email sent to you.'
    },
    {
      category: 'General',
      question: 'Which countries does BlockCast support?',
      answer: 'We currently operate in 15+ African countries with plans to expand across the entire continent. Our platform supports multiple languages including English, French, and Swahili.'
    },
    {
      category: 'General',
      question: 'Is BlockCast free to use?',
      answer: 'Yes, creating an account and browsing truth markets is completely free. You only need funds when you want to participate in truth markets by staking positions on claims.'
    },
    {
      category: 'Verification',
      question: 'How does truth verification work?',
      answer: 'Our AI scans thousands of sources across Africa and internationally to verify claims. It cross-references data from credible news outlets, official reports, and verified databases.'
    },
    {
      category: 'Verification',
      question: 'How do I submit a claim for verification?',
      answer: 'Navigate to the "Verify" section and use the verification tool to submit suspicious claims. Paste the claim or URL, add any relevant context, and our AI will assess it within 24-48 hours.'
    },
    {
      category: 'Verification',
      question: 'How accurate is the AI verification?',
      answer: 'Our AI has a 94.2% accuracy rate based on historical verification outcomes. We recommend considering AI verifications alongside human judgment for nuanced stories.'
    },
    {
      category: 'Verification',
      question: 'Can I dispute a verification result?',
      answer: 'Yes! If you have evidence that contradicts an AI resolution, you can submit a dispute during the dispute window with supporting links.'
    },
    {
      category: 'Markets',
      question: 'What are truth markets?',
      answer: 'Truth markets are prediction markets for African events where you can stake positions on real-world outcomes. They harness collective intelligence to determine the likelihood of claims being true or false.'
    },
    {
      category: 'Markets',
      question: 'How do I participate in truth markets?',
      answer: 'Browse active markets, select one that interests you, choose your position (True or False), enter your stake amount, and confirm. You\'ll earn rewards if your prediction is correct.'
    },
    {
      category: 'Markets',
      question: 'What are the risks?',
      answer: 'Truth markets involve financial risk. You may lose the funds you stake if your prediction is incorrect. Only participate with amounts you can afford to lose.'
    },
    {
      category: 'Markets',
      question: 'How are markets resolved?',
      answer: 'Markets are resolved using AI analysis of official sources and verified data once the resolution criteria are met, typically 24-48 hours after market closes.'
    },
    {
      category: 'Markets',
      question: 'What fees are charged?',
      answer: 'There is a 3% fee on winnings when you claim rewards from a resolved market. There are no fees for placing positions or for losing positions.'
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
