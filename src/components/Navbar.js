import React from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar({ isLoggedIn = false }) {
    const location = useLocation();

    const links = [
        { name: "Home", path: "/" },
        { name: "Smart Allowance", path: "/allowance" },
        { name: "Employee Payments", path: "/payment" },
        { name: "Community Savings", path: "/savings" },
    ];

    return (
        <nav className="bg-white shadow-md fixed w-full z-50 top-0">
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-[#00524e]">
                    SmartCollect
                </Link>

                <div className="hidden md:flex space-x-6">
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`font-medium transition-colors ${
                                location.pathname === link.path
                                    ? "text-[#00a896]"
                                    : "text-gray-700 hover:text-[#00524e]"
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}

                    {/* Dashboard only if logged in */}
                    {isLoggedIn && (
                        <Link
                            to="/dashboard"
                            className={`font-medium transition-colors ${
                                location.pathname === "/dashboard"
                                    ? "text-[#00a896]"
                                    : "text-gray-700 hover:text-[#00524e]"
                            }`}
                        >
                            Dashboard
                        </Link>
                    )}
                </div>

                {!isLoggedIn && (
                    <Link
                        to="/register"
                        className="hidden md:inline-block bg-[#00524e] text-white px-5 py-2 rounded-full hover:bg-[#007e75] transition"
                    >
                        Get Started
                    </Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
