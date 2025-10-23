import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Savings() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) setIsAuthenticated(true);
    }, []);

    const handleGetStarted = () => {
        const token = localStorage.getItem("token");

        if (!token) {
            // ✅ Save redirect path so user returns to community dashboard after login
            localStorage.setItem("redirectAfterLogin", "/community-dashboard");
            navigate("/login");
        } else {
            navigate("/community-dashboard");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center px-6 md:px-20 py-16 bg-white text-gray-800">
            <div className="max-w-4xl w-full text-center">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
                    💰 Community Savings
                </h1>
                <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                    Empower your community or team to save together. SmartCollect’s
                    Community Savings feature lets you create transparent, automated, and
                    goal-oriented savings groups — fostering trust, growth, and
                    collaboration.
                </p>

                <div className="grid md:grid-cols-2 gap-10 text-left">
                    <div className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                            👥 Group Savings Made Simple
                        </h2>
                        <p className="text-gray-600">
                            Create and manage saving groups easily. Members contribute
                            automatically based on your defined cycle — weekly, monthly, or
                            quarterly.
                        </p>
                    </div>

                    <div className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                            💳 Auto-Contribution System
                        </h2>
                        <p className="text-gray-600">
                            Automate contributions so no one forgets to save. Every deposit is
                            recorded transparently and visible to all group members.
                        </p>
                    </div>

                    <div className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                            📜 Transparent Recordkeeping
                        </h2>
                        <p className="text-gray-600">
                            Every transaction and withdrawal is securely logged, preventing
                            disputes and ensuring full trust within your community.
                        </p>
                    </div>

                    <div className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                            🎯 Goal-Based Saving
                        </h2>
                        <p className="text-gray-600">
                            Set clear saving goals, monitor progress, and celebrate milestones
                            together — turning financial discipline into shared success.
                        </p>
                    </div>
                </div>

                <div className="mt-16">
                    <button
                        onClick={handleGetStarted}
                        className="px-10 py-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition text-lg"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Savings;
