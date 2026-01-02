import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  CheckCircle,
  FileText,
  Users,
  Wallet,
  BarChart3,
  Shield,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  adminProfile: {
    walletAddress: string;
    role: 'admin' | 'super_admin';
    displayName?: string;
  };
  pendingCounts?: {
    markets: number;
    resolutions: number;
    reports: number;
  };
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'pending', label: 'Pending Markets', icon: Clock, countKey: 'markets' },
  { id: 'resolved', label: 'Resolved', icon: CheckCircle },
  { id: 'evidence', label: 'Evidence', icon: FileText },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'treasury', label: 'Treasury', icon: Wallet },
  { id: 'reports', label: 'Reports', icon: BarChart3, countKey: 'reports' },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  adminProfile,
  pendingCounts = { markets: 0, resolutions: 0, reports: 0 }
}) => {
  const navigate = useNavigate();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  const handleExitAdmin = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    setShowExitDialog(false);
    navigate('/');
    toast.success('Exited admin panel');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar - Always visible */}
      <aside
        className="hidden lg:flex flex-col w-64 border-r border-border fixed h-full z-40"
        style={{ backgroundColor: '#0a0a0b' }}
      >
        {/* Admin Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#06f6ff] to-[#0ea5e9] flex items-center justify-center">
              <Shield className="h-5 w-5 text-black" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">Admin Dashboard</p>
              <p className="text-xs text-muted-foreground truncate">{formatAddress(adminProfile.walletAddress)}</p>
            </div>
          </div>
          <Badge
            className={`mt-2 ${adminProfile.role === 'super_admin' ? 'bg-purple-600' : 'bg-[#06f6ff] text-black'}`}
          >
            {adminProfile.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </Badge>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const count = item.countKey ? pendingCounts[item.countKey as keyof typeof pendingCounts] : 0;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#06f6ff]/10 text-[#06f6ff] border border-[#06f6ff]/30'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {count > 0 && (
                  <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] flex items-center justify-center">
                    {count}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Exit Button */}
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleExitAdmin}
          >
            <LogOut className="h-4 w-4" />
            Exit Admin Panel
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b border-border"
        style={{ backgroundColor: '#0a0a0b' }}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#06f6ff] to-[#0ea5e9] flex items-center justify-center">
              <Shield className="h-4 w-4 text-black" />
            </div>
            <span className="font-semibold">Admin</span>
            <Badge
              className={`text-xs ${adminProfile.role === 'super_admin' ? 'bg-purple-600' : 'bg-[#06f6ff] text-black'}`}
            >
              {adminProfile.role === 'super_admin' ? 'Super' : 'Admin'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {(pendingCounts.markets + pendingCounts.reports) > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {pendingCounts.markets + pendingCounts.reports}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

      </div>

      {/* Mobile Navigation - Full Screen Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* Backdrop - click to close */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: '#0a0a0b' }}
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Navigation Content */}
          <div className="relative pt-20 px-4 h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const count = item.countKey ? pendingCounts[item.countKey as keyof typeof pendingCounts] : 0;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-lg text-base font-medium transition-all ${
                      isActive
                        ? 'bg-[#06f6ff]/10 text-[#06f6ff] border border-[#06f6ff]/30'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {count > 0 && (
                      <Badge className="bg-red-500 text-white text-xs px-2">
                        {count}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
            <hr className="my-4 border-border" />
            <button
              onClick={handleExitAdmin}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-lg text-base font-medium text-muted-foreground hover:bg-muted"
            >
              <LogOut className="h-5 w-5" />
              Exit Admin Panel
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Status Bar Header */}
        <header
          className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-border"
          style={{ backgroundColor: '#0a0a0b' }}
        >
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">
              {navItems.find(item => item.id === activeTab)?.label || 'Overview'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Last login: Just now</span>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {(pendingCounts.markets + pendingCounts.reports) > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {pendingCounts.markets + pendingCounts.reports}
                </span>
              )}
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 lg:p-6 mt-16 lg:mt-0">
          {children}
        </div>
      </main>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit Admin Panel?</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave the admin dashboard? You'll be returned to the main application.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmExit}>
              Exit Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLayout;
