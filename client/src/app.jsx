import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Hotel from "./pages/Hotel";
import Food from "./pages/Food";
import Spa from "./pages/Spa";
import Adventure from "./pages/Adventure";
import Home from "./pages/Home";
import MerchantSignup from "./pages/MerchantSignup";
import CustomerDashboard from "./pages/CustomerDashboard";
import MerchantDashboard from "./pages/MerchantDashboard";
import AdminLayout from "./components/AdminLayout";
import AdminOverview from "./pages/AdminOverview";
import AdminSettings from "./pages/AdminSettings";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminDealManagement from "./pages/AdminDealManagement";
import AdminBusinessManagement from "./pages/AdminBusinessManagement";

import AdminLogin from "./pages/AdminLogin";
import DealDetail from "./pages/DealDetail";
import Cart from "./pages/Cart";
import Forbidden from "./pages/Forbidden";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import ProtectedRoute from "./components/ProtectedRoute";
import OTPVerify from "./pages/OTPVerify";
import About from "./pages/About";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/merchant-register" element={<MerchantSignup />} />
        <Route path="/verify-otp" element={<OTPVerify />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <CustomerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/merchant-dashboard" element={
          <ProtectedRoute requiredRole="business">
            <MerchantDashboard />
          </ProtectedRoute>
        } />

        <Route path="/hotels" element={<Hotel />} />
        <Route path="/home" element={<Home />} />
        <Route path="/food" element={<Food />} />
        <Route path="/spa" element={<Spa />} />
        <Route path="/adventure" element={<Adventure />} />
        <Route path="/deals/:dealId" element={<DealDetail />} />
        <Route path="/deal/:dealId" element={<DealDetail />} />
        <Route path="/hotel/:dealId" element={<DealDetail />} />
        <Route path="/cart" element={<Cart />} />
        
        {/* Protected Checkout Route */}
        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />

        <Route path="/403" element={<Forbidden />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />

        {/* Admin Public Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <Routes>
                <Route path="overview" element={<AdminOverview />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="users" element={<AdminUserManagement />} />
                <Route path="deals" element={<AdminDealManagement />} />
                <Route path="businesses" element={<AdminBusinessManagement />} />
                <Route path="*" element={<AdminOverview />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App;
