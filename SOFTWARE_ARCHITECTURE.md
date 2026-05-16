# Le'Kiray Software Architecture & Technical Documentation

## 1. Overview
Le'Kiray is a professional multi-agent marketplace platform for vehicle and equipment rentals. It connects **Agents** (equipment owners/rental companies) with **Consumers** (renters) through a centralized **Marketplace**, all managed by a platform **Admin**.

The platform is designed with a **Multi-Tenant (Multi-Agent)** architecture, ensuring data isolation between different agents while providing a unified experience for consumers.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19 (using TypeScript for type safety)
- **Build Tool**: Vite
- **Routing**: React Router 7
- **State Management & Data Fetching**: TanStack Query (React Query) v5
- **Styling**: Tailwind CSS 4 & PostCSS
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts (for analytics and dashboards)
- **Icons**: Lucide React

### Backend & Infrastructure (BaaS)
- **Platform**: Firebase
- **Authentication**: Firebase Auth (Role-based: ADMIN, AGENT, CONSUMER)
- **Database**: Cloud Firestore (NoSQL, document-based)
- **Storage**: Firebase Storage (for general assets)
- **Serverless Logic**: Firebase Cloud Functions
- **Payments**: Stripe (Subscription management and transactions)
- **Media Management**: Cloudinary (Image uploads, transformations, and optimization)

### Cross-Platform
- **Mobile**: Capacitor (targeting Android/iOS from the same codebase)

### AI Integration
- **Engine**: Google Generative AI (@google/genai)
- **Features**: AI Assistant for agents and consumers to help with listings, searches, and support.

---

## 3. Architecture Design

### Feature-Based Modular Structure
The codebase follows a **Feature-Based Architecture**. Instead of grouping by technical type (components, hooks, pages), code is grouped by business domain (features).

**Key Directories:**
- `src/features/`: Contains self-contained modules for each business domain.
  - `admin/`: Platform-wide management, agent approval, system settings.
  - `agent/`: Dashboard, fleet management, analytics, and agent-specific profile.
  - `marketplace/`: Landing page, vehicle search, and discovery.
  - `auth/`: Login, signup, and session management.
  - `booking/`: Reservation flows and management.
  - `ai/`: AI-driven assistant components.
- `src/services/`: Centralized API/Business logic layer that interacts with Firebase.
- `src/lib/`: External library configurations (Firebase init, Cloudinary utils).
- `src/components/`: Shared UI components (Layouts, Buttons, Inputs).

### Multi-Agent Isolation
The system uses a **Single-Database, Multiple-Tenant** approach.
- **Data Partitioning**: Documents in `listings`, `bookings`, and `leads` collections are tagged with an `agentId`.
- **Filtering**: Services automatically filter queries by the authenticated `agentId` when in the Agent Dashboard.
- **Security**: Firestore Security Rules ensure that an Agent can only read/write documents where `agentId == request.auth.uid`.

---

## 4. Core Features & Workflows

### Agent Onboarding
1. **Self-Registration**: Agents sign up and provide business details.
2. **Admin Approval**: Account remains `PENDING` until an Admin reviews and approves it.
3. **Subscription Activation**: Approved agents select a subscription plan (managed via Stripe).
4. **Trial Incentives**: New agents are automatically granted a 1-month free trial upon approval.

### Fleet Management
- Agents can create and manage listings with rich metadata (make, model, year, category, location).
- Image handling is offloaded to **Cloudinary** for performance and automatic resizing.

### Marketplace Experience
- **Search & Filter**: Consumers can filter vehicles by type, location, and price.
- **Booking Flow**: Integrated booking system with status tracking (Pending, Confirmed, Completed, Cancelled).

### Analytics & Reporting
- Real-time dashboards for Agents showing leads, revenue, and fleet performance.
- Platform-level analytics for Admins to monitor growth and agent performance.

---

## 5. Data Models (Key Collections)

### Users
```typescript
{
  id: string; // Firebase UID
  email: string;
  role: 'ADMIN' | 'AGENT' | 'CONSUMER';
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
  companyName?: string;
  subscriptionTier?: 'BASIC' | 'PRO' | 'ENTERPRISE';
}
```

### Listings
```typescript
{
  id: string;
  agentId: string; // Owner reference
  make: string;
  model: string;
  pricePerDay: number;
  images: string[]; // Cloudinary public IDs
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE';
}
```

### Bookings
```typescript
{
  id: string;
  listingId: string;
  agentId: string;
  consumerId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}
```

---

## 6. Security & Authorization

### Routing Guards
- `AgentGuard`: Protects `/agent/*` routes, ensuring the user is both authenticated and has the `AGENT` role.
- `AdminGuard`: Ensures only users with the `ADMIN` role can access `/admin/*`.

### Firestore Security Rules
Rules are structured to enforce:
- **Public Read**: Marketplace listings are publicly readable.
- **Owner Write**: Only the agent who created a listing/booking can modify it.
- **Admin Overlord**: Admins have read/write access to all collections for moderation.

---

## 7. Performance & Optimization

- **React Query**: Used for intelligent caching of Firebase data, reducing unnecessary reads.
- **Cloudinary Transformations**: Images are loaded in optimized formats (WebP/AVIF) and resized on the fly based on the user's device.
- **Vite Bundling**: Optimized production builds with code-splitting by feature.
- **Tailwind CSS 4**: Utilizes the latest JIT engine for minimal CSS bundles.
