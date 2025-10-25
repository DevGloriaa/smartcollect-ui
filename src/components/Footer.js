import React from "react";
import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-10 py-6 text-center text-gray-600 dark:text-gray-200 text-sm transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                    <p>© {new Date().getFullYear()} SmartCollect. All rights reserved.</p>

                    <div className="flex space-x-4">
                        <Link to="/about" className="hover:text-[#00524e] dark:hover:text-[#00bfa5] transition-colors">
                            About
                        </Link>
                        <Link to="/privacy" className="hover:text-[#00524e] dark:hover:text-[#00bfa5] transition-colors">
                            Privacy
                        </Link>
                        <Link to="/terms" className="hover:text-[#00524e] dark:hover:text-[#00bfa5] transition-colors">
                            Terms
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
