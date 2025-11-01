import type { UUID, Timestamp, Region } from './common';
import type { UserRole } from './user';

// Subscription and Billing Types
export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
  DISTRICT = 'district',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
  BIENNIAL = 'biennial',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIAL = 'trial',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  PAUSED = 'paused',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  DISPUTED = 'disputed',
}

// Feature flags for different subscription tiers
export interface FeatureSet {
  // Core Features
  maxStudents: number;
  maxTeachers: number;
  maxSchools: number;
  storageGB: number;
  
  // AI Features
  aiInteractionsPerMonth: number;
  personalizedAI: boolean;
  customAIModels: boolean;
  aiContentGeneration: boolean;
  advancedAnalytics: boolean;
  
  // Assessment Features
  unlimitedAssessments: boolean;
  customAssessments: boolean;
  adaptiveAssessments: boolean;
  advancedReporting: boolean;
  realTimeProgress: boolean;
  
  // IEP Features
  iepManagement: boolean;
  iepAnalytics: boolean;
  complianceReporting: boolean;
  parentPortal: boolean;
  
  // Curriculum Features
  curriculumMapping: boolean;
  multiRegionalCurricula: boolean;
  customCurriculum: boolean;
  alignmentTools: boolean;
  
  // Integration Features
  singleSignOn: boolean;
  apiAccess: boolean;
  webhooks: boolean;
  thirdPartyIntegrations: string[];
  
  // Support Features
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  trainingIncluded: boolean;
  onboardingSupport: boolean;
  customOnboarding: boolean;
  
  // Compliance Features
  coppaCompliance: boolean;
  ferpaCompliance: boolean;
  gdprCompliance: boolean;
  hipaaCompliance: boolean;
  auditLogs: boolean;
  dataExport: boolean;
  dataRetention: boolean;
}

// Subscription Plan Definitions
export interface SubscriptionPlan {
  id: UUID;
  name: string;
  tier: SubscriptionTier;
  description: string;
  features: FeatureSet;
  
  // Pricing
  pricing: {
    region: Region;
    currency: string;
    prices: {
      cycle: BillingCycle;
      amount: number; // in cents
      perUnit?: 'student' | 'teacher' | 'school' | 'district';
      setupFee?: number;
      minimumSeats?: number;
    }[];
  }[];
  
  // Trial Information
  trialDays?: number;
  trialFeatures?: FeatureSet;
  
  // Availability
  isActive: boolean;
  availableRegions: Region[];
  targetCustomers: ('individual' | 'school' | 'district' | 'enterprise')[];
  
