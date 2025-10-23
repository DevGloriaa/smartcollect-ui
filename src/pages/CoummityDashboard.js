import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

function CommunityDashboard() {
    const [account, setAccount] = useState(null);
    const [error, setError] = useState("");
    const [isConnected, setIsConnected] = useState(false);


    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                setError("MetaMask not detected. Please install it.");
                return;
            }

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });

            setAccount(accounts[0]);
            setIsConnected(true);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to connect wallet.");
        }
    };

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    setIsConnected(true);
                }
            });
        }
    }, []);

    return (
        <div className="flex flex-col items-center justify-center px-6 md:px-20 py-16 bg-gray-50 text-gray-800 min-h-screen">
            <div className="max-w-3xl w-full text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                    💰 Community Savings Dashboard
                </h1>
                <p className="text-gray-600 mb-10">
                    Manage your community’s shared savings — contribute, monitor goals, and view transparency reports.
                </p>

                {!isConnected ? (
                    <button
                        onClick={connectWallet}
                        className="px-10 py-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition text-lg"
                    >
                        Connect Wallet
                    </button>
                ) : (
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-semibold mb-4">Wallet Connected ✅</h2>
                        <p className="text-gray-700 break-all mb-6">
                            <strong>Address:</strong> {account}
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 text-left">
                            <div className="bg-gray-100 p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-lg font-semibold mb-2 text-gray-900">👥 My Group</h3>
                                <p className="text-gray-600 text-sm">
                                    View your current savings group, contributions, and members.
                                </p>
                            </div>

                            <div className="bg-gray-100 p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-lg font-semibold mb-2 text-gray-900">💸 Contribute</h3>
                                <p className="text-gray-600 text-sm">
                                    Add your savings contribution directly to the smart contract.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {error && <p className="text-red-500 mt-6">{error}</p>}
            </div>
        </div>
    );
}

export default CommunityDashboard;
