import React from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const summaryData = [
    { title: "Total Savings", value: "₦1,200,000", light: "bg-green-100 text-green-800", dark: "dark:bg-green-900 dark:text-green-200" },
    { title: "Allowances", value: "₦450,000", light: "bg-blue-100 text-blue-800", dark: "dark:bg-blue-900 dark:text-blue-200" },
    { title: "Payments", value: "₦750,000", light: "bg-yellow-100 text-yellow-800", dark: "dark:bg-yellow-900 dark:text-yellow-200" },
    { title: "Active Groups", value: "8", light: "bg-purple-100 text-purple-800", dark: "dark:bg-purple-900 dark:text-purple-200" },
];

const transactions = [
    { id: 1, type: "Allowance", amount: "₦50,000", date: "18-Oct-2025" },
    { id: 2, type: "Payment", amount: "₦120,000", date: "17-Oct-2025" },
    { id: 3, type: "Savings", amount: "₦30,000", date: "16-Oct-2025" },
    { id: 4, type: "Payment", amount: "₦80,000", date: "15-Oct-2025" },
];

const chartData = [
    { month: "Jan", Savings: 40000, Payments: 30000 },
    { month: "Feb", Savings: 50000, Payments: 35000 },
    { month: "Mar", Savings: 60000, Payments: 45000 },
    { month: "Apr", Savings: 70000, Payments: 50000 },
    { month: "May", Savings: 80000, Payments: 60000 },
    { month: "Jun", Savings: 90000, Payments: 70000 },
];

function Dashboard() {
    const navigate = useNavigate();

    return (
        <div className="px-4 md:px-12 py-16 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-white transition-colors duration-300">
                Dashboard
            </h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                {summaryData.map((item) => (
                    <div
                        key={item.title}
                        className={`p-6 rounded-2xl shadow hover:shadow-lg transition shadow-gray-200 dark:shadow-black/50 ${item.light} ${item.dark}`}
                    >
                        <p className="text-sm font-medium mb-2">{item.title}</p>
                        <p className="text-2xl md:text-3xl font-bold">{item.value}</p>
                    </div>
                ))}
            </div>

            {/* Monthly Trends Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow transition-colors duration-300 mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    Monthly Trends
                </h2>
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={chartData}>
                        <XAxis dataKey="month" stroke="currentColor" className="text-gray-600 dark:text-gray-300" />
                        <YAxis stroke="currentColor" className="text-gray-600 dark:text-gray-300" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1f2937",
                                color: "#fff",
                                borderRadius: "8px",
                                border: "none",
                            }}
                            itemStyle={{ color: "#fff" }}
                        />
                        <Line type="monotone" dataKey="Savings" stroke="#00bfa5" strokeWidth={3} />
                        <Line type="monotone" dataKey="Payments" stroke="#00524e" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow transition-colors duration-300 overflow-x-auto mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    Recent Transactions
                </h2>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Type</th>
                        <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Amount</th>
                        <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Date</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((tx) => (
                        <tr key={tx.id}>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{tx.type}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{tx.amount}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{tx.date}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Module Navigation */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
                    Choose a Module
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => navigate("/smart-allowance-dashboard")}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl shadow-lg transition font-semibold"
                    >
                        Smart Allowance
                    </button>
                    <button
                        onClick={() => navigate("/community-dashboard")}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl shadow-lg transition font-semibold"
                    >
                        Community Savings
                    </button>
                    <button
                        onClick={() => navigate("/employee-payment-dashboard")}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-xl shadow-lg transition font-semibold"
                    >
                        Employee Payments
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
