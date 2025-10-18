import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="text-center mt-10 space-y-16">
            {/* Hero Section */}
            <section className="space-y-6 flex flex-col items-center text-center px-4">
                <h1 className="text-5xl font-extrabold text-green-700">
                    Welcome to SmartCollect
                </h1>

                <p className="text-gray-600 max-w-2xl">
                    A decentralized platform that simplifies smart savings, automated payments,
                    and group collections — powered by blockchain technology.
                </p>

                <Link
                    to="/create"
                    className="mt-4 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
                >
                    Get Started
                </Link>
            </section>


            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                {[
                    {
                        title: "Smart Allowance",
                        text: "Automate recurring transfers — send weekly or monthly allowances without stress.",
                        link: "/allowance",
                    },
                    {
                        title: "Employee Payment",
                        text: "Schedule salary disbursements and pay employees directly through the blockchain.",
                        link: "/payment",
                    },
                    {
                        title: "Community Savings",
                        text: "Create savings groups, contribute collectively, and withdraw transparently.",
                        link: "/savings",
                    },
                ].map((feature, index) => (
                    <Link
                        key={index}
                        to={feature.link}
                        className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl hover:scale-105 transition transform block"
                    >
                        <h2 className="text-2xl font-bold text-green-600 mb-2">{feature.title}</h2>
                        <p className="text-gray-600">{feature.text}</p>
                    </Link>
                ))}
            </section>


            {/* CTA Section */}
            <section className="bg-green-600 text-white py-12">
                <h2 className="text-3xl font-bold mb-4">Start your first smart collection today</h2>
                <Link
                    to="/create"
                    className="px-6 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                    Create Now
                </Link>
            </section>
        </div>
    );
}
