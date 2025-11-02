import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Subscription, PaymentMethod, Invoice } from '../types';

interface BillingState {
  subscription: Subscription | null;
  paymentMethods: PaymentMethod[];
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSubscription: (subscription: Subscription) => void;
  updateSubscription: (updates: Partial<Subscription>) => void;
  cancelSubscription: () => void;
  reactivateSubscription: () => void;
  
  // Payment Methods
  addPaymentMethod: (paymentMethod: PaymentMethod) => void;
  updatePaymentMethod: (paymentMethodId: string, updates: Partial<PaymentMethod>) => void;
  removePaymentMethod: (paymentMethodId: string) => void;
  setDefaultPaymentMethod: (paymentMethodId: string) => void;
  
  // Invoices
  addInvoice: (invoice: Invoice) => void;
  markInvoiceAsPaid: (invoiceId: string) => void;
  
  // Plan Management
  changePlan: (planType: 'single-child' | 'multi-child' | 'family' | 'premium') => Promise<void>;
  upgradeSubscription: () => Promise<void>;
  downgradeSubscription: () => Promise<void>;
  
  // Utilities
  getCurrentPlan: () => string | null;
  getNextBillingDate: () => Date | null;
  getTotalMonthlySpend: () => number;
  getUsagePercentage: () => number;
}

export const useBillingStore = create<BillingState>()(
  persist(
    (set, get) => ({
      subscription: null,
      paymentMethods: [],
      invoices: [],
      isLoading: false,
      error: null,

      setSubscription: (subscription: Subscription) => {
        set({ subscription });
      },

      updateSubscription: (updates: Partial<Subscription>) => {
        const { subscription } = get();
        if (subscription) {
          set({ subscription: { ...subscription, ...updates } });
        }
      },

      cancelSubscription: () => {
        const { subscription } = get();
        if (subscription) {
          set({
            subscription: {
              ...subscription,
              status: 'cancelled',
              cancelledAt: new Date()
            }
          });
        }
      },

      reactivateSubscription: () => {
        const { subscription } = get();
        if (subscription) {
          set({
            subscription: {
              ...subscription,
              status: 'active',
              cancelledAt: undefined
            }
          });
        }
      },

      addPaymentMethod: (paymentMethod: PaymentMethod) => {
        set((state: BillingState) => ({
          paymentMethods: [...state.paymentMethods, paymentMethod]
        }));
      },

      updatePaymentMethod: (paymentMethodId: string, updates: Partial<PaymentMethod>) => {
        set((state: BillingState) => ({
          paymentMethods: state.paymentMethods.map((pm: PaymentMethod) =>
            pm.id === paymentMethodId ? { ...pm, ...updates } : pm
          )
        }));
      },

      removePaymentMethod: (paymentMethodId: string) => {
        set((state: BillingState) => ({
          paymentMethods: state.paymentMethods.filter((pm: PaymentMethod) => pm.id !== paymentMethodId)
        }));
      },

      setDefaultPaymentMethod: (paymentMethodId: string) => {
        set((state: BillingState) => ({
          paymentMethods: state.paymentMethods.map((pm: PaymentMethod) => ({
            ...pm,
            isDefault: pm.id === paymentMethodId
          }))
        }));
      },

      addInvoice: (invoice: Invoice) => {
        set((state: BillingState) => ({
          invoices: [...state.invoices, invoice].sort((a: Invoice, b: Invoice) => 
            new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
          )
        }));
      },

      markInvoiceAsPaid: (invoiceId: string) => {
        set((state: BillingState) => ({
          invoices: state.invoices.map((invoice: Invoice) =>
            invoice.id === invoiceId
              ? { ...invoice, status: 'paid', paidAt: new Date() }
              : invoice
          )
        }));
      },

      changePlan: async (planType: 'single-child' | 'multi-child' | 'family' | 'premium') => {
        const { subscription } = get();
        if (!subscription) return;

        set({ isLoading: true });
        try {
          // Mock API call - replace with actual implementation
          const planPrices = {
            'single-child': 29.99,
            'multi-child': 25.00,
            'family': 35.00,
            'premium': 49.99
          };

          const childLimits = {
            'single-child': 1,
            'multi-child': 5,
            'family': 10,
            'premium': 10
          };

          const updatedSubscription = {
            ...subscription,
            planType,
            planName: planType === 'single-child' ? 'Individual Plan' : 
                     planType === 'multi-child' ? 'Family Plan' :
                     planType === 'family' ? 'Extended Family Plan' : 'Premium Plan',
            price: planPrices[planType],
            childLimit: childLimits[planType]
          };

          set({ subscription: updatedSubscription, isLoading: false });
        } catch (error) {
          console.error('Failed to change plan:', error);
          set({ isLoading: false, error: 'Failed to change plan' });
        }
      },

      upgradeSubscription: async () => {
        const { subscription } = get();
        if (!subscription) return;

        const upgradeMap = {
          'single-child': 'multi-child',
          'multi-child': 'family',
          'family': 'premium',
          'premium': 'premium'
        };

        const nextPlan = upgradeMap[subscription.planType];
        if (nextPlan !== subscription.planType) {
          await get().changePlan(nextPlan as any);
        }
      },

      downgradeSubscription: async () => {
        const { subscription } = get();
        if (!subscription) return;

        const downgradeMap = {
          'premium': 'family',
          'family': 'multi-child',
          'multi-child': 'single-child',
          'single-child': 'single-child'
        };

        const nextPlan = downgradeMap[subscription.planType];
        if (nextPlan !== subscription.planType) {
          await get().changePlan(nextPlan as any);
        }
      },

      getCurrentPlan: () => {
        const { subscription } = get();
        return subscription?.planName || null;
      },

      getNextBillingDate: () => {
        const { subscription } = get();
        return subscription?.currentPeriodEnd || null;
      },

      getTotalMonthlySpend: () => {
        const { subscription } = get();
        if (!subscription) return 0;
        
        return subscription.billingCycle === 'monthly' 
          ? subscription.price 
          : subscription.price / 12;
      },

      getUsagePercentage: () => {
        const { subscription } = get();
        if (!subscription) return 0;
        
        const { usageMetrics, childLimit } = subscription;
        return Math.min((usageMetrics.activeChildren / childLimit) * 100, 100);
      }
    }),
    {
      name: 'billing-storage',
      partialize: (state) => ({
        subscription: state.subscription,
        paymentMethods: state.paymentMethods,
        invoices: state.invoices
      })
    }
  )
);