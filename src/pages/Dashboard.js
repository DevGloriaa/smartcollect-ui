import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const summaryData = [
    { title: "Total Savings", value: "₦1,200,000" },
    { title: "Allowances", value: "₦450,000" },
    { title: "Payments", value: "₦750,000" },
    { title: "Active Groups", value: "8" },
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
    return (
        <div className="px-6 md:px-12 py-16 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold mb-8 text-gray-900">Dashboard</h1>


            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {summaryData.map((item) => (
                    <div
                        key={item.title}
                        className="bg-white p-6 rounded-2xl shadow-lg flex flex-col justify-between hover:shadow-xl transition"
                    >
                        <p className="text-gray-500">{item.title}</p>
                        <p className="text-2xl md:text-3xl font-bold text-gray-900">{item.value}</p>
                    </div>
                ))}
            </div>


            <div className="bg-white p-6 rounded-2xl shadow-lg mb-12">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Monthly Trends</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <XAxis dataKey="month" stroke="#8884d8" />
                        <YAxis stroke="#8884d8" />
                        <Tooltip />
                        <Line type="monotone" dataKey="Savings" stroke="#00a896" strokeWidth={3} />
                        <Line type="monotone" dataKey="Payments" stroke="#00524e" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            </div>


            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Recent Transactions</h2>
                <div className="overflow-x-auto">
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
            </div>


            <div className="flex flex-wrap gap-4 mt-12">
                <button className="bg-[#00524e] text-white px-6 py-3 rounded-xl hover:bg-[#007e75] transition">
                    Add Payment
                </button>
                <button className="bg-[#00a896] text-white px-6 py-3 rounded-xl hover:bg-[#00cba0] transition">
                    Add Savings
                </button>
                <button className="bg-[#f9a826] text-white px-6 py-3 rounded-xl hover:bg-[#ffb84d] transition">
                    Add Allowance
                </button>
            </div>
        </div>
    );
}

export default Dashboard;
