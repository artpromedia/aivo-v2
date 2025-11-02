import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { SignJWT, jwtVerify } from 'jose';

import type { 
  AuthConfig, 
  AuthService, 
  AuthResult, 
  LoginCredentials, 
  RegisterData,
  SessionVerification,
  TokenPayload,
  MFASetup,
  PasswordResetData,
  AgeVerification,
  User,
  UserSession,
  Permission,
  ConsentRecord,
  UserRole
} from './types';
import type { Status } from '@aivo/types';

export class SupabaseAuthService implements AuthService {
  private supabase: SupabaseClient;
  private config: AuthConfig;
  private jwtSecret: Uint8Array;

  constructor(config: AuthConfig) {
    this.config = config;
    this.supabase = createClient(config.supabase.url, config.supabase.anonKey);
    // Use buffer for Node.js compatibility
    this.jwtSecret = Buffer.from(config.jwt.secret, 'utf-8');
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      // Rate limiting check
      if (this.config.rateLimit.enabled) {
        // Implementation would check rate limit here
      }

      // Authenticate with Supabase
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email!,
        password: credentials.password,
      });

      if (error) {
        await this.logAuthEvent({
          event: 'failed_login',
          success: false,
          tenantId: credentials.tenantId,
          metadata: { error: error.message }
        });
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Authentication failed' };
      }

      // Get user profile and verify tenant access
      const user = await this.getUserProfile(data.user.id, credentials.tenantId);
      if (!user) {
        return { success: false, error: 'User not found or access denied' };
      }

      // Check if MFA is required
      if (this.requiresMFA(user) && !credentials.mfaCode) {
        return { 
          success: false, 
          requiresMFA: true, 
          error: 'MFA code required' 
        };
      }

      // Verify MFA if provided
      if (credentials.mfaCode && !await this.verifyMFA(user.id, credentials.mfaCode)) {
        return { success: false, error: 'Invalid MFA code' };
      }

      // Create session
      const session = await this.createSession(user);
      const tokens = await this.generateTokens(user, session.sessionId);

      await this.logAuthEvent({
        event: 'login',
        success: true,
        userId: user.id,
        tenantId: credentials.tenantId
      });

      return {
        success: true,
        user,
        session,
        tokens
      };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  }

  async register(data: RegisterData): Promise<AuthResult> {
    try {
      // Age verification for COPPA compliance
      if (data.dateOfBirth) {
        const ageVerification = await this.verifyAge(data.dateOfBirth);
        if (ageVerification.requiresParentConsent && !data.parentEmail) {
          return {
            success: false,
            requiresParentConsent: true,
            error: 'Parent consent required for users under 13'
          };
        }
      }

      // Create account in Supabase
      const { data: authData, error } = await this.supabase.auth.signUp({
        email: data.email!,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            role: data.role,
            tenant_id: data.tenantId
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Registration failed' };
      }

      // Create user profile in our database
      const user = await this.createUserProfile({
        id: authData.user.id,
        email: data.email,
        phoneNumber: data.phoneNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        status: 'active' as Status,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Additional fields would be populated based on role
      } as Partial<User>);

      // Handle parent consent for minors
      if (data.parentEmail && data.dateOfBirth) {
        await this.requestParentConsent(data);
      }

      return {
        success: true,
        user
      };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  }

  async logout(sessionId: string): Promise<void> {
    try {
      await this.invalidateSession(sessionId);
      await this.supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error || !data.user) {
        return { success: false, error: 'Token refresh failed' };
      }

      const user = await this.getUserProfile(data.user.id);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const session = await this.updateSessionActivity(refreshToken);
      const tokens = await this.generateTokens(user, session.sessionId);

      return {
        success: true,
        user,
        session,
        tokens
      };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Token refresh failed' 
      };
    }
  }

  async verifySession(token: string): Promise<SessionVerification> {
    try {
      const { payload } = await jwtVerify(token, this.jwtSecret);
      const tokenPayload = payload as unknown as TokenPayload;

      const user = await this.getUserProfile(tokenPayload.userId, tokenPayload.tenantId);
      const session = await this.getSession(tokenPayload.sessionId);

      if (!user || !session || !session.isActive) {
        return { valid: false, error: 'Invalid session' };
      }

      // Get permissions for the user (using tenantId from tokenPayload since not all User types have it)
      const permissions = await this.getUserPermissions(user.id, tokenPayload.tenantId);

      return {
        valid: true,
        user,
        session,
        permissions
      };

    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Session verification failed' 
      };
    }
  }

  async setupMFA(userId: string): Promise<MFASetup> {
    // Implementation would integrate with TOTP library
    const secret = this.generateTOTPSecret();
    const qrCode = await this.generateQRCode(userId, secret);
    const backupCodes = this.generateNewBackupCodes();

    // Store MFA secret (encrypted)
    await this.storeMFASecret(userId, secret);
    await this.storeBackupCodes(userId, backupCodes);

    return { secret, qrCode, backupCodes };
  }

  async verifyMFA(_userId: string, _code: string): Promise<boolean> {
    // Implementation would verify TOTP code or backup code
    return true; // Placeholder
  }

  async verifyAge(dateOfBirth: string): Promise<AgeVerification> {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    const isMinor = age < 13;
    const requiresParentConsent = this.config.coppa.enabled && isMinor;

    return {
      isMinor,
      age,
      requiresParentConsent,
      canCreateAccount: !requiresParentConsent || this.config.coppa.parentConsentRequired
    };
  }

  async requestParentConsent(_childData: RegisterData): Promise<boolean> {
    // Implementation would send parent consent email
    return true; // Placeholder
  }

  async verifyParentConsent(_token: string): Promise<boolean> {
    // Implementation would verify parent consent token
    return true; // Placeholder
  }

  // Helper methods (implementations would be completed)
  private async getUserProfile(_userId: string, _tenantId?: string): Promise<User | null> {
    // Database query to get user profile
    return null; // Placeholder
  }

  private async createUserProfile(userData: Partial<User>): Promise<User> {
    // Database query to create user profile
    return userData as User; // Placeholder
  }

  private async createSession(_user: User): Promise<UserSession> {
    // Database query to create session
    return { 
      sessionId: 'session-id', 
      userId: 'user-id',
      role: 'learner' as UserRole,
      permissions: [],
      tenantId: 'tenant-id',
      lastActivityAt: new Date(),
      expiresAt: new Date()
    }; // Placeholder
  }

  private async generateTokens(user: User, sessionId: string): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
    // For stub implementation, use session.tenantId since not all User types have tenantId
    const tenantId = 'tenantId' in user ? (user as { tenantId: string }).tenantId : 'default-tenant';
    
    const payload: TokenPayload = {
      userId: user.id,
      tenantId,
      role: user.role,
      permissions: await this.getUserPermissions(user.id, tenantId),
      sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
    };

    const accessToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .sign(this.jwtSecret);

    return {
      accessToken,
      refreshToken: 'refresh-token', // Would generate actual refresh token
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    };
  }

  async getUserPermissions(_userId: string, _tenantId: string): Promise<Permission[]> {
    // Database query to get user permissions
    return []; // Placeholder
  }

  async hasPermission(userId: string, permission: Permission, tenantId: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId, tenantId);
    return permissions.includes(permission);
  }

  checkRoleAccess(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(userRole);
  }

  // Placeholder implementations for other required methods
  async changePassword(_userId: string, _oldPassword: string, _newPassword: string): Promise<boolean> {
    return true;
  }

  async requestPasswordReset(_data: Omit<PasswordResetData, 'resetToken' | 'newPassword'>): Promise<boolean> {
    return true;
  }

  async resetPassword(_data: PasswordResetData): Promise<boolean> {
    return true;
  }

  async invalidateSession(_sessionId: string): Promise<void> {
    // Implementation
  }

  async invalidateAllSessions(_userId: string): Promise<void> {
    // Implementation
  }

  async disableMFA(_userId: string, _password: string): Promise<boolean> {
    return true;
  }

  async generateBackupCodes(userId: string): Promise<string[]> {
    const codes = this.generateNewBackupCodes();
    await this.storeBackupCodes(userId, codes);
    return codes;
  }

  async sendVerificationEmail(_email: string, _tenantId: string): Promise<boolean> {
    return true;
  }

  async verifyEmail(_token: string): Promise<boolean> {
    return true;
  }

  async sendVerificationSMS(_phoneNumber: string, _tenantId: string): Promise<boolean> {
    return true;
  }

  async verifyPhoneNumber(_phoneNumber: string, _code: string): Promise<boolean> {
    return true;
  }

  async recordConsent(_userId: string, consent: Omit<ConsentRecord, 'id' | 'userId'>): Promise<ConsentRecord> {
    return consent as ConsentRecord;
  }

  // Private helper methods
  private requiresMFA(_user: User): boolean {
    // Check if user role requires MFA
    return false; // Placeholder
  }

  private async getSession(_sessionId: string): Promise<UserSession & { isActive: boolean } | null> {
    return { 
      userId: 'user-id',
      sessionId: 'session-id', 
      role: 'learner' as UserRole,
      permissions: [],
      tenantId: 'tenant-id',
      lastActivityAt: new Date(),
      expiresAt: new Date(),
      isActive: true 
    }; // Placeholder
  }

  private async updateSessionActivity(_refreshToken: string): Promise<UserSession> {
    return { 
      userId: 'user-id',
      sessionId: 'session-id',
      role: 'learner' as UserRole,
      permissions: [],
      tenantId: 'tenant-id',
      lastActivityAt: new Date(),
      expiresAt: new Date()
    }; // Placeholder
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async logAuthEvent(_event: any): Promise<void> {
    // Log authentication event
  }

  private generateTOTPSecret(): string {
    return 'TOTP_SECRET'; // Placeholder
  }

  private async generateQRCode(_userId: string, _secret: string): Promise<string> {
    return 'QR_CODE_DATA_URL'; // Placeholder
  }

  private generateNewBackupCodes(): string[] {
    return ['CODE1', 'CODE2', 'CODE3']; // Placeholder
  }

  private async storeMFASecret(_userId: string, _secret: string): Promise<void> {
    // Store encrypted MFA secret
  }

  private async storeBackupCodes(_userId: string, _codes: string[]): Promise<void> {
    // Store encrypted backup codes
  }
}