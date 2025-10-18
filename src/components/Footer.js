import React from "react";
import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="bg-white border-t mt-10 py-6 text-center text-gray-600 text-sm">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                    <p>© {new Date().getFullYear()} SmartCollect. All rights reserved.</p>

                    <div className="flex space-x-4">
                        <Link to="/about" className="hover:text-[#00524e]">
                            About
                        </Link>
                        <Link to="/privacy" className="hover:text-[#00524e]">
                            Privacy
                        </Link>
                        <Link to="/terms" className="hover:text-[#00524e]">
                            Terms
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
