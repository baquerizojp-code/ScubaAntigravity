import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";

// Lazy-loaded routes
const Login = lazy(() => import("./pages/Login"));
// Signup is now part of Login page
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const CompleteProfile = lazy(() => import("./pages/CompleteProfile"));
const RegisterCenter = lazy(() => import("./pages/RegisterCenter"));
const AdminLayout = lazy(() => import("@/components/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminTrips = lazy(() => import("./pages/admin/Trips"));
const AdminBookings = lazy(() => import("./pages/admin/Bookings"));
const AdminStaff = lazy(() => import("./pages/admin/Staff"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const DiverLayout = lazy(() => import("@/components/DiverLayout"));
const DiverDiscover = lazy(() => import("./pages/app/Discover"));
const TripDetail = lazy(() => import("./pages/app/TripDetail"));
const MyBookings = lazy(() => import("./pages/app/MyBookings"));
const DiverProfile = lazy(() => import("./pages/app/DiverProfile"));
const Explore = lazy(() => import("./pages/Explore"));
const ExploreTrip = lazy(() => import("./pages/ExploreTrip"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

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
        <BrowserRouter>
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

              {/* Admin routes with shared layout */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['dive_center_admin', 'dive_center_staff']}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="trips" element={<AdminTrips />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="staff" element={<AdminStaff />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Diver routes with shared layout */}
              <Route path="/app" element={
                <ProtectedRoute allowedRoles={['diver']}>
                  <DiverLayout />
                </ProtectedRoute>
              }>
                <Route path="discover" element={<DiverDiscover />} />
                <Route path="trip/:id" element={<TripDetail />} />
                <Route path="bookings" element={<MyBookings />} />
                <Route path="profile" element={<DiverProfile />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
