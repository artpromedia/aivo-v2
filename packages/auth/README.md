# @aivo/auth

Enterprise-grade authentication and authorization package for the AIVO educational platform, featuring COPPA compliance, multi-factor authentication, and comprehensive security controls.

## Features

### Core Authentication
- ✅ User registration and login with Supabase
- ✅ Password-based and social authentication
- ✅ JWT token management with refresh tokens
- ✅ Session management and validation
- ✅ Multi-tenant authentication support

### Security & Compliance
- ✅ COPPA compliance for users under 13
- ✅ Age verification and parent consent workflows
- ✅ Multi-factor authentication (TOTP, SMS, Email)
- ✅ Rate limiting and abuse prevention
- ✅ Security audit logging
- ✅ Password strength enforcement

### Authorization
- ✅ Role-based access control (RBAC)
- ✅ Permission-based authorization
- ✅ Educational role hierarchy (Student, Parent, Teacher, Admin)
- ✅ Tenant-scoped permissions
- ✅ Express/Connect middleware integration

### Developer Experience
- ✅ TypeScript-first with comprehensive types
- ✅ Framework-agnostic service interfaces
- ✅ Express middleware included
- ✅ Comprehensive utilities and helpers
- ✅ Security best practices built-in

## Installation

```bash
npm install @aivo/auth
# or
pnpm add @aivo/auth
```

### Peer Dependencies
This package requires the following peer dependencies:

```bash
npm install @supabase/supabase-js bcryptjs jsonwebtoken otplib jose
```

## Quick Start

### 1. Configuration

```typescript
import { SupabaseAuthService, AuthConfig } from '@aivo/auth';

const config: AuthConfig = {
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    serviceKey: process.env.SUPABASE_SERVICE_KEY!
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: '1h',
    refreshExpiresIn: '7d'
  },
  mfa: {
    enabled: true,
    issuer: 'AIVO Platform',
    algorithm: 'SHA256'
  },
  coppa: {
    enabled: true,
    minAge: 13,
    parentConsentRequired: true
  },
  rateLimit: {
    enabled: true,
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000 // 15 minutes
  }
};

const authService = new SupabaseAuthService(config);
```

### 2. User Registration with Age Verification

```typescript
import { AuthUtils } from '@aivo/auth';

// Check age and COPPA requirements
const ageVerification = await authService.verifyAge('2015-05-15');
if (ageVerification.requiresParentConsent) {
  console.log('Parent consent required for user under 13');
}

// Register user
const result = await authService.signUp('student@school.edu', 'securePassword123!', {
  email: 'student@school.edu',
  role: 'learner',
  tenantId: 'school-district-123',
  roleData: {
    dateOfBirth: '2015-05-15',
    gradeLevel: '3rd',
    studentId: 'STU-2024-001'
  }
});

if (result.requiresParentConsent) {
  // Initiate parent consent workflow
  await authService.requestParentConsent(result.user!.id, 'parent@email.com');
}
```

### 3. Authentication Middleware

```typescript
import express from 'express';
import { createAuthMiddleware, commonMiddleware } from '@aivo/auth';

const app = express();
const authMiddleware = createAuthMiddleware(authService);

// Public route
app.get('/api/public', authMiddleware.authenticate(commonMiddleware.public), (req, res) => {
  res.json({ message: 'Public endpoint' });
});

// Student-only route with COPPA compliance
app.get('/api/student/dashboard', 
  authMiddleware.requireStudent(),
  authMiddleware.coppaCompliance(),
  (req, res) => {
    const user = req.auth.user;
    res.json({ message: `Welcome ${user.email}` });
  }
);

// Teacher-only route
app.get('/api/teacher/classes', authMiddleware.requireTeacher(), (req, res) => {
  res.json({ classes: [] });
});

// Admin route with rate limiting
app.post('/api/admin/users',
  authMiddleware.rateLimit({ windowMs: 60000, maxRequests: 10 }),
  authMiddleware.requireAdmin(),
  (req, res) => {
    res.json({ message: 'Admin endpoint' });
  }
);
```

### 4. Multi-Factor Authentication

```typescript
// Enable MFA for a user
const mfaSetup = await authService.setupMFA(userId, 'totp');
if (mfaSetup.success) {
  console.log('Scan QR code:', mfaSetup.qrCode);
  console.log('Backup codes:', mfaSetup.backupCodes);
}

// Verify MFA during login
const loginResult = await authService.signIn('user@school.edu', 'password');
if (loginResult.requiresMFA) {
  const mfaResult = await authService.verifyMFA(
    loginResult.user!.id,
    '123456', // TOTP code
    'totp'
  );
  
  if (mfaResult.success) {
    console.log('MFA verified successfully');
  }
}
```

### 5. Role and Permission Management

```typescript
// Assign roles
await authService.assignRole(userId, 'teacher');

// Grant specific permissions
await authService.grantPermissions(userId, [
  'assessments:create',
  'assessments:edit',
  'students:view'
]);

// Check permissions in middleware
app.get('/api/assessments', 
  authMiddleware.requirePermission('assessments:view'),
  (req, res) => {
    res.json({ assessments: [] });
  }
);
```

## User Roles

The platform supports the following role hierarchy:

