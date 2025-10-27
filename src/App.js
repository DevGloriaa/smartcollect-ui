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

// ✅ Updated Dashboard Pages
import CommunityDashboard from "./pages/CommunityDashboard";
import SmartAllowanceDashboard from "./pages/SmartAllowanceDashboard";
import EmployeePaymentDashboard from "./pages/EmployeePaymentDashboard";

import { ThemeProvider } from "./context/ThemeContext";

function AppLayout() {
    const location = useLocation();

    const dashboardPages = [
        "/dashboard",
        "/community-dashboard",
        "/smart-allowance-dashboard",
        "/employee-payment-dashboard"
    ];

    const hidePublicLayout = dashboardPages.includes(location.pathname);

    return (
        <div className="flex flex-col min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-900 dark:text-gray-100">


            {!hidePublicLayout && <Navbar />}

            <main className={`flex-grow ${!hidePublicLayout ? "pt-20" : ""}`}>
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

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/smart-allowance-dashboard"
                        element={
                            <ProtectedRoute>
                                <SmartAllowanceDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/employee-payment-dashboard"
                        element={
                            <ProtectedRoute>
                                <EmployeePaymentDashboard />
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
                </Routes>
            </main>
            {!hidePublicLayout && <Footer />}
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <Router>
                <AppLayout />
            </Router>
        </ThemeProvider>
    );
}

export default App;
