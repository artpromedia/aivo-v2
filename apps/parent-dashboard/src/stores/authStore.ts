import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Parent, ParentPermissions } from '../types';

interface AuthState {
  parent: Parent | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: ParentPermissions | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateParent: (updates: Partial<Parent>) => void;
  updatePermissions: (permissions: ParentPermissions) => void;
  checkPermission: (permission: keyof ParentPermissions) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      parent: null,
      isAuthenticated: false,
      isLoading: false,
      permissions: null,

      login: async (email: string, _password: string) => {
        set({ isLoading: true });
        try {
          // TODO: Replace with actual API call
          const mockParent: Parent = {
            id: 'parent-1',
            email,
            name: 'Sarah Johnson',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
            phoneNumber: '+1 (555) 123-4567',
            timezone: 'America/New_York',
            preferences: {
              language: 'en',
              emailNotifications: true,
              smsNotifications: false,
              weeklyReports: true,
              monthlyReports: true,
              emergencyAlerts: true,
              theme: 'light',
              digestFrequency: 'weekly'
            },
            subscription: {
              id: 'sub-1',
              parentId: 'parent-1',
              planType: 'multi-child',
              planName: 'Family Plan',
              price: 25.00,
              billingCycle: 'monthly',
              status: 'active',
              currentPeriodStart: new Date('2025-01-01'),
              currentPeriodEnd: new Date('2025-02-01'),
              childLimit: 5,
              features: [
                { name: 'Multi-child support', included: true, limit: 5, description: 'Up to 5 children' },
                { name: 'Advanced analytics', included: true, description: 'Detailed progress tracking' },
                { name: 'Priority support', included: true, description: '24/7 customer support' },
                { name: 'Custom reports', included: true, description: 'Generate custom reports' }
              ],
              paymentMethod: {
                id: 'pm-1',
                type: 'card',
                last4: '4242',
                brand: 'visa',
                expiryMonth: 12,
                expiryYear: 2026,
                isDefault: true
              },
              invoices: [],
              usageMetrics: {
                childrenCount: 2,
                activeChildren: 2,
                totalLessonsThisMonth: 45,
                totalAssessmentsThisMonth: 12,
                storageUsedMB: 125.5,
                reportGeneratedThisMonth: 3,
                apiCallsThisMonth: 1250
              }
            },
            children: [],
            notifications: {
              email: {
                achievements: true,
                weeklyReports: true,
                assessmentGraded: true,
                goalCompleted: true,
                messageReceived: true,
                billingUpdates: true,
                systemUpdates: false
              },
              push: {
                achievements: true,
                dailySummary: true,
                messageReceived: true,
                urgentAlerts: true
              },
              sms: {
                emergencyAlerts: true,
                billingIssues: true
              }
            },
            permissions: {
              canModifyChildProfiles: true,
              canViewDetailedProgress: true,
              canCommunicateWithTeachers: true,
              canManageScreenTime: true,
              canSetLearningGoals: true,
              canDownloadReports: true,
              canManageBilling: true,
              canInviteOtherParents: false
            },
            createdAt: new Date('2024-01-15'),
            lastLogin: new Date()
          };

          set({ 
            parent: mockParent, 
            isAuthenticated: true, 
            permissions: mockParent.permissions,
            isLoading: false 
          });
        } catch (error) {
          console.error('Login failed:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ 
          parent: null, 
          isAuthenticated: false, 
          permissions: null,
          isLoading: false 
        });
      },

      updateParent: (updates: Partial<Parent>) => {
        const { parent } = get();
        if (parent) {
          set({ parent: { ...parent, ...updates } });
        }
      },

      updatePermissions: (permissions: ParentPermissions) => {
        set({ permissions });
        const { parent } = get();
        if (parent) {
          set({ parent: { ...parent, permissions } });
        }
      },

      checkPermission: (permission: keyof ParentPermissions) => {
        const { permissions } = get();
        return permissions?.[permission] || false;
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        parent: state.parent,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions
      })
    }
  )
);