import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getCreditCustomers,
    createCustomer,
} from "../api/customerApi";

interface CustomerCredit {
    id: string;
    name: string;
    phone: string;
    totalPurchases: number;
    totalPaid: number;
    totalBalance: number;
    activeCreditSales: number;
}

export default function CreditCustomers() {
    const [customers, setCustomers] = useState<CustomerCredit[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const [view, setView] = useState<"all" | "credit">("all");

    const navigate = useNavigate();

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            setLoading(true);
            const data = await getCreditCustomers();
            setCustomers(data || []);
        } catch {
            alert("Failed to load customers");
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter((c) => {
        const q = search.toLowerCase();

        const matchesSearch =
            c.name.toLowerCase().includes(q) ||
            c.phone.includes(search);

        const matchesView =
            view === "all"
                ? true
                : c.activeCreditSales > 0; // 👈 ONLY CREDIT CUSTOMERS

        return matchesSearch && matchesView;
    });

    const totalCustomers = customers.length;

    const customersWithOutstanding = customers.filter(
        (c) => c.totalBalance > 0
    ).length;

    const totalOutstanding = customers.reduce(
        (sum, c) => sum + (c.totalBalance || 0),
        0
    );

    const handleCreateCustomer = async () => {
        if (!name.trim()) return alert("Customer name is required");
        if (!phone.trim()) return alert("Phone number is required");

        try {
            await createCustomer({ name, phone });

            alert("Customer created successfully");

            setName("");
            setPhone("");
            setShowModal(false);

            await load();
        } catch (error: any) {
            alert(
                error?.response?.data ||
                error?.message ||
                "Failed to create customer"
            );
        }
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 rounded-2xl bg-black/5 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-5">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[#14181C]">
                        Credit customers
                    </h1>
                    <p className="text-[13px] text-black/40 mt-0.5">
                        Manage customer credit balances
                    </p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-[#0B6E4F] hover:bg-[#0A5F44] text-white px-4 py-2.5 rounded-xl font-medium text-[14px] cursor-pointer transition shadow-sm inline-flex items-center gap-1.5 justify-center"
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Add customer
                </button>
            </div>

            {/* TOGGLE VIEW */}
            <div className="flex bg-white border border-black/5 rounded-xl p-1 w-full md:w-fit shadow-sm">
                <button
                    onClick={() => setView("all")}
                    className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[14px] font-medium cursor-pointer transition ${view === "all"
                        ? "bg-[#14181C] text-white shadow-sm"
                        : "text-black/50 hover:text-black/70"
                        }`}
                >
                    All customers
                </button>

                <button
                    onClick={() => setView("credit")}
                    className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[14px] font-medium cursor-pointer transition ${view === "credit"
                        ? "bg-red-600 text-white shadow-sm"
                        : "text-black/50 hover:text-black/70"
                        }`}
                >
                    On credit
                </button>
            </div>

            {/* SUMMARY */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-4">
                    <p className="text-[11px] font-semibold tracking-widest text-black/40 uppercase">
                        {view === "credit" ? "Customers with outstanding" : "Total customers"}
                    </p>
                    <p className="text-3xl font-bold mt-1 font-mono tabular-nums">
                        {view === "credit" ? customersWithOutstanding : totalCustomers}
                    </p>
                </div>

                <div className="bg-[#12171A] rounded-2xl p-4 shadow-sm">
                    <p className="text-[11px] font-semibold tracking-widest text-white/40 uppercase">
                        Outstanding balance
                    </p>
                    <p className="text-3xl font-bold mt-1 font-mono tabular-nums text-[#F87171] [text-shadow:0_0_18px_rgba(248,113,113,0.35)]">
                        Rs {totalOutstanding.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* SEARCH */}
            <div className="relative">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or phone…"
                    className="w-full border border-black/10 bg-white rounded-xl p-3 pl-11 text-[14px] outline-none focus:ring-2 focus:ring-[#0B6E4F]/30 focus:border-[#0B6E4F] transition shadow-sm"
                />
            </div>

            {/* LIST */}
            <div className="grid gap-3">
                {filteredCustomers.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-10 text-center text-black/30 text-sm">
                        No customers found
                    </div>
                )}

                {filteredCustomers.map((c) => (
                    <div
                        key={c.id}
                        onClick={() =>
                            navigate(`/credit-customers/${c.id}`)
                        }
                        className="bg-white p-4 rounded-2xl shadow-sm border border-black/5 cursor-pointer hover:shadow-md hover:border-black/10 transition"
                    >
                        <div className="flex justify-between items-center gap-3">

                            {/* NAME */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#F3F6F4] flex items-center justify-center text-[#4338CA] font-semibold text-sm shrink-0">
                                    {(c.name || "?").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-[15px] text-[#14181C]">
                                        {c.name}
                                    </p>
                                    <p className="text-[13px] text-black/40 font-mono">
                                        {c.phone}
                                    </p>
                                </div>
                            </div>

                            {/* BALANCE */}
                            <div className="text-right shrink-0">
                                <p className={`text-lg font-bold font-mono tabular-nums ${c.totalBalance > 0 ? "text-red-600" : "text-[#0B6E4F]"}`}>
                                    Rs {c.totalBalance}
                                </p>

                                <p className="text-[12px] text-black/40 mt-0.5">
                                    {c.activeCreditSales} invoices
                                </p>
                            </div>

                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">

                    <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">

                        <h2 className="text-lg font-semibold text-[#14181C]">
                            Create customer
                        </h2>

                        <div className="space-y-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-black/60 font-medium">
                                    Customer name
                                </label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Nimal Perera"
                                    className="w-full border border-black/10 bg-[#FAFAF8] rounded-xl p-3 text-[14px] outline-none focus:ring-2 focus:ring-[#0B6E4F]/30 focus:border-[#0B6E4F] transition"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-black/60 font-medium">
                                    Phone number
                                </label>
                                <input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="07X XXX XXXX"
                                    className="w-full border border-black/10 bg-[#FAFAF8] rounded-xl p-3 text-[14px] font-mono outline-none focus:ring-2 focus:ring-[#0B6E4F]/30 focus:border-[#0B6E4F] transition"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2.5 bg-[#F3F6F4] hover:bg-[#E7ECE9] text-black/70 rounded-xl font-medium text-[14px] cursor-pointer transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleCreateCustomer}
                                className="px-4 py-2.5 bg-[#0B6E4F] hover:bg-[#0A5F44] text-white rounded-xl font-medium text-[14px] cursor-pointer transition shadow-sm"
                            >
                                Save
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}