  // Limits and Restrictions
  contractTerms?: {
    minimumTerm: number; // months
    autoRenew: boolean;
    cancellationNotice: number; // days
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Customer Subscription
export interface Subscription {
  id: UUID;
  customerId: UUID; // School, District, or Individual
  planId: UUID;
  status: SubscriptionStatus;
  
  // Billing Information
  billingCycle: BillingCycle;
  currency: string;
  amount: number; // in cents
  
  // Subscription Timeline
  startDate: Timestamp;
  endDate?: Timestamp;
  trialStart?: Timestamp;
  trialEnd?: Timestamp;
  canceledAt?: Timestamp;
  cancelationReason?: string;
  
  // Current Period
  currentPeriodStart: Timestamp;
  currentPeriodEnd: Timestamp;
  
  // Usage and Limits
  currentUsage: {
    students: number;
    teachers: number;
    schools: number;
    aiInteractions: number;
    storageUsedGB: number;
  };
  
  // Billing Details
  nextBillingDate?: Timestamp;
  lastBillingDate?: Timestamp;
  
  // Discounts and Promotions
  discount?: {
    type: 'percentage' | 'fixed_amount';
    value: number;
    duration?: 'once' | 'repeating' | 'forever';
    endsAt?: Timestamp;
    promotionCode?: string;
  };
  
  // Add-ons and Customizations
  addOns: {
    id: UUID;
    name: string;
    type: 'feature' | 'capacity' | 'service';
    price: number;
    quantity?: number;
  }[];
  
  // Contract Information (for Enterprise/District)
  contract?: {
    id: UUID;
    startDate: Timestamp;
    endDate: Timestamp;
    autoRenew: boolean;
    terms: string;
    signedBy: UUID;
    signedAt: Timestamp;
  };
  
  // Metadata
  metadata: Record<string, any>;
  createdBy: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Payment and Invoice Information
export interface Invoice {
  id: UUID;
  subscriptionId: UUID;
  customerId: UUID;
  invoiceNumber: string;
  
  // Invoice Details
  status: PaymentStatus;
  currency: string;
  subtotal: number; // in cents
  taxAmount: number;
  discountAmount: number;
  total: number;
  amountDue: number;
  amountPaid: number;
  
  // Line Items
  items: {
    id: UUID;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    periodStart?: Timestamp;
    periodEnd?: Timestamp;
  }[];
  
  // Dates
  invoiceDate: Timestamp;
  dueDate: Timestamp;
  paidAt?: Timestamp;
  
  // Payment Information
  paymentMethod?: {
    id: UUID;
    type: 'card' | 'ach' | 'wire' | 'check' | 'purchase_order';
    last4?: string;
    brand?: string;
  };
  
  // Billing Address
  billingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  
  // Tax Information
  taxId?: string;
  taxExempt: boolean;
  
  // Collections
  collectionMethod: 'charge_automatically' | 'send_invoice';
  daysOverdue?: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Payment Method and Billing
export interface PaymentMethod {
  id: UUID;
  customerId: UUID;
  type: 'card' | 'bank_account' | 'paypal' | 'stripe';
  
  // Card Information
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    country: string;
    funding: 'credit' | 'debit' | 'prepaid';
  };
  
  // Bank Account Information
  bankAccount?: {
    bankName: string;
    accountType: 'checking' | 'savings';
    last4: string;
    routingNumber?: string; // Masked
    country: string;
  };
  
  // Status and Metadata
  isDefault: boolean;
  isVerified: boolean;
  billingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Usage Analytics and Billing
export interface UsageRecord {
  id: UUID;
  subscriptionId: UUID;
  customerId: UUID;
  
  // Usage Metrics
  metric: 'ai_interactions' | 'storage_gb' | 'api_calls' | 'students' | 'assessments';
  quantity: number;
  unit: string;
  
  // Time Period
  recordedAt: Timestamp;
  periodStart: Timestamp;
  periodEnd: Timestamp;
  
  // Billing Impact
  billable: boolean;
  unitPrice?: number;
  totalCost?: number;
  
  // Context
  source: 'automatic' | 'manual' | 'import';
  metadata: Record<string, any>;
  
  createdAt: Timestamp;
}

// Subscription Analytics
export interface SubscriptionAnalytics {
  customerId?: UUID;
  timeframe: {
    start: Timestamp;
    end: Timestamp;
  };
  
  // Revenue Metrics
  revenue: {
    total: number;
    recurring: number;
    oneTime: number;
    byTier: Record<SubscriptionTier, number>;
    monthlyRecurringRevenue: number;
    annualRecurringRevenue: number;
  };
  
  // Subscription Metrics
  subscriptions: {
    total: number;
    active: number;
    trial: number;
    canceled: number;
    churnRate: number;
    growthRate: number;
    byTier: Record<SubscriptionTier, number>;
  };
  
  // Customer Metrics
  customers: {
    total: number;
    new: number;
    churned: number;
    lifetimeValue: number;
    acquisitionCost: number;
    paybackPeriod: number; // months
  };
  
  // Usage Metrics
  usage: {
    totalStudents: number;
    totalTeachers: number;
    totalAIInteractions: number;
    averageEngagement: number;
    featureAdoption: Record<string, number>;
  };
  
  // Payment Metrics
  payments: {
    successRate: number;
    failureRate: number;
    averagePaymentTime: number; // days
    outstandingInvoices: number;
    overdueAmount: number;
  };
  
  generatedAt: Timestamp;
}

// Promotional Codes and Discounts
export interface PromotionCode {
  id: UUID;
  code: string;
  name: string;
  description?: string;
  
  // Discount Details
  discount: {
    type: 'percentage' | 'fixed_amount';
    value: number;
    duration: 'once' | 'repeating' | 'forever';
    durationInMonths?: number;
  };
  
  // Restrictions
  restrictions: {
    firstTimeCustomers?: boolean;
    minimumAmount?: number;
    applicablePlans?: UUID[];
    maxRedemptions?: number;
    maxRedemptionsPerCustomer?: number;
  };
  
  // Validity
  validFrom: Timestamp;
  validUntil?: Timestamp;
  isActive: boolean;
  
  // Usage Statistics
  timesUsed: number;
  
  createdBy: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}