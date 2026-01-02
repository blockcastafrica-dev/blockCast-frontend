// Admin Service - Manages admin wallet whitelist and permissions

// Whitelisted admin wallets (lowercase for comparison)
const ADMIN_WALLETS: { [address: string]: 'super_admin' | 'admin' } = {
  '0x17b40492e3d7a2a2ba2fe0c09322cf9e5563cb0b': 'super_admin', // Main admin wallet
};

export type AdminRole = 'super_admin' | 'admin' | 'user';

export const adminService = {
  /**
   * Check if a wallet address is an admin
   */
  isAdmin(address: string | null | undefined): boolean {
    if (!address) return false;
    const normalizedAddress = address.toLowerCase();
    return normalizedAddress in ADMIN_WALLETS;
  },

  /**
   * Check if a wallet address is a super admin
   */
  isSuperAdmin(address: string | null | undefined): boolean {
    if (!address) return false;
    const normalizedAddress = address.toLowerCase();
    return ADMIN_WALLETS[normalizedAddress] === 'super_admin';
  },

  /**
   * Get the admin role for a wallet address
   */
  getAdminRole(address: string | null | undefined): AdminRole {
    if (!address) return 'user';
    const normalizedAddress = address.toLowerCase();
    return ADMIN_WALLETS[normalizedAddress] || 'user';
  },

  /**
   * Get display name for admin role
   */
  getRoleDisplayName(role: AdminRole): string {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      default:
        return 'User';
    }
  },

  /**
   * Get all admin wallet addresses
   */
  getAdminWallets(): string[] {
    return Object.keys(ADMIN_WALLETS);
  }
};

export default adminService;
