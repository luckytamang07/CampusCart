import {
  CATEGORIES,
  SEED_CONVERSATIONS,
  SEED_MESSAGES,
  SEED_NOTIFICATIONS,
  SEED_PRODUCTS,
  SEED_REPORTS,
  SEED_REVIEWS,
  SEED_USERS,
} from '../data/seedData';
import {
  Category,
  Conversation,
  Message,
  NotificationItem,
  Product,
  ReportItem,
  Review,
  User,
} from '../types/marketplace';
import { isValidUniversityEmail } from '../utils/formatters';

/**
 * API-Ready Marketplace Service Layer
 * -----------------------------------
 * Structured to mirror REST endpoints (/api/auth, /api/products, /api/listings,
 * /api/favorites, /api/messages, /api/notifications, /api/admin) for seamless
 * connection to the Node.js + Express + MongoDB backend.
 */

const STORAGE_KEYS = {
  USERS: 'campuscart_users_v5_presidency',
  CURRENT_USER_ID: 'campuscart_current_user_v5_presidency',
  AUTH_TOKEN: 'campuscart_auth_token_jwt_v5_presidency',
  PRODUCTS: 'campuscart_products_v5_presidency',
  CATEGORIES: 'campuscart_categories_v5_presidency',
  FAVORITES: 'campuscart_favorites_v5_presidency',
  CONVERSATIONS: 'campuscart_conversations_v5_presidency',
  MESSAGES: 'campuscart_messages_v5_presidency',
  NOTIFICATIONS: 'campuscart_notifications_v5_presidency',
  REVIEWS: 'campuscart_reviews_v5_presidency',
  REPORTS: 'campuscart_reports_v5_presidency',
};

const API_BASE_URL = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL || '/api';

function loadOrSeed<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw) as T;
    }
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  } catch {
    return fallback;
  }
}

function saveState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota issues in private browsing
  }
}

export const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------- JWT session helpers ----------------
// The backend signs the token at login. The browser keeps it and sends it with every API call.
// (The browser cannot verify the signature - only the server can - so it only reads the expiry.)

/** Fired when the server rejects our token (expired/invalid) so the app can sign the user out. */
export const SESSION_EXPIRED_EVENT = 'campuscart:session-expired';

interface TokenPayload {
  sub: string;
  role?: string;
  exp: number;
}

function getToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch {
    return null;
  }
}

function setToken(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch {
    // ignore storage problems (private browsing)
  }
}

function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  } catch {
    // ignore
  }
}

function decodeToken(token: string | null): TokenPayload | null {
  if (!token) return null;
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as TokenPayload;
    return typeof payload.sub === 'string' && typeof payload.exp === 'number' ? payload : null;
  } catch {
    return null;
  }
}

const isExpired = (payload: TokenPayload | null): boolean =>
  !payload || payload.exp * 1000 <= Date.now();

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const SERVER_UNREACHABLE_MESSAGE =
  'Cannot reach the CampusCart server. Start the backend (cd backend && npm run dev) and make sure MongoDB is running.';

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { headers, ...rest } = options;
  const token = getToken();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
    });
  } catch {
    throw new Error(SERVER_UNREACHABLE_MESSAGE);
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    // A 401 while holding a token means it expired or is no longer valid: end the session.
    const isLoginAttempt = path.startsWith('/auth/login') || path.startsWith('/auth/register');
    if (response.status === 401 && token && !isLoginAttempt) {
      clearSession();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    throw new ApiError(payload.message || 'API request failed', response.status);
  }
  return payload as T;
}

/**
 * Finishes a successful login/signup: keeps the JWT and the user's profile.
 * The server decides identity and role. On login the browser's own saved profile
 * (e.g. edits made in Settings) is kept; on signup the fresh profile replaces any stale one.
 */
function completeSignIn(token: string, serverUser: User, preferLocalProfile: boolean): User {
  const users = loadOrSeed<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
  const local = users.find(
    (u) => u.id === serverUser.id || u.email.toLowerCase() === serverUser.email.toLowerCase()
  );
  const base = preferLocalProfile && local ? local : serverUser;
  const user: User = { ...base, id: serverUser.id, email: serverUser.email, role: serverUser.role };

  if (user.status === 'suspended') {
    throw new Error('This account has been suspended by campus moderators.');
  }

  const others = users.filter((u) => u.id !== user.id && u.email.toLowerCase() !== user.email.toLowerCase());
  saveState(STORAGE_KEYS.USERS, [user, ...others]);
  setToken(token);
  return user;
}

