import { Badge } from './ui/badge';
import {
  Shield,
  Database,
  Eye,
  Share2,
  Clock,
  Cookie,
  Lock,
  UserCheck,
  Globe,
  Baby,
  ExternalLink,
  RefreshCw,
  Mail,
  ChevronRight
} from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    {
      id: 1,
      icon: Shield,
      title: "Introduction",
      color: "from-cyan-500 to-blue-500",
      content: (
        <div className="space-y-4">
          <p>
            Welcome to Blockcast ("we," "our," or "us"). Blockcast is operated by <span className="text-primary font-medium">xxx</span>, a company registered in <span className="text-primary font-medium">xxx</span> with registration number <span className="text-primary font-medium">xxx</span>, and having its registered office at <span className="text-primary font-medium">xxx</span>.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our decentralized prediction market platform and related services (collectively, the "Platform").
          </p>
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary">
            <p className="text-sm">
              By accessing or using the Platform, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      icon: Database,
      title: "Information We Collect",
      color: "from-purple-500 to-pink-500",
      content: (
        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-colors">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                Information You Provide
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Wallet Information:</strong> Your public wallet address when connecting</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Account Information:</strong> Username, email (optional), and preferences</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Transaction Data:</strong> Predictions, trades, and platform activities</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>KYC Information:</strong> Identity documents including <span className="text-primary">xxx</span> (if applicable)</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-colors">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                Automatic Collection
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Device Info:</strong> Browser type, OS, device identifiers</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Usage Data:</strong> Pages visited, interactions, time spent</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Log Data:</strong> IP address, access times, error logs</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-sm flex items-start gap-2">
                <span className="text-yellow-500 font-bold">Note:</span>
                Blockchain transactions are publicly visible. Your wallet address and transaction history on the blockchain are public information.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      icon: Eye,
      title: "How We Use Your Information",
      color: "from-green-500 to-emerald-500",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: "Platform Operation", desc: "Provide and improve services" },
            { label: "Transaction Processing", desc: "Facilitate predictions and payouts" },
            { label: "Security", desc: "Detect and prevent fraud" },
            { label: "Communication", desc: "Service updates and alerts" },
            { label: "Analytics", desc: "Understand user behavior" },
            { label: "Legal Compliance", desc: "Meet regulatory requirements" },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-lg bg-card/50 border border-border/50 hover:bg-primary/5 transition-colors">
              <p className="font-medium text-foreground text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 4,
      icon: Share2,
      title: "Information Sharing",
      color: "from-orange-500 to-red-500",
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 mb-4">
            <p className="text-sm font-medium text-green-400">We do NOT sell your personal information.</p>
          </div>

          <div className="space-y-3">
            {[
              { title: "Service Providers", desc: "Third-party providers for hosting, analytics, and support (under strict agreements)" },
              { title: "Legal Requirements", desc: "When required by law, regulation, or to protect rights and safety" },
              { title: "Business Transfers", desc: "In case of merger, acquisition, or asset sale (with notification)" },
              { title: "With Consent", desc: "For other purposes only with your explicit permission" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-card/50 transition-colors">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 5,
      icon: Clock,
      title: "Data Retention",
      color: "from-blue-500 to-indigo-500",
      content: (
        <div className="space-y-4">
          <p className="text-sm">We retain your information only as long as necessary:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { type: "Account Data", period: "While account is active" },
              { type: "Transaction Records", period: "xxx years" },
              { type: "Communication Records", period: "xxx years" },
              { type: "Marketing Preferences", period: "Until consent withdrawn" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50">
                <span className="text-sm font-medium">{item.type}</span>
                <Badge variant="outline" className="text-primary border-primary/30">{item.period}</Badge>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 6,
      icon: Cookie,
      title: "Cookies & Tracking",
      color: "from-amber-500 to-orange-500",
      content: (
        <div className="space-y-4">
          <div className="grid gap-3">
            {[
              { type: "Essential", desc: "Required for platform functionality", required: true },
              { type: "Analytics", desc: "Help us understand usage patterns", required: false },
              { type: "Preferences", desc: "Remember your settings", required: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50">
                <div>
                  <p className="font-medium text-sm">{item.type}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Badge className={item.required ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}>
                  {item.required ? "Required" : "Optional"}
                </Badge>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Manage preferences through your browser settings. Disabling certain cookies may affect functionality.
          </p>
        </div>
      )
    },
    {
      id: 7,
      icon: Lock,
      title: "Data Security",
      color: "from-emerald-500 to-teal-500",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              "End-to-end encryption",
              "Regular security audits",
              "Access controls",
              "Employee training",
              "Incident response",
              "Penetration testing",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Lock className="h-3 w-3 text-emerald-500" />
                <span className="text-xs">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/30">
            While we implement strong security measures, no method is 100% secure. We cannot guarantee absolute security.
          </p>
        </div>
      )
    },
    {
      id: 8,
      icon: UserCheck,
      title: "Your Rights",
      color: "from-violet-500 to-purple-500",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { right: "Access", desc: "Get a copy of your data" },
              { right: "Rectification", desc: "Correct inaccurate info" },
              { right: "Erasure", desc: "Request deletion" },
              { right: "Restriction", desc: "Limit processing" },
              { right: "Portability", desc: "Export your data" },
              { right: "Objection", desc: "Opt out of processing" },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-card/50 border border-border/50 hover:border-violet-500/30 transition-colors text-center">
                <p className="font-semibold text-sm text-violet-400">{item.right}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
            <p className="text-sm">
              To exercise your rights, contact us at <span className="text-primary font-medium">xxx</span>.
              We'll respond within <span className="text-primary font-medium">xxx</span> days.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 9,
      icon: Globe,
      title: "International Transfers",
      color: "from-sky-500 to-blue-500",
      content: (
        <div className="space-y-4">
          <p className="text-sm">
            Your information may be transferred internationally. We implement safeguards including:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Standard Contractual Clauses",
              "Adequacy decisions",
              "Approved transfer mechanisms",
            ].map((item, i) => (
              <Badge key={i} variant="outline" className="border-sky-500/30 text-sky-400">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 10,
      icon: Baby,
      title: "Children's Privacy",
      color: "from-pink-500 to-rose-500",
      content: (
        <div className="p-4 rounded-xl bg-card/50 border border-border/50">
          <p className="text-sm">
            The Platform is not intended for individuals under <span className="text-primary font-medium">xxx</span> years old.
            We do not knowingly collect data from children. If you believe a child has provided us information,
            contact us at <span className="text-primary font-medium">xxx</span>.
          </p>
        </div>
      )
    },
    {
      id: 11,
      icon: ExternalLink,
      title: "Third-Party Links",
      color: "from-slate-500 to-gray-500",
      content: (
        <p className="text-sm p-4 rounded-xl bg-card/50 border border-border/50">
          The Platform may contain links to third-party services. We are not responsible for their privacy practices.
          Review their policies before sharing information.
        </p>
      )
    },
    {
      id: 12,
      icon: RefreshCw,
      title: "Policy Updates",
      color: "from-teal-500 to-cyan-500",
      content: (
        <div className="space-y-3">
          <p className="text-sm">We'll notify you of material changes via:</p>
          <div className="flex flex-wrap gap-2">
            {["Platform notice", "Email notification", "Updated date badge"].map((item, i) => (
              <Badge key={i} variant="outline" className="border-teal-500/30 text-teal-400">
                {item}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Continued use after changes indicates acceptance.
          </p>
        </div>
      )
    },
    {
      id: 13,
      icon: Mail,
      title: "Contact Us",
      color: "from-indigo-500 to-violet-500",
      content: (
        <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Company</p>
              <p className="font-medium text-primary">xxx</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Data Protection Officer</p>
              <p className="font-medium text-primary">xxx</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Email</p>
              <p className="font-medium text-primary">xxx</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Address</p>
              <p className="font-medium text-primary">xxx</p>
            </div>
          </div>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your privacy matters. Here's how we collect, use, and protect your information.
        </p>
        <Badge className="bg-primary/20 text-primary border-primary/30">
          Last Updated: xxx
        </Badge>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.id}
              className="group rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden hover:border-primary/30 transition-all duration-300"
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {section.id}. {section.title}
                  </h2>
                </div>
                <div className="text-muted-foreground">
                  {section.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center py-8 space-y-4">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent"></div>
        <p className="text-sm text-muted-foreground">
          By using Blockcast, you acknowledge that you have read and understood this Privacy Policy.
        </p>
        <Badge variant="outline" className="text-muted-foreground">
          Version xxx | Effective: xxx
        </Badge>
      </div>
    </div>
  );
}
