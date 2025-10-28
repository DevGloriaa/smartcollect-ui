import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

function Navbar() {
    const location = useLocation();
    const { theme, toggleTheme } = useContext(ThemeContext);

    const dashboardLinks = [
        { name: "Smart Allowance", path: "/allowance" },
        { name: "Employee Payments", path: "/payment" },
        { name: "Community Savings", path: "/savings" },
    ];

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-md fixed w-full z-50 top-0 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">

                <Link
                    to="/dashboard"
                    className="text-2xl font-bold text-[#00524e] dark:text-[#00bfa5]"
                >
                    SmartCollect
                </Link>

                <div className="hidden md:flex space-x-6 items-center">
                    {dashboardLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`font-medium transition-colors duration-300 px-3 py-1 rounded-lg ${
                                location.pathname === link.path
                                    ? "bg-[#00524e] dark:bg-[#00bfa5] text-white"
                                    : "text-gray-600 dark:text-gray-300 hover:text-[#00524e] dark:hover:text-[#00bfa5]"
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300"
                    aria-label="Toggle Theme"
                >
                    {theme === "light" ? (
                        <MoonIcon className="w-5 h-5" />
                    ) : (
                        <SunIcon className="w-5 h-5" />
                    )}
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
