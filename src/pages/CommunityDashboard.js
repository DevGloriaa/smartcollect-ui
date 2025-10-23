import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

const CONTRACT_ABI = [
    "function joinGroup() external",
    "function contribute() external payable",
    "function withdraw(uint256 amount) external",
    "function getGroupBalance() external view returns (uint256)",
    "function admin() external view returns (address)",
    "function contributions(address) external view returns (uint256)",
    "function totalSavings() external view returns (uint256)"
];

const CommunityDashboard = () => {
    const [account, setAccount] = useState("");
    const [contract, setContract] = useState(null);
    const [balance, setBalance] = useState("0");
    const [myContribution, setMyContribution] = useState("0");
    const [totalSavings, setTotalSavings] = useState("0");
    const [admin, setAdmin] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

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

            const adminAddress = await contractInstance.admin();
            setAdmin(adminAddress);
        } catch (err) {
            console.error("Wallet connection failed:", err);
        }
    };

    const getGroupData = async () => {
        if (!contract || !account) return;
        try {
            const total = await contract.getGroupBalance();
            const myCont = await contract.contributions(account);
            const totalSav = await contract.totalSavings();

            setBalance(ethers.formatEther(total));
            setMyContribution(ethers.formatEther(myCont));
            setTotalSavings(ethers.formatEther(totalSav));
        } catch (err) {
            console.error("Failed to fetch group data:", err);
        }
    };

    const handleJoinGroup = async () => {
        if (!contract) return;
        setLoading(true);
        try {
            const tx = await contract.joinGroup();
            await tx.wait();
            alert("Successfully joined the group!");
        } catch (err) {
            console.error("Join group failed:", err);
            alert("You may already be a member.");
        } finally {
            setLoading(false);
            getGroupData();
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

    const handleWithdraw = async () => {
        const amount = prompt("Enter amount (in ETH) to withdraw:");
        if (!amount || parseFloat(amount) <= 0) return;
        setLoading(true);

        try {
            const tx = await contract.withdraw(ethers.parseEther(amount));
            await tx.wait();
            alert(`Successfully withdrew ${amount} ETH`);
            getGroupData();
        } catch (err) {
            console.error("Withdraw failed:", err);
            alert("Only admin can withdraw or insufficient funds.");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        await getGroupData();
        alert("Data refreshed ✅");
    };

    useEffect(() => {
        connectWallet();
    }, []);

    useEffect(() => {
        if (contract && account) getGroupData();
    }, [contract, account]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-10">
                <h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#00524e] mb-6 text-center">
                    💰 Community Savings Dashboard
                </h1>

                <div className="mb-6 text-center">
                    {account ? (
                        <p className="text-green-600 font-medium break-words">
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
                    {/* 👥 My Group */}
                    <div className="bg-green-50 p-4 sm:p-6 rounded-lg">
                        <h3 className="font-semibold text-gray-700 mb-1">👥 My Group</h3>
                        <p>Join your community savings group and start contributing together.</p>
                        <button
                            onClick={handleJoinGroup}
                            disabled={loading}
                            className="mt-2 w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            {loading ? "Processing..." : "Join Group"}
                        </button>
                    </div>

                    {/* 💸 Contribute */}
                    <div className="bg-green-50 p-4 sm:p-6 rounded-lg">
                        <h3 className="font-semibold text-gray-700 mb-1">💸 Contribute</h3>
                        <form onSubmit={handleContribute} className="flex flex-col sm:flex-row gap-3 mt-2">
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

                    {/* 📊 Transparency Report */}
                    <div className="bg-green-50 p-4 sm:p-6 rounded-lg">
                        <h3 className="font-semibold text-gray-700 mb-1">📊 Transparency Report</h3>
                        <p>Total Group Balance: <b>{balance}</b> ETH</p>
                        <p>Total Savings: <b>{totalSavings}</b> ETH</p>
                        <p>My Total Contribution: <b>{myContribution}</b> ETH</p>
                        <button
                            onClick={handleRefresh}
                            className="mt-3 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                        >
                            🔄 Refresh Data
                        </button>
                    </div>

                    {/* ⚙️ Admin Controls */}
                    {account.toLowerCase() === admin.toLowerCase() && (
                        <div className="bg-red-50 p-4 sm:p-6 rounded-lg">
                            <h3 className="font-semibold text-gray-700 mb-2">⚙️ Admin Controls</h3>
                            <p>You are the group admin. You can withdraw from the community pool.</p>
                            <button
                                onClick={handleWithdraw}
                                disabled={loading}
                                className="mt-2 w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                            >
                                {loading ? "Processing..." : "Withdraw Funds"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunityDashboard;
