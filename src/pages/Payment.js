import React from "react";
import { Link } from "react-router-dom";

function Payment() {
    return (
        <div className="flex flex-col items-center justify-center px-6 md:px-20 py-16 bg-white text-gray-800">
            <div className="max-w-4xl w-full text-center">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
                    Employee Payments
                </h1>
                <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                    Simplify payroll with SmartCollect’s Employee Payments system. Automate salary
                    disbursements, manage employee accounts, and maintain real-time transparency —
                    all from a secure, blockchain-powered platform.
                </p>

                <div className="grid md:grid-cols-2 gap-10 text-left">
                    <div className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900">⚡ Automated Payroll</h2>
                        <p className="text-gray-600">
                            Schedule salary payments to employees on any interval — weekly, bi-weekly, or monthly —
                            without manual transfers or errors.
                        </p>
                    </div>

                    <div className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900">🧾 Payment Records</h2>
                        <p className="text-gray-600">
                            Keep detailed payment history for every employee. Easily export data for accounting
                            and compliance purposes.
                        </p>
                    </div>

                    <div className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900">🔐 Blockchain Security</h2>
                        <p className="text-gray-600">
                            Each payment is logged securely on-chain — guaranteeing proof of payment,
                            authenticity, and zero manipulation.
                        </p>
                    </div>

                    <div className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900">📈 Payroll Analytics</h2>
                        <p className="text-gray-600">
                            Get a visual breakdown of salaries, bonuses, and deductions in one simple dashboard.
                            Make smarter HR and finance decisions.
                        </p>
                    </div>
                </div>

                <div className="mt-16">
                    <Link
                        to="/create"
                        className="px-10 py-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition text-lg"
                    >
                        Get Started with Employee Payments
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Payment;
