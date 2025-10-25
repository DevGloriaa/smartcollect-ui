import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "_wallet", "type": "address" },
            { "internalType": "uint256", "name": "_salary", "type": "uint256" }
        ],
        "name": "addEmployee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "employees",
        "outputs": [
            { "internalType": "address", "name": "wallet", "type": "address" },
            { "internalType": "uint256", "name": "salary", "type": "uint256" },
            { "internalType": "bool", "name": "exists", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "employer",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "fundContract",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getBalance",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "_wallet", "type": "address" }],
        "name": "payEmployee",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
];

const CONTRACT_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

const EmployeePaymentDashboard = () => {
    const [account, setAccount] = useState("");
    const [contract, setContract] = useState(null);
    const [balance, setBalance] = useState("0");
    const [loading, setLoading] = useState(false);
    const [employeeAddress, setEmployeeAddress] = useState("");
    const [salary, setSalary] = useState("");
    const [fundAmount, setFundAmount] = useState("");

    const connectWallet = async () => {
        if (!window.ethereum) return alert("Please install MetaMask!");
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            setAccount(accounts[0]);
            setContract(contractInstance);
        } catch (err) {
            console.error(err);
            alert("Failed to connect wallet.");
        }
    };

    const getContractBalance = async () => {
        if (!contract) return;
        try {
            const bal = await contract.getBalance();
            setBalance(ethers.formatEther(bal));
        } catch (err) {
            console.error(err);
        }
    };

    const handleFundContract = async (e) => {
        e.preventDefault();
        if (!fundAmount || isNaN(fundAmount) || Number(fundAmount) <= 0) return;

        setLoading(true);
        try {
            const tx = await contract.fundContract({ value: ethers.parseEther(fundAmount) });
            await tx.wait();
            alert(`Contract funded with ${fundAmount} ETH`);
            setFundAmount("");
            getContractBalance();
        } catch (err) {
            console.error(err);
            alert("Funding failed.");
        }
        setLoading(false);
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        if (!employeeAddress || !salary) return;

        setLoading(true);
        try {
            const tx = await contract.addEmployee(employeeAddress, ethers.parseEther(salary));
            await tx.wait();
            alert("Employee added!");
            setEmployeeAddress("");
            setSalary("");
        } catch (err) {
            console.error(err);
            alert("Failed to add employee. Make sure the contract is funded and the employee address is valid.");
        }
        setLoading(false);
    };

    const handlePayEmployee = async (e) => {
        e.preventDefault();
        if (!employeeAddress) return;

        setLoading(true);
        try {
            const contractBal = await contract.getBalance();
            const employee = await contract.employees(employeeAddress);

            if (!employee.exists) {
                alert("Employee does not exist.");
                setLoading(false);
                return;
            }

            if (contractBal < employee.salary) {
                alert("Insufficient contract balance. Fund the contract first.");
                setLoading(false);
                return;
            }

            const tx = await contract.payEmployee(employeeAddress);
            await tx.wait();
            alert("Employee paid!");
            setEmployeeAddress("");
            getContractBalance();
        } catch (err) {
            console.error(err);
            alert("Payment failed. Check employee address and contract balance.");
        }
        setLoading(false);
    };

    useEffect(() => {
        connectWallet();
    }, []);

    useEffect(() => {
        if (contract) getContractBalance();
    }, [contract]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-[#00524e] mb-6 text-center">
                    💼 Employee Payment Dashboard
                </h1>

                <p className="text-gray-700 mb-4">
                    Contract Balance: <b>{balance}</b> ETH
                </p>

                <form onSubmit={handleFundContract} className="mb-6">
                    <h2 className="font-semibold text-gray-800 mb-2">Fund Contract</h2>
                    <input
                        type="number"
                        placeholder="Amount (ETH)"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 mb-2"
                        required
                    />
                    <div className="flex gap-2 mb-2">
                        {[0.1, 0.5, 1].map((amt) => (
                            <button
                                type="button"
                                key={amt}
                                onClick={() => setFundAmount(amt.toString())}
                                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                            >
                                {amt} ETH
                            </button>
                        ))}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                    >
                        {loading ? "Processing..." : "Fund Contract"}
                    </button>
                </form>

                <form onSubmit={handleAddEmployee} className="mb-6">
                    <h2 className="font-semibold text-gray-800 mb-2">Add Employee</h2>
                    <input
                        type="text"
                        placeholder="Employee Wallet Address"
                        value={employeeAddress}
                        onChange={(e) => setEmployeeAddress(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 mb-2"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Salary (ETH)"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 mb-2"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                        {loading ? "Processing..." : "Add Employee"}
                    </button>
                </form>


                <form onSubmit={handlePayEmployee}>
                    <h2 className="font-semibold text-gray-800 mb-2">Pay Employee</h2>
                    <input
                        type="text"
                        placeholder="Employee Wallet Address"
                        value={employeeAddress}
                        onChange={(e) => setEmployeeAddress(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 mb-2"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        {loading ? "Processing..." : "Pay Employee"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EmployeePaymentDashboard;
