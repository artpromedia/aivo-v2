import type { 
  User, 
  UserRole, 
  Permission, 
  UserSession, 
  ConsentRecord 
} from '@aivo/types';

// Authentication configuration
export interface AuthConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceKey: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  mfa: {
    enabled: boolean;
    issuer: string;
    algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  };
  coppa: {
    enabled: boolean;
    minAge: number;
    parentConsentRequired: boolean;
  };
  rateLimit: {
    enabled: boolean;
    maxAttempts: number;
    windowMs: number;
  };
}

// Authentication result types
export interface AuthResult {
  success: boolean;
  user?: User;
  session?: UserSession;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  };
  error?: string;
  requiresMFA?: boolean;
  requiresParentConsent?: boolean;
}

// Login credentials
export interface LoginCredentials {
  email?: string;
  phoneNumber?: string;
  password: string;
  mfaCode?: string;
  tenantId: string;
}

// Registration data
export interface RegisterData {
  email?: string;
  phoneNumber?: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  dateOfBirth?: string; // For COPPA compliance
  parentEmail?: string; // For minors
  schoolId?: string;
  districtId?: string;
  roleData?: Record<string, any>;
}

// MFA setup data
export interface MFASetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

// Password reset data
export interface PasswordResetData {
  email: string;
  tenantId: string;
  resetToken?: string;
  newPassword?: string;
}

// Session verification result
export interface SessionVerification {
  valid: boolean;
  user?: User;
  session?: UserSession;
  permissions?: Permission[];
  error?: string;
}

// Age verification for COPPA compliance
export interface AgeVerification {
  isMinor: boolean;
  age: number;
  requiresParentConsent: boolean;
  canCreateAccount: boolean;
}

// Authentication service interface
export interface AuthService {
  // Core authentication
  login(credentials: LoginCredentials): Promise<AuthResult>;
  register(data: RegisterData): Promise<AuthResult>;
  logout(sessionId: string): Promise<void>;
  refreshToken(refreshToken: string): Promise<AuthResult>;
  
  // Password management
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean>;
  requestPasswordReset(data: Omit<PasswordResetData, 'resetToken' | 'newPassword'>): Promise<boolean>;
  resetPassword(data: PasswordResetData): Promise<boolean>;
  
  // Session management
  verifySession(token: string): Promise<SessionVerification>;
  invalidateSession(sessionId: string): Promise<void>;
  invalidateAllSessions(userId: string): Promise<void>;
  
  // MFA management
  setupMFA(userId: string): Promise<MFASetup>;
  verifyMFA(userId: string, code: string): Promise<boolean>;
  disableMFA(userId: string, password: string): Promise<boolean>;
  generateBackupCodes(userId: string): Promise<string[]>;
  
  // Email/Phone verification
  sendVerificationEmail(email: string, tenantId: string): Promise<boolean>;
  verifyEmail(token: string): Promise<boolean>;
  sendVerificationSMS(phoneNumber: string, tenantId: string): Promise<boolean>;
  verifyPhoneNumber(phoneNumber: string, code: string): Promise<boolean>;
  
  // COPPA compliance
  verifyAge(dateOfBirth: string): Promise<AgeVerification>;
  requestParentConsent(childData: RegisterData): Promise<boolean>;
  verifyParentConsent(token: string): Promise<boolean>;
  recordConsent(userId: string, consent: Omit<ConsentRecord, 'id' | 'userId'>): Promise<ConsentRecord>;
  
  // Permission management
  getUserPermissions(userId: string, tenantId: string): Promise<Permission[]>;
  hasPermission(userId: string, permission: Permission, tenantId: string): Promise<boolean>;
  checkRoleAccess(userRole: UserRole, requiredRoles: UserRole[]): boolean;
}

// Token payload structure (compatible with jose JWTPayload)
export interface TokenPayload extends Record<string, any> {
  userId: string;
  tenantId: string;
  role: UserRole;
  permissions: Permission[];
  sessionId: string;
  iat: number;
  exp: number;
}

// Authentication middleware context
export interface AuthContext {
  user?: User;
  session?: UserSession;
  permissions: Permission[];
  tenantId: string;
}

// Rate limiting for security
export interface RateLimit {
  key: string;
  limit: number;
  window: number; // in milliseconds
  remaining: number;
  resetTime: Date;
}

// Audit logging for authentication events
export interface AuthAuditLog {
  id: string;
  userId?: string;
  tenantId: string;
  event: 'login' | 'logout' | 'register' | 'password_change' | 'mfa_enable' | 'mfa_disable' | 'failed_login' | 'session_expired';
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// Security configuration for different user types
export interface SecurityPolicy {
  role: UserRole;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    maxAge?: number; // days
    preventReuse?: number; // last N passwords
  };
  sessionPolicy: {
    maxDuration: number; // minutes
    idleTimeout: number; // minutes
    maxConcurrentSessions: number;
  };
  mfaPolicy: {
    required: boolean;
    methods: ('totp' | 'sms' | 'email')[];
  };
  accessPolicy: {
    allowedIPs?: string[];
    blockedIPs?: string[];
    timeRestrictions?: {
      allowedHours: [number, number]; // [start, end] in 24h format
      allowedDays: number[]; // 0=Sunday, 1=Monday, etc.
      timezone: string;
    };
  };
}

// Additional result types
export interface MFASetupResult {
  success: boolean;
  qrCode?: string;
  secret?: string;
  backupCodes?: string[];
  error?: string;
}

export interface MFAVerificationResult {
  success: boolean;
  error?: string;
}

export interface PasswordResetResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ParentConsentResult {
  success: boolean;
  consentId?: string;
  error?: string;
  requiresVerification?: boolean;
}

export interface AgeVerificationResult {
  isMinor: boolean;
  age: number;
  requiresParentConsent: boolean;
}

export interface SecurityAuditLog {
  id: string;
  userId: string;
  action: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// Re-export types from @aivo/types for convenience
export type { User, UserRole, Permission, UserSession, ConsentRecord } from '@aivo/types';