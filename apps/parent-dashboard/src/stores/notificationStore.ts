import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification, Message, Conversation } from '../types';

interface NotificationState {
  notifications: Notification[];
  messages: Message[];
  conversations: Conversation[];
  unreadNotificationCount: number;
  unreadMessageCount: number;
  isLoading: boolean;
  
  // Notifications
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  archiveNotification: (notificationId: string) => void;
  
  // Messages
  addMessage: (message: Message) => void;
  markMessageAsRead: (messageId: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  addConversation: (conversation: Conversation) => void;
  
  // Utilities
  getUnreadNotifications: () => Notification[];
  getUnreadMessages: () => Message[];
  getNotificationsByType: (type: string) => Notification[];
  getConversationById: (conversationId: string) => Conversation | undefined;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      messages: [],
      conversations: [],
      unreadNotificationCount: 0,
      unreadMessageCount: 0,
      isLoading: false,

      addNotification: (notification: Notification) => {
        set((state: NotificationState) => {
          const newNotifications = [notification, ...state.notifications];
          const unreadCount = newNotifications.filter((n: Notification) => n.status === 'unread').length;
          
          return {
            notifications: newNotifications,
            unreadNotificationCount: unreadCount
          };
        });
      },

      markNotificationAsRead: (notificationId: string) => {
        set((state: NotificationState) => {
          const updatedNotifications = state.notifications.map((notification: Notification) =>
            notification.id === notificationId
              ? { ...notification, status: 'read' as const, readAt: new Date() }
              : notification
          );
          const unreadCount = updatedNotifications.filter((n: Notification) => n.status === 'unread').length;
          
          return {
            notifications: updatedNotifications,
            unreadNotificationCount: unreadCount
          };
        });
      },

      markAllNotificationsAsRead: () => {
        set((state: NotificationState) => ({
          notifications: state.notifications.map((notification: Notification) =>
            notification.status === 'unread'
              ? { ...notification, status: 'read' as const, readAt: new Date() }
              : notification
          ),
          unreadNotificationCount: 0
        }));
      },

      removeNotification: (notificationId: string) => {
        set((state: NotificationState) => {
          const updatedNotifications = state.notifications.filter((n: Notification) => n.id !== notificationId);
          const unreadCount = updatedNotifications.filter((n: Notification) => n.status === 'unread').length;
          
          return {
            notifications: updatedNotifications,
            unreadNotificationCount: unreadCount
          };
        });
      },

      archiveNotification: (notificationId: string) => {
        set((state: NotificationState) => {
          const updatedNotifications = state.notifications.map((notification: Notification) =>
            notification.id === notificationId
              ? { ...notification, status: 'archived' as const }
              : notification
          );
          const unreadCount = updatedNotifications.filter((n: Notification) => n.status === 'unread').length;
          
          return {
            notifications: updatedNotifications,
            unreadNotificationCount: unreadCount
          };
        });
      },

      addMessage: (message: Message) => {
        set((state: NotificationState) => {
          const newMessages = [message, ...state.messages];
          const unreadCount = newMessages.filter((m: Message) => m.status !== 'read').length;
          
          // Update conversation
          const updatedConversations = state.conversations.map((conv: Conversation) =>
            conv.id === message.conversationId
              ? { 
                  ...conv, 
                  lastMessage: message, 
                  updatedAt: message.sentAt,
                  unreadCount: conv.unreadCount + (message.status !== 'read' ? 1 : 0)
                }
              : conv
          );
          
          return {
            messages: newMessages,
            conversations: updatedConversations,
            unreadMessageCount: unreadCount
          };
        });
      },

      markMessageAsRead: (messageId: string) => {
        set((state: NotificationState) => {
          const updatedMessages = state.messages.map((message: Message) =>
            message.id === messageId
              ? { ...message, status: 'read' as const, readAt: new Date() }
              : message
          );
          const unreadCount = updatedMessages.filter((m: Message) => m.status !== 'read').length;
          
          return {
            messages: updatedMessages,
            unreadMessageCount: unreadCount
          };
        });
      },

      markConversationAsRead: (conversationId: string) => {
        set((state: NotificationState) => {
          const updatedMessages = state.messages.map((message: Message) =>
            message.conversationId === conversationId
              ? { ...message, status: 'read' as const, readAt: new Date() }
              : message
          );
          
          const updatedConversations = state.conversations.map((conv: Conversation) =>
            conv.id === conversationId
              ? { ...conv, unreadCount: 0 }
              : conv
          );
          
          const unreadCount = updatedMessages.filter((m: Message) => m.status !== 'read').length;
          
          return {
            messages: updatedMessages,
            conversations: updatedConversations,
            unreadMessageCount: unreadCount
          };
        });
      },

      addConversation: (conversation: Conversation) => {
        set((state: NotificationState) => ({
          conversations: [conversation, ...state.conversations]
        }));
      },

      getUnreadNotifications: () => {
        return get().notifications.filter((notification: Notification) => notification.status === 'unread');
      },

      getUnreadMessages: () => {
        return get().messages.filter((message: Message) => message.status !== 'read');
      },

      getNotificationsByType: (type: string) => {
        return get().notifications.filter((notification: Notification) => notification.type === type);
      },

      getConversationById: (conversationId: string) => {
        return get().conversations.find((conversation: Conversation) => conversation.id === conversationId);
      }
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 100), // Keep last 100 notifications
        messages: state.messages.slice(0, 200), // Keep last 200 messages
        conversations: state.conversations,
        unreadNotificationCount: state.unreadNotificationCount,
        unreadMessageCount: state.unreadMessageCount
      })
    }
  )
);