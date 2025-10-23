import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Allowance() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) setIsAuthenticated(true);
    }, []);

    const handleGetStarted = () => {
        const token = localStorage.getItem("token");

        if (!token) {

            localStorage.setItem("redirectAfterLogin", "/allowance-dashboard");
            navigate("/login");
        } else {
            navigate("/allowance-dashboard");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center px-6 md:px-20 py-16 bg-white text-gray-800">
            <div className="max-w-4xl w-full text-center">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
                    Smart Allowance
                </h1>
                <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                    SmartCollect’s Smart Allowance system helps parents, guardians, and organizations
                    automate and monitor allowances — ensuring accountability and teaching
                    responsible spending. Whether it’s weekly allowances or monthly stipends,
                    Smart Allowance makes every payment transparent and trackable.
                </p>

                <div className="grid md:grid-cols-2 gap-10 text-left">

                    <div className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                            💰 Automated Disbursements
                        </h2>
                        <p className="text-gray-600">
                            Schedule recurring allowances and send them automatically without manual follow-ups.
                            Parents and mentors can set payment frequency, limits, and reminders effortlessly.
                        </p>
                    </div>


                    <div className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                            📊 Real-Time Tracking
                        </h2>
                        <p className="text-gray-600">
                            Gain full visibility on how allowances are used. Generate spending insights and
                            encourage better financial decisions through SmartCollect’s tracking dashboard.
                        </p>
                    </div>


                    <div className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                            🔒 Secure and Transparent
                        </h2>
                        <p className="text-gray-600">
                            Every transaction is recorded securely on the blockchain — ensuring
                            trust and transparency for both senders and receivers.
                        </p>
                    </div>


                    <div className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                            👨‍👩‍👧‍👦 Perfect for Families & Groups
                        </h2>
                        <p className="text-gray-600">
                            Manage multiple dependents or team members with ease. SmartCollect allows
                            grouped payments, limits, and customizable roles for parents, admins, or mentors.
                        </p>
                    </div>
                </div>

                <div className="mt-16">
                    <button
                        onClick={handleGetStarted}
                        className="px-10 py-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition text-lg"
                    >
                        Get Started with Smart Allowance
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Allowance;
