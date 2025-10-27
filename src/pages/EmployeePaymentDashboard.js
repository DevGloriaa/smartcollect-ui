
import React, { useEffect, useState, useRef, useContext } from "react";
import { ethers } from "ethers";
import { ThemeContext } from "../context/ThemeContext";



const CONTRACT_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
const CONTRACT_ABI = [
    {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [
            { internalType: "address", name: "_wallet", type: "address" },
            { internalType: "uint256", name: "_salary", type: "uint256" },
        ],
        name: "addEmployee",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "employees",
        outputs: [
            { internalType: "address", name: "wallet", type: "address" },
            { internalType: "uint256", name: "salary", type: "uint256" },
            { internalType: "bool", name: "exists", type: "bool" },
        ],
        stateMutability: "view",
        type: "function",
    },
    { inputs: [], name: "employer", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
    { inputs: [], name: "fundContract", outputs: [], stateMutability: "payable", type: "function" },
    { inputs: [], name: "getBalance", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
    { inputs: [{ internalType: "address", name: "_wallet", type: "address" }], name: "payEmployee", outputs: [], stateMutability: "payable", type: "function" },
];


function ShortAddr({ address }) {
    if (!address) return null;
    return <span className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>;
}

function Toast({ toast, onClose }) {
    if (!toast) return null;
    const bg = toast.type === "success" ? "bg-green-600" : toast.type === "error" ? "bg-red-600" : "bg-gray-700";
    return (
        <div className={`fixed top-6 right-6 z-50 ${bg} text-white px-4 py-2 rounded shadow-lg`}>
            <div className="flex items-center gap-3">
                <div className="text-sm">{toast.message}</div>
                <button onClick={onClose} className="opacity-90 hover:opacity-100">✕</button>
            </div>
        </div>
    );
}

export default function EmployeePaymentDashboard() {
    const { theme, toggleTheme } = useContext(ThemeContext);

    const [fundAmount, setFundAmount] = useState("");
    const [wallet, setWallet] = useState(() => localStorage.getItem("wallet") || "");
    const [tempWallet, setTempWallet] = useState("");
    const [connected, setConnected] = useState(false);
    const [network, setNetwork] = useState(null);
    const [ethBalance, setEthBalance] = useState(null);


    const [contract, setContract] = useState(null);
    const [contractBalance, setContractBalance] = useState("0");

    const [activeTab, setActiveTab] = useState("employer");
    const [employees, setEmployees] = useState(() => {
        try {
            const raw = localStorage.getItem("employees_list_v1");
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);


    const [openAddModal, setOpenAddModal] = useState(false);
    const [openConfirmPay, setOpenConfirmPay] = useState(false);
    const [selectedEmployeeToPay, setSelectedEmployeeToPay] = useState(null);


    const [newEmployeeAddress, setNewEmployeeAddress] = useState("");
    const [newEmployeeSalary, setNewEmployeeSalary] = useState("");

    const addFirstRef = useRef(null);

    const showToast = (message, type = "info", ms = 3500) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), ms);
    };


    const providerAvailable = () => Boolean(window.ethereum && window.ethereum.request);

    const getProvider = () => new ethers.BrowserProvider(window.ethereum);

    const connectWalletOnLoad = async () => {
        if (!providerAvailable()) return;
        try {
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            if (accounts && accounts.length > 0) {
                const a = accounts[0];
                setWallet(a);
                setTempWallet(a);
                localStorage.setItem("wallet", a);
                setConnected(true);
                const prov = getProvider();
                const net = await prov.getNetwork();
                setNetwork(net.name || net.chainId);
                await fetchBalance(a);
                await initContract();
                await fetchContractBalance();
            }
        } catch (err) {
            console.debug("connectWalletOnLoad:", err);
        }
    };

    const initContract = async () => {
        if (!providerAvailable()) return;
        try {
            const prov = getProvider();
            const signer = await prov.getSigner();
            const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            setContract(c);
            return c;
        } catch (err) {
            console.debug("initContract:", err);
            setContract(null);
            return null;
        }
    };

    useEffect(() => {
        connectWalletOnLoad().catch(() => {});
    }, []);

    const connectWallet = async () => {
        if (!providerAvailable()) {
            showToast("Please install MetaMask or a web3 wallet", "error");
            return;
        }
        try {
            const prov = getProvider();
            const accounts = await prov.send("eth_requestAccounts", []);
            if (accounts && accounts.length) {
                const a = accounts[0];
                setWallet(a);
                setTempWallet(a);
                localStorage.setItem("wallet", a);
                setConnected(true);
                showToast("Wallet connected", "success");
                const net = await prov.getNetwork();
                setNetwork(net.name || net.chainId);
                await fetchBalance(a);
                const c = await initContract();
                if (c) fetchContractBalance();
            }
        } catch (err) {
            console.error("connectWallet:", err);
            showToast("Failed to connect wallet", "error");
        }
    };

    const disconnectWallet = () => {
        setWallet("");
        setTempWallet("");
        localStorage.removeItem("wallet");
        setConnected(false);
        setContract(null);
        setEthBalance(null);
        setNetwork(null);
        showToast("Wallet disconnected", "info");
    };

    const updateWallet = async () => {
        if (!tempWallet || !tempWallet.startsWith("0x")) {
            showToast("Enter a valid wallet address (0x...)", "error");
            return;
        }
        setWallet(tempWallet);
        localStorage.setItem("wallet", tempWallet);
        showToast("Active wallet updated", "success");
        await fetchBalance(tempWallet);
        await fetchContractBalance();
        fetchEmployeeFromChain(tempWallet).catch(() => {});
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

    const fetchContractBalance = async () => {
        if (!contract) {
            const c = await initContract();
            if (!c) return;
        }
        try {
            const bal = await contract.getBalance();
            setContractBalance(ethers.formatEther(bal));
        } catch (err) {
            console.debug("fetchContractBalance:", err);
            setContractBalance("0");
        }
    };

    const fetchEmployeeFromChain = async (addr) => {
        if (!contract || !addr) return null;
        try {
            const res = await contract.employees(addr);

            const exists = res.exists || false;
            const salary = res.salary ? ethers.formatEther(res.salary) : "0";
            return { wallet: res.wallet, salary, exists };
        } catch (err) {
            console.debug("fetchEmployeeFromChain:", err);
            return null;
        }
    };
    const persistEmployees = (list) => {
        setEmployees(list);
        try {
            localStorage.setItem("employees_list_v1", JSON.stringify(list));
        } catch {}
    };

    const handleFundContract = async (amountEth) => {
        if (!contract) return showToast("Connect wallet to fund contract", "error");
        if (!amountEth || Number(amountEth) <= 0) return showToast("Enter valid amount", "error");
        setLoading(true);
        try {
            const tx = await contract.fundContract({ value: ethers.parseEther(String(amountEth)) });
            await tx.wait();
            showToast(`Contract funded with ${amountEth} ETH`, "success");
            await fetchContractBalance();
        } catch (err) {
            console.error("fundContract:", err);
            showToast("Funding failed", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAddEmployee = async () => {
        if (!contract) return showToast("Connect wallet to add employee", "error");
        if (!newEmployeeAddress || !newEmployeeAddress.startsWith("0x")) return showToast("Enter valid wallet address", "error");
        if (!newEmployeeSalary || Number(newEmployeeSalary) <= 0) return showToast("Enter valid salary", "error");

        setLoading(true);
        try {
            const tx = await contract.addEmployee(newEmployeeAddress, ethers.parseEther(String(newEmployeeSalary)));
            await tx.wait();
            const newEmp = { wallet: newEmployeeAddress, salary: String(Number(newEmployeeSalary)), addedAt: Date.now() };
            const next = [newEmp, ...employees];
            persistEmployees(next);
            showToast("Employee added on-chain", "success");
            setNewEmployeeAddress("");
            setNewEmployeeSalary("");
            setOpenAddModal(false);
        } catch (err) {
            console.error("addEmployee:", err);
            showToast("Failed to add employee", "error");
        } finally {
            setLoading(false);
        }
    };

    const confirmPayEmployee = (emp) => {
        setSelectedEmployeeToPay(emp);
        setOpenConfirmPay(true);
    };

    const handlePayEmployee = async () => {
        if (!contract || !selectedEmployeeToPay) return;
        setLoading(true);
        try {
            const tx = await contract.payEmployee(selectedEmployeeToPay.wallet);
            await tx.wait();
            showToast(`Paid ${selectedEmployeeToPay.wallet}`, "success");
            setOpenConfirmPay(false);
            setSelectedEmployeeToPay(null);
            await fetchContractBalance();
        } catch (err) {
            console.error("payEmployee:", err);
            showToast("Payment failed", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (contract) fetchContractBalance();
    }, [contract]);

    const totalEmployees = employees.length;
    const totalPayroll = employees.reduce((sum, e) => sum + Number(e.salary || 0), 0).toFixed(4);

    function Header() {
        return (
            <header className="w-full bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-xl font-bold text-[#00524e] dark:text-[#00bfa5]">SmartCollect</div>
                        <div className="hidden md:flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                            <span>Employee Payments</span>
                            <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs">{network || "—"}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={toggleTheme} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-sm">{theme === "light" ? "Dark" : "Light"}</button>

                        <div className="bg-white dark:bg-gray-900 px-3 py-1 rounded-lg flex items-center gap-3 shadow-sm">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-white dark:from-gray-700 dark:to-gray-800 flex items-center justify-center font-bold text-xs">
                                {wallet ? wallet.slice(2,4).toUpperCase() : "EP"}
                            </div>

                            <div className="hidden sm:block text-sm text-right">
                                <div className="text-xs text-gray-500 dark:text-gray-400">Active wallet</div>
                                <div className="font-mono text-sm text-gray-900 dark:text-white">{wallet ? `${wallet.slice(0,6)}...${wallet.slice(-4)}` : "Not connected"}</div>
                            </div>

                            <div className="flex gap-2 ml-3">
                                <button onClick={connectWallet} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Connect</button>
                                <button onClick={copyWallet} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">Copy</button>
                                <button onClick={disconnectWallet} className="px-2 py-1 bg-red-50 dark:bg-red-800 text-red-700 rounded text-sm">Disconnect</button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        );
    }

    function Sidebar() {
        return (
            <aside className="w-72 hidden lg:flex flex-col bg-white dark:bg-gray-900 border-r dark:border-gray-700">
                <div className="px-6 py-6">
                    <div className="text-2xl font-bold text-[#00524e] dark:text-[#00bfa5]">SmartCollect</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Payroll · Employee Management</p>
                </div>

                <nav className="px-3 py-4 flex-1 space-y-1">
                    <button onClick={() => setActiveTab("employer")} className={`block w-full text-left px-4 py-2 rounded-lg text-sm font-medium ${activeTab === "employer" ? "bg-green-50 dark:bg-gray-800 text-[#00524e]" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>Overview</button>
                    <button onClick={() => setActiveTab("employees")} className={`block w-full text-left px-4 py-2 rounded-lg text-sm font-medium ${activeTab === "employees" ? "bg-green-50 dark:bg-gray-800 text-[#00524e]" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>Employees</button>
                    <button onClick={() => { setActiveTab("overview"); showToast("Overview not implemented (placeholder)", "info"); }} className="block w-full text-left px-4 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Reports</button>
                </nav>

                <div className="px-4 py-4 border-t dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Contract</div>
                    <div className="mt-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Balance</div>
                        <div className="font-semibold">{contractBalance} ETH</div>
                        <div className="mt-2">
                            <button onClick={() => fetchContractBalance()} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-sm">Refresh</button>
                        </div>
                    </div>
                </div>
            </aside>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Toast toast={toast} onClose={() => setToast(null)} />
            <Header />

            <div className="flex">
                <Sidebar />

                <main className="flex-1 p-6 max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-6 mb-6">
                        <div className="col-span-2 p-6 rounded-2xl bg-gradient-to-br from-white/60 to-green-50 dark:from-gray-800 dark:to-gray-900 shadow glass">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold">Payroll Overview</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage contract funds and payroll operations</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                                        <div>Contract</div>
                                        <div className="font-semibold">{contractBalance} ETH</div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => handleFundContract(0.5)} className="px-3 py-2 bg-yellow-500 text-white rounded-md text-sm">Fund 0.5 ETH</button>
                                        <button onClick={() => setOpenAddModal(true)} className="px-3 py-2 bg-green-600 text-white rounded-md text-sm">Add Employee</button>
                                    </div>
                                </div>
                            </div>

                            {/* KPI chips */}
                            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="p-3 rounded-lg bg-white/80 dark:bg-gray-800/60">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Employees</div>
                                    <div className="text-lg font-semibold">{totalEmployees}</div>
                                </div>

                                <div className="p-3 rounded-lg bg-white/80 dark:bg-gray-800/60">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Total Payroll (ETH)</div>
                                    <div className="text-lg font-semibold">{totalPayroll}</div>
                                </div>

                                <div className="p-3 rounded-lg bg-white/80 dark:bg-gray-800/60">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Network</div>
                                    <div className="text-lg font-semibold">{network || "—"}</div>
                                </div>

                                <div className="p-3 rounded-lg bg-white/80 dark:bg-gray-800/60">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Wallet Balance</div>
                                    <div className="text-lg font-semibold">{ethBalance !== null ? `${ethBalance.toFixed(4)} ETH` : "—"}</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-md glass">
                            <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => handleFundContract(0.1)} className="w-full px-4 py-2 rounded bg-green-600 text-white">Fund 0.1 ETH</button>
                                <button onClick={() => setOpenAddModal(true)} className="w-full px-4 py-2 rounded bg-white dark:bg-gray-700 border dark:border-gray-700">Add Employee</button>
                                <button onClick={() => { fetchContractBalance(); fetchBalance(); showToast("Refreshed", "info"); }} className="w-full px-4 py-2 rounded bg-gray-100 dark:bg-gray-700">Refresh</button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs: Employer / Employees */}
                    <div className="mb-6">
                        <div className="flex gap-3 items-center">
                            <button onClick={() => setActiveTab("employer")} className={`px-4 py-2 rounded-lg ${activeTab === "employer" ? "bg-green-600 text-white" : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border dark:border-gray-700"}`}>Employer</button>
                            <button onClick={() => setActiveTab("employees")} className={`px-4 py-2 rounded-lg ${activeTab === "employees" ? "bg-green-600 text-white" : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border dark:border-gray-700"}`}>Employees</button>
                        </div>
                    </div>

                    {/* Tab content */}
                    {activeTab === "employer" ? (
                        <>
                            {/* Employer view — fund + add + employees table */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md mb-6">
                                <h3 className="text-lg font-semibold mb-4">Fund Contract</h3>

                                <div className="flex gap-3 flex-col sm:flex-row">
                                    <input type="number" placeholder="Amount (ETH)" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} className="flex-1 px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-900" />
                                    <button onClick={() => handleFundContract(fundAmount)} className="px-4 py-2 bg-yellow-500 text-white rounded">Fund</button>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Employees</h3>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Manage employee wallets & payments</div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="text-left text-xs text-gray-500 dark:text-gray-400">
                                        <tr>
                                            <th className="px-3 py-2">Wallet</th>
                                            <th className="px-3 py-2">Salary (ETH)</th>
                                            <th className="px-3 py-2">Added</th>
                                            <th className="px-3 py-2">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {employees.length === 0 && (
                                            <tr><td colSpan="4" className="px-3 py-6 text-center text-gray-500 dark:text-gray-400">No employees yet — add one.</td></tr>
                                        )}
                                        {employees.map((emp, idx) => (
                                            <tr key={emp.wallet + idx} className="border-t dark:border-gray-700">
                                                <td className="px-3 py-3"><div className="font-mono">{emp.wallet}</div></td>
                                                <td className="px-3 py-3">{Number(emp.salary).toFixed(4)}</td>
                                                <td className="px-3 py-3 text-sm text-gray-500">{new Date(emp.addedAt || Date.now()).toLocaleDateString()}</td>
                                                <td className="px-3 py-3">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => confirmPayEmployee(emp)} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">Pay</button>
                                                        <button onClick={async () => {
                                                            // try to refresh on-chain data for this employee
                                                            const onChain = await fetchEmployeeFromChain(emp.wallet);
                                                            if (onChain && onChain.exists) {
                                                                showToast(`On-chain salary: ${onChain.salary} ETH`, "info");
                                                            } else {
                                                                showToast("No on-chain record found", "error");
                                                            }
                                                        }} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-sm">Sync</button>
                                                        <button onClick={() => {
                                                            const next = employees.filter(e => e.wallet !== emp.wallet);
                                                            persistEmployees(next);
                                                            showToast("Removed locally (on-chain mapping remains)", "info");
                                                        }} className="px-3 py-1 rounded bg-red-50 dark:bg-red-800 text-red-700 text-sm">Remove</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Employees tab: list + quick payroll stats */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md mb-6">
                                <h3 className="text-lg font-semibold mb-3">Employees</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Employees added by employer. Employer is required to trigger payments.</p>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="rounded-lg p-4 bg-white/80 dark:bg-gray-900/60">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Total employees</div>
                                        <div className="text-2xl font-semibold">{totalEmployees}</div>
                                    </div>

                                    <div className="rounded-lg p-4 bg-white/80 dark:bg-gray-900/60">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Payroll total (ETH)</div>
                                        <div className="text-2xl font-semibold">{totalPayroll}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
                                <h3 className="text-lg font-semibold mb-3">Employee Directory</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="text-left text-xs text-gray-500 dark:text-gray-400">
                                        <tr>
                                            <th className="px-3 py-2">Wallet</th>
                                            <th className="px-3 py-2">Salary (ETH)</th>
                                            <th className="px-3 py-2">Added</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {employees.length === 0 && (
                                            <tr><td colSpan="3" className="px-3 py-6 text-center text-gray-500 dark:text-gray-400">No employees yet.</td></tr>
                                        )}
                                        {employees.map((emp, idx) => (
                                            <tr key={emp.wallet + idx} className="border-t dark:border-gray-700">
                                                <td className="px-3 py-3 font-mono">{emp.wallet}</td>
                                                <td className="px-3 py-3">{Number(emp.salary).toFixed(4)}</td>
                                                <td className="px-3 py-3 text-sm text-gray-500">{new Date(emp.addedAt || Date.now()).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Add Employee modal */}
                    {openAddModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                            <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Add Employee</h3>
                                    <button onClick={() => setOpenAddModal(false)} className="text-gray-500 hover:text-gray-800">✕</button>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <input ref={addFirstRef} value={newEmployeeAddress} onChange={(e) => setNewEmployeeAddress(e.target.value)} placeholder="Employee wallet (0x...)" className="p-3 rounded border dark:border-gray-700 bg-white dark:bg-gray-900" />
                                    <input type="number" value={newEmployeeSalary} onChange={(e) => setNewEmployeeSalary(e.target.value)} placeholder="Salary (ETH)" className="p-3 rounded border dark:border-gray-700 bg-white dark:bg-gray-900" />
                                </div>

                                <div className="mt-4 flex justify-end gap-3">
                                    <button onClick={() => setOpenAddModal(false)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">Cancel</button>
                                    <button onClick={handleAddEmployee} className="px-4 py-2 rounded bg-green-600 text-white">{loading ? "Adding..." : "Add Employee"}</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Confirm pay modal */}
                    {openConfirmPay && selectedEmployeeToPay && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Confirm Payment</h3>
                                    <button onClick={() => { setOpenConfirmPay(false); setSelectedEmployeeToPay(null); }} className="text-gray-500">✕</button>
                                </div>

                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    You're about to pay employee <strong>{selectedEmployeeToPay.wallet}</strong> salary <strong>{selectedEmployeeToPay.salary} ETH</strong>.
                                </div>

                                <div className="mt-4 flex justify-end gap-3">
                                    <button onClick={() => { setOpenConfirmPay(false); setSelectedEmployeeToPay(null); }} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">Cancel</button>
                                    <button onClick={handlePayEmployee} className="px-4 py-2 rounded bg-blue-600 text-white">{loading ? "Processing..." : "Confirm & Pay"}</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Floating action button (neo fintech) */}
                    <div className="fixed right-6 bottom-6 z-40">
                        <div className="flex flex-col items-end gap-3">
                            <button onClick={() => setOpenAddModal(true)} className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg flex items-center justify-center text-xl">+</button>
                            <button onClick={() => { fetchContractBalance(); fetchBalance(); showToast("Refreshed", "info"); }} className="w-14 h-10 rounded-lg bg-white/90 dark:bg-gray-800 shadow text-sm">⟳</button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
