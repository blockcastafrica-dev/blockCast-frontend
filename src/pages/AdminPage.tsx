import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, AlertCircle, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminOverview from '@/components/admin/AdminOverview';
import MarketsDashboard from '@/components/admin/MarketsDashboard';
import EvidenceDashboard from '@/components/admin/EvidenceDashboard';
import UsersDashboard from '@/components/admin/UsersDashboard';
import TreasuryDashboard from '@/components/admin/TreasuryDashboard';
import ReportsDashboard from '@/components/admin/ReportsDashboard';
import { toast } from 'sonner';

// Admin wallet addresses - in production, this would be fetched from a secure source
const ADMIN_WALLETS = [
  '0x7f3a9b2cd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', // Super Admin
  '0x8a4b6c3de7f89012345678901234567890abcdef', // Admin
  '0xdef012345678901234567890123456789012345'  // Admin
];

const SUPER_ADMIN_WALLETS = [
  '0x7f3a9b2cd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9'
];

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminProfile, setAdminProfile] = useState<{
    walletAddress: string;
    role: 'admin' | 'super_admin';
    displayName?: string;
  } | null>(null);

  // Mock pending counts - would be fetched from API
  const [pendingCounts, setPendingCounts] = useState({
    markets: 12,
    resolutions: 3,
    reports: 2
  });

  useEffect(() => {
    verifyAdminAccess();
  }, []);

  const verifyAdminAccess = async () => {
    setIsVerifying(true);

    // Simulate wallet connection check
    // In production, this would check the actual connected wallet
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo purposes, auto-authorize with mock wallet
    // In production, this would check window.ethereum or wallet adapter
    const mockConnectedWallet = localStorage.getItem('blockcast_demo_admin_wallet');

    if (mockConnectedWallet) {
      const isAdmin = ADMIN_WALLETS.includes(mockConnectedWallet.toLowerCase());
      const isSuperAdmin = SUPER_ADMIN_WALLETS.includes(mockConnectedWallet.toLowerCase());

      if (isAdmin || isSuperAdmin) {
        setIsAuthorized(true);
        setAdminProfile({
          walletAddress: mockConnectedWallet,
          role: isSuperAdmin ? 'super_admin' : 'admin',
          displayName: isSuperAdmin ? 'Super Admin' : 'Admin'
        });
        toast.success(`Welcome, ${isSuperAdmin ? 'Super Admin' : 'Admin'}!`);
      } else {
        setIsAuthorized(false);
        toast.error('Access denied: Admin privileges required');
      }
    } else {
      // For demo, set a default admin wallet
      const demoWallet = ADMIN_WALLETS[0];
      localStorage.setItem('blockcast_demo_admin_wallet', demoWallet);
      setIsAuthorized(true);
      setAdminProfile({
        walletAddress: demoWallet,
        role: 'super_admin',
        displayName: 'Super Admin'
      });
      toast.success('Welcome, Super Admin! (Demo Mode)');
    }

    setIsVerifying(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Loading state while verifying admin access
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-12 w-12 text-[#06f6ff] mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Verifying Access</h2>
            <p className="text-muted-foreground">
              Checking admin privileges...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not authorized
  if (!isAuthorized || !adminProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              Your wallet address is not authorized to access the admin panel.
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
              >
                Return to Home
              </Button>
              <Button
                onClick={verifyAdminAccess}
                className="w-full bg-[#06f6ff] text-black hover:bg-[#06f6ff]/90"
              >
                Retry Verification
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the appropriate content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview onNavigate={handleTabChange} />;
      case 'markets':
        return <MarketsDashboard />;
      case 'evidence':
        return <EvidenceDashboard />;
      case 'users':
        return <UsersDashboard />;
      case 'treasury':
        return <TreasuryDashboard />;
      case 'reports':
        return <ReportsDashboard />;
      default:
        return <AdminOverview onNavigate={handleTabChange} />;
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      adminProfile={adminProfile}
      pendingCounts={pendingCounts}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminPage;
