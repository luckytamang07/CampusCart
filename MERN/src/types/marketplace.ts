export type CategorySlug =
  | 'electronics'
  | 'books'
  | 'furniture'
  | 'clothing'
  | 'accessories'
  | 'sports'
  | 'notes'
  | 'other';

export type ProductCondition = 'New' | 'Like New' | 'Good' | 'Fair';

export type ListingStatus = 'active' | 'sold' | 'draft';

export type ContactPreference = 'In-App Chat' | 'Chat & Phone' | 'University Email';

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  university: string;
  campusLocation: string;
  avatarUrl?: string;
  role: UserRole;
  verified: boolean;
  memberSince: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  status: 'active' | 'suspended';
  preferences: {
    notifyMessages: boolean;
    notifyInterest: boolean;
    notifyListingUpdates: boolean;
    notifySystem: boolean;
    showPhoneOnProfile: boolean;
    showOnlineStatus: boolean;
    campusOnlyVisibility: boolean;
  };
}

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  description: string;
  itemCount: number;
  active: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: CategorySlug;
  condition: ProductCondition;
  campusLocation: string;
  university: string;
  images: string[];
  status: ListingStatus;
  sellerId: string;
  sellerName: string;
  sellerUniversity: string;
  sellerAvatar?: string;
  sellerRating: number;
  sellerVerified: boolean;
  contactPreference: ContactPreference;
  createdAt: string;
  updatedAt: string;
  views: number;
  featured?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImage: string;
  participantIds: string[];
  otherUserId: string;
  otherUserName: string;
  otherUserUniversity: string;
  otherUserAvatar?: string;
  otherUserOnline: boolean;
  status: 'Active Inquiry' | 'Meetup Scheduled' | 'Completed';
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export type NotificationType =
  | 'new_message'
  | 'product_interest'
  | 'listing_approved'
  | 'product_sold'
  | 'listing_update'
  | 'system';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  targetView?: AppRoute;
  targetId?: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerUniversity: string;
  rating: number;
  comment: string;
  productTitle: string;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  sellerName: string;
  reportedBy: string;
  reason: string;
  details: string;
  status: 'Pending' | 'Resolved' | 'Dismissed';
  createdAt: string;
}

export type AppRoute =
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'browse'
  | 'product-details'
  | 'sell'
  | 'my-listings'
  | 'saved'
  | 'messages'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'admin';

export interface ProductFilters {
  query: string;
  category: CategorySlug | 'all';
  condition: ProductCondition | 'all';
  campus: string;
  minPrice: string;
  maxPrice: string;
  datePosted: 'all' | '24h' | '7d' | '30d';
  sort: 'newest' | 'price_asc' | 'price_desc';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}
