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

    // Connect Wallet
    const connectWallet = async () => {
        if (!window.ethereum) return alert("Please install MetaMask!");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        setAccount(accounts[0]);
        setContract(contractInstance);
    };

    // Get Contract Balance
    const getContractBalance = async () => {
        if (!contract) return;
        const bal = await contract.getBalance();
        setBalance(ethers.formatEther(bal));
    };

    // Add Employee
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
            alert("Failed to add employee.");
        }
        setLoading(false);
    };


    const handlePayEmployee = async (e) => {
        e.preventDefault();
        if (!employeeAddress) return;

        setLoading(true);
        try {
            const tx = await contract.payEmployee(employeeAddress, { value: 0 });
            await tx.wait();
            alert("Employee paid!");
            setEmployeeAddress("");
            getContractBalance();
        } catch (err) {
            console.error(err);
            alert("Payment failed.");
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
