import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
const contractABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "beneficiary", "type": "address" },
            { "internalType": "uint256", "name": "allowancePerInterval", "type": "uint256" },
            { "internalType": "uint256", "name": "interval", "type": "uint256" }
        ],
        "name": "createPlan",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "claimAllowance",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "beneficiary", "type": "address" }],
        "name": "getPlan",
        "outputs": [
            { "internalType": "address", "name": "funder", "type": "address" },
            { "internalType": "uint256", "name": "totalAmount", "type": "uint256" },
            { "internalType": "uint256", "name": "allowancePerInterval", "type": "uint256" },
            { "internalType": "uint256", "name": "interval", "type": "uint256" },
            { "internalType": "uint256", "name": "lastClaimed", "type": "uint256" },
            { "internalType": "uint256", "name": "remainingBalance", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
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
            if (accounts.length > 0) {
                setWalletAddress(accounts[0]);
            }
        }
    };

    const connectWallet = async () => {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            setWalletAddress(accounts[0]);
        } else {
            alert("Please install MetaMask to connect your wallet.");
        }
    };

    const getContract = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        return new ethers.Contract(contractAddress, contractABI, signer);
    };

    const handleCreatePlan = async () => {
        if (!beneficiary || !allowancePerInterval || !interval || !totalFund)
            return alert("Fill all fields first!");

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
            alert("✅ Plan created successfully!");
            fetchPlan();
        } catch (err) {
            console.error(err);
            alert("⚠️ Failed to create plan");
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async () => {
        try {
            setLoading(true);
            const contract = await getContract();
            const tx = await contract.claimAllowance();
            await tx.wait();
            alert("🎉 Allowance claimed successfully!");
            fetchPlan();
        } catch (err) {
            console.error(err);
            alert("⚠️ Claim failed. Maybe not ready yet or insufficient balance.");
        } finally {
            setLoading(false);
        }
    };

    const fetchPlan = async () => {
        try {
            const contract = await getContract();
            const data = await contract.getPlan(walletAddress);
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

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
                    Smart Allowance Dashboard
                </h1>

                <div className="flex flex-col items-center mb-8">
                    {walletAddress ? (
                        <p className="text-gray-700">
                            Wallet Connected ✅ <br />
                            <span className="font-mono text-sm">{walletAddress}</span>
                        </p>
                    ) : (
                        <button
                            onClick={connectWallet}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                        >
                            Connect Wallet
                        </button>
                    )}
                </div>

                {walletAddress && (
                    <>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="p-6 bg-gray-100 rounded-lg shadow-sm">
                                <h2 className="text-xl font-semibold mb-4">💰 Create Allowance Plan</h2>
                                <input
                                    type="text"
                                    placeholder="Beneficiary Address"
                                    value={beneficiary}
                                    onChange={(e) => setBeneficiary(e.target.value)}
                                    className="w-full mb-3 p-2 border rounded"
                                />
                                <input
                                    type="text"
                                    placeholder="Allowance per Interval (ETH)"
                                    value={allowancePerInterval}
                                    onChange={(e) => setAllowancePerInterval(e.target.value)}
                                    className="w-full mb-3 p-2 border rounded"
                                />
                                <input
                                    type="number"
                                    placeholder="Interval (seconds)"
                                    value={interval}
                                    onChange={(e) => setInterval(e.target.value)}
                                    className="w-full mb-3 p-2 border rounded"
                                />
                                <input
                                    type="text"
                                    placeholder="Total Fund (ETH)"
                                    value={totalFund}
                                    onChange={(e) => setTotalFund(e.target.value)}
                                    className="w-full mb-3 p-2 border rounded"
                                />
                                <button
                                    onClick={handleCreatePlan}
                                    disabled={loading}
                                    className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                                >
                                    {loading ? "Processing..." : "Create Plan"}
                                </button>
                            </div>

                            <div className="p-6 bg-gray-100 rounded-lg shadow-sm">
                                <h2 className="text-xl font-semibold mb-4">📊 Current Plan</h2>
                                <button
                                    onClick={fetchPlan}
                                    className="mb-3 px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    Refresh Plan
                                </button>

                                {plan ? (
                                    <div className="text-sm space-y-2">
                                        <p><strong>Funder:</strong> {plan.funder}</p>
                                        <p><strong>Total Fund:</strong> {plan.totalAmount} ETH</p>
                                        <p><strong>Allowance:</strong> {plan.allowancePerInterval} ETH</p>
                                        <p><strong>Interval:</strong> {plan.interval} secs</p>
                                        <p><strong>Last Claimed:</strong> {plan.lastClaimed}</p>
                                        <p><strong>Remaining:</strong> {plan.remainingBalance} ETH</p>
                                        <button
                                            onClick={handleClaim}
                                            disabled={loading}
                                            className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg"
                                        >
                                            {loading ? "Claiming..." : "Claim Allowance"}
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No active plan found.</p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default SmartAllowanceDashboard;
