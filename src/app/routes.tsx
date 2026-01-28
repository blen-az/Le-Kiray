import React from 'react';
import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import { User, UserRole } from '../types';
import AppShell from '../components/layout/AppShell';
import Landing from '../features/marketplace/pages/Landing';
import MarketplaceHome from '../features/marketplace/pages/MarketplaceHome';
import AdminDashboardOverview from '../features/admin/pages/AdminDashboardOverview';
import AdminCreateAgentPage from '../features/admin/pages/AdminCreateAgentPage';
import AdminAgentManagement from '../features/admin/pages/AdminAgentManagement';
import AdminListingModeration from '../features/admin/pages/AdminListingModeration';
import AdminSubscriptionOversight from '../features/admin/pages/AdminSubscriptionOversight';
import AdminDisputesReports from '../features/admin/pages/AdminDisputesReports';
import AdminAuditLogs from '../features/admin/pages/AdminAuditLogs';
import AdminSystemSettings from '../features/admin/pages/AdminSystemSettings';

// Agent Pages
import AgentGuard from '../features/agent/guards/AgentGuard';
import AgentLayout from '../features/agent/components/AgentLayout';
import AgentDashboard from '../features/agent/pages/AgentDashboard';
import AgentActivationPage from '../features/agent/pages/AgentActivationPage';
import FleetManagement from '../features/agent/pages/FleetManagement';
import ListingForm from '../features/agent/pages/ListingForm';
import BookingsPage from '../features/agent/pages/BookingsPage';
import LeadsPage from '../features/agent/pages/LeadsPage';
import SubscriptionPage from '../features/agent/pages/SubscriptionPage';
import AnalyticsPage from '../features/agent/pages/AnalyticsPage';
import AgentProfilePage from '../features/agent/pages/AgentProfilePage';
import LoginPage from '../features/auth/pages/LoginPage';
import SignUpPage from '../features/auth/pages/SignUpPage';

// Helper to create routes with user context
export const createRoutes = (
  currentUser: User | null,
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>
): RouteObject[] => {

  return [
    {
      path: '/',
      element: <AppShell currentUser={currentUser} onUserChange={setCurrentUser} />,
      children: [
        {
          index: true,
          element: <Landing />,
        },
        {
          path: 'marketplace',
          element: <MarketplaceHome />,
        },
        {
          path: 'admin',
          element: <AdminDashboardOverview />,
        },
        {
          path: 'admin/agents',
          element: <AdminAgentManagement />,
        },
        {
          path: 'admin/listings',
          element: <AdminListingModeration />,
        },
        {
          path: 'admin/subscriptions',
          element: <AdminSubscriptionOversight />,
        },
        {
          path: 'admin/disputes',
          element: <AdminDisputesReports />,
        },
        {
          path: 'admin/audit-logs',
          element: <AdminAuditLogs />,
        },
        {
          path: 'admin/settings',
          element: <AdminSystemSettings />,
        },
        {
          path: 'admin/agents/new',
          element: <AdminCreateAgentPage />,
        },
        {
          path: 'login',
          element: <LoginPage />,
        },
        {
          path: 'signup',
          element: <SignUpPage />,
        },
        {
          path: 'agent/activate',
          element: <AgentActivationPage />,
        },
      ],
    },
    // Agent Routes (Protected)
    {
      path: '/agent',
      element: (
        <AgentGuard user={currentUser}>
          <AgentLayout user={currentUser!} onLogout={() => setCurrentUser(null)} />
        </AgentGuard>
      ),
      children: [
        {
          index: true,
          element: <Navigate to="dashboard" replace />,
        },
        {
          path: 'dashboard',
          element: currentUser ? <AgentDashboard user={currentUser} /> : null,
        },
        {
          path: 'fleet',
          element: currentUser ? <FleetManagement agentId={currentUser.id} /> : null,
        },
        {
          path: 'listings/new',
          element: currentUser ? <ListingForm agentId={currentUser.id} agentName={currentUser.name} /> : null,
        },
        {
          path: 'listings/:id/edit',
          element: currentUser ? <ListingForm agentId={currentUser.id} agentName={currentUser.name} /> : null,
        },
        {
          path: 'bookings',
          element: currentUser ? <BookingsPage agentId={currentUser.id} /> : null,
        },
        {
          path: 'leads',
          element: currentUser ? <LeadsPage agentId={currentUser.id} /> : null,
        },
        {
          path: 'subscription',
          element: currentUser ? <SubscriptionPage agentId={currentUser.id} /> : null,
        },
        {
          path: 'analytics',
          element: currentUser ? <AnalyticsPage agentId={currentUser.id} /> : null,
        },
        {
          path: 'profile',
          element: currentUser ? <AgentProfilePage user={currentUser} /> : null,
        },
      ],
    },
  ];
};
