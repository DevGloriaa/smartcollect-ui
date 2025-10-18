import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Create from "./pages/Create";
import Dashboard from "./pages/Dashboard";
import Allowance from "./pages/Allowance";
import Payment from "./pages/Payment";
import Savings from "./pages/Savings";


export default function App() {
    return (
        <Router>
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow p-6">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/create" element={<Create />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/allowance" element={<Allowance />} />
                        <Route path="/payment" element={<Payment />} />
                        <Route path="/savings" element={<Savings />} />

                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}
