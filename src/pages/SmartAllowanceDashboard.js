// SmartAllowanceDashboard.jsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

/**
 * SmartAllowanceDashboard
 * - self-contained toast notifications (no external libs)
 * - wallet connect / manual change
 * - action cards: Create Plan (modal) and Claim Allowance (modal)
 * - role selection is explicit via the action cards (C)
 * - theme-aware styling (Tailwind dark: variants)
 *
 * IMPORTANT: keep your existing contractAddress & contractABI (example below).
 */

const contractAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const contractABI = [
    // ... trimmed for brevity; place your ABI here (same as before) ...
    {
        inputs: [
            { internalType: "address", name: "beneficiary", type: "address" },
            { internalType: "uint256", name: "allowancePerInterval", type: "uint256" },
            { internalType: "uint256", name: "interval", type: "uint256" },
        ],
        name: "createPlan",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    { inputs: [], name: "claimAllowance", outputs: [], stateMutability: "nonpayable", type: "function" },
    {
        inputs: [{ internalType: "address", name: "beneficiary", type: "address" }],
        name: "getPlan",
        outputs: [
            { internalType: "address", name: "funder", type: "address" },
            { internalType: "uint256", name: "totalAmount", type: "uint256" },
            { internalType: "uint256", name: "allowancePerInterval", type: "uint256" },
            { internalType: "uint256", name: "interval", type: "uint256" },
            { internalType: "uint256", name: "lastClaimed", type: "uint256" },
            { internalType: "uint256", name: "remainingBalance", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
    },
];

function ShortAddr({ address }) {
    if (!address) return null;
    return <span className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>;
}

/* Simple internal toast (no external lib) */
function Toast({ toast, onClose }) {
    if (!toast) return null;
    const bg =
        toast.type === "success"
            ? "bg-green-600"
            : toast.type === "error"
                ? "bg-red-600"
                : "bg-gray-700";
    return (
        <div className={`fixed right-4 top-6 z-50 ${bg} text-white px-4 py-2 rounded shadow-lg`}>
            <div className="flex items-center gap-3">
                <div className="text-sm">{toast.message}</div>
                <button onClick={onClose} className="ml-3 opacity-80 hover:opacity-100">✕</button>
            </div>
        </div>
    );
}

export default function SmartAllowanceDashboard() {
    // wallet and UI state
    const [walletAddress, setWalletAddress] = useState(() => localStorage.getItem("wallet") || "");
    const [tempWallet, setTempWallet] = useState("");
    const [connected, setConnected] = useState(false);

    // plan & form state
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    // modals / panels
    const [openCreate, setOpenCreate] = useState(false);
    const [openClaim, setOpenClaim] = useState(false);

    // create form fields
    const [beneficiary, setBeneficiary] = useState("");
    const [allowancePerInterval, setAllowancePerInterval] = useState("");
    const [intervalSecs, setIntervalSecs] = useState("");
    const [totalFund, setTotalFund] = useState("");

    // local toast
    const [toast, setToast] = useState(null);

    // helper: show toast
    const showToast = (message, type = "info", ms = 3000) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), ms);
    };

    useEffect(() => {
        // if we stored wallet in localStorage, try to fetch plan for it
        if (walletAddress) {
            setTempWallet(walletAddress);
            fetchPlan(walletAddress).catch(() => {});
        }
        // check if provider already connected
        connectWalletOnLoad().catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // WALLET helpers
    const connectWalletOnLoad = async () => {
        if (!window.ethereum) return;
        try {
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            if (accounts && accounts.length > 0) {
                setWalletAddress(accounts[0]);
                setConnected(true);
                localStorage.setItem("wallet", accounts[0]);
                setTempWallet(accounts[0]);
            }
        } catch (err) {
            console.error("wallet onload:", err);
        }
    };

    const connectWallet = async () => {
        if (!window.ethereum) {
            showToast("MetaMask not installed", "error");
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            if (accounts && accounts.length > 0) {
                setWalletAddress(accounts[0]);
                setConnected(true);
                localStorage.setItem("wallet", accounts[0]);
                setTempWallet(accounts[0]);
                showToast("Wallet connected", "success");
                await fetchPlan(accounts[0]);
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to connect wallet", "error");
        }
    };

    const updateWallet = async () => {

        if (!tempWallet || !tempWallet.startsWith("0x") || tempWallet.length < 10) {
            showToast("Enter a valid wallet address (0x...)", "error");
            return;
        }
        setWalletAddress(tempWallet);
        localStorage.setItem("wallet", tempWallet);
        showToast("Wallet updated", "success");
        await fetchPlan(tempWallet);
    };

    const copyWallet = async () => {
        if (!walletAddress) return;
        await navigator.clipboard.writeText(walletAddress);
        showToast("Address copied", "success");
    };

    // contract helper
    const getContract = async () => {
        if (!window.ethereum) throw new Error("No web3 provider");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        return new ethers.Contract(contractAddress, contractABI, signer);
    };

    // FETCH plan for an address (beneficiary)
    const fetchPlan = async (address = walletAddress) => {
        if (!address) {
            setPlan(null);
            return;
        }
        try {
            setLoading(true);
            const contract = await getContract();
            const data = await contract.getPlan(address);
            // some contracts throw for no plan; guard
            if (!data) {
                setPlan(null);
                setLoading(false);
                return;
            }
            setPlan({
                funder: data[0],
                totalAmount: ethers.formatEther(data[1]),
                allowancePerInterval: ethers.formatEther(data[2]),
                interval: Number(data[3]),
                lastClaimedUnix: Number(data[4]),
                lastClaimed: data[4].toNumber ? new Date(Number(data[4]) * 1000).toLocaleString() : new Date(Number(data[4]) * 1000).toLocaleString(),
                remainingBalance: ethers.formatEther(data[5]),
            });
        } catch (err) {
            console.debug("fetchPlan: no plan or error", err);
            setPlan(null);
        } finally {
            setLoading(false);
        }
    };


    const handleCreatePlan = async () => {
        // basic validation
        if (!beneficiary || !allowancePerInterval || !intervalSecs || !totalFund) {
            showToast("Please fill all fields", "error");
            return;
        }
        if (!beneficiary.startsWith("0x")) {
            showToast("Beneficiary must be an Ethereum address", "error");
            return;
        }
        try {
            setLoading(true);
            const contract = await getContract();
            const tx = await contract.createPlan(
                beneficiary,
                ethers.parseEther(allowancePerInterval),
                Number(intervalSecs),
                { value: ethers.parseEther(totalFund) }
            );
            await tx.wait();
            showToast("Plan created ✅", "success");
            setOpenCreate(false);

            await fetchPlan(beneficiary);

            setBeneficiary("");
            setAllowancePerInterval("");
            setIntervalSecs("");
            setTotalFund("");
        } catch (err) {
            console.error("createPlan", err);
            showToast("Create plan failed", "error");
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
            showToast("Claim successful ✅", "success");
            setOpenClaim(false);
            await fetchPlan(walletAddress);
        } catch (err) {
            console.error("claimAllowance", err);
            showToast("Claim failed", "error");
        } finally {
            setLoading(false);
        }
    };

    const shorten = (addr) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "-");

    /* small UI pieces */
    const ActionCard = ({ title, desc, cta, onClick, color = "green" }) => {
        const colors =
            color === "green"
                ? "from-green-50 to-green-100 dark:from-green-900 dark:to-green-800"
                : "from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800";
        return (
            <div className={`p-6 rounded-2xl shadow-md bg-gradient-to-br ${colors} transition hover:shadow-2xl`}>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{desc}</p>
                <button
                    onClick={onClick}
                    className="px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold hover:scale-[1.01] transition"
                >
                    {cta}
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-6">

            <Toast toast={toast} onClose={() => setToast(null)} />

            <div className="max-w-6xl mx-auto">

                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Smart Allowance</h1>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-sm text-gray-600 dark:text-gray-300">Active wallet</div>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                                    {/* simple avatar from address hex */}
                                    {walletAddress ? walletAddress.slice(2, 4).toUpperCase() : "SC"}
                                </div>
                                <div className="text-sm text-gray-900 dark:text-gray-100">
                                    {walletAddress ? <ShortAddr address={walletAddress} /> : "Not connected"}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={connectWallet}
                                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Connect
                            </button>
                            <button
                                onClick={copyWallet}
                                className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                </div>


                <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex items-center gap-3">
                    <input
                        value={tempWallet}
                        onChange={(e) => setTempWallet(e.target.value)}
                        className="flex-1 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Paste wallet address to view / manage (or connect with MetaMask)"
                    />
                    <button onClick={updateWallet} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg">
                        Update Wallet
                    </button>
                </div>


                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <ActionCard
                        title="Create Allowance Plan"
                        desc="Fund an allowance plan for a beneficiary. You will be guided through funding + confirmation."
                        cta="Create Plan"
                        onClick={() => setOpenCreate(true)}
                        color="green"
                    />

                    <ActionCard
                        title="Claim Allowance"
                        desc="If you are a beneficiary, check and claim your available allowance here."
                        cta="Claim Allowance"
                        onClick={() => {
                            setOpenClaim(true);
                            fetchPlan(walletAddress).catch(() => {});
                        }}
                        color="blue"
                    />
                </div>

                {/* main grid: plan + analytics (placeholder analytics) */}
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Plan Summary</h2>
                            <div className="flex gap-2">
                                <button onClick={() => fetchPlan(walletAddress)} className="px-3 py-1 bg-blue-600 text-white rounded">
                                    Refresh
                                </button>
                                <button
                                    onClick={() => {
                                        setOpenCreate(true);
                                    }}
                                    className="px-3 py-1 bg-green-600 text-white rounded"
                                >
                                    New Plan
                                </button>
                            </div>
                        </div>

                        {/* Plan details */}
                        {loading ? (
                            <div className="py-10 text-center text-gray-600 dark:text-gray-300">Loading…</div>
                        ) : plan ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Funder</div>
                                        <div className="font-mono text-sm">{shorten(plan.funder)}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Remaining</div>
                                        <div className="text-xl font-bold text-gray-900 dark:text-white">{plan.remainingBalance} ETH</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                                        <div className="text-sm text-gray-500">Total Fund</div>
                                        <div className="font-semibold">{plan.totalAmount} ETH</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                                        <div className="text-sm text-gray-500">Allowance / interval</div>
                                        <div className="font-semibold">{plan.allowancePerInterval} ETH</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                                        <div className="text-sm text-gray-500">Interval (s)</div>
                                        <div className="font-semibold">{plan.interval} s</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                                        <div className="text-sm text-gray-500">Last Claimed</div>
                                        <div className="font-semibold">{plan.lastClaimed}</div>
                                    </div>
                                </div>

                                {/* Claim CTA if beneficiary */}
                                <div className="mt-4">
                                    <button
                                        onClick={() => {
                                            setOpenClaim(true);
                                        }}
                                        disabled={loading || Number(plan.remainingBalance) <= 0}
                                        className={`w-full py-3 rounded-lg font-semibold text-white ${Number(plan.remainingBalance) <= 0 ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"}`}
                                    >
                                        {Number(plan.remainingBalance) <= 0 ? "No balance to claim" : "Open Claim Panel"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-gray-500 dark:text-gray-300">
                                No active plan found for this wallet. Create a new plan or update the wallet address.
                            </div>
                        )}
                    </div>


                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Stats</h3>
                        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex justify-between"><span>Active Plan</span><strong>{plan ? "Yes" : "No"}</strong></div>
                            <div className="flex justify-between"><span>Remaining (ETH)</span><strong>{plan ? plan.remainingBalance : "-"}</strong></div>
                            <div className="flex justify-between"><span>Allowance / int</span><strong>{plan ? plan.allowancePerInterval : "-"}</strong></div>
                            <div className="flex justify-between"><span>Last Claimed</span><strong>{plan ? plan.lastClaimed : "-"}</strong></div>
                        </div>
                    </div>
                </div>

                {/* CREATE PLAN MODAL */}
                {openCreate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                        <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Create Allowance Plan</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    placeholder="Beneficiary address"
                                    value={beneficiary}
                                    onChange={(e) => setBeneficiary(e.target.value)}
                                    className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                />
                                <input
                                    placeholder="Allowance per interval (ETH)"
                                    value={allowancePerInterval}
                                    onChange={(e) => setAllowancePerInterval(e.target.value)}
                                    className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                />
                                <input
                                    placeholder="Interval (seconds)"
                                    type="number"
                                    value={intervalSecs}
                                    onChange={(e) => setIntervalSecs(e.target.value)}
                                    className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                />
                                <input
                                    placeholder="Total fund (ETH)"
                                    value={totalFund}
                                    onChange={(e) => setTotalFund(e.target.value)}
                                    className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                />
                            </div>

                            <div className="mt-4 flex justify-end gap-3">
                                <button onClick={() => setOpenCreate(false)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">Cancel</button>
                                <button onClick={handleCreatePlan} className="px-4 py-2 rounded bg-green-600 text-white">{loading ? "Processing..." : "Create & Fund"}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* CLAIM MODAL */}
                {openClaim && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Claim Allowance</h3>

                            {plan ? (
                                <>
                                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                                        <div><strong>Allowance / interval:</strong> {plan.allowancePerInterval} ETH</div>
                                        <div><strong>Remaining:</strong> {plan.remainingBalance} ETH</div>
                                        <div><strong>Last Claimed:</strong> {plan.lastClaimed}</div>
                                    </div>

                                    <div className="mt-4 flex gap-3 justify-end">
                                        <button onClick={() => setOpenClaim(false)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">Close</button>
                                        <button
                                            onClick={handleClaim}
                                            disabled={loading || Number(plan.remainingBalance) <= 0}
                                            className={`px-4 py-2 rounded font-semibold text-white ${Number(plan.remainingBalance) <= 0 ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"}`}
                                        >
                                            {loading ? "Claiming..." : "Claim Now"}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="py-4 text-center text-gray-500 dark:text-gray-300">No plan data for this wallet.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
