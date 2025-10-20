import React, { useState } from "react";
import "../styles/theme.css";

function OTP() {
    const [otp, setOtp] = useState("");

    const handleSubmit = async e => {
        e.preventDefault();
        const res = await fetch("http://localhost:8003/api/users/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ otp }),
        });
        const data = await res.json();
        console.log(data);
    };

    return (
        <div className="form-container">
            <form className="form-card" onSubmit={handleSubmit}>
                <h2 className="form-title">Enter OTP</h2>
                <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="form-input"
                    placeholder="Enter OTP"
                />
                <button type="submit" className="cta-btn w-full mt-4">
                    Verify
                </button>
            </form>
        </div>
    );
}

export default OTP;
