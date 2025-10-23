import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

const CONTRACT_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "contribute",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getGroupBalance",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSavings",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "contributions",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
];

const CommunityDashboard = () => {
    const [account, setAccount] = useState("");
    const [contract, setContract] = useState(null);
    const [balance, setBalance] = useState("0");
    const [myContribution, setMyContribution] = useState("0");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    // Connect Wallet
    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                alert("Please install MetaMask first!");
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            setAccount(accounts[0]);
            setContract(contractInstance);
        } catch (err) {
            console.error("Wallet connection failed:", err);
        }
    };

    const getGroupData = async () => {
        if (!contract || !account) return;
        try {
            const total = await contract.getGroupBalance();
            const myCont = await contract.contributions(account);

            setBalance(ethers.formatEther(total));
            setMyContribution(ethers.formatEther(myCont));
        } catch (err) {
            console.error("Failed to fetch group data:", err);
        }
    };

    const handleContribute = async (e) => {
        e.preventDefault();
        if (!amount || !contract) return;
        setLoading(true);

        try {
            const tx = await contract.contribute({ value: ethers.parseEther(amount) });
            await tx.wait();
            alert("Contribution successful!");
            setAmount("");
            getGroupData();
        } catch (err) {
            console.error("Contribution failed:", err);
            alert("Transaction failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        connectWallet();
    }, []);

    useEffect(() => {
        if (contract && account) {
            getGroupData();
        }
    }, [contract, account]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-[#00524e] mb-6 text-center">
                    💰 Community Savings Dashboard
                </h1>

                <div className="mb-6">
                    {account ? (
                        <p className="text-green-600 font-medium">
                            ✅ Wallet Connected <br />
                            <span className="text-gray-600 text-sm">{account}</span>
                        </p>
                    ) : (
                        <button
                            onClick={connectWallet}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                            Connect Wallet
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-700 mb-1">👥 My Group</h3>
                        <p>View your current group, members, and contributions.</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-700 mb-1">💸 Contribute</h3>
                        <form onSubmit={handleContribute} className="flex gap-3 mt-2">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount (ETH)"
                                className="flex-1 border rounded-lg px-3 py-2"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
                                {loading ? "Processing..." : "Contribute"}
                            </button>
                        </form>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-700 mb-1">📊 Transparency Report</h3>
                        <p>Total Group Savings: <b>{balance}</b> ETH</p>
                        <p>My Total Contribution: <b>{myContribution}</b> ETH</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityDashboard;
