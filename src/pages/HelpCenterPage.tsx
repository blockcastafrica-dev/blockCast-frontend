import { useState } from 'react';
import { ChevronDown, Search, Mail, MessageCircle, BookOpen, Users, Shield, Zap, HelpCircle, ExternalLink, ChevronRight } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: React.ElementType;
  description: string;
  questions: FAQItem[];
}

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Getting Started');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const faqCategories: FAQCategory[] = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      description: 'New to BlockCast? Start here',
      questions: [
        {
          question: 'How do I create an account?',
          answer: 'Click the "Sign Up" button in the top right corner and follow the registration process. You\'ll need to provide your email, create a password, and verify your account through the confirmation email sent to you.'
        },
        {
          question: 'What is BlockCast and how does it work?',
          answer: 'BlockCast is Africa\'s first AI-powered truth verification platform that combines community wisdom with advanced artificial intelligence to combat misinformation. Our AI analyzes claims against multiple sources while the community votes on truthfulness, creating a decentralized fact-checking ecosystem.'
        },
        {
          question: 'Which countries does BlockCast support?',
          answer: 'We currently operate in 15+ African countries with plans to expand across the entire continent. Our platform supports multiple languages including English, French, and Swahili to serve diverse communities.'
        },
        {
          question: 'Is BlockCast free to use?',
          answer: 'Yes, creating an account and browsing truth markets is completely free. You only need funds when you want to participate in truth markets by staking positions on claims.'
        }
      ]
    },
    {
      title: 'Truth Verification',
      icon: Shield,
      description: 'How we verify claims',
      questions: [
        {
          question: 'How does truth verification work?',
          answer: 'Our AI scans thousands of sources across Africa and internationally to verify claims. It cross-references data from credible news outlets, official reports, and verified databases. Community members then vote on the truthfulness of claims, providing local context and cultural nuances that improve AI accuracy.'
        },
        {
          question: 'How do I submit a claim for verification?',
          answer: 'Navigate to the "Verify" section and use the verification tool to submit suspicious claims. Paste the claim or URL, add any relevant context, and our AI and community will assess and provide truth ratings within 24-48 hours.'
        },
        {
          question: 'How accurate is the AI verification?',
          answer: 'Our AI has a 94.2% accuracy rate based on historical verification outcomes. However, we always recommend considering AI verifications alongside human judgment and additional sources, especially for nuanced or developing stories.'
        },
        {
          question: 'Can I dispute a verification result?',
          answer: 'Yes! If you have evidence that contradicts an AI resolution, you can submit a dispute during the dispute window. Submit your evidence with supporting links, and our dispute resolution system will review your submission. There is a small fee to prevent spam, which is refunded for good-faith attempts.'
        }
      ]
    },
    {
      title: 'Truth Markets',
      icon: Zap,
      description: 'Prediction markets explained',
      questions: [
        {
          question: 'What are truth markets?',
          answer: 'Truth markets are prediction markets for African events where you can stake positions on real-world outcomes. They harness collective intelligence to determine the likelihood of claims being true or false, with financial incentives for accurate predictions.'
        },
        {
          question: 'How do I participate in truth markets?',
          answer: 'Browse active markets in the "Truth Markets" section, select a market that interests you, choose your position (True or False), enter your stake amount, and confirm your position. You\'ll earn rewards if your prediction is correct when the market resolves.'
        },
        {
          question: 'What are the risks of participating in truth markets?',
          answer: 'Truth markets involve financial risk. You may lose the funds you stake if your prediction is incorrect. Only participate with amounts you can afford to lose. Past performance is not indicative of future results. BlockCast is not a financial advisor.'
        },
        {
          question: 'How are markets resolved?',
          answer: 'Markets are resolved using AI analysis of official sources and verified data once the resolution criteria are met. The resolution period is typically 24-48 hours after market closes. In case of disputes, additional evidence is reviewed before final resolution.'
        },
        {
          question: 'What fees are charged?',
          answer: 'There is a 3% fee on winnings when you claim your rewards from a resolved market. There are no fees for placing positions or for losing positions.'
        }
      ]
    },
    {
      title: 'Community & Reputation',
      icon: Users,
      description: 'Build your credibility',
      questions: [
        {
          question: 'How do I become a trusted verifier?',
          answer: 'Consistently provide accurate truth assessments, participate in community discussions, and maintain high credibility scores over time. Trusted verifiers are identified by a verified badge and earn additional rewards and influence in the platform.'
        },
        {
          question: 'What is the credibility scoring system?',
          answer: 'Our blockchain-secured credibility system tracks your verification accuracy over time. Your score is calculated based on your prediction accuracy, dispute outcomes, and community standing. Higher scores unlock additional features, early access to markets, and enhanced rewards.'
        },
        {
          question: 'How do community discussions work?',
          answer: 'Each truth market has a dedicated discussion section where community members can share insights, debate claims, and collaborate on verification efforts. You can comment, like posts, and indicate your position. Quality contributions improve your reputation score.'
        },
        {
          question: 'Can I follow other users?',
          answer: 'Yes, you can follow top performers and trusted verifiers to see their positions and insights. This helps you learn from experienced users and make more informed decisions.'
        }
      ]
    }
  ];

  const toggleItem = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '24px 16px',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
            }}
          >
            <HelpCircle style={{ width: '20px', height: '20px', color: 'white' }} />
          </div>
          <div>
            <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '16px', margin: 0 }}>
              Help Center
            </h1>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>
              Find answers to your questions
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '18px',
              height: '18px',
              color: '#6b7280',
            }}
          />
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 42px',
              backgroundColor: '#1a1f26',
              border: '1px solid #374151',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* FAQ Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredCategories.map((category) => {
          const Icon = category.icon;
          const actualCategoryIndex = faqCategories.findIndex(c => c.title === category.title);
          const isExpanded = expandedCategory === category.title;

          return (
            <div
              key={category.title}
              style={{
                backgroundColor: '#1a1f26',
                border: isExpanded ? '1px solid rgba(6, 246, 255, 0.3)' : '1px solid #374151',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category.title)}
                style={{
                  width: '100%',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      border: '1px solid #4b5563',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'white', fontWeight: 500, fontSize: '14px' }}>
                        {category.title}
                      </span>
                      <span
                        style={{
                          padding: '2px 8px',
                          backgroundColor: 'rgba(6, 246, 255, 0.15)',
                          color: '#06f6ff',
                          fontSize: '10px',
                          borderRadius: '9999px',
                        }}
                      >
                        {category.questions.length}
                      </span>
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>
                      {category.description}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  style={{
                    width: '20px',
                    height: '20px',
                    color: '#6b7280',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>

              {/* Questions */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid #374151' }}>
                  {category.questions.map((faq, questionIndex) => {
                    const key = `${actualCategoryIndex}-${questionIndex}`;
                    const isItemExpanded = expandedItems[key];

                    return (
                      <div
                        key={faq.question}
                        style={{
                          borderBottom: questionIndex < category.questions.length - 1 ? '1px solid #374151' : 'none',
                        }}
                      >
                        <button
                          onClick={() => toggleItem(actualCategoryIndex, questionIndex)}
                          style={{
                            width: '100%',
                            padding: '14px 16px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: '12px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <span style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.5' }}>
                            {faq.question}
                          </span>
                          <ChevronDown
                            style={{
                              width: '16px',
                              height: '16px',
                              color: isItemExpanded ? '#06f6ff' : '#6b7280',
                              flexShrink: 0,
                              marginTop: '2px',
                              transform: isItemExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease',
                            }}
                          />
                        </button>

                        {isItemExpanded && (
                          <div
                            style={{
                              padding: '0 16px 14px 16px',
                            }}
                          >
                            <p
                              style={{
                                color: '#9ca3af',
                                fontSize: '13px',
                                lineHeight: '1.7',
                                margin: 0,
                              }}
                            >
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {searchQuery && filteredCategories.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 16px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#1a1f26',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Search style={{ width: '24px', height: '24px', color: '#4b5563' }} />
          </div>
          <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
            No results found
          </h3>
          <p style={{ color: '#6b7280', fontSize: '13px' }}>
            Try searching with different keywords
          </p>
        </div>
      )}

      {/* Contact Support */}
      <div
        style={{
          marginTop: '24px',
          padding: '20px',
          backgroundColor: '#1a1f26',
          border: '1px solid #374151',
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '1px solid #4b5563',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MessageCircle style={{ width: '20px', height: '20px', color: 'white' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ color: 'white', fontWeight: 500, fontSize: '14px' }}>
                Still need help?
              </span>
            </div>
            <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '16px' }}>
              Our support team is available 24/7 to assist you
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href="mailto:support@blockcast.africa"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  backgroundColor: '#06f6ff',
                  color: 'black',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '13px',
                  textDecoration: 'none',
                }}
              >
                <Mail style={{ width: '16px', height: '16px' }} />
                Email Support
              </a>
              <a
                href="https://discord.gg/blockcast"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid #4b5563',
                  color: 'white',
                  borderRadius: '10px',
                  fontWeight: 500,
                  fontSize: '13px',
                  textDecoration: 'none',
                }}
              >
                <ExternalLink style={{ width: '16px', height: '16px' }} />
                Join Discord
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div
        style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: '#1a1f26',
          border: '1px solid #374151',
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <Shield style={{ width: '16px', height: '16px', color: '#06f6ff', marginTop: '1px', flexShrink: 0 }} />
          <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0, lineHeight: '1.5' }}>
            BlockCast will never ask for your password or private keys. Report suspicious activity to our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
