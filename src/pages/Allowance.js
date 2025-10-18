import React from "react";
import { useNavigate } from "react-router-dom";

export default function Allowance() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white px-6 py-16">
            <h1 className="text-4xl font-bold text-green-700 mb-6">Smart Allowance</h1>
            <p className="text-lg text-gray-700 max-w-2xl text-center mb-8">
                Take control of how allowances are managed and distributed. With SmartCollect’s Smart
                Allowance, parents or organizations can automate and monitor periodic transfers — ensuring
                discipline, transparency, and accountability.
            </p>

            <ul className="text-left bg-white shadow-lg rounded-2xl p-6 mb-8 max-w-md space-y-3">
                <li>💰 Automate weekly or monthly allowances</li>
                <li>📊 Track usage and spending patterns</li>
                <li>👩‍👧 Teach financial discipline early</li>
            </ul>

            <button
                onClick={() => navigate("/create")}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition"
            >
                Get Started
            </button>
        </div>
    );
}
