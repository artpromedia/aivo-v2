import type { 
  AuthContext, 
  SessionVerification, 
  Permission, 
  UserRole,
  RateLimit 
} from './types';

// Middleware function type for various frameworks
export type MiddlewareFunction = (
  req: any,
  res: any,
  next: any
) => void | Promise<void>;

// Authentication middleware options
export interface AuthMiddlewareOptions {
  required?: boolean;
  roles?: UserRole[];
  permissions?: Permission[];
  tenantRequired?: boolean;
  skipPaths?: string[];
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
    keyGenerator?: (req: any) => string;
  };
}

// Rate limiting store interface
export interface RateLimitStore {
  get(key: string): Promise<RateLimit | null>;
  set(key: string, limit: RateLimit): Promise<void>;
  increment(key: string): Promise<RateLimit>;
  reset(key: string): Promise<void>;
}

// In-memory rate limit store (for development)
class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, RateLimit>();

  async get(key: string): Promise<RateLimit | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, limit: RateLimit): Promise<void> {
    this.store.set(key, limit);
  }

  async increment(key: string): Promise<RateLimit> {
    const existing = this.store.get(key);
    if (!existing) {
      const newLimit: RateLimit = {
        key,
        limit: 1,
        window: 60000, // 1 minute
        remaining: 0,
        resetTime: new Date(Date.now() + 60000)
      };
      this.store.set(key, newLimit);
      return newLimit;
    }

    if (Date.now() > existing.resetTime.getTime()) {
      // Reset window
      existing.remaining = existing.limit - 1;
      existing.resetTime = new Date(Date.now() + existing.window);
    } else {
      existing.remaining = Math.max(0, existing.remaining - 1);
    }

    this.store.set(key, existing);
    return existing;
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }
}

// Authentication middleware factory
export class AuthMiddleware {
  private authService: any; // Would be AuthService interface
  private rateLimitStore: RateLimitStore;

  constructor(authService: any, rateLimitStore?: RateLimitStore) {
    this.authService = authService;
    this.rateLimitStore = rateLimitStore || new MemoryRateLimitStore();
  }

