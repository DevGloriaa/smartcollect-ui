import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

function App() {
    return (
        <Router>
            <div className="flex flex-col min-h-screen bg-gray-50">
                <Navbar />
                <main className="flex-grow pt-20">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/allowance" element={<Allowance />} />
                        <Route path="/payment" element={<Payment />} />
                        <Route path="/savings" element={<Savings />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/create" element={<Create />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/otp" element={<OTP />} />

                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
