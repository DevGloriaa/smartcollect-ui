import { Link } from "react-router-dom";

export default function DashboardHeader() {
    return (
        <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 sticky top-0 z-50">
            <nav className="max-w-6xl mx-auto flex justify-between items-center px-4 py-4">

                {/* Logo */}
                <Link to="/dashboard" className="text-xl font-bold text-[#00524e] dark:text-white">
                    SmartCollect
                </Link>

                {/* Navigation Links */}
                <div className="flex gap-6 text-gray-700 dark:text-gray-300 font-medium">
                    <Link to="/smart-allowance" className="hover:text-[#00524e] dark:hover:text-white">
                        Allowance
                    </Link>
                    <Link to="/employee-payments" className="hover:text-[#00524e] dark:hover:text-white">
                        Payroll
                    </Link>
                    <Link to="/community-savings" className="hover:text-[#00524e] dark:hover:text-white">
                        Groups
                    </Link>
                </div>
            </nav>
        </header>
    );
}
