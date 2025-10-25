import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

function OTP() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ✅ If page is accessed without email → redirect to signup
    useEffect(() => {
        if (!email) {
            navigate("/signup");
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!otp.trim()) {
            setError("Please enter the OTP.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:8003/api/users/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ otp, email }),
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "OTP verification failed");
                setLoading(false);
                return;
            }

            setSuccess("✅ OTP verified! Redirecting...");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-300">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg transition-all duration-300">

                {/* Title */}
                <h2 className="text-3xl font-bold text-[#00524e] dark:text-green-300 mb-6 text-center">
                    Verify OTP
                </h2>

                {/* ✅ Error Message */}
                {error && (
                    <p className="text-red-500 text-center mb-3 font-medium">
                        {error}
                    </p>
                )}

                {/* ✅ Success Message */}
                {success && (
                    <p className="text-green-500 text-center mb-3 font-medium">
                        {success}
                    </p>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                            Enter OTP
                        </label>
                        <input
                            type="text"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            placeholder="6-digit OTP"
                            className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white
                                       focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                    </div>

                    {/* ✅ Loading Animation */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg
                                   hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed
                                   transition-all duration-300"
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                </form>

                {/* ✅ Footer */}
                <p className="mt-6 text-center text-gray-700 dark:text-gray-300">
                    Didn’t receive OTP?{" "}
                    <Link to="/resend-otp" className="text-green-600 font-semibold hover:text-green-700">
                        Resend
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default OTP;
