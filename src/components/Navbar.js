import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext"; // ✅ Import ThemeContext
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline"; // optional, for icons

function Navbar({ isLoggedIn = false }) {
    const location = useLocation();
    const { theme, toggleTheme } = useContext(ThemeContext); // ✅ Use the theme context

    const links = [
        { name: "Home", path: "/" },
        { name: "Smart Allowance", path: "/allowance" },
        { name: "Employee Payments", path: "/payment" },
        { name: "Community Savings", path: "/savings" },
    ];

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full z-50 top-0 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                <Link
                    to="/"
                    className="text-2xl font-bold text-[#00524e] dark:text-[#00bfa5] transition-colors duration-300"
                >
                    SmartCollect
                </Link>

                <div className="hidden md:flex space-x-6 items-center">
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`font-medium transition-colors duration-300 ${
                                location.pathname === link.path
                                    ? "text-[#00a896]"
                                    : "text-gray-700 dark:text-gray-200 hover:text-[#00524e] dark:hover:text-[#00bfa5]"
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}

                    {/* Dashboard only if logged in */}
                    {isLoggedIn && (
                        <Link
                            to="/dashboard"
                            className={`font-medium transition-colors duration-300 ${
                                location.pathname === "/dashboard"
                                    ? "text-[#00a896]"
                                    : "text-gray-700 dark:text-gray-200 hover:text-[#00524e] dark:hover:text-[#00bfa5]"
                            }`}
                        >
                            Dashboard
                        </Link>
                    )}

                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="ml-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
                        aria-label="Toggle Theme"
                    >
                        {theme === "light" ? (
                            <MoonIcon className="w-5 h-5" />
                        ) : (
                            <SunIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {!isLoggedIn && (
                    <Link
                        to="/register"
                        className="hidden md:inline-block bg-[#00524e] dark:bg-[#00bfa5] text-white px-5 py-2 rounded-full hover:bg-[#007e75] dark:hover:bg-[#008e7c] transition-colors duration-300"
                    >
                        Get Started
                    </Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
