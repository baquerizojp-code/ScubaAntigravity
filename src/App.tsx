import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SpeedInsights } from "@vercel/speed-insights/react";
const Landing = lazy(() => import("./views/Landing"));
import { Analytics } from "@vercel/analytics/react";

// Lazy-loaded routes
const Login = lazy(() => import("./views/Login"));
// Signup is now part of Login page
const ForgotPassword = lazy(() => import("./views/ForgotPassword"));
const ResetPassword = lazy(() => import("./views/ResetPassword"));
const CompleteProfile = lazy(() => import("./views/CompleteProfile"));
const RegisterCenter = lazy(() => import("./views/RegisterCenter"));
const AdminLayout = lazy(() => import("@/components/AdminLayout"));
const AdminDashboard = lazy(() => import("./views/admin/Dashboard"));
const AdminTrips = lazy(() => import("./views/admin/Trips"));
const AdminTripDetail = lazy(() => import("./views/admin/TripDetail"));
const AdminBookings = lazy(() => import("./views/admin/Bookings"));
const AdminSettings = lazy(() => import("./views/admin/Settings"));
const DiverLayout = lazy(() => import("@/components/DiverLayout"));
const DiverDiscover = lazy(() => import("./views/app/Discover"));
const DiverDashboard = lazy(() => import("./views/app/Dashboard"));
const TripDetail = lazy(() => import("./views/app/TripDetail"));
const MyBookings = lazy(() => import("./views/app/MyBookings"));
const DiverProfile = lazy(() => import("./views/app/DiverProfile"));
const Explore = lazy(() => import("./views/Explore"));
const ExploreTrip = lazy(() => import("./views/ExploreTrip"));
const NotFound = lazy(() => import("./views/NotFound"));

// Super Admin
const SuperAdminLayout = lazy(() => import("@/components/SuperAdminLayout"));
const SuperAdminDashboard = lazy(() => import("./views/super-admin/Dashboard"));
const SuperAdminCenterDetail = lazy(() => import("./views/super-admin/CenterDetail"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // 1 min — data is fresh; no refetch on window focus
      gcTime: 5 * 60 * 1000,       // 5 min — keep unused cache in memory
      retry: 1,                     // one retry on network error (default 3 is excessive)
      refetchOnWindowFocus: false,  // avoids jarring refetches when the user alt-tabs back
    },
  },
});

const LazyFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ErrorBoundary>
          <Suspense fallback={<LazyFallback />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/explore/:id" element={<ExploreTrip />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/complete-profile" element={
                <ProtectedRoute skipRoleCheck>
                  <CompleteProfile />
                </ProtectedRoute>
              } />
              <Route path="/register-center" element={<RegisterCenter />} />

              {/* Super Admin routes */}
              <Route path="/super-admin" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<SuperAdminDashboard />} />
                <Route path="centers/:id" element={<SuperAdminCenterDetail />} />
              </Route>

              {/* Admin routes with shared layout */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['dive_center']}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="trips" element={<AdminTrips />} />
                <Route path="trips/:id" element={<AdminTripDetail />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Diver routes with shared layout */}
              <Route path="/app" element={
                <ProtectedRoute allowedRoles={['diver']}>
                  <DiverLayout />
                </ProtectedRoute>
              }>
                <Route index element={<DiverDashboard />} />
                <Route path="discover" element={<DiverDiscover />} />
                <Route path="trip/:id" element={<TripDetail />} />
                <Route path="bookings" element={<MyBookings />} />
                <Route path="profile" element={<DiverProfile />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
        <Analytics />
        <SpeedInsights />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
