# Le'Kiray Multi-Agent Architecture

## Current Implementation

### 1. **Agent Isolation** ✅
- Each agent has their own dashboard at `/agent/*`
- All data is filtered by `agentId`:
  - Listings: Only see own listings
  - Bookings: Only see bookings for own listings
  - Leads: Only see leads for own equipment
  - Analytics: Only see own metrics

### 2. **Data Models** ✅
**Users Collection:**
```
{
  id: string (Firebase UID)
  email: string
  name: string
  role: "AGENT" | "CONSUMER" | "ADMIN"
  companyName: string
  status: "PENDING" | "APPROVED" | "SUSPENDED"
  createdAt: string
  updatedAt: string
}
```

**Listings Collection:**
```
{
  id: string
  agentId: string ← Filters data to specific agent
  agentName: string
  category: string
  make: string
  model: string
  ...
}
```

**Bookings Collection:**
```
{
  id: string
  listingId: string
  agentId: string ← Links to agent's listings
  consumerId: string
  ...
}
```

### 3. **Current Routes** ✅
- `/agent/dashboard` - Agent dashboard
- `/agent/fleet` - Fleet management (filtered by agentId)
- `/agent/listings/new` - Create listing (owns the listing)
- `/agent/bookings` - Bookings for agent's listings
- `/agent/leads` - Leads for agent's equipment
- `/agent/analytics` - Agent-specific metrics
- `/agent/subscription` - Agent subscription tier

### 4. **Security** ⚠️ (Needs Rules)
Firestore rules should enforce:
- Agents can only read/write their own documents
- Consumers cannot access agent dashboard
- Admins can view all data

```javascript
// Firestore Rules for Agent Isolation
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Agent can only access own listings
    match /listings/{listingId} {
      allow read: if request.auth != null;  // Consumers can browse
      allow write: if resource.data.agentId == request.auth.uid;  // Only owner can edit
    }
    
    // Agent can only see own bookings
    match /bookings/{bookingId} {
      allow read: if request.auth.uid == resource.data.agentId || 
                     request.auth.uid == resource.data.consumerId;
      allow write: if request.auth.uid == resource.data.agentId ||
                     request.auth.uid == resource.data.consumerId;
    }
    
    // Users can only read own profile
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## Features Working for Multiple Agents

✅ **Admin can create multiple agents** - Each gets unique invite link  
✅ **Agents isolated by ID** - Each sees only their data  
✅ **Marketplace is shared** - All consumers see all listings from all agents  
✅ **Subscription tracking** - Per-agent subscription tier  
✅ **Analytics** - Per-agent metrics and reporting  

## What Needs Implementation

### 1. **Agent Team Management** ❌
Currently: Single agent per account  
Needed: Allow agents to invite team members
- Invite sub-users to same company
- Role-based access (Owner, Manager, Coordinator)
- Shared fleet across team

### 2. **Firestore Security Rules** ⚠️
Currently: Permissive rules (allow all auth users)  
Needed: Strict agent-isolation rules (see above)

### 3. **Admin Analytics** ❌
Dashboard shows agents, but needs:
- Revenue per agent
- Listing performance by agent
- Booking completion rates
- Platform growth metrics

### 4. **Agent Approval Workflow** ⚠️
Status exists but not enforced:
- PENDING agents should not be able to publish
- Subscription check before publishing
- Auto-suspend on policy violations

### 5. **Multi-Tenant Reporting** ❌
Need:
- Bulk exports for admin
- Agent-specific invoicing
- Performance reports per agent

## How Consumers See Multiple Agents

1. Consumer goes to `/marketplace`
2. Searches/filters vehicles
3. Gets results from ALL agents
4. Can book from any agent
5. Sees agent company name in listing

## How Agents Stay Isolated

```
Agent A logs in:
- currentUser.id = "agent_A_uid"
- Dashboard loads with agentId = "agent_A_uid"
- All queries filtered by agentId
- Can only see own listings, bookings, etc.

Agent B logs in:
- currentUser.id = "agent_B_uid"
- Dashboard loads with agentId = "agent_B_uid"
- All queries filtered by agentId
- Sees completely different data

Consumer logs in:
- currentUser.id = "consumer_uid"
- Marketplace shows listings from ALL agents
- Can book from any agent
- Only sees own bookings
```

## Scale Considerations

Current architecture supports:
- **100+ agents** easily with proper indexing
- **1000+ agents** with read replicas and caching
- **Unlimited consumers** across all agents

Bottlenecks to watch:
1. `/marketplace` query with many listings (add pagination)
2. Agent analytics queries (add aggregation function)
3. Admin dashboard with 100+ agents (add infinite scroll)

## To-Do for Production

- [ ] Implement strict Firestore security rules
- [ ] Add subscription enforcement before publishing
- [ ] Build agent team management
- [ ] Add admin metrics dashboard
- [ ] Implement audit logging for all agent actions
- [ ] Add rate limiting per agent
- [ ] Build agent API keys for third-party integrations
- [ ] Add agent notification preferences
