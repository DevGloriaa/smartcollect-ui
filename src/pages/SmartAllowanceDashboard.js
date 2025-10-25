import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Jazzicon from "react-jazzicon"; // wallet icon
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const contractAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const contractABI = [
    // same as before
];

function SmartAllowanceDashboard() {
    const [walletAddress, setWalletAddress] = useState("");
    const [beneficiary, setBeneficiary] = useState("");
    const [allowancePerInterval, setAllowancePerInterval] = useState("");
    const [interval, setInterval] = useState("");
    const [totalFund, setTotalFund] = useState("");
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        connectWalletOnLoad();
    }, []);

    const connectWalletOnLoad = async () => {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            if (accounts.length > 0) setWalletAddress(accounts[0]);
        }
    };

    const connectWallet = async () => {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            setWalletAddress(accounts[0]);
            toast.success("Wallet connected!");
        } else {
            alert("Please install MetaMask.");
        }
    };

    const getContract = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        return new ethers.Contract(contractAddress, contractABI, signer);
    };

    const handleCreatePlan = async () => {
        if (!beneficiary || !allowancePerInterval || !interval || !totalFund)
            return toast.error("Fill all fields first!");

        try {
            setLoading(true);
            const contract = await getContract();
            const tx = await contract.createPlan(
                beneficiary,
                ethers.parseEther(allowancePerInterval),
                interval,
                { value: ethers.parseEther(totalFund) }
            );
            await tx.wait();
            toast.success("Plan created successfully!");
            fetchPlan();
        } catch (err) {
            console.error(err);
            toast.error("Failed to create plan");
        } finally {
            setLoading(false);
        }
    };

    const fetchPlan = async (address = walletAddress) => {
        try {
            const contract = await getContract();
            const data = await contract.getPlan(address);
            setPlan({
                funder: data[0],
                totalAmount: ethers.formatEther(data[1]),
                allowancePerInterval: ethers.formatEther(data[2]),
                interval: Number(data[3]),
                lastClaimed: new Date(Number(data[4]) * 1000).toLocaleString(),
                remainingBalance: ethers.formatEther(data[5]),
            });
        } catch (err) {
            console.error("No plan found");
            setPlan(null);
        }
    };

    const handleClaim = async () => {
        try {
            setLoading(true);
            const contract = await getContract();
            const tx = await contract.claimAllowance();
            await tx.wait();
            toast.success("Allowance claimed successfully!");
            fetchPlan();
        } catch (err) {
            console.error(err);
            toast.error("Claim failed. Maybe not ready yet or insufficient balance.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateWallet = () => {
        if (!beneficiary) return toast.error("Enter a wallet address!");
        setWalletAddress(beneficiary);
        fetchPlan(beneficiary);
        toast.success("Wallet updated!");
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-8">
            <ToastContainer position="top-right" autoClose={2500} />

            <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
                <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
                    Smart Allowance Dashboard
                </h1>

                {/* Wallet Section */}
                <div className="flex flex-col items-center space-y-4">
                    {walletAddress ? (
                        <div className="flex items-center space-x-3">
                            <Jazzicon diameter={40} seed={parseInt(walletAddress.slice(2, 10), 16)} />
                            <div className="text-gray-700 dark:text-gray-200 font-mono text-sm">
                                {walletAddress}
                            </div>
                            <button
                                onClick={connectWallet}
                                className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                            >
                                Connect
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={connectWallet}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Connect Wallet
                        </button>
                    )}

                    {/* Update Wallet */}
                    <div className="flex space-x-2 mt-2">
                        <input
                            type="text"
                            placeholder="Enter wallet address"
                            value={beneficiary}
                            onChange={(e) => setBeneficiary(e.target.value)}
                            className="px-3 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                        <button
                            onClick={handleUpdateWallet}
                            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
                        >
                            Update
                        </button>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    {/* Create Plan */}
                    <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-md space-y-3">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">💰 Create Allowance Plan</h2>
                        <input
                            type="text"
                            placeholder="Beneficiary Address"
                            value={beneficiary}
                            onChange={(e) => setBeneficiary(e.target.value)}
                            className="w-full mb-2 p-2 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Allowance per Interval (ETH)"
                            value={allowancePerInterval}
                            onChange={(e) => setAllowancePerInterval(e.target.value)}
                            className="w-full mb-2 p-2 border rounded"
                        />
                        <input
                            type="number"
                            placeholder="Interval (seconds)"
                            value={interval}
                            onChange={(e) => setInterval(e.target.value)}
                            className="w-full mb-2 p-2 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Total Fund (ETH)"
                            value={totalFund}
                            onChange={(e) => setTotalFund(e.target.value)}
                            className="w-full mb-2 p-2 border rounded"
                        />
                        <button
                            onClick={handleCreatePlan}
                            disabled={loading}
                            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            {loading ? "Processing..." : "Create Plan"}
                        </button>
                    </div>

                    {/* Current Plan */}
                    <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-2xl shadow-md space-y-3">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">📊 Current Plan</h2>
                        <button
                            onClick={() => fetchPlan()}
                            className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                            Refresh
                        </button>

                        {plan ? (
                            <div className="text-sm space-y-2 mt-2">
                                <p><strong>Funder:</strong> {plan.funder}</p>
                                <p><strong>Total Fund:</strong> {plan.totalAmount} ETH</p>
                                <p><strong>Allowance:</strong> {plan.allowancePerInterval} ETH</p>
                                <p><strong>Interval:</strong> {plan.interval} secs</p>
                                <p><strong>Last Claimed:</strong> {plan.lastClaimed}</p>
                                <p><strong>Remaining:</strong> {plan.remainingBalance} ETH</p>
                                <button
                                    onClick={handleClaim}
                                    disabled={loading}
                                    className="mt-2 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                                >
                                    {loading ? "Claiming..." : "Claim Allowance"}
                                </button>
                            </div>
                        ) : (
                            <p className="text-gray-500 mt-2">No active plan found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SmartAllowanceDashboard;