  // Express/Connect-style middleware
  authenticate(options: AuthMiddlewareOptions = {}): MiddlewareFunction {
    return async (req: any, res: any, next: any) => {
      try {
        // Skip authentication for certain paths
        if (options.skipPaths?.includes(req.path)) {
          return next();
        }

        // Rate limiting
        if (options.rateLimit) {
          const rateLimitResult = await this.checkRateLimit(req, options.rateLimit);
          if (!rateLimitResult.allowed) {
            return res.status(429).json({
              error: 'Too many requests',
              resetTime: rateLimitResult.resetTime
            });
          }
        }

        // Extract token from request
        const token = this.extractToken(req);
        if (!token && options.required !== false) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        if (!token) {
          // Optional authentication - continue without user context
          req.auth = { permissions: [] };
          return next();
        }

        // Verify session
        const verification = await this.authService.verifySession(token);
        if (!verification.valid) {
          return res.status(401).json({ error: verification.error || 'Invalid token' });
        }

        // Check tenant requirement
        if (options.tenantRequired && !verification.user?.tenantId) {
          return res.status(403).json({ error: 'Tenant context required' });
        }

        // Check role authorization
        if (options.roles && !this.checkRoleAccess(verification.user.role, options.roles)) {
          return res.status(403).json({ error: 'Insufficient role permissions' });
        }

        // Check permission authorization
        if (options.permissions && !this.checkPermissions(verification.permissions || [], options.permissions)) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }

        // Attach auth context to request
        req.auth = {
          user: verification.user,
          session: verification.session,
          permissions: verification.permissions || [],
          tenantId: verification.user?.tenantId
        } as AuthContext;

        next();
      } catch (error) {
        console.error('Authentication middleware error:', error);
        res.status(500).json({ error: 'Authentication error' });
      }
    };
  }

  // Role-based access control middleware
  requireRole(...roles: UserRole[]): MiddlewareFunction {
    return this.authenticate({ required: true, roles });
  }

  // Permission-based access control middleware
  requirePermission(...permissions: Permission[]): MiddlewareFunction {
    return this.authenticate({ required: true, permissions });
  }

  // Admin-only middleware
  requireAdmin(): MiddlewareFunction {
    return this.authenticate({
      required: true,
      roles: ['platform_admin' as UserRole, 'district_admin' as UserRole]
    });
  }

  // Student-only middleware (with COPPA compliance)
  requireStudent(): MiddlewareFunction {
    return async (req: any, res: any, next: any) => {
      const authMiddleware = this.authenticate({
        required: true,
        roles: ['learner' as UserRole]
      });

      await authMiddleware(req, res, () => {
        // Additional student-specific checks
        const user = req.auth?.user;
        if (!user) return;

        // Check if student account is properly set up
        if (user.status !== 'active') {
          return res.status(403).json({
            error: 'Student account requires activation',
            requiresParentConsent: user.status === 'pending_parent_consent'
          });
        }

        next();
      });
    };
  }

  // Teacher-only middleware
  requireTeacher(): MiddlewareFunction {
    return this.authenticate({
      required: true,
      roles: ['teacher' as UserRole, 'counselor' as UserRole, 'specialist' as UserRole]
    });
  }

  // Parent-only middleware
  requireParent(): MiddlewareFunction {
    return this.authenticate({
      required: true,
      roles: ['parent' as UserRole, 'guardian' as UserRole]
    });
  }

  // Multi-tenant middleware
  requireTenant(): MiddlewareFunction {
    return this.authenticate({ required: true, tenantRequired: true });
  }

  // Rate limiting middleware
  rateLimit(options: { windowMs: number; maxRequests: number; keyGenerator?: (req: any) => string }): MiddlewareFunction {
    return async (req: any, res: any, next: any) => {
      const result = await this.checkRateLimit(req, options);
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetTime.toISOString()
      });

      if (!result.allowed) {
        return res.status(429).json({
          error: 'Too many requests',
          resetTime: result.resetTime
        });
      }

      next();
    };
  }

  // COPPA compliance middleware
  coppaCompliance(): MiddlewareFunction {
    return async (req: any, res: any, next: any) => {
      const user = req.auth?.user;
      if (!user) return next();

      // Check if user is a minor and has proper consent
      if (user.role === 'learner' && user.roleData?.dateOfBirth) {
        const age = this.calculateAge(user.roleData.dateOfBirth);
        if (age < 13) {
          // Check for parent consent records
          const hasConsent = await this.checkParentConsent(user.id);
          if (!hasConsent) {
            return res.status(403).json({
              error: 'Parent consent required',
              coppaCompliance: true
            });
          }
        }
      }

      next();
    };
  }

  // Helper methods
  private extractToken(req: any): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Also check cookies for web applications
    const cookieToken = req.cookies?.['auth-token'];
    if (cookieToken) {
      return cookieToken;
    }

    return null;
  }

  private async checkRateLimit(req: any, options: { windowMs: number; maxRequests: number; keyGenerator?: (req: any) => string }): Promise<{
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: Date;
  }> {
    const key = options.keyGenerator ? options.keyGenerator(req) : this.getDefaultRateLimitKey(req);
    const current = await this.rateLimitStore.get(key);

    if (!current) {
      const newLimit: RateLimit = {
        key,
        limit: options.maxRequests,
        window: options.windowMs,
        remaining: options.maxRequests - 1,
        resetTime: new Date(Date.now() + options.windowMs)
      };
      await this.rateLimitStore.set(key, newLimit);
      return {
        allowed: true,
        limit: newLimit.limit,
        remaining: newLimit.remaining,
        resetTime: newLimit.resetTime
      };
    }

    const updated = await this.rateLimitStore.increment(key);
    return {
      allowed: updated.remaining > 0,
      limit: updated.limit,
      remaining: updated.remaining,
      resetTime: updated.resetTime
    };
  }

  private getDefaultRateLimitKey(req: any): string {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userId = req.auth?.user?.id;
    return userId ? `user:${userId}` : `ip:${ip}`;
  }

  private checkRoleAccess(userRole: UserRole, allowedRoles: UserRole[]): boolean {
    return allowedRoles.includes(userRole);
  }

  private checkPermissions(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
    return requiredPermissions.every(permission => userPermissions.includes(permission));
  }

  private calculateAge(dateOfBirth: string): number {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  private async checkParentConsent(userId: string): Promise<boolean> {
    // Implementation would check database for valid parent consent
    return true; // Placeholder
  }
}

// Utility functions for creating middleware instances
export function createAuthMiddleware(authService: any, rateLimitStore?: RateLimitStore): AuthMiddleware {
  return new AuthMiddleware(authService, rateLimitStore);
}

// Export common middleware configurations
export const commonMiddleware = {
  // Public routes (no auth required)
  public: { required: false },
  
  // Basic authentication required
  authenticated: { required: true },
  
  // Student access with COPPA compliance
  student: { 
    required: true, 
    roles: ['learner' as UserRole],
    tenantRequired: true 
  },
  
  // Teacher/staff access
  teacher: { 
    required: true, 
    roles: ['teacher' as UserRole, 'counselor' as UserRole, 'specialist' as UserRole],
    tenantRequired: true 
  },
  
  // Parent access
  parent: { 
    required: true, 
    roles: ['parent' as UserRole, 'guardian' as UserRole],
    tenantRequired: true 
  },
  
  // Admin access
  admin: { 
    required: true, 
    roles: ['district_admin' as UserRole, 'platform_admin' as UserRole],
    tenantRequired: true 
  },
  
  // Rate limited public endpoint
  rateLimited: {
    required: false,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100
    }
  }
};