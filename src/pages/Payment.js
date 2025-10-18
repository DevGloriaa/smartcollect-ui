import React from "react";
import { useNavigate } from "react-router-dom";

export default function Payment() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-6 py-16">
            <h1 className="text-4xl font-bold text-blue-700 mb-6">Employee Payments</h1>
            <p className="text-lg text-gray-700 max-w-2xl text-center mb-8">
                Simplify your company’s payroll. SmartCollect enables instant, secure, and trackable salary
                disbursements — all without traditional banking delays or paperwork.
            </p>

            <ul className="text-left bg-white shadow-lg rounded-2xl p-6 mb-8 max-w-md space-y-3">
                <li>🏦 Pay multiple employees with a single click</li>
                <li>⏱ Instant, transparent transfers</li>
                <li>📈 Real-time salary tracking and analytics</li>
            </ul>

            <button
                onClick={() => navigate("/create")}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
            >
                Get Started
            </button>
        </div>
    );
}
