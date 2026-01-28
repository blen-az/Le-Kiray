
// ==================== ENUMS ====================

export enum VehicleCategory {
  COMPACT = 'COMPACT',
  MID_SIZE = 'MID_SIZE',
  FAMILY = 'FAMILY',
  VAN = 'VAN',
  EARTH_MOVING = 'EARTH_MOVING'
}

export enum UserRole {
  CONSUMER = 'CONSUMER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN'
}

export enum AgentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SUSPENDED = 'SUSPENDED'
}

export enum InviteStatus {
  SENT = 'SENT',
  USED = 'USED',
  EXPIRED = 'EXPIRED'
}

// ==================== STATUS TYPES ====================

export type ListingStatus = 'draft' | 'pending_review' | 'active' | 'paused' | 'archived';
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost' | 'closed';
export type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'suspended' | 'cancelled';

// ==================== USER TYPES ====================

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  subscriptionTier?: string;
  companyName?: string;
  isApproved?: boolean;
}

// ==================== AGENT TYPES ====================

export interface AgentProfile {
  id: string;
  userId: string;
  companyName: string;
  contactPhone: string;
  contactEmail: string;
  serviceLocations: string[];
  businessAddress?: string;
  logoUrl?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== LISTING TYPES ====================

export interface Listing {
  id: string;
  agentId: string;
  agentName: string;
  category: VehicleCategory;
  make: string;
  model: string;
  year: number;
  imageUrls: string[];
  dailyRate?: number;      // Required for non-EARTH_MOVING
  weeklyRate?: number;     // Optional for non-EARTH_MOVING
  location: string;
  specifications: string[];
  description: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

// Legacy Vehicle type for backward compatibility
export interface Vehicle {
  id: string;
  category: VehicleCategory;
  make: string;
  model: string;
  year: number;
  imageUrl: string;
  dailyRate?: number;
  agentId: string;
  agentName: string;
  location: string;
  specifications: string[];
  description: string;
  status: 'available' | 'booked' | 'maintenance' | 'suspended';
}

export interface Availability {
  id: string;
  listingId: string;
  blockedDates: string[];      // ISO date strings
  maintenanceDates: string[];  // ISO date strings
}

// ==================== BOOKING TYPES (Cars/Vans ONLY) ====================

export interface Booking {
  id: string;
  listingId: string;
  listingName: string;
  agentId: string;
  consumerId: string;
  consumerName: string;
  consumerEmail: string;
  consumerPhone: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

// ==================== QUOTE REQUEST TYPES (Earth-Moving ONLY) ====================

export interface QuoteRequest {
  id: string;
  listingId: string;
  listingName: string;
  agentId: string;
  consumerId: string;
  consumerName: string;
  consumerEmail: string;
  consumerPhone: string;
  projectLocation: string;
  duration: string;
  scopeOfWork: string;
  requestedStartDate?: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

// Legacy Lead type for backward compatibility
export interface Lead {
  id: string;
  vehicleId: string;
  vehicleName: string;
  agentId: string;
  consumerId: string;
  consumerName: string;
  location: string;
  duration: string;
  scopeOfWork: string;
  status: 'new' | 'responded' | 'archived';
  createdAt: string;
}

// ==================== SUBSCRIPTION TYPES ====================

export interface SubscriptionPlan {
  id: string;
  name: string;
  maxVehicles: number;
  monthlyFee: number;
  category: 'CARS_VANS' | 'EARTH_MOVING';
}

export interface Subscription {
  id: string;
  agentId: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  maxVehicles: number;
  activeListingCount: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== INVITE & ONBOARDING TYPES ====================

export interface AgentInvite {
  id: string;
  agentId: string;
  email: string;
  token: string;
  status: InviteStatus;
  expiresAt: string;
  createdBy: string; // Admin ID
  createdAt: string;
  usedAt?: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  agentId?: string;
  action: 'CREATE_AGENT' | 'APPROVE_AGENT' | 'SUSPEND_AGENT' | 'RESEND_INVITE' | 'AGENT_ACTIVATED';
  timestamp: string;
  notes?: string;
}

// ==================== UTILITY TYPES ====================

// Helper to check if category is bookable (cars/vans)
export const isBookableCategory = (category: VehicleCategory): boolean => {
  return category !== VehicleCategory.EARTH_MOVING;
};

// Helper to check if category requires quote (earth-moving)
export const isQuoteCategory = (category: VehicleCategory): boolean => {
  return category === VehicleCategory.EARTH_MOVING;
};
