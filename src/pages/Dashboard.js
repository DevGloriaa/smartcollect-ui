import React from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const summaryData = [
    { title: "Total Savings", value: "₦1,200,000", color: "bg-green-100", textColor: "text-green-800" },
    { title: "Allowances", value: "₦450,000", color: "bg-blue-100", textColor: "text-blue-800" },
    { title: "Payments", value: "₦750,000", color: "bg-yellow-100", textColor: "text-yellow-800" },
    { title: "Active Groups", value: "8", color: "bg-purple-100", textColor: "text-purple-800" },
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
        <div className="px-4 md:px-12 py-12 bg-gray-50 min-h-screen">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Dashboard</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                {summaryData.map((item) => (
                    <div
                        key={item.title}
                        className={`p-6 rounded-2xl shadow hover:shadow-lg transition ${item.color}`}
                    >
                        <p className={`text-sm font-medium ${item.textColor} mb-2`}>{item.title}</p>
                        <p className="text-2xl md:text-3xl font-bold text-gray-900">{item.value}</p>
                    </div>
                ))}
            </div>

            {/* Monthly Trends Chart */}
            <div className="bg-white p-6 rounded-2xl shadow mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Monthly Trends</h2>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                        <XAxis dataKey="month" stroke="#8884d8" />
                        <YAxis stroke="#8884d8" />
                        <Tooltip />
                        <Line type="monotone" dataKey="Savings" stroke="#00a896" strokeWidth={3} />
                        <Line type="monotone" dataKey="Payments" stroke="#00524e" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white p-6 rounded-2xl shadow mb-10 overflow-x-auto">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Recent Transactions</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left text-gray-600">Type</th>
                        <th className="px-4 py-2 text-left text-gray-600">Amount</th>
                        <th className="px-4 py-2 text-left text-gray-600">Date</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {transactions.map((tx) => (
                        <tr key={tx.id}>
                            <td className="px-4 py-3 text-gray-700">{tx.type}</td>
                            <td className="px-4 py-3 text-gray-700">{tx.amount}</td>
                            <td className="px-4 py-3 text-gray-700">{tx.date}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Module Navigation */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900">Choose a Module</h2>
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
