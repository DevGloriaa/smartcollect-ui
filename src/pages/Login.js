import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!formData.email || !formData.password) {
            setError("Both fields are required");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:8003/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Login failed");
                setLoading(false);
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("isLoggedIn", "true");

            const redirectPath =
                localStorage.getItem("redirectAfterLogin") ||
                location.state?.from?.pathname ||
                "/dashboard";

            localStorage.removeItem("redirectAfterLogin");

            navigate(redirectPath, { replace: true });
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-300">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg transition-colors duration-300">
                <h2 className="text-3xl font-bold text-[#00524e] dark:text-green-400 mb-6 text-center transition-colors duration-300">
                    Login to SmartCollect
                </h2>

                {error && (
                    <p className="text-red-600 dark:text-red-400 text-center mb-4 font-medium">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-green-600 dark:bg-green-500 text-white font-semibold rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-300"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-green-600 dark:text-green-400 font-semibold hover:text-green-700 dark:hover:text-green-300"
                    >
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
