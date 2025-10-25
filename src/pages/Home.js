import React from "react";
import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="flex flex-col items-center justify-center px-6 md:px-20 py-16 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">

            <section className="text-center mb-20 max-w-3xl">
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight transition-colors duration-300">
                    Simplify Your Finances with{" "}
                    <span className="text-green-600 dark:text-green-400">SmartCollect</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-300">
                    SmartCollect helps individuals, businesses, and communities manage money smarter —
                    from allowances to salary automation and group savings. Secure. Seamless. Smart.
                </p>
                <Link
                    to="/register"
                    className="px-8 py-3 bg-green-600 dark:bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-300"
                >
                    Get Started
                </Link>
            </section>

            {/* Features Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-6xl mt-10">

                <div className="p-8 border border-gray-200 dark:border-gray-700 rounded-2xl hover:shadow-xl transition bg-white dark:bg-gray-800">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Smart Allowance</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Automate allowances, set spending limits, and teach financial discipline the easy way.
                    </p>
                    <Link
                        to="/allowance"
                        className="text-green-600 dark:text-green-400 font-semibold hover:text-green-700 dark:hover:text-green-300"
                    >
                        Learn More →
                    </Link>
                </div>

                <div className="p-8 border border-gray-200 dark:border-gray-700 rounded-2xl hover:shadow-xl transition bg-white dark:bg-gray-800">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Employee Payments</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Send salaries securely, track payouts, and keep your payroll organized with ease.
                    </p>
                    <Link
                        to="/payment"
                        className="text-green-600 dark:text-green-400 font-semibold hover:text-green-700 dark:hover:text-green-300"
                    >
                        Learn More →
                    </Link>
                </div>

                <div className="p-8 border border-gray-200 dark:border-gray-700 rounded-2xl hover:shadow-xl transition bg-white dark:bg-gray-800">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Community Savings</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Create savings groups, contribute easily, and reach financial goals faster — together.
                    </p>
                    <Link
                        to="/savings"
                        className="text-green-600 dark:text-green-400 font-semibold hover:text-green-700 dark:hover:text-green-300"
                    >
                        Learn More →
                    </Link>
                </div>

            </section>
        </div>
    );
}

export default Home;
