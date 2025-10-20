import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

function OTP() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || ""; // optional: pre-fill email if passed
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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

            setSuccess("OTP verified successfully! Redirecting to login...");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-3xl font-bold text-[#00524e] mb-6 text-center">
                    Verify OTP
                </h2>

                {error && (
                    <p className="text-red-600 text-center mb-4 font-medium">{error}</p>
                )}

                {success && (
                    <p className="text-green-600 text-center mb-4 font-medium">{success}</p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">
                            Enter OTP
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                    >
                        {loading ? "Verifying..." : "Verify"}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-600">
                    Didn't receive OTP?{" "}
                    <Link
                        to="/resend-otp"
                        className="text-green-600 font-semibold hover:text-green-700"
                    >
                        Resend
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default OTP;