### Student Roles
- **learner**: Standard student account with COPPA compliance
- **student_aide**: Student with limited administrative privileges

### Educator Roles
- **teacher**: Classroom instructor with student management
- **counselor**: School counselor with student support access
- **specialist**: Special education or intervention specialist
- **substitute**: Temporary instructor with limited access

### Administrative Roles
- **principal**: School-level administrator
- **district_admin**: District-level administrator
- **platform_admin**: System-wide administrator

### Parent/Guardian Roles
- **parent**: Legal parent with student data access
- **guardian**: Legal guardian with student data access
- **emergency_contact**: Limited access for emergencies

## Permissions System

Permissions follow the format `resource:action`:

### Assessment Permissions
- `assessments:view` - View assessments
- `assessments:create` - Create new assessments
- `assessments:edit` - Modify existing assessments
- `assessments:delete` - Remove assessments
- `assessments:assign` - Assign to students

### Student Management
- `students:view` - View student profiles
- `students:edit` - Modify student data
- `students:create` - Add new students
- `students:delete` - Remove student accounts

### Curriculum Permissions
- `curriculum:view` - View curriculum content
- `curriculum:edit` - Modify curriculum
- `curriculum:create` - Create curriculum content

### Analytics & Reporting
- `analytics:view` - View reports and analytics
- `analytics:export` - Export data and reports

## Security Features

### COPPA Compliance
- Automatic age verification for new registrations
- Parent consent workflows for users under 13
- Data minimization for minor accounts
- Audit trails for consent management

### Password Security
```typescript
import { AuthUtils } from '@aivo/auth';

// Validate password strength
const validation = AuthUtils.Password.validateStrength('myPassword123!');
console.log(`Score: ${validation.score}/5`);
console.log(`Valid: ${validation.isValid}`);
console.log(`Feedback:`, validation.feedback);

// Generate secure password
const securePassword = AuthUtils.Password.generateSecure(16);
```

### Rate Limiting
```typescript
// Custom rate limiting middleware
app.use('/api/auth', authMiddleware.rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per window
  keyGenerator: (req) => req.ip // Rate limit by IP
}));
```

### Security Auditing
```typescript
// Log security events
await authService.logSecurityEvent({
  userId: 'user-123',
  action: 'password_change',
  details: { method: 'self_service' },
  ipAddress: req.ip,
  userAgent: req.get('User-Agent') || ''
});

// Get security logs
const logs = await authService.getSecurityLogs('user-123', 10);
```

## Multi-Tenant Support

```typescript
// Switch tenant context
await authService.switchTenant(userId, 'new-school-district');

// Get user's tenant memberships
const tenants = await authService.getUserTenants(userId);
tenants.forEach(tenant => {
  console.log(`Tenant: ${tenant.tenantId}, Role: ${tenant.role}`);
});

// Require tenant context in middleware
app.use('/api/school-data', authMiddleware.requireTenant());
```

## Error Handling

The package provides comprehensive error handling:

```typescript
try {
  const result = await authService.signIn(email, password);
  if (!result.success) {
    switch (result.error) {
      case 'invalid_credentials':
        // Handle invalid login
        break;
      case 'account_locked':
        // Handle locked account
        break;
      case 'mfa_required':
        // Redirect to MFA flow
        break;
    }
  }
} catch (error) {
  console.error('Authentication error:', error);
}
```

## Environment Variables

Required environment variables:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# JWT Configuration
JWT_SECRET=your-jwt-secret-key

# Optional: MFA Configuration
MFA_ISSUER="AIVO Platform"

# Optional: COPPA Configuration
COPPA_MIN_AGE=13
```

## API Reference

### AuthService Interface

The main authentication service interface provides:

- **Authentication**: `signUp()`, `signIn()`, `signOut()`
- **Session Management**: `verifySession()`, `refreshToken()`, `revokeSession()`
- **User Management**: `getUser()`, `updateUser()`, `deleteUser()`
- **MFA**: `setupMFA()`, `verifyMFA()`, `generateBackupCodes()`
- **COPPA**: `verifyAge()`, `requestParentConsent()`, `verifyParentConsent()`
- **Security**: `logSecurityEvent()`, `getSecurityLogs()`, `checkRateLimit()`

### Middleware Methods

- **authenticate()**: Basic authentication middleware
- **requireRole()**: Role-based access control
- **requirePermission()**: Permission-based access control
- **requireStudent()**: Student-specific middleware with COPPA
- **requireTeacher()**: Teacher/educator middleware
- **requireParent()**: Parent/guardian middleware
- **requireAdmin()**: Administrator middleware
- **rateLimit()**: Rate limiting middleware
- **coppaCompliance()**: COPPA compliance checks

### Utility Classes

- **PasswordUtils**: Password hashing, validation, and generation
- **TokenUtils**: JWT token creation and validation
- **MFAUtils**: TOTP and backup code management
- **SessionUtils**: Session ID and token generation
- **SecurityUtils**: General security utilities
- **AgeUtils**: Age calculation and COPPA compliance
- **ValidationUtils**: Input validation helpers

## Contributing

This package is part of the AIVO platform monorepo. Please refer to the main repository's contributing guidelines.

## License

Proprietary - AIVO Educational Platform