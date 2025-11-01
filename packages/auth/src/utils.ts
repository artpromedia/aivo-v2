import * as crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';

// Password utilities
export class PasswordUtils {
  private static readonly SALT_ROUNDS = 12;
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 128;

  static async hash(password: string): Promise<string> {
    if (!this.isValidLength(password)) {
      throw new Error(`Password must be between ${this.MIN_LENGTH} and ${this.MAX_LENGTH} characters`);
    }
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static validateStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length < this.MIN_LENGTH) {
      feedback.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
    } else {
      score += 1;
      if (password.length >= 12) score += 1;
      if (password.length >= 16) score += 1;
    }

    // Character variety checks
    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain lowercase letters');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain uppercase letters');
    } else {
      score += 1;
    }

    if (!/\d/.test(password)) {
      feedback.push('Password must contain numbers');
    } else {
      score += 1;
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      feedback.push('Password must contain special characters');
    } else {
      score += 1;
    }

    // Common patterns check
    if (this.hasCommonPatterns(password)) {
      feedback.push('Password contains common patterns');
      score = Math.max(0, score - 2);
    }

    return {
      isValid: feedback.length === 0 && score >= 4,
      score: Math.min(5, score),
      feedback
    };
  }

  private static isValidLength(password: string): boolean {
    return password.length >= this.MIN_LENGTH && password.length <= this.MAX_LENGTH;
  }

  private static hasCommonPatterns(password: string): boolean {
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /admin/i,
      /letmein/i,
      /welcome/i,
      /(.)\1{3,}/ // Repeated characters
    ];

    return commonPatterns.some(pattern => pattern.test(password));
  }

  static generateSecure(length = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each required character type
    password += this.getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    password += this.getRandomChar('abcdefghijklmnopqrstuvwxyz');
    password += this.getRandomChar('0123456789');
    password += this.getRandomChar('!@#$%^&*');

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += this.getRandomChar(charset);
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  private static getRandomChar(charset: string): string {
    const randomIndex = crypto.randomInt(0, charset.length);
    return charset[randomIndex];
  }
}

// JWT token utilities
export class TokenUtils {
  static generate(payload: object, secret: string, expiresIn = '1h'): string {
    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }

  static verify(token: string, secret: string): any {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  static decode(token: string): any {
    return jwt.decode(token);
  }

  static generateSecureSecret(length = 64): string {
    return crypto.randomBytes(length).toString('hex');
  }
}

// MFA utilities
export class MFAUtils {
  static generateSecret(length = 32): string {
    return authenticator.generateSecret(length);
  }

  static generateQRCode(secret: string, label: string, issuer = 'AIVO Platform'): string {
    return authenticator.keyuri(label, issuer, secret);
  }

  static verifyToken(token: string, secret: string, window = 1): boolean {
    try {
      authenticator.options = { window };
      return authenticator.verify({ token, secret });
    } catch {
      return false;
    }
  }

  static generateBackupCodes(count = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric codes
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code.match(/.{1,4}/g)!.join('-'));
    }
    return codes;
  }

  static hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code.replace(/-/g, '')).digest('hex');
  }

  static verifyBackupCode(code: string, hash: string): boolean {
    const normalizedCode = code.replace(/-/g, '').toUpperCase();
    const computedHash = crypto.createHash('sha256').update(normalizedCode).digest('hex');
    return computedHash === hash;
  }
}

// Session utilities
export class SessionUtils {
  static generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('base64url');
  }

  static isExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  static calculateExpiry(durationMinutes: number): Date {
    return new Date(Date.now() + durationMinutes * 60 * 1000);
  }
}

// Security utilities
export class SecurityUtils {
  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static hashIP(ip: string, salt: string): string {
    return crypto.createHash('sha256').update(ip + salt).digest('hex');
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  static detectSuspiciousPatterns(userAgent: string, ip: string): boolean {
    // Simple bot detection patterns
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  static calculatePasswordEntropy(password: string): number {
    const charsetSize = this.getCharsetSize(password);
    return Math.log2(Math.pow(charsetSize, password.length));
  }

  private static getCharsetSize(password: string): number {
    let size = 0;
    if (/[a-z]/.test(password)) size += 26;
    if (/[A-Z]/.test(password)) size += 26;
    if (/\d/.test(password)) size += 10;
    if (/[^a-zA-Z0-9]/.test(password)) size += 32; // Approximate special chars
    return size;
  }
}

// Rate limiting utilities
export class RateLimitUtils {
  static createKey(identifier: string, action: string): string {
    return `ratelimit:${action}:${identifier}`;
  }

  static calculateResetTime(windowMs: number): Date {
    return new Date(Date.now() + windowMs);
  }

  static isWithinWindow(timestamp: Date, windowMs: number): boolean {
    return Date.now() - timestamp.getTime() < windowMs;
  }
}

// Age verification utilities
export class AgeUtils {
  static calculateAge(dateOfBirth: string): number {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  static isMinor(dateOfBirth: string, minAge = 13): boolean {
    return this.calculateAge(dateOfBirth) < minAge;
  }

  static requiresParentConsent(dateOfBirth: string, jurisdiction = 'US'): boolean {
    const age = this.calculateAge(dateOfBirth);
    
    // COPPA compliance (US) - under 13
    if (jurisdiction === 'US') {
      return age < 13;
    }
    
    // GDPR compliance (EU) - under 16 (can vary by member state)
    if (jurisdiction === 'EU') {
      return age < 16;
    }
    
    // Default to COPPA
    return age < 13;
  }
}

// Validation utilities
export class ValidationUtils {
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static isValidPhoneNumber(phone: string): boolean {
    // Basic international phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  static sanitizePhoneNumber(phone: string): string {
    return phone.replace(/[^\d\+]/g, '');
  }

  static isValidDateOfBirth(dateString: string): boolean {
    const date = new Date(dateString);
    const now = new Date();
    
    // Check if valid date
    if (isNaN(date.getTime())) {
      return false;
    }
    
    // Check if not in future
    if (date > now) {
      return false;
    }
    
    // Check if reasonable age (not older than 120 years)
    const maxAge = 120;
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - maxAge);
    
    return date >= minDate;
  }
}

// Export all utilities as a single object for convenience
export const AuthUtils = {
  Password: PasswordUtils,
  Token: TokenUtils,
  MFA: MFAUtils,
  Session: SessionUtils,
  Security: SecurityUtils,
  RateLimit: RateLimitUtils,
  Age: AgeUtils,
  Validation: ValidationUtils
};