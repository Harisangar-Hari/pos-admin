import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/axios";
import { useToast } from "../store/toastStore";
import { getCustomerInvoices } from "../api/customerApi";

interface Customer {
    Id: string;
    Name: string;
    Phone: string;
}

interface Invoice {
    Id: string;
    InvoiceNumber: string;
    TotalAmount: number;
    PaidAmount: number;
    BalanceAmount: number;
    CreatedAt: string;
}

export default function CustomerCreditDetails() {
    const { id } = useParams();
    const { showToast } = useToast();

    const [customer, setCustomer] = useState<any | null>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState(0);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            setLoading(true);
            if (!id) {
                return;
            }

            const res = await getCustomerInvoices(id);

            setCustomer(res.customer);
            setInvoices(res.invoices);

        } catch {
            showToast("Failed to load customer data", "error");
        } finally {
            setLoading(false);
        }
    };

    const totalBalance = invoices.reduce(
        (sum, i) => sum + (i.BalanceAmount || 0),
        0
    );

    const payCredit = async () => {
        if (amount <= 0) {
            showToast("Enter valid amount", "error");
            return;
        }

        try {
            await api.post("/customers/pay-customer-credit", {
                customerId: id,
                amount,
            });

            showToast("Payment successful", "success");
            setAmount(0);
            load();
        } catch {
            showToast("Payment failed", "error");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#EEF1EF] p-4 md:p-6">
                <div className="max-w-2xl mx-auto space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-16 rounded-2xl bg-black/5 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#EEF1EF] p-4 md:p-6 font-sans text-[#14181C]">
            <div className="max-w-2xl mx-auto space-y-5">

                {/* CUSTOMER HEADER */}
                {customer && (
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-black/5 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#F3F6F4] flex items-center justify-center text-[#4338CA] font-semibold text-base shrink-0">
                            {(customer.Name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#14181C]">{customer.Name}</h2>
                            <p className="text-[13px] text-black/40 font-mono">{customer.Phone}</p>
                        </div>
                    </div>
                )}

                {/* SUMMARY */}
                <div className="bg-[#12171A] rounded-2xl p-5 shadow-sm">
                    <p className="text-[11px] tracking-widest uppercase text-white/40 font-semibold">
                        Total outstanding
                    </p>
                    <p className="mt-1 font-mono text-4xl font-semibold tabular-nums text-[#F87171] [text-shadow:0_0_18px_rgba(248,113,113,0.35)]">
                        Rs {totalBalance}
                    </p>
                </div>

                {/* PAYMENT SECTION */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-black/5 space-y-3">
                    <p className="text-[11px] font-semibold tracking-widest text-black/40 uppercase">
                        Record a payment
                    </p>

                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        placeholder="0.00"
                        className="w-full border border-black/10 bg-[#FAFAF8] p-3 rounded-xl font-mono text-[15px] outline-none focus:ring-2 focus:ring-[#0B6E4F]/30 focus:border-[#0B6E4F] transition"
                    />

                    <button
                        onClick={payCredit}
                        className="w-full bg-[#0B6E4F] hover:bg-[#0A5F44] text-white p-3 rounded-xl font-semibold tracking-wide cursor-pointer transition shadow-sm"
                    >
                        Pay credit
                    </button>
                </div>

                {/* INVOICE LIST */}
                <div className="space-y-3">
                    <p className="text-[11px] font-semibold tracking-widest text-black/40 uppercase px-1">
                        Invoices
                    </p>

                    {invoices.length === 0 && (
                        <div className="bg-white p-10 rounded-2xl shadow-sm border border-black/5 text-center text-black/30 text-sm">
                            No invoices found
                        </div>
                    )}

                    {invoices.map((inv) => (
                        <div
                            key={inv.Id}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-black/5"
                        >
                            <div className="flex justify-between gap-3">
                                <div>
                                    <p className="font-semibold font-mono text-[14px]">
                                        {inv.InvoiceNumber}
                                    </p>

                                    <p className="text-[13px] text-black/40 mt-0.5">
                                        {new Date(inv.CreatedAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="text-right space-y-0.5">
                                    <p className="text-[13px] text-black/50">
                                        Total <span className="font-mono text-[#14181C] ml-1">Rs {inv.TotalAmount}</span>
                                    </p>
                                    <p className="text-[13px] text-black/50">
                                        Paid <span className="font-mono text-[#0B6E4F] ml-1">Rs {inv.PaidAmount}</span>
                                    </p>
                                    <p className="text-[14px] text-red-600 font-bold font-mono">
                                        Rs {inv.BalanceAmount}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}