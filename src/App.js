import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Create from "./pages/Create";
import Dashboard from "./pages/Dashboard";
import Payment from "./pages/Payment";
import Savings from "./pages/Savings";
import Allowance from "./pages/Allowance";
import Register from "./pages/Register";
import Login from "./pages/Login";
import OTP from "./pages/OTP";
import ProtectedRoute from "./components/ProtectedRoute";
import CommunityDashboard from "./pages/CommunityDashboard";
import SmartAllowanceDashboard from "./pages/SmartAllowanceDashboard";
import EmployeePaymentDashboard from "./pages/EmployeePaymentDashboard";

function AppLayout() {
    const location = useLocation();

    const hideLayout =
        location.pathname === "/dashboard" ||
        location.pathname === "/community-dashboard" ||
        location.pathname === "/smart-allowance-dashboard" ||
        location.pathname === "/employee-payment-dashboard"; // ✅ added this

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {!hideLayout && <Navbar />}
            <main className={`flex-grow ${!hideLayout ? "pt-20" : ""}`}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/allowance" element={<Allowance />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/savings" element={<Savings />} />
                    <Route path="/create" element={<Create />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/otp" element={<OTP />} />
                    <Route path="/employee-payment-dashboard" element={<EmployeePaymentDashboard />} />

                    {/* Protected Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/community-dashboard"
                        element={
                            <ProtectedRoute>
                                <CommunityDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* ✅ Smart Allowance route */}
                    <Route
                        path="/smart-allowance-dashboard"
                        element={
                            <ProtectedRoute>
                                <SmartAllowanceDashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>
            {!hideLayout && <Footer />}
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppLayout />
        </Router>
    );
}

export default App;