export const marketplaceService = {
  apiBaseUrl: API_BASE_URL,

  async login(email: string, password: string): Promise<User> {
    const payload = await apiRequest<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
    });
    return completeSignIn(payload.token, payload.user, true);
  },

  async signup(payload: {
    fullName: string;
    email: string;
    phone: string;
    university: string;
    password: string;
    avatarUrl?: string;
  }): Promise<User> {
    const fullName = payload.fullName.trim();
    const phone = payload.phone.trim();
    if (!/^[A-Za-z ]+$/.test(fullName)) {
      throw new Error('Name must contain letters and spaces only.');
    }
    if (!/^\d{10}$/.test(phone)) {
      throw new Error('Phone number must contain exactly 10 digits.');
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(payload.password)) {
      throw new Error('Password must contain at least 6 characters, including at least one letter and one number.');
    }
    if (!isValidUniversityEmail(payload.email)) {
      throw new Error(
        'Email must follow name.rollnumber@presidencyuniversity.in (e.g. navya.46@presidencyuniversity.in).'
      );
    }
    const draftProfile: User = {
      id: '',
      fullName,
      email: payload.email.trim().toLowerCase(),
      phone,
      university: 'Presidency University, Bangalore',
      campusLocation: 'Admin Block',
      avatarUrl: payload.avatarUrl,
      role: 'student',
      verified: false,
      memberSince: 'Nov 2026',
      rating: 5.0,
      reviewCount: 0,
      soldCount: 0,
      status: 'active',
      preferences: {
        notifyMessages: true,
        notifyInterest: true,
        notifyListingUpdates: true,
        notifySystem: true,
        showPhoneOnProfile: false,
        showOnlineStatus: true,
        campusOnlyVisibility: true,
      },
    };
    // The server checks the rules again, stores the account in MongoDB (password hashed) and returns a JWT.
    const result = await apiRequest<{ success: boolean; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName,
        email: payload.email.trim(),
        phone,
        password: payload.password,
        profile: draftProfile,
      }),
    });
    return completeSignIn(result.token, result.user, false);
  },

  async logout(): Promise<void> {
    clearSession();
  },

  // Restores the session only while a JWT is stored and has not expired.
  getCurrentUser(): User | null {
    const payload = decodeToken(getToken());
    if (!payload || isExpired(payload)) {
      clearSession();
      return null;
    }
    const users = loadOrSeed<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
    const user = users.find((u) => u.id === payload.sub);
    // The saved profile must match the token (a role edited in dev tools is rejected).
    if (!user || user.status === 'suspended' || (payload.role && payload.role !== user.role)) {
      clearSession();
      return null;
    }
    return user;
  },

  // True while the stored JWT exists and is not past its expiry time.
  isSessionValid(): boolean {
    return !isExpired(decodeToken(getToken()));
  },

  // Asks the server to confirm the JWT is still valid (signature, expiry, account active).
  // A rejected token ends the session through SESSION_EXPIRED_EVENT. Offline = assume still valid.
  async verifySession(): Promise<boolean> {
    if (!getToken()) return false;
    try {
      await apiRequest('/auth/me');
      return true;
    } catch (error) {
      return !(error instanceof ApiError && error.status === 401);
    }
  },

  // Raw JWT for the Authorization header.
  getAuthToken(): string | null {
    return getToken();
  },

  getInitialSnapshot() {
    return {
      users: loadOrSeed<User[]>(STORAGE_KEYS.USERS, SEED_USERS),
      products: loadOrSeed<Product[]>(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS),
      categories: loadOrSeed<Category[]>(STORAGE_KEYS.CATEGORIES, CATEGORIES),
      favorites: loadOrSeed<string[]>(STORAGE_KEYS.FAVORITES, ['prod-101', 'prod-104']),
      conversations: loadOrSeed<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, SEED_CONVERSATIONS),
      messages: loadOrSeed<Message[]>(STORAGE_KEYS.MESSAGES, SEED_MESSAGES),
      notifications: loadOrSeed<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS),
      reviews: loadOrSeed<Review[]>(STORAGE_KEYS.REVIEWS, SEED_REVIEWS),
      reports: loadOrSeed<ReportItem[]>(STORAGE_KEYS.REPORTS, SEED_REPORTS),
    };
  },

  async fetchProducts(): Promise<Product[]> {
    const payload = await apiRequest<{ success: boolean; data: Product[] }>('/products');
    return payload.data || [];
  },

  async createProduct(product: Product): Promise<Product> {
    const payload = await apiRequest<{ success: boolean; data: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    return payload.data;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const payload = await apiRequest<{ success: boolean; data: Product }>(`/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return payload.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await apiRequest<{ success: boolean }>(`/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  async seedProductsIfEmpty(products: Product[]): Promise<Product[]> {
    const remote = await this.fetchProducts();
    if (remote.length > 0) return remote;
    const payload = await apiRequest<{ success: boolean; data: Product[] }>('/products/bulk', {
      method: 'POST',
      body: JSON.stringify({ products }),
    });
    return payload.data || products;
  },

  persistUsers(users: User[]) { saveState(STORAGE_KEYS.USERS, users); },
  persistProducts(products: Product[]) { saveState(STORAGE_KEYS.PRODUCTS, products); },
  persistCategories(categories: Category[]) { saveState(STORAGE_KEYS.CATEGORIES, categories); },
  persistFavorites(favorites: string[]) { saveState(STORAGE_KEYS.FAVORITES, favorites); },
  persistConversations(conversations: Conversation[]) { saveState(STORAGE_KEYS.CONVERSATIONS, conversations); },
  persistMessages(messages: Message[]) { saveState(STORAGE_KEYS.MESSAGES, messages); },
  persistNotifications(notifications: NotificationItem[]) { saveState(STORAGE_KEYS.NOTIFICATIONS, notifications); },
  persistReports(reports: ReportItem[]) { saveState(STORAGE_KEYS.REPORTS, reports); },
};
