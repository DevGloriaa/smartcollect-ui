import React from "react";
import { useNavigate } from "react-router-dom";

export default function Savings() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white px-6 py-16">
            <h1 className="text-4xl font-bold text-purple-700 mb-6">Community Savings</h1>
            <p className="text-lg text-gray-700 max-w-2xl text-center mb-8">
                Build wealth together with SmartCollect’s community savings feature — designed for groups,
                clubs, and cooperatives to save collectively with full transparency.
            </p>

            <ul className="text-left bg-white shadow-lg rounded-2xl p-6 mb-8 max-w-md space-y-3">
                <li>👥 Create group or rotating savings pools</li>
                <li>📅 Automate contributions and payouts</li>
                <li>🔍 Track contributions and balances in real time</li>
            </ul>

            <button
                onClick={() => navigate("/create")}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition"
            >
                Get Started
            </button>
        </div>
    );
}
