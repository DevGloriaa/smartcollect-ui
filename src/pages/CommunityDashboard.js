
import React, { useEffect, useState, useRef, useContext } from "react";
import { ethers } from "ethers";
import { ThemeContext } from "../context/ThemeContext";

const CONTRACT_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
const CONTRACT_ABI = [
    "function joinGroup() external",
    "function contribute() external payable",
    "function withdraw(uint256 amount) external",
    "function getGroupBalance() external view returns (uint256)",
    "function admin() external view returns (address)",
    "function contributions(address) external view returns (uint256)",
    "function totalSavings() external view returns (uint256)",
];


function ShortAddr({ address }) {
    if (!address) return null;
    return <span className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>;
}

function Toast({ toast, onClose }) {
    if (!toast) return null;
    const bg = toast.type === "success" ? "bg-green-600" : toast.type === "error" ? "bg-red-600" : "bg-gray-700";
    return (
        <div className={`fixed right-6 top-6 z-50 ${bg} text-white px-4 py-2 rounded shadow-lg`}>
            <div className="flex items-center gap-3">
                <div className="text-sm">{toast.message}</div>
                <button onClick={onClose} className="opacity-90 hover:opacity-100">✕</button>
            </div>
        </div>
    );
}


function Header({
                    wallet,
                    onConnect,
                    onCopy,
                    onDisconnect,
                    onNavigate,
                    network,
                }) {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <header className="w-full bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <div className="text-2xl font-bold text-[#00524e] dark:text-[#00bfa5]">SmartCollect</div>

                    <nav className="hidden sm:flex items-center gap-2">
                        <button
                            onClick={() => onNavigate("/smart-allowance-dashboard")}
                            className="px-3 py-1 rounded-full bg-white/80 dark:bg-gray-700/60 hover:opacity-90 text-sm flex items-center gap-2"
                        >
                            <span className="text-lg">🏦</span>
                            <span className="hidden md:inline">Smart Allowance</span>
                        </button>

                        <button
                            onClick={() => onNavigate("/employee-payment-dashboard")}
                            className="px-3 py-1 rounded-full bg-white/80 dark:bg-gray-700/60 hover:opacity-90 text-sm flex items-center gap-2"
                        >
                            <span className="text-lg">💼</span>
                            <span className="hidden md:inline">Employee Payments</span>
                        </button>

                        <button
                            onClick={() => onNavigate("/community")}
                            className="px-3 py-1 rounded-full bg-green-600 text-white hover:bg-green-700 text-sm flex items-center gap-2"
                        >
                            <span className="text-lg">👥</span>
                            <span className="hidden md:inline">Community Savings</span>
                        </button>
                    </nav>

                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-sm"
                        aria-label="Toggle theme"
                    >
                        {theme === "light" ? "Dark" : "Light"}
                    </button>

                    <div className="bg-white dark:bg-gray-900 px-3 py-2 rounded-lg flex items-center gap-3 shadow-sm">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-white dark:from-gray-700 dark:to-gray-800 flex items-center justify-center font-bold text-xs">
                            {wallet ? wallet.slice(2,4).toUpperCase() : "CS"}
                        </div>

                        <div className="hidden sm:block text-sm text-right">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Active wallet</div>
                            <div className="font-mono text-sm text-gray-900 dark:text-white">{wallet ? `${wallet.slice(0,6)}...${wallet.slice(-4)}` : "Not connected"}</div>
                        </div>

                        <div className="flex gap-2 ml-3">
                            <button onClick={onConnect} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Connect</button>
                            <button onClick={onCopy} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">Copy</button>
                            <button onClick={onDisconnect} className="px-2 py-1 bg-red-50 dark:bg-red-800 text-red-700 rounded text-sm">Disconnect</button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
function Footer() {
    return (
        <footer className="mt-10 py-6 text-center text-gray-600 dark:text-gray-400 text-sm">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                    <p>© {new Date().getFullYear()} SmartCollect. All rights reserved.</p>

                    <div className="flex space-x-4">
                        <a href="#about" className="hover:text-[#00524e]">About</a>
                        <a href="#privacy" className="hover:text-[#00524e]">Privacy</a>
                        <a href="#terms" className="hover:text-[#00524e]">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default function CommunityDashboard() {
    const { theme } = useContext(ThemeContext);

    const [wallet, setWallet] = useState(() => localStorage.getItem("wallet") || "");
    const [connected, setConnected] = useState(false);
    const [ethBalance, setEthBalance] = useState(null);
    const [network, setNetwork] = useState(null);
    const [contract, setContract] = useState(null);

    const [contractBalance, setContractBalance] = useState("0");
    const [totalSavingsOnChain, setTotalSavingsOnChain] = useState("0");
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState("home");


    const [groups, setGroups] = useState(() => {
        try {
            const raw = localStorage.getItem("community_groups_v1");
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });
    const [selectedGroupId, setSelectedGroupId] = useState(() => {
        try {
            return localStorage.getItem("community_selected_group") || null;
        } catch {
            return null;
        }
    });

    const [openCreateGroup, setOpenCreateGroup] = useState(false);
    const [openContribute, setOpenContribute] = useState(false);
    const [openWithdraw, setOpenWithdraw] = useState(false);

    const [newGroupName, setNewGroupName] = useState("");
    const [contributeAmount, setContributeAmount] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");

    const [loading, setLoading] = useState(false);

    const createFirstRef = useRef(null);

    const showToast = (message, type = "info", ms = 3000) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), ms);
    };

    const providerAvailable = () => Boolean(window.ethereum && window.ethereum.request);
    const getProvider = () => new ethers.BrowserProvider(window.ethereum);
    useEffect(() => {
        (async () => {
            if (providerAvailable()) {
                try {
                    const prov = getProvider();
                    const accounts = await prov.send("eth_accounts", []);
                    if (accounts && accounts.length > 0) {
                        const a = accounts[0];
                        setWallet(a);
                        setConnected(true);
                        localStorage.setItem("wallet", a);
                        await fetchBalance(a);
                        initContract();
                    } else if (localStorage.getItem("wallet")) {
                        setWallet(localStorage.getItem("wallet"));
                        await fetchBalance(localStorage.getItem("wallet"));
                    }
                } catch (err) {
                    console.debug("connectOnLoad:", err);
                }
            }
        })();

    }, []);


    useEffect(() => {
        try {
            localStorage.setItem("community_groups_v1", JSON.stringify(groups));
        } catch {}
    }, [groups]);

    useEffect(() => {
        try {
            if (selectedGroupId) localStorage.setItem("community_selected_group", selectedGroupId);
        } catch {}
    }, [selectedGroupId]);

    const initContract = async () => {
        if (!providerAvailable()) return;
        try {
            const prov = getProvider();
            const signer = await prov.getSigner();
            const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            setContract(c);
            try {
                const bal = await c.getGroupBalance();
                setContractBalance(ethers.formatEther(bal));
            } catch {}
            try {
                const tot = await c.totalSavings();
                setTotalSavingsOnChain(ethers.formatEther(tot));
            } catch {}
            const net = await prov.getNetwork();
            setNetwork(net.name || net.chainId);
        } catch (err) {
            console.debug("initContract:", err);
        }
    };

    const connectWallet = async () => {
        if (!providerAvailable()) {
            showToast("Please install MetaMask or another web3 wallet", "error");
            return;
        }
        try {
            const prov = getProvider();
            const accounts = await prov.send("eth_requestAccounts", []);
            if (accounts && accounts.length > 0) {
                const a = accounts[0];
                setWallet(a);
                setConnected(true);
                localStorage.setItem("wallet", a);
                showToast("Wallet connected", "success");
                await fetchBalance(a);
                initContract();
            }
        } catch (err) {
            console.error("connectWallet:", err);
            showToast("Failed to connect wallet", "error");
        }
    };

    const disconnectWallet = () => {
        setWallet("");
        setConnected(false);
        setEthBalance(null);
        localStorage.removeItem("wallet");
        showToast("Wallet disconnected", "info");
    };

    const copyWallet = async () => {
        if (!wallet) return showToast("No wallet to copy", "error");
        await navigator.clipboard.writeText(wallet);
        showToast("Address copied", "success");
    };

    const fetchBalance = async (address = wallet) => {
        if (!address || !providerAvailable()) {
            setEthBalance(null);
            return;
        }
        try {
            const prov = getProvider();
            const bal = await prov.getBalance(address);
            setEthBalance(Number(ethers.formatEther(bal)));
        } catch (err) {
            console.debug("fetchBalance:", err);
            setEthBalance(null);
        }
    };

    const callJoinGroup = async () => {
        if (!contract) return showToast("Connect wallet to join group", "error");
        setLoading(true);
        try {
            const tx = await contract.joinGroup();
            await tx.wait();
            showToast("Joined on-chain group ✅", "success");
            markLocalMembership(wallet);
        } catch (err) {
            console.error("joinGroup:", err);
            showToast("Failed to join on-chain group", "error");
        } finally {
            setLoading(false);
        }
    };

    const callContribute = async (amountEth) => {
        if (!contract) return showToast("Connect wallet to contribute", "error");
        if (!amountEth || Number(amountEth) <= 0) return showToast("Enter a valid amount", "error");
        setLoading(true);
        try {
            const tx = await contract.contribute({ value: ethers.parseEther(String(amountEth)) });
            await tx.wait();
            showToast("Contribution successful on-chain ✅", "success");
            try {
                const bal = await contract.getGroupBalance();
                setContractBalance(ethers.formatEther(bal));
            } catch {}
            recordLocalContribution(wallet, amountEth);
        } catch (err) {
            console.error("contribute:", err);
            showToast("Contribution failed", "error");
        } finally {
            setLoading(false);
        }
    };

    const callWithdraw = async (amountEth) => {
        if (!contract) return showToast("Connect wallet (admin) to withdraw", "error");
        if (!amountEth || Number(amountEth) <= 0) return showToast("Enter a valid amount", "error");
        setLoading(true);
        try {
            const tx = await contract.withdraw(ethers.parseEther(String(amountEth)));
            await tx.wait();
            showToast(`Withdrew ${amountEth} ETH`, "success");
            try {
                const bal = await contract.getGroupBalance();
                setContractBalance(ethers.formatEther(bal));
            } catch {}
        } catch (err) {
            console.error("withdraw:", err);
            showToast("Withdraw failed — only admin or insufficient funds", "error");
        } finally {
            setLoading(false);
        }
    };

    // local group helpers
    const createGroup = (name) => {
        const id = `g_${Date.now()}`;
        const adminWallet = wallet || "";
        const g = {
            id,
            name,
            adminWallet,
            members: adminWallet ? [adminWallet] : [],
            localContributions: [],
            createdAt: Date.now(),
        };
        const next = [g, ...groups];
        setGroups(next);
        setSelectedGroupId(id);
        showToast("Group created locally. To make groups on-chain update the contract later.", "info", 4000);
        setOpenCreateGroup(false);
        setNewGroupName("");
    };

    const markLocalMembership = (addr) => {
        if (!selectedGroupId) return;
        const next = groups.map((g) => {
            if (g.id !== selectedGroupId) return g;
            const already = g.members.includes(addr);
            return { ...g, members: already ? g.members : [...g.members, addr] };
        });
        setGroups(next);
        showToast("Membership recorded locally", "success");
    };

    const recordLocalContribution = (addr, amountEth) => {
        if (!selectedGroupId) return;
        const next = groups.map((g) => {
            if (g.id !== selectedGroupId) return g;
            const c = { wallet: addr || "unknown", amount: String(amountEth), time: Date.now() };
            return { ...g, localContributions: [c, ...g.localContributions] };
        });
        setGroups(next);
    };

    const joinSelectedGroup = async () => {
        if (!selectedGroupId) {
            showToast("Select or create a group first", "error");
            return;
        }
        await callJoinGroup();
        markLocalMembership(wallet);
    };

    const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null;
    const isAdmin = selectedGroup && selectedGroup.adminWallet && wallet && selectedGroup.adminWallet.toLowerCase() === wallet.toLowerCase();

    useEffect(() => {
        if (openCreateGroup && createFirstRef.current) createFirstRef.current.focus();
    }, [openCreateGroup]);

    useEffect(() => {
        if (!selectedGroupId && groups.length > 0) {
            setSelectedGroupId(groups[0].id);
        }
    }, [groups, selectedGroupId]);

    const handleNavigate = (path) => {
        window.location.href = path;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
            <Toast toast={toast} onClose={() => setToast(null)} />
            <Header
                wallet={wallet}
                onConnect={connectWallet}
                onCopy={copyWallet}
                onDisconnect={disconnectWallet}
                onNavigate={handleNavigate}
                network={network}
            />

            <main className="max-w-6xl mx-auto p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="text-xl font-semibold">Community Savings</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Manage groups & contributions</div>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={selectedGroupId || ""}
                            onChange={(e) => setSelectedGroupId(e.target.value)}
                            className="px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800"
                        >
                            <option value="">— Select group —</option>
                            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>

                        <button onClick={() => setOpenCreateGroup(true)} className="px-4 py-2 bg-green-600 text-white rounded">Create Group</button>
                        <button onClick={() => { initContract(); showToast("Refreshed on-chain data", "info"); }} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded">Refresh on-chain</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Selected Group</div>
                        <div className="font-semibold mt-1">{selectedGroup ? selectedGroup.name : "No group selected"}</div>
                        <div className="text-sm text-gray-500 mt-2">{selectedGroup ? `${selectedGroup.members.length} member(s)` : "—"}</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Contract Balance (on-chain)</div>
                        <div className="font-semibold mt-1">{contractBalance} ETH</div>
                        <div className="text-sm text-gray-500 mt-2">Total savings on-chain: {totalSavingsOnChain} ETH</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Your Wallet</div>
                        <div className="font-mono mt-1">{wallet ? <ShortAddr address={wallet} /> : "Not connected"}</div>
                        <div className="text-sm text-gray-500 mt-2">Balance: {ethBalance !== null ? `${ethBalance.toFixed(4)} ETH` : "—"}</div>
                    </div>
                </div>


                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => setActiveTab("home")} className={`px-3 py-1 rounded-full ${activeTab === "home" ? "bg-green-600 text-white" : "bg-white dark:bg-gray-700 text-sm"}`}>Overview</button>
                        <button onClick={() => setActiveTab("groups")} className={`px-3 py-1 rounded-full ${activeTab === "groups" ? "bg-green-600 text-white" : "bg-white dark:bg-gray-700 text-sm"}`}>Group Details</button>
                        <button onClick={() => setActiveTab("reports")} className={`px-3 py-1 rounded-full ${activeTab === "reports" ? "bg-green-600 text-white" : "bg-white dark:bg-gray-700 text-sm"}`}>Reports</button>
                        <button onClick={() => setActiveTab("admin")} className={`px-3 py-1 rounded-full ${activeTab === "admin" ? "bg-green-600 text-white" : "bg-white dark:bg-gray-700 text-sm"}`}>Admin</button>
                    </div>

                    {activeTab === "home" && (
                        <>
                            <h2 className="text-lg font-semibold mb-3">Welcome</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Use actions below to join groups, contribute funds, or manage your community. Select a group above or create one.</p>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-lg bg-green-50 dark:bg-gray-900">
                                    <div className="text-sm font-semibold">Join Group</div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Join the on-chain group and mark membership locally.</p>
                                    <div className="mt-3">
                                        <button onClick={joinSelectedGroup} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? "Processing..." : "Join"}</button>
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-green-50 dark:bg-gray-900">
                                    <div className="text-sm font-semibold">Contribute</div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Add funds to the community pool.</p>
                                    <div className="mt-3">
                                        <button onClick={() => { if (!selectedGroup) return showToast("Choose a group first", "error"); setOpenContribute(true); }} className="px-4 py-2 bg-green-600 text-white rounded">Contribute</button>
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-green-50 dark:bg-gray-900">
                                    <div className="text-sm font-semibold">Transparency</div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">View group contributions recorded locally and the on-chain balance.</p>
                                    <div className="mt-3">
                                        <button onClick={() => setActiveTab("reports")} className="px-4 py-2 bg-white text-gray-800 dark:bg-gray-700 rounded">View Report</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "groups" && (
                        <>
                            <h2 className="text-lg font-semibold mb-3">Group Details</h2>
                            {!selectedGroup ? (
                                <div className="text-gray-500">Select or create a group to see details.</div>
                            ) : (
                                <>
                                    <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">Admin: {selectedGroup.adminWallet ? <ShortAddr address={selectedGroup.adminWallet} /> : "—"}</div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-lg bg-white dark:bg-gray-900">
                                            <div className="text-sm font-semibold mb-2">Members</div>
                                            {selectedGroup.members.length === 0 ? (
                                                <div className="text-gray-500 text-sm">No members yet.</div>
                                            ) : (
                                                <ul className="space-y-2 text-sm">
                                                    {selectedGroup.members.map((m) => <li key={m} className="font-mono">{m}</li>)}
                                                </ul>
                                            )}
                                        </div>

                                        <div className="p-4 rounded-lg bg-white dark:bg-gray-900">
                                            <div className="text-sm font-semibold mb-2">Local Contributions</div>
                                            {selectedGroup.localContributions.length === 0 ? (
                                                <div className="text-gray-500 text-sm">No local contributions recorded.</div>
                                            ) : (
                                                <ul className="space-y-2 text-sm">
                                                    {selectedGroup.localContributions.map((c, idx) => (
                                                        <li key={idx} className="flex justify-between">
                                                            <span className="font-mono">{c.wallet}</span>
                                                            <span>{Number(c.amount).toFixed(4)} ETH</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {activeTab === "reports" && (
                        <>
                            <h2 className="text-lg font-semibold mb-3">Reports</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Snapshot combining on-chain and local data.</p>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-white dark:bg-gray-900">
                                    <div className="text-xs text-gray-500">On-chain pool balance</div>
                                    <div className="font-semibold mt-1">{contractBalance} ETH</div>
                                </div>

                                <div className="p-4 rounded-lg bg-white dark:bg-gray-900">
                                    <div className="text-xs text-gray-500">Local group total</div>
                                    <div className="font-semibold mt-1">{selectedGroup ? selectedGroup.localContributions.reduce((s, c) => s + Number(c.amount), 0).toFixed(4) : "0.0000"} ETH</div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "admin" && (
                        <>
                            {isAdmin ? (
                                <>
                                    <h2 className="text-lg font-semibold mb-3">Admin Panel</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Withdraw on-chain or manage members locally.</p>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-lg bg-white dark:bg-gray-900">
                                            <div className="text-sm font-semibold mb-2">Withdraw (on-chain)</div>
                                            <input type="number" placeholder="Amount (ETH)" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 mb-2" />
                                            <div className="flex gap-2">
                                                <button onClick={() => { if (!withdrawAmount) return showToast("Enter amount", "error"); callWithdraw(withdrawAmount); }} className="px-3 py-2 bg-red-600 text-white rounded">Withdraw</button>
                                                <button onClick={() => { setWithdrawAmount(""); showToast("Cleared", "info"); }} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded">Clear</button>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-lg bg-white dark:bg-gray-900">
                                            <div className="text-sm font-semibold mb-2">Manage Members (local)</div>
                                            <p className="text-sm text-gray-500 mb-2">Remove or invite members in the local group record.</p>
                                            {selectedGroup && selectedGroup.members.length === 0 && <div className="text-gray-500">No members</div>}
                                            {selectedGroup && selectedGroup.members.map((m) => (
                                                <div key={m} className="flex items-center justify-between gap-2 mb-2">
                                                    <div className="font-mono text-sm">{m}</div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => {
                                                            const next = groups.map(g => {
                                                                if (g.id !== selectedGroup.id) return g;
                                                                return { ...g, members: g.members.filter(x => x !== m) };
                                                            });
                                                            setGroups(next);
                                                            showToast("Member removed (local)", "info");
                                                        }} className="px-2 py-1 rounded bg-red-50 dark:bg-red-800 text-red-700 text-sm">Remove</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-gray-500">Admin panel visible only to the group admin (matches group's admin wallet).</div>
                            )}
                        </>
                    )}
                </div>

                <Footer />
            </main>

            {openCreateGroup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Create Group</h3>
                            <button className="text-gray-500" onClick={() => setOpenCreateGroup(false)}>✕</button>
                        </div>

                        <input ref={createFirstRef} value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Group name (e.g. 'Saves Team A')" className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-900 mb-3" />

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setOpenCreateGroup(false)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">Cancel</button>
                            <button onClick={() => { if (!newGroupName) return showToast("Group name required", "error"); createGroup(newGroupName); }} className="px-4 py-2 rounded bg-green-600 text-white">Create</button>
                        </div>
                    </div>
                </div>
            )}

            {openContribute && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Contribute to Group</h3>
                            <button className="text-gray-500" onClick={() => setOpenContribute(false)}>✕</button>
                        </div>

                        <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">Contributing will call the on-chain <code>contribute</code> method (single contract). The UI also records the contribution locally for the selected group.</div>

                        <input type="number" value={contributeAmount} onChange={(e) => setContributeAmount(e.target.value)} placeholder="Amount (ETH)" className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-900 mb-3" />

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setOpenContribute(false)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">Cancel</button>
                            <button onClick={() => { if (!contributeAmount || Number(contributeAmount) <= 0) return showToast("Enter valid amount", "error"); callContribute(contributeAmount); setOpenContribute(false); setContributeAmount(""); }} className="px-4 py-2 rounded bg-green-600 text-white">{loading ? "Processing..." : "Contribute"}</button>
                        </div>
                    </div>
                </div>
            )}

            {openWithdraw && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Withdraw from Pool</h3>
                            <button className="text-gray-500" onClick={() => setOpenWithdraw(false)}>✕</button>
                        </div>

                        <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">Only the group's admin (as recorded locally) can call withdraw on-chain. Ensure the connected wallet is the admin wallet.</div>

                        <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Amount (ETH)" className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-900 mb-3" />

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setOpenWithdraw(false)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">Cancel</button>
                            <button onClick={() => { if (!withdrawAmount || Number(withdrawAmount) <= 0) return showToast("Enter valid amount", "error"); callWithdraw(withdrawAmount); setOpenWithdraw(false); setWithdrawAmount(""); }} className="px-4 py-2 rounded bg-red-600 text-white">{loading ? "Processing..." : "Withdraw"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
