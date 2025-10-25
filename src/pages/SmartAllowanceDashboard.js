
import React, { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";

const contractAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const contractABI = [

    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "beneficiary", type: "address" },
            { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
            { indexed: false, internalType: "uint256", name: "time", type: "uint256" },
        ],
        name: "AllowanceClaimed",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "funder", type: "address" },
            { indexed: true, internalType: "address", name: "beneficiary", type: "address" },
            { indexed: false, internalType: "uint256", name: "totalAmount", type: "uint256" },
            { indexed: false, internalType: "uint256", name: "allowancePerInterval", type: "uint256" },
            { indexed: false, internalType: "uint256", name: "interval", type: "uint256" },
        ],
        name: "PlanCreated",
        type: "event",
    },
    { inputs: [], name: "claimAllowance", outputs: [], stateMutability: "nonpayable", type: "function" },
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
    {
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "plans",
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

// ---------- small UI helpers ----------
function ShortAddr({ address }) {
    if (!address) return null;
    return <span className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>;
}

/* built-in toast component */
function Toast({ toast, onClose }) {
    if (!toast) return null;
    const bg = toast.type === "success" ? "bg-green-600" : toast.type === "error" ? "bg-red-600" : "bg-gray-700";
    return (
        <div className={`fixed right-6 top-6 z-50 ${bg} text-white px-4 py-2 rounded shadow-lg`}>
            <div className="flex items-center gap-3">
                <div className="text-sm">{toast.message}</div>
                <button onClick={onClose} className="ml-3 opacity-90 hover:opacity-100">✕</button>
            </div>
        </div>
    );
}

// ---------- main component ----------
export default function SmartAllowanceDashboard() {
    // wallet state
    const [walletAddress, setWalletAddress] = useState(() => localStorage.getItem("wallet") || "");
    const [tempWallet, setTempWallet] = useState("");
    const [connected, setConnected] = useState(false);
    const [network, setNetwork] = useState(null);
    const [ethBalance, setEthBalance] = useState(null);

    // plan state
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    // UI state - role modal overlay (Option A: modal overlay)
    const [showRoleModal, setShowRoleModal] = useState(true); // show on load (you can alter)
    const [selectedRole, setSelectedRole] = useState(null); // "funder" | "beneficiary"

    // modals for flows
    const [openCreate, setOpenCreate] = useState(false);
    const [openCreateConfirm, setOpenCreateConfirm] = useState(false);
    const [openClaim, setOpenClaim] = useState(false);
    const [openClaimConfirm, setOpenClaimConfirm] = useState(false);

    // create form fields
    const [beneficiary, setBeneficiary] = useState("");
    const [allowancePerInterval, setAllowancePerInterval] = useState("");
    const [intervalSecs, setIntervalSecs] = useState("");
    const [totalFund, setTotalFund] = useState("");

    // toast
    const [toast, setToast] = useState(null);
    const showToast = (message, type = "info", ms = 3000) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), ms);
    };

    // refs for focus
    const createFirstRef = useRef(null);
    const claimFirstRef = useRef(null);

    // on mount: try wallet from localStorage, provider accounts
    useEffect(() => {
        if (walletAddress) {
            setTempWallet(walletAddress);
            fetchPlan(walletAddress).catch(() => {});
            fetchBalance(walletAddress).catch(() => {});
        }
        connectWalletOnLoad().catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // provider helper
    const providerAvailable = () => Boolean(window.ethereum && window.ethereum.request);

    // connect on load if already connected
    const connectWalletOnLoad = async () => {
        if (!providerAvailable()) return;
        try {
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            if (accounts && accounts.length > 0) {
                setWalletAddress(accounts[0]);
                setTempWallet(accounts[0]);
                localStorage.setItem("wallet", accounts[0]);
                setConnected(true);
                const prov = new ethers.BrowserProvider(window.ethereum);
                const net = await prov.getNetwork();
                setNetwork(net.name || net.chainId);
                await fetchBalance(accounts[0]);
            }
        } catch (err) {
            console.debug("connectWalletOnLoad:", err);
        }
    };

    // connect wallet via MetaMask
    const connectWallet = async () => {
        if (!providerAvailable()) {
            showToast("Please install MetaMask or another web3 wallet", "error");
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            if (accounts && accounts.length > 0) {
                setWalletAddress(accounts[0]);
                setTempWallet(accounts[0]);
                localStorage.setItem("wallet", accounts[0]);
                setConnected(true);
                showToast("Wallet connected", "success");
                const prov = new ethers.BrowserProvider(window.ethereum);
                const net = await prov.getNetwork();
                setNetwork(net.name || net.chainId);
                await fetchBalance(accounts[0]);
                await fetchPlan(accounts[0]);
            }
        } catch (err) {
            console.error("connectWallet:", err);
            showToast("Wallet connection failed", "error");
        }
    };

    const disconnectWallet = () => {
        setWalletAddress("");
        setTempWallet("");
        localStorage.removeItem("wallet");
        setConnected(false);
        setPlan(null);
        setEthBalance(null);
        setNetwork(null);
        showToast("Wallet disconnected", "info");
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
        await fetchBalance(tempWallet);
    };

    const copyWallet = async () => {
        if (!walletAddress) return showToast("No wallet to copy", "error");
        await navigator.clipboard.writeText(walletAddress);
        showToast("Address copied", "success");
    };

    const fetchBalance = async (address = walletAddress) => {
        if (!address || !providerAvailable()) {
            setEthBalance(null);
            return;
        }
        try {
            const prov = new ethers.BrowserProvider(window.ethereum);
            const bal = await prov.getBalance(address);
            setEthBalance(Number(ethers.formatEther(bal)));
            const net = await prov.getNetwork();
            setNetwork(net.name || net.chainId);
        } catch (err) {
            console.debug("fetchBalance:", err);
            setEthBalance(null);
        }
    };

    // contract helper
    const getContract = async () => {
        if (!providerAvailable()) throw new Error("No web3 provider");
        const prov = new ethers.BrowserProvider(window.ethereum);
        const signer = await prov.getSigner();
        return new ethers.Contract(contractAddress, contractABI, signer);
    };

    // fetch plan for beneficiary address
    const fetchPlan = async (address = walletAddress) => {
        if (!address) {
            setPlan(null);
            return;
        }
        try {
            setLoading(true);
            const contract = await getContract();
            const data = await contract.getPlan(address);
            // if contract returns data, map it
            if (!data) {
                setPlan(null);
            } else {
                // data fields: funder, totalAmount, allowancePerInterval, interval, lastClaimed, remainingBalance
                const funder = data[0];
                const totalAmount = ethers.formatEther(data[1]);
                const allowance = ethers.formatEther(data[2]);
                const interval = Number(data[3].toString());
                const lastClaimedUnix = Number(data[4].toString());
                const lastClaimed = new Date(lastClaimedUnix * 1000).toLocaleString();
                const remainingBalance = ethers.formatEther(data[5]);
                setPlan({ funder, totalAmount, allowancePerInterval: allowance, interval, lastClaimedUnix, lastClaimed, remainingBalance });
            }
        } catch (err) {
            // contract probably reverts if no plan — handle as no plan
            console.debug("fetchPlan:", err);
            setPlan(null);
        } finally {
            setLoading(false);
        }
    };

    // Create plan (call createPlan payable)
    const handleCreatePlan = async () => {
        // validation
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
            const tx = await contract.createPlan(beneficiary, ethers.parseEther(allowancePerInterval), Number(intervalSecs), { value: ethers.parseEther(totalFund) });
            await tx.wait();
            showToast("Plan created successfully", "success");
            setOpenCreate(false);
            setOpenCreateConfirm(false);
            // refresh plan for beneficiary
            await fetchPlan(beneficiary);
            // clear form
            setBeneficiary("");
            setAllowancePerInterval("");
            setIntervalSecs("");
            setTotalFund("");
        } catch (err) {
            console.error("handleCreatePlan:", err);
            showToast("Create plan failed", "error");
        } finally {
            setLoading(false);
        }
    };

    // Claim allowance
    const handleClaim = async () => {
        try {
            setLoading(true);
            const contract = await getContract();
            const tx = await contract.claimAllowance();
            await tx.wait();
            showToast("Claim successful", "success");
            setOpenClaim(false);
            setOpenClaimConfirm(false);
            await fetchPlan(walletAddress);
        } catch (err) {
            console.error("handleClaim:", err);
            showToast("Claim failed", "error");
        } finally {
            setLoading(false);
        }
    };

    // small UI helpers
    const shorten = (addr) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "-");
    const percentUsed = () => {
        if (!plan) return 0;
        const total = Number(plan.totalAmount);
        const remaining = Number(plan.remainingBalance);
        if (total === 0) return 0;
        const used = total - remaining;
        return Math.max(0, Math.min(100, Math.round((used / total) * 100)));
    };
    const nextClaimCountdown = () => {
        if (!plan) return null;
        if (!plan.lastClaimedUnix || !plan.interval) return null;
        const next = plan.lastClaimedUnix + plan.interval;
        const diff = next * 1000 - Date.now();
        if (diff <= 0) return "Available now";
        const totalSec = Math.floor(diff / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        return `${h}h ${m}m ${s}s`;
    };

    // focus management for modals
    useEffect(() => {
        if (openCreate && createFirstRef.current) createFirstRef.current.focus();
    }, [openCreate]);
    useEffect(() => {
        if (openClaim && claimFirstRef.current) claimFirstRef.current.focus();
    }, [openClaim]);

    // ---------- RENDER ----------
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
            <Toast toast={toast} onClose={() => setToast(null)} />

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Smart Allowance</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Pick role → create plans or claim allowances</p>
                    </div>

                    {/* Wallet card */}
                    <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-white dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-sm font-bold text-gray-900 dark:text-white">
                                {walletAddress ? walletAddress.slice(2, 4).toUpperCase() : "SC"}
                            </div>

                            <div className="text-left">
                                <div className="text-xs text-gray-500 dark:text-gray-400">Active wallet</div>
                                <div className="text-sm font-mono text-gray-900 dark:text-white">
                                    {walletAddress ? <ShortAddr address={walletAddress} /> : "Not connected"}
                                </div>
                            </div>

                            <div className="ml-4 flex items-center gap-2">
                                <button onClick={connectWallet} className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">Connect</button>
                                <button onClick={copyWallet} className="px-2 py-1 bg-white/10 text-white rounded-md text-sm">Copy</button>
                                <button onClick={disconnectWallet} className="px-2 py-1 bg-red-50 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-md text-sm">Disconnect</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wallet update area */}
                <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-3 items-center">
                    <input
                        value={tempWallet}
                        onChange={(e) => setTempWallet(e.target.value)}
                        placeholder="Paste wallet address to view/manage (or connect with MetaMask)"
                        className="flex-1 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <div className="flex gap-2">
                        <button onClick={updateWallet} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md">Update Wallet</button>
                        <button onClick={() => { setTempWallet(walletAddress || ""); showToast("Reset to active wallet", "info"); }} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md">Reset</button>
                        <div className="px-3 py-2 rounded-md bg-white dark:bg-gray-900 text-sm">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Balance</div>
                            <div className="font-semibold">{ethBalance !== null ? `${ethBalance.toFixed(4)} ETH` : "—"}</div>
                        </div>
                    </div>
                </div>

                {/* ACTION CARDS */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-900 shadow-md">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create Allowance Plan</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Fund an allowance plan for a beneficiary. Guided modal will follow.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setSelectedRole("funder");
                                    setOpenCreate(true);
                                    setShowRoleModal(false);
                                }}
                                className="px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold"
                            >
                                Create Plan
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedRole("funder");
                                    setOpenCreate(true);
                                    setOpenCreateConfirm(true);
                                    setShowRoleModal(false);
                                }}
                                className="px-4 py-2 bg-white/70 text-gray-900 rounded-lg"
                            >
                                Quick Create
                            </button>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 shadow-md">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Claim Allowance</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">If you're a beneficiary, check and claim your available allowance.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setSelectedRole("beneficiary");
                                    setOpenClaim(true);
                                    setShowRoleModal(false);
                                    fetchPlan(walletAddress).catch(() => {});
                                }}
                                className="px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold"
                            >
                                Claim Allowance
                            </button>
                            <button onClick={() => { fetchPlan(walletAddress).catch(() => {}); showToast("Plan refreshed", "info"); }} className="px-4 py-2 bg-white/70 rounded-lg">
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main grid: plan summary + quick stats */}
                <div className="grid lg:grid-cols-3 gap-6 mb-6">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Plan Summary</h2>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Overview & actions</div>
                        </div>

                        {loading ? (
                            <div className="py-8 text-center text-gray-600 dark:text-gray-300">Loading…</div>
                        ) : plan ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Funder</div>
                                        <div className="font-mono text-sm text-gray-900 dark:text-white">{shorten(plan.funder)}</div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Remaining</div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{plan.remainingBalance} ETH</div>
                                    </div>
                                </div>

                                {/* progress */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Progress</div>
                                        <div className="text-sm font-medium">{percentUsed()}%</div>
                                    </div>
                                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{ width: `${percentUsed()}%` }} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Total Fund</div>
                                        <div className="font-semibold">{plan.totalAmount} ETH</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Allowance / interval</div>
                                        <div className="font-semibold">{plan.allowancePerInterval} ETH</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Interval</div>
                                        <div className="font-semibold">{plan.interval} s</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Next claim in</div>
                                        <div className="font-semibold">{nextClaimCountdown() || "—"}</div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <button
                                        onClick={() => { setOpenClaim(true); setOpenClaimConfirm(true); }}
                                        disabled={Number(plan.remainingBalance) <= 0}
                                        className={`w-full py-3 rounded-lg font-semibold text-white ${Number(plan.remainingBalance) <= 0 ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"}`}
                                    >
                                        {Number(plan.remainingBalance) <= 0 ? "No balance to claim" : "Claim Allowance"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-gray-500 dark:text-gray-300">
                                <div className="mb-4">No active plan found for the current wallet.</div>
                                <div className="flex justify-center gap-3">
                                    <button onClick={() => { setSelectedRole("funder"); setOpenCreate(true); setShowRoleModal(false); }} className="px-4 py-2 bg-green-600 text-white rounded">Create Plan</button>
                                    <button onClick={() => { setTempWallet(""); setWalletAddress(""); showToast("Update wallet or connect", "info"); }} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">Update Wallet</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick stats */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Stats</h3>
                        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex justify-between"><span>Active Plan</span><strong>{plan ? "Yes" : "No"}</strong></div>
                            <div className="flex justify-between"><span>Remaining (ETH)</span><strong>{plan ? plan.remainingBalance : "-"}</strong></div>
                            <div className="flex justify-between"><span>Allowance / int</span><strong>{plan ? plan.allowancePerInterval : "-"}</strong></div>
                            <div className="flex justify-between"><span>Next Claim</span><strong>{plan ? nextClaimCountdown() : "-"}</strong></div>
                            <div className="flex justify-between"><span>Wallet Balance</span><strong>{ethBalance !== null ? `${ethBalance.toFixed(4)} ETH` : "-"}</strong></div>
                        </div>
                    </div>
                </div>


                {showRoleModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Choose your action</h3>
                                <button className="text-gray-500 hover:text-gray-800" onClick={() => setShowRoleModal(false)}>✕</button>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Do you want to create an allowance plan as a funder, or claim your allowance as a beneficiary?</p>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-green-800">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Create Plan</h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">Fund a plan for a beneficiary (parents / employers).</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setSelectedRole("funder"); setOpenCreate(true); setShowRoleModal(false); }} className="px-4 py-2 bg-white rounded">Start</button>
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-blue-800">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Claim Allowance</h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">Check your plan and claim available allowance (beneficiaries).</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setSelectedRole("beneficiary"); setOpenClaim(true); setShowRoleModal(false); fetchPlan(walletAddress).catch(() => {}); }} className="px-4 py-2 bg-white rounded">Start</button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                                You can change this later using the action cards at the top of the dashboard.
                            </div>
                        </div>
                    </div>
                )}

                {openCreate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create Allowance Plan</h3>
                                <button className="text-gray-500 hover:text-gray-800" onClick={() => setOpenCreate(false)}>✕</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input ref={createFirstRef} placeholder="Beneficiary (0x...)" value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900" />
                                <input placeholder="Allowance per interval (ETH)" value={allowancePerInterval} onChange={(e) => setAllowancePerInterval(e.target.value)} className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900" />
                                <input type="number" placeholder="Interval (seconds)" value={intervalSecs} onChange={(e) => setIntervalSecs(e.target.value)} className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900" />
                                <input placeholder="Total fund (ETH)" value={totalFund} onChange={(e) => setTotalFund(e.target.value)} className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900" />
                            </div>

                            <div className="mt-4 flex justify-end gap-3">
                                <button onClick={() => setOpenCreate(false)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">Cancel</button>
                                <button onClick={() => setOpenCreateConfirm(true)} className="px-4 py-2 rounded bg-green-600 text-white">{loading ? "Processing..." : "Review & Fund"}</button>
                            </div>
                        </div>
                    </div>
                )}


                {openCreateConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Create Plan</h3>
                                <button className="text-gray-500 hover:text-gray-800" onClick={() => setOpenCreateConfirm(false)}>✕</button>
                            </div>

                            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                                <div><strong>Beneficiary:</strong> {beneficiary}</div>
                                <div><strong>Allowance / interval:</strong> {allowancePerInterval} ETH</div>
                                <div><strong>Interval:</strong> {intervalSecs} s</div>
                                <div><strong>Total fund:</strong> {totalFund} ETH</div>
                            </div>

                            <div className="mt-4 flex justify-end gap-3">
                                <button onClick={() => setOpenCreateConfirm(false)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">Back</button>
                                <button onClick={handleCreatePlan} className="px-4 py-2 rounded bg-green-600 text-white">{loading ? "Processing..." : "Create & Fund"}</button>
                            </div>
                        </div>
                    </div>
                )}


                {openClaim && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Claim Allowance</h3>
                                <button className="text-gray-500 hover:text-gray-800" onClick={() => setOpenClaim(false)}>✕</button>
                            </div>

                            {loading ? (
                                <div className="py-6 text-center text-gray-600 dark:text-gray-300">Processing...</div>
                            ) : plan ? (
                                <>
                                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                        <div><strong>Allowance / interval:</strong> {plan.allowancePerInterval} ETH</div>
                                        <div><strong>Remaining:</strong> {plan.remainingBalance} ETH</div>
                                        <div><strong>Last Claimed:</strong> {plan.lastClaimed}</div>
                                        <div><strong>Next claim in:</strong> {nextClaimCountdown() || "—"}</div>
                                    </div>

                                    <div className="mt-4 flex justify-end gap-3">
                                        <button onClick={() => setOpenClaim(false)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">Close</button>
                                        <button onClick={() => setOpenClaimConfirm(true)} disabled={Number(plan.remainingBalance) <= 0} className={`px-4 py-2 rounded font-semibold text-white ${Number(plan.remainingBalance) <= 0 ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"}`}>{loading ? "Claiming..." : "Claim Now"}</button>
                                    </div>
                                </>
                            ) : (
                                <div className="py-6 text-center text-gray-500 dark:text-gray-300">
                                    No plan found for this wallet. Ask the funder to create one, or change wallet.
                                    <div className="mt-4">
                                        <button onClick={() => setOpenClaim(false)} className="px-4 py-2 bg-green-600 text-white rounded">Back</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {openClaimConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Claim</h3>
                                <button className="text-gray-500 hover:text-gray-800" onClick={() => setOpenClaimConfirm(false)}>✕</button>
                            </div>

                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                You are about to claim <strong>{plan ? plan.allowancePerInterval : "—"} ETH</strong> from the allowance plan.
                            </div>

                            <div className="mt-4 flex justify-end gap-3">
                                <button onClick={() => setOpenClaimConfirm(false)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">Back</button>
                                <button onClick={handleClaim} className="px-4 py-2 rounded bg-purple-600 text-white">{loading ? "Claiming..." : "Confirm Claim"}</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
