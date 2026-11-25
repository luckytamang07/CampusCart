import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { marketplaceService, SESSION_EXPIRED_EVENT } from '../services/marketplaceService';
import {
  AppRoute,
  Category,
  CategorySlug,
  Conversation,
  ListingStatus,
  Message,
  NotificationItem,
  Product,
  ProductFilters,
  ReportItem,
  Review,
  ToastMessage,
  User,
} from '../types/marketplace';

interface AppContextValue {
  route: AppRoute;
  selectedProductId: string | null;
  editingProductId: string | null;
  activeConversationId: string | null;
  currentUser: User | null;
  users: User[];
  products: Product[];
  categories: Category[];
  favorites: string[];
  conversations: Conversation[];
  messages: Message[];
  notifications: NotificationItem[];
  reviews: Review[];
  reports: ReportItem[];
  filters: ProductFilters;
  toasts: ToastMessage[];
  unreadMessagesCount: number;
  unreadNotificationsCount: number;

  navigate: (route: AppRoute, options?: { productId?: string; editProductId?: string; conversationId?: string; category?: CategorySlug | 'all'; query?: string }) => void;
  setFilters: React.Dispatch<React.SetStateAction<ProductFilters>>;
  resetFilters: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;

  login: (email: string, password: string) => Promise<User>;
  signup: (payload: {
    fullName: string;
    email: string;
    phone: string;
    university: string;
    password: string;
    avatarUrl?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  updatePreferences: (updates: Partial<User['preferences']>) => void;

  toggleFavorite: (productId: string) => void;
  createListing: (data: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'sellerUniversity' | 'sellerAvatar' | 'sellerRating' | 'sellerVerified' | 'createdAt' | 'updatedAt' | 'views'>) => Promise<Product>;
  updateListing: (id: string, updates: Partial<Product>) => Promise<boolean>;
  deleteListing: (id: string) => Promise<void>;
  changeListingStatus: (id: string, status: ListingStatus) => Promise<void>;

  startConversationForProduct: (product: Product) => void;
  selectConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, text: string, imageUrl?: string) => void;
  updateConversationStatus: (conversationId: string, status: Conversation['status']) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  submitReport: (payload: { productId: string; reason: string; details: string }) => void;
  resolveReport: (reportId: string, action: 'Resolved' | 'Dismissed', removeProduct?: boolean) => void;
  toggleUserSuspension: (userId: string) => void;
  toggleProductFeatured: (productId: string) => void;
  addCategory: (name: string, description: string) => void;
  toggleCategoryActive: (categoryId: string) => void;
}

const DEFAULT_FILTERS: ProductFilters = {
  query: '',
  category: 'all',
  condition: 'all',
  campus: 'all',
  minPrice: '',
  maxPrice: '',
  datePosted: 'all',
  sort: 'newest',
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const snapshot = useMemo(() => marketplaceService.getInitialSnapshot(), []);

  const [currentUser, setCurrentUser] = useState<User | null>(() => marketplaceService.getCurrentUser());
  // Always holds the latest signed-in user. The post-login redirect runs from a callback created
  // before login finished, so it must not rely on an older "signed out" copy of currentUser.
  const currentUserRef = useRef<User | null>(currentUser);
  currentUserRef.current = currentUser;
  const [route, setRoute] = useState<AppRoute>(() => (marketplaceService.getCurrentUser() ? 'dashboard' : 'landing'));
  const [selectedProductId, setSelectedProductId] = useState<string | null>(snapshot.products[0]?.id || null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(snapshot.conversations[0]?.id || null);

  const [users, setUsers] = useState<User[]>(snapshot.users);
  const [products, setProducts] = useState<Product[]>(snapshot.products);
  const [categories, setCategories] = useState<Category[]>(snapshot.categories);
  const [favorites, setFavorites] = useState<string[]>(snapshot.favorites);
  const [conversations, setConversations] = useState<Conversation[]>(snapshot.conversations);
  const [messages, setMessages] = useState<Message[]>(snapshot.messages);
  const [notifications, setNotifications] = useState<NotificationItem[]>(snapshot.notifications);
  const [reviews] = useState<Review[]>(snapshot.reviews);
  const [reports, setReports] = useState<ReportItem[]>(snapshot.reports);

  // Keep category counts tied to the real marketplace data instead of hard-coded demo numbers.
  useEffect(() => {
    setCategories((prev) => {
      const next = prev.map((category) => ({
        ...category,
        itemCount: products.filter((product) => product.category === category.slug && product.status !== 'sold').length,
      }));
      marketplaceService.persistCategories(next);
      return next;
    });
  }, [products]);

  // Hydrate listings from MongoDB. If the database is empty, seed it once with
  // the demo listings so the marketplace is immediately usable.
  useEffect(() => {
    let cancelled = false;
    marketplaceService.seedProductsIfEmpty(snapshot.products)
      .then((remoteProducts) => {
        if (!cancelled) {
          setProducts(remoteProducts);
          marketplaceService.persistProducts(remoteProducts);
        }
      })
      .catch((error) => {
        console.warn('MongoDB is unavailable. Using the local cached listings.', error);
      });
    return () => { cancelled = true; };
  }, [snapshot.products]);

  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const navigate = useCallback(
    (
      nextRoute: AppRoute,
      options?: {
        productId?: string;
        editProductId?: string;
        conversationId?: string;
        category?: CategorySlug | 'all';
        query?: string;
      }
    ) => {
      const user = currentUserRef.current;
      const protectedRoutes: AppRoute[] = [
        'dashboard',
        'sell',
        'my-listings',
        'saved',
        'messages',
        'notifications',
        'profile',
        'settings',
        'admin',
      ];

      if (protectedRoutes.includes(nextRoute) && !user) {
        addToast({
          type: 'info',
          title: 'Sign in required',
          description: 'Please log in with your university email to access that section.',
        });
        setRoute('login');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (nextRoute === 'admin' && user?.role !== 'admin') {
        addToast({
          type: 'error',
          title: 'Admin access only',
          description: 'Only the CampusCart administrator can open the admin console.',
        });
        setRoute('dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (options?.productId) {
        setSelectedProductId(options.productId);
      }
      if (nextRoute === 'sell') {
        setEditingProductId(options?.editProductId || null);
      } else if (options?.editProductId !== undefined) {
        setEditingProductId(options.editProductId);
      }
      if (options?.conversationId) {
        setActiveConversationId(options.conversationId);
      }
      if (options?.category !== undefined || options?.query !== undefined) {
        setFilters((prev) => ({
          ...prev,
          category: options.category !== undefined ? options.category : prev.category,
          query: options.query !== undefined ? options.query : prev.query,
        }));
      }

      setRoute(nextRoute);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [addToast]
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const user = await marketplaceService.login(email, password);
      currentUserRef.current = user;
      setCurrentUser(user);
      setUsers((prev) => {
        const exists = prev.some((u) => u.id === user.id);
        return exists ? prev : [user, ...prev];
      });
      return user;
    },
    []
  );

  const signup = useCallback(
    async (payload: {
      fullName: string;
      email: string;
      phone: string;
      university: string;
      password: string;
      avatarUrl?: string;
    }) => {
      const user = await marketplaceService.signup(payload);
      currentUserRef.current = user;
      setCurrentUser(user);
      setUsers((prev) => [user, ...prev]);
      return user;
    },
    []
  );

  // End the session when the JWT expires or the server rejects it.
  const sessionUserId = currentUser?.id;
  useEffect(() => {
    if (!sessionUserId) return;
    const endSession = () => {
      marketplaceService.logout();
      setCurrentUser(null);
      setRoute('login');
      addToast({ type: 'info', title: 'Session expired', description: 'Please sign in again to continue.' });
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, endSession);
    const timer = setInterval(() => {
      if (!marketplaceService.isSessionValid()) endSession();
    }, 30000);
    // Confirm with the server once that the stored token is still accepted.
    marketplaceService.verifySession();
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, endSession);
      clearInterval(timer);
    };
  }, [sessionUserId, addToast]);

  const logout = useCallback(async () => {
    await marketplaceService.logout();
    setCurrentUser(null);
    setRoute('landing');
    addToast({ type: 'info', title: 'Signed out', description: 'You have been logged out of CampusCart.' });
  }, [addToast]);

  const updateProfile = useCallback(
    (updates: Partial<User>) => {
      if (!currentUser) return;
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      setUsers((prev) => {
        const next = prev.map((u) => (u.id === updatedUser.id ? updatedUser : u));
        marketplaceService.persistUsers(next);
        return next;
      });
      addToast({ type: 'success', title: 'Profile updated', description: 'Your campus profile changes are saved.' });
    },
    [currentUser, addToast]
  );

  const updatePreferences = useCallback(
    (updates: Partial<User['preferences']>) => {
      if (!currentUser) return;
      const updatedUser: User = {
        ...currentUser,
        preferences: { ...currentUser.preferences, ...updates },
      };
      setCurrentUser(updatedUser);
      setUsers((prev) => {
        const next = prev.map((u) => (u.id === updatedUser.id ? updatedUser : u));
        marketplaceService.persistUsers(next);
        return next;
      });
      addToast({ type: 'success', title: 'Settings saved' });
    },
    [currentUser, addToast]
  );

  const toggleFavorite = useCallback(
    (productId: string) => {
      setFavorites((prev) => {
        const exists = prev.includes(productId);
        const next = exists ? prev.filter((id) => id !== productId) : [productId, ...prev];
        marketplaceService.persistFavorites(next);
        addToast({
          type: 'success',
          title: exists ? 'Removed from Saved Items' : 'Saved to your favorites',
        });
        return next;
      });
    },
    [addToast]
  );

  const createListing = useCallback(
    async (
      data: Omit<
        Product,
        | 'id'
        | 'sellerId'
        | 'sellerName'
        | 'sellerUniversity'
        | 'sellerAvatar'
        | 'sellerRating'
        | 'sellerVerified'
        | 'createdAt'
        | 'updatedAt'
        | 'views'
      >
    ) => {
      const seller = currentUser;
      if (!seller) throw new Error('Please sign in before creating a listing.');
      const now = new Date().toISOString();
      const newProduct: Product = {
        ...data,
        id: `prod-${Date.now()}`,
        sellerId: seller.id,
        sellerName: seller.fullName,
        sellerUniversity: seller.university,
        sellerAvatar: seller.avatarUrl,
        sellerRating: seller.rating,
        sellerVerified: seller.verified,
        createdAt: now,
        updatedAt: now,
        views: 1,
        featured: false,
      };
      const savedProduct = await marketplaceService.createProduct(newProduct);
      setProducts((prev) => {
        const next = [savedProduct, ...prev.filter((p) => p.id !== savedProduct.id)];
        marketplaceService.persistProducts(next);
        return next;
      });
      if (data.status === 'active') {
        const notif: NotificationItem = {
          id: `notif-${Date.now()}`,
          type: 'listing_approved',
          title: 'Listing published on CampusCart',
          description: `"${savedProduct.title}" is now live for students at ${seller.university}.`,
          createdAt: now,
          read: false,
          targetView: 'product-details',
          targetId: savedProduct.id,
        };
        setNotifications((prev) => {
          const next = [notif, ...prev];
          marketplaceService.persistNotifications(next);
          return next;
        });
      }
      return savedProduct;
    },
    [currentUser, users]
  );

  const updateListing = useCallback(
    async (id: string, updates: Partial<Product>) => {
      try {
        const target = products.find((p) => p.id === id);
        if (!target) throw new Error('Listing not found.');
        if (currentUser?.role !== 'admin' && target.sellerId !== currentUser?.id) {
          throw new Error('You can only modify your own listings.');
        }
        const savedProduct = await marketplaceService.updateProduct(id, updates);
        setProducts((prev) => {
          const next = prev.map((p) => (p.id === id ? savedProduct : p));
          marketplaceService.persistProducts(next);
          return next;
        });
        addToast({ type: 'success', title: 'Listing updated', description: 'Your changes are now saved to MongoDB.' });
        return true;
      } catch (error) {
        addToast({ type: 'error', title: 'Could not update listing', description: error instanceof Error ? error.message : 'Please try again.' });
        return false;
      }
    },
    [addToast, currentUser, products]
  );

  const deleteListing = useCallback(
    async (id: string) => {
      try {
        const target = products.find((p) => p.id === id);
        if (!target) throw new Error('Listing not found.');
        if (currentUser?.role !== 'admin' && target.sellerId !== currentUser?.id) {
          throw new Error('You can only delete your own listings.');
        }
        await marketplaceService.deleteProduct(id);
        setProducts((prev) => {
          const next = prev.filter((p) => p.id !== id);
          marketplaceService.persistProducts(next);
          return next;
        });
        addToast({ type: 'info', title: 'Listing deleted', description: 'The listing was removed from MongoDB.' });
      } catch (error) {
        addToast({ type: 'error', title: 'Could not delete listing', description: error instanceof Error ? error.message : 'Please try again.' });
      }
    },
    [addToast, currentUser, products]
  );

  const changeListingStatus = useCallback(
    async (id: string, status: ListingStatus) => {
      try {
        const target = products.find((p) => p.id === id);
        if (!target) throw new Error('Listing not found.');
        if (currentUser?.role !== 'admin' && target.sellerId !== currentUser?.id && status !== 'sold') {
          throw new Error('You can only change the status of your own listings.');
        }
        const savedProduct = await marketplaceService.updateProduct(id, { status });
        setProducts((prev) => {
          const next = prev.map((p) => (p.id === id ? savedProduct : p));
          marketplaceService.persistProducts(next);
          return next;
        });
        addToast({
          type: 'success',
          title: status === 'sold' ? 'Marked as Sold' : status === 'active' ? 'Listing Published' : 'Moved to Drafts',
          description: 'The change is saved to MongoDB.',
        });
      } catch (error) {
        addToast({ type: 'error', title: 'Could not update listing status', description: error instanceof Error ? error.message : 'Please try again.' });
      }
    },
    [addToast, currentUser, products]
  );

  const selectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
    setConversations((prev) => {
      const next = prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c));
      marketplaceService.persistConversations(next);
      return next;
    });
  }, []);

  const startConversationForProduct = useCallback(
    (product: Product) => {
      if (!currentUser) {
        addToast({
          type: 'info',
          title: 'Sign in to chat',
          description: 'Log in with your university email to message campus sellers.',
        });
        setRoute('login');
        return;
      }

      const existing = conversations.find(
        (c) => c.productId === product.id && c.otherUserId === product.sellerId
      );
      if (existing) {
        selectConversation(existing.id);
        setRoute('messages');
        return;
      }

      const now = new Date().toISOString();
      const newConvId = `conv-${Date.now()}`;
      const newConv: Conversation = {
        id: newConvId,
        productId: product.id,
        productTitle: product.title,
        productPrice: product.price,
        productImage: product.images[0] || '',
        participantIds: [currentUser.id, product.sellerId],
        otherUserId: product.sellerId,
        otherUserName: product.sellerName,
        otherUserUniversity: product.sellerUniversity,
        otherUserAvatar: product.sellerAvatar,
        otherUserOnline: true,
        status: 'Active Inquiry',
        lastMessage: `Started inquiry about ${product.title}`,
        lastMessageAt: now,
        unreadCount: 0,
      };
      const welcomeMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId: newConvId,
        senderId: currentUser.id,
        text: `Hi ${product.sellerName.split(' ')[0]}, is "${product.title}" still available?`,
        createdAt: now,
        read: true,
      };

      setConversations((prev) => {
        const next = [newConv, ...prev];
        marketplaceService.persistConversations(next);
        return next;
      });
      setMessages((prev) => {
        const next = [...prev, welcomeMessage];
        marketplaceService.persistMessages(next);
        return next;
      });
      setActiveConversationId(newConvId);
      setRoute('messages');
    },
    [currentUser, conversations, selectConversation, addToast]
  );

  const sendMessage = useCallback(
    (conversationId: string, text: string, imageUrl?: string) => {
      if (!currentUser || (!text.trim() && !imageUrl)) return;
      const now = new Date().toISOString();
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId: currentUser.id,
        text: text.trim(),
        imageUrl,
        createdAt: now,
        read: true,
      };
      setMessages((prev) => {
        const next = [...prev, newMsg];
        marketplaceService.persistMessages(next);
        return next;
      });
      setConversations((prev) => {
        const next = prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                lastMessage: text.trim() || 'Sent an image attachment',
                lastMessageAt: now,
                unreadCount: 0,
              }
            : c
        );
        marketplaceService.persistConversations(next);
        return next;
      });
    },
    [currentUser]
  );

  const updateConversationStatus = useCallback(
    (conversationId: string, status: Conversation['status']) => {
      setConversations((prev) => {
        const next = prev.map((c) => (c.id === conversationId ? { ...c, status } : c));
        marketplaceService.persistConversations(next);
        return next;
      });
      addToast({ type: 'success', title: `Conversation marked as ${status}` });
    },
    [addToast]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      marketplaceService.persistNotifications(next);
      return next;
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      marketplaceService.persistNotifications(next);
      return next;
    });
    addToast({ type: 'success', title: 'All notifications marked as read' });
  }, [addToast]);

  const submitReport = useCallback(
    (payload: { productId: string; reason: string; details: string }) => {
      const target = products.find((p) => p.id === payload.productId);
      if (!target) return;
      const newReport: ReportItem = {
        id: `rep-${Date.now()}`,
        productId: target.id,
        productTitle: target.title,
        productPrice: target.price,
        sellerName: target.sellerName,
        reportedBy: currentUser?.email || 'student.01@presidencyuniversity.in',
        reason: payload.reason,
        details: payload.details,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      setReports((prev) => {
        const next = [newReport, ...prev];
        marketplaceService.persistReports(next);
        return next;
      });
      addToast({
        type: 'success',
        title: 'Report submitted',
        description: 'Campus moderators will review this listing shortly.',
      });
    },
    [products, currentUser, addToast]
  );

  const resolveReport = useCallback(
    (reportId: string, action: 'Resolved' | 'Dismissed', removeProduct?: boolean) => {
      const targetReport = reports.find((r) => r.id === reportId);
      setReports((prev) => {
        const next = prev.map((r) => (r.id === reportId ? { ...r, status: action } : r));
        marketplaceService.persistReports(next);
        return next;
      });
      if (removeProduct && targetReport) {
        setProducts((prev) => {
          const next = prev.filter((p) => p.id !== targetReport.productId);
          marketplaceService.persistProducts(next);
          return next;
        });
      }
      addToast({
        type: 'success',
        title: removeProduct ? 'Listing removed & report resolved' : `Report marked as ${action}`,
      });
    },
    [reports, addToast]
  );

  const toggleUserSuspension = useCallback(
    (userId: string) => {
      setUsers((prev) => {
        const next: User[] = prev.map((u) =>
          u.id === userId ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u
        );
        marketplaceService.persistUsers(next);
        return next;
      });
      addToast({ type: 'info', title: 'User account status updated' });
    },
    [addToast]
  );

  const toggleProductFeatured = useCallback(
    (productId: string) => {
      setProducts((prev) => {
        const next = prev.map((p) => (p.id === productId ? { ...p, featured: !p.featured } : p));
        marketplaceService.persistProducts(next);
        return next;
      });
      addToast({ type: 'success', title: 'Listing showcase updated' });
    },
    [addToast]
  );

  const addCategory = useCallback(
    (name: string, description: string) => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') as CategorySlug;
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        slug,
        name: name.trim(),
        description: description.trim(),
        itemCount: 0,
        active: true,
      };
      setCategories((prev) => {
        const next = [...prev, newCat];
        marketplaceService.persistCategories(next);
        return next;
      });
      addToast({ type: 'success', title: `Category "${name}" added` });
    },
    [addToast]
  );

  const toggleCategoryActive = useCallback((categoryId: string) => {
    setCategories((prev) => {
      const next = prev.map((c) => (c.id === categoryId ? { ...c, active: !c.active } : c));
      marketplaceService.persistCategories(next);
      return next;
    });
  }, []);

  const unreadMessagesCount = useMemo(
    () => conversations.reduce((acc, c) => acc + c.unreadCount, 0),
    [conversations]
  );

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const value: AppContextValue = {
    route,
    selectedProductId,
    editingProductId,
    activeConversationId,
    currentUser,
    users,
    products,
    categories,
    favorites,
    conversations,
    messages,
    notifications,
    reviews,
    reports,
    filters,
    toasts,
    unreadMessagesCount,
    unreadNotificationsCount,
    navigate,
    setFilters,
    resetFilters,
    addToast,
    dismissToast,
    login,
    signup,
    logout,
    updateProfile,
    updatePreferences,
    toggleFavorite,
    createListing,
    updateListing,
    deleteListing,
    changeListingStatus,
    startConversationForProduct,
    selectConversation,
    sendMessage,
    updateConversationStatus,
    markNotificationRead,
    markAllNotificationsRead,
    submitReport,
    resolveReport,
    toggleUserSuspension,
    toggleProductFeatured,
    addCategory,
    toggleCategoryActive,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}
