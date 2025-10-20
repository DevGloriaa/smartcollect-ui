import React, { useState } from "react";
import "../styles/theme.css";

function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" });

    const handleChange = e =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        const res = await fetch("http://localhost:8003/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        const data = await res.json();
        console.log(data);
    };

    return (
        <div className="form-container">
            <form className="form-card" onSubmit={handleSubmit}>
                <h2 className="form-title">Login</h2>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                />

                <button type="submit" className="cta-btn w-full mt-4">
                    Login
                </button>
            </form>
        </div>
    );
}

export default Login;
