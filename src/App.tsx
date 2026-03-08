import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import DiverLayout from "@/components/DiverLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CompleteProfile from "./pages/CompleteProfile";
import RegisterCenter from "./pages/RegisterCenter";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminTrips from "./pages/admin/Trips";
import AdminBookings from "./pages/admin/Bookings";
import AdminStaff from "./pages/admin/Staff";
import AdminSettings from "./pages/admin/Settings";
import DiverDiscover from "./pages/app/Discover";
import TripDetail from "./pages/app/TripDetail";
import MyBookings from "./pages/app/MyBookings";
// GroupChat removed
import DiverProfile from "./pages/app/DiverProfile";
import Explore from "./pages/Explore";
import ExploreTrip from "./pages/ExploreTrip";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/explore/:id" element={<ExploreTrip />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
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
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
