import type {
  User,
  UserRole,
  Permission,
  UserSession,
  ConsentRecord
} from '@aivo/types';

import type {
  AuthConfig,
  AuthResult,
  SessionVerification,
  MFASetupResult,
  MFAVerificationResult,
  PasswordResetResult,
  ParentConsentResult,
  AgeVerificationResult,
  SecurityAuditLog,
  RateLimit,
  SecurityPolicy
} from './types';

// Core authentication service interface
export interface AuthService {
  // Basic authentication
  signUp(email: string, password: string, userData: Partial<User>): Promise<AuthResult>;
  signIn(email: string, password: string): Promise<AuthResult>;
  signOut(sessionId?: string): Promise<{ success: boolean; error?: string }>;
  
  // Session management
  verifySession(token: string): Promise<SessionVerification>;
  refreshToken(refreshToken: string): Promise<AuthResult>;
  revokeSession(sessionId: string): Promise<{ success: boolean }>;
  getAllSessions(userId: string): Promise<UserSession[]>;
  
  // User management
  getUser(userId: string): Promise<User | null>;
  updateUser(userId: string, updates: Partial<User>): Promise<User>;
  deleteUser(userId: string): Promise<{ success: boolean }>;
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }>;
  
  // Multi-factor authentication
  setupMFA(userId: string, method: 'totp' | 'sms' | 'email'): Promise<MFASetupResult>;
  verifyMFA(userId: string, token: string, method: 'totp' | 'sms' | 'email'): Promise<MFAVerificationResult>;
  disableMFA(userId: string, password: string): Promise<{ success: boolean; error?: string }>;
  generateBackupCodes(userId: string): Promise<string[]>;
  verifyBackupCode(userId: string, code: string): Promise<boolean>;
  
  // Password reset
  requestPasswordReset(email: string): Promise<PasswordResetResult>;
  resetPassword(token: string, newPassword: string): Promise<PasswordResetResult>;
  
  // COPPA compliance
  verifyAge(dateOfBirth: string): Promise<AgeVerificationResult>;
  requestParentConsent(userId: string, parentEmail: string): Promise<ParentConsentResult>;
  verifyParentConsent(token: string): Promise<ParentConsentResult>;
  getConsentRecords(userId: string): Promise<ConsentRecord[]>;
  
  // Role and permission management
  assignRole(userId: string, role: UserRole): Promise<{ success: boolean; error?: string }>;
  grantPermissions(userId: string, permissions: Permission[]): Promise<{ success: boolean; error?: string }>;
  revokePermissions(userId: string, permissions: Permission[]): Promise<{ success: boolean; error?: string }>;
  getUserPermissions(userId: string): Promise<Permission[]>;
  
  // Security and auditing
  logSecurityEvent(event: Omit<SecurityAuditLog, 'id' | 'timestamp'>): Promise<void>;
  getSecurityLogs(userId: string, limit?: number): Promise<SecurityAuditLog[]>;
  checkRateLimit(identifier: string, action: string): Promise<RateLimit>;
  getSecurityPolicy(role: UserRole): Promise<SecurityPolicy>;
  
  // Tenant management
  switchTenant(userId: string, tenantId: string): Promise<{ success: boolean; error?: string }>;
  getUserTenants(userId: string): Promise<Array<{ tenantId: string; role: UserRole }>>;
}

// Extended authentication service with additional features
export interface ExtendedAuthService extends AuthService {
  // Bulk operations
  bulkCreateUsers(users: Array<Partial<User>>): Promise<Array<{ success: boolean; user?: User; error?: string }>>;
  bulkDeleteUsers(userIds: string[]): Promise<Array<{ userId: string; success: boolean; error?: string }>>;
  
  // Advanced MFA
  setupWebAuthn(userId: string): Promise<any>; // WebAuthn credential creation options
  verifyWebAuthn(userId: string, credential: any): Promise<boolean>;
  
  // Social authentication
  signInWithProvider(provider: 'google' | 'microsoft' | 'apple', token: string): Promise<AuthResult>;
  linkAccount(userId: string, provider: 'google' | 'microsoft' | 'apple', token: string): Promise<{ success: boolean; error?: string }>;
  
  // Advanced security
  detectSuspiciousActivity(userId: string): Promise<boolean>;
  requireReauthentication(userId: string): Promise<{ required: boolean; reason?: string }>;
  lockAccount(userId: string, reason: string): Promise<{ success: boolean }>;
  unlockAccount(userId: string): Promise<{ success: boolean }>;
  
  // Analytics and reporting
  getAuthMetrics(tenantId?: string): Promise<{
    activeUsers: number;
    totalSignIns: number;
    failedAttempts: number;
    mfaAdoption: number;
  }>;
  
  // Compliance and data export
  exportUserData(userId: string): Promise<any>; // GDPR compliance
  anonymizeUser(userId: string): Promise<{ success: boolean }>;
}

// Authentication event types
export type AuthEvent = 
  | 'user.signup'
  | 'user.signin'
  | 'user.signout'
  | 'user.password_change'
  | 'user.mfa_setup'
  | 'user.mfa_disable'
  | 'user.role_change'
  | 'user.permission_change'
  | 'user.account_lock'
  | 'user.account_unlock'
  | 'user.suspicious_activity'
  | 'session.created'
  | 'session.refreshed'
  | 'session.revoked'
  | 'consent.requested'
  | 'consent.granted'
  | 'consent.revoked';

// Authentication event handler interface
export interface AuthEventHandler {
  handleEvent(event: AuthEvent, data: any): Promise<void>;
}

// Authentication service factory interface
export interface AuthServiceFactory {
  create(config: AuthConfig): AuthService;
  createExtended(config: AuthConfig): ExtendedAuthService;
}