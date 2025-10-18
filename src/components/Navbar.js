import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="bg-green-600 text-white p-4 flex justify-between items-center shadow-md">
            <h1 className="text-xl font-bold">SmartCollect</h1>
            <div className="space-x-4">
                <Link to="/" className="hover:underline">Home</Link>
                <Link to="/about" className="hover:underline">About</Link>
                <Link to="/create" className="hover:underline">Create</Link>
                <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            </div>
        </nav>
    );
}
