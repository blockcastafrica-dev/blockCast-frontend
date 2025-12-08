import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, User, Bell, Shield, Globe, Palette, Database, Smartphone, Languages, Moon, Sun, Volume2, VolumeX, Wallet, History } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import LocalCurrencyWallet from '@/components/LocalCurrencyWallet';
import WithdrawWallet from '@/components/WithdrawWallet';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showFundWallet, setShowFundWallet] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [notifications, setNotifications] = useState({
    truthMarkets: true,
    communityUpdates: true,
    governance: false,
    marketing: false,
    soundEnabled: true
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    historyVisible: false,
    activityVisible: true
  });

  const languageOptions = [
    { code: 'en', name: 'English', flag: '🇬🇧', native: 'English' },
    { code: 'fr', name: 'French', flag: '🇫🇷', native: 'Français' },
    { code: 'sw', name: 'Swahili', flag: '🇰🇪', native: 'Kiswahili' },
  ];

  const handleLanguageChange = (newLanguage: string) => {
    toast.success(`Language changed to ${languageOptions.find(l => l.code === newLanguage)?.native}`);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast.success(value ? 'Notification enabled' : 'Notification disabled');
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    toast.success('Privacy setting updated');
  };

  const handleExportData = () => {
    toast.success('Data export started! You will receive an email when ready.');
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion requires email confirmation. Check your inbox.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-1 flex items-center gap-2">
            <SettingsIcon className="h-7 w-7" />
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your account, preferences, and privacy settings
          </p>
        </div>
      </div>

      {/* Settings Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="gap-2">
            <Wallet className="h-4 w-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Palette className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Manage your public profile and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Recommended: Square image, at least 400x400px
                  </p>
                </div>
              </div>

              <Separator />

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue="TruthSeeker_001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="john.doe@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select defaultValue="nigeria">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nigeria">🇳🇬 Nigeria</SelectItem>
                      <SelectItem value="kenya">🇰🇪 Kenya</SelectItem>
                      <SelectItem value="south-africa">🇿🇦 South Africa</SelectItem>
                      <SelectItem value="ghana">🇬🇭 Ghana</SelectItem>
                      <SelectItem value="senegal">🇸🇳 Senegal</SelectItem>
                      <SelectItem value="cote-divoire">🇨🇮 Côte d'Ivoire</SelectItem>
                      <SelectItem value="morocco">🇲🇦 Morocco</SelectItem>
                      <SelectItem value="egypt">🇪🇬 Egypt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="africa/lagos">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="africa/lagos">Africa/Lagos (WAT)</SelectItem>
                      <SelectItem value="africa/nairobi">Africa/Nairobi (EAT)</SelectItem>
                      <SelectItem value="africa/johannesburg">Africa/Johannesburg (SAST)</SelectItem>
                      <SelectItem value="africa/cairo">Africa/Cairo (EET)</SelectItem>
                      <SelectItem value="africa/casablanca">Africa/Casablanca (WET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  className="w-full min-h-[100px] px-3 py-2 bg-input border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Tell the community about yourself and your truth verification interests..."
                  defaultValue="Passionate about fighting misinformation across Africa. Specialized in economic and political fact-checking."
                />
              </div>

              {/* Verification Status */}
              <div className="p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">Verification Status</h4>
                    <p className="text-sm text-muted-foreground">Complete verification to increase trust</p>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                    Partial
                  </Badge>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Verified</span>
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                      Verified
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Phone Verified</span>
                    <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                      Pending
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Identity Verified</span>
                    <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
                      Not Verified
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  Complete Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Portfolio Settings</CardTitle>
              <CardDescription>
                Customize how your betting portfolio is displayed and managed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Public Portfolio</h4>
                  <p className="text-sm text-muted-foreground">
                    Allow other users to view your betting history and performance
                  </p>
                </div>
                <Switch
                  checked={privacy.historyVisible}
                  onCheckedChange={(checked) => handlePrivacyChange('historyVisible', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Performance Statistics</h4>
                  <p className="text-sm text-muted-foreground">
                    Show your accuracy statistics on your profile
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Achievement Badges</h4>
                  <p className="text-sm text-muted-foreground">
                    Display earned badges on your profile
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Portfolio Privacy</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-border/50 bg-card/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <span className="font-medium">Public</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Anyone can view your portfolio and performance
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 bg-card/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-secondary" />
                        <span className="font-medium">Community</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Only verified community members can view
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 bg-card/80 border-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="font-medium">Private</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Only you can view your portfolio
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>History & Activity</CardTitle>
              <CardDescription>
                Manage your verification and betting history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Save Verification History</h4>
                  <p className="text-sm text-muted-foreground">
                    Keep a record of all claims you've verified
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Save Betting History</h4>
                  <p className="text-sm text-muted-foreground">
                    Keep a record of all your truth market positions
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Activity Feed</h4>
                  <p className="text-sm text-muted-foreground">
                    Show your activity in the community feed
                  </p>
                </div>
                <Switch
                  checked={privacy.activityVisible}
                  onCheckedChange={(checked) => handlePrivacyChange('activityVisible', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Auto-Cleanup</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button variant="outline">30 Days</Button>
                  <Button variant="outline">90 Days</Button>
                  <Button variant="default">1 Year</Button>
                  <Button variant="outline">Forever</Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatically delete history older than selected period
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your Blockcast experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Dark Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    Enable dark theme for better viewing
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Language</h4>
                <Select onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                          <span className="text-muted-foreground">({lang.native})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Sound Effects</h4>
                  <p className="text-sm text-muted-foreground">
                    Play sounds for notifications and actions
                  </p>
                </div>
                <Switch
                  checked={notifications.soundEnabled}
                  onCheckedChange={(checked) => handleNotificationChange('soundEnabled', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Currency Display</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline">ETH</Button>
                  <Button variant="default">USD</Button>
                  <Button variant="outline">Local</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Market View</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="default">List View</Button>
                  <Button variant="outline">Grid View</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Choose which notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Truth Markets</h4>
                  <p className="text-sm text-muted-foreground">
                    Updates on markets you're participating in
                  </p>
                </div>
                <Switch
                  checked={notifications.truthMarkets}
                  onCheckedChange={(checked) => handleNotificationChange('truthMarkets', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Community Updates</h4>
                  <p className="text-sm text-muted-foreground">
                    New discussions and community activities
                  </p>
                </div>
                <Switch
                  checked={notifications.communityUpdates}
                  onCheckedChange={(checked) => handleNotificationChange('communityUpdates', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Governance</h4>
                  <p className="text-sm text-muted-foreground">
                    Voting and proposal notifications
                  </p>
                </div>
                <Switch
                  checked={notifications.governance}
                  onCheckedChange={(checked) => handleNotificationChange('governance', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Marketing & Promotions</h4>
                  <p className="text-sm text-muted-foreground">
                    Special offers and platform updates
                  </p>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Notification Methods</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="default" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Email
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Browser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Privacy Controls</CardTitle>
              <CardDescription>
                Manage your privacy and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Public Profile</h4>
                  <p className="text-sm text-muted-foreground">
                    Allow others to find and view your profile
                  </p>
                </div>
                <Switch
                  checked={privacy.profileVisible}
                  onCheckedChange={(checked) => handlePrivacyChange('profileVisible', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Activity Visibility</h4>
                  <p className="text-sm text-muted-foreground">
                    Show your verification and betting activity
                  </p>
                </div>
                <Switch
                  checked={privacy.activityVisible}
                  onCheckedChange={(checked) => handlePrivacyChange('activityVisible', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">History Visibility</h4>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your verification history
                  </p>
                </div>
                <Switch
                  checked={privacy.historyVisible}
                  onCheckedChange={(checked) => handlePrivacyChange('historyVisible', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Data Sharing</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <div className="font-medium">Research Partners</div>
                      <div className="text-sm text-muted-foreground">
                        Share anonymized data for academic research
                      </div>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <div className="font-medium">Analytics Providers</div>
                      <div className="text-sm text-muted-foreground">
                        Share usage data to improve our services
                      </div>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <div className="font-medium">Third-Party Integrations</div>
                      <div className="text-sm text-muted-foreground">
                        Allow data sharing with trusted partners
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export or delete your personal data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Export Your Data</h4>
                <p className="text-sm text-muted-foreground">
                  Download a copy of your personal data, verification history, and betting records
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleExportData} className="flex-1">
                    <Database className="h-4 w-4 mr-2" />
                    Export All Data
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <History className="h-4 w-4 mr-2" />
                    Export History Only
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Data Usage</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-2xl font-bold text-foreground">24.5 MB</div>
                    <div className="text-sm text-muted-foreground">Storage Used</div>
                  </div>
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-2xl font-bold text-foreground">1,247</div>
                    <div className="text-sm text-muted-foreground">Verifications</div>
                  </div>
                  <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="text-2xl font-bold text-foreground">89</div>
                    <div className="text-sm text-muted-foreground">Bets Placed</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-destructive" />
                  <h4 className="font-medium text-destructive">Danger Zone</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  className="w-full md:w-auto"
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Fund Wallet Modal */}
      {showFundWallet && (
        <LocalCurrencyWallet
          visible={showFundWallet}
          onClose={() => setShowFundWallet(false)}
        />
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <WithdrawWallet
          visible={showWithdraw}
          onClose={() => setShowWithdraw(false)}
        />
      )}
    </div>
  );
}