import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSaleById, returnSale } from "../api/salesApi";
import { printReceipt, type ReceiptData } from "../utils/printReceipt";

export default function SaleDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [sale, setSale] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [returning, setReturning] = useState(false);

    useEffect(() => {
        loadSale();
    }, [id]);

    const loadSale = async () => {
        if (!id) return;

        try {
            const data = await getSaleById(id);
            console.log(data);
            setSale(data);

        } finally {
            setLoading(false);

        }
    };

    const isReturned =
        sale?.status === 1 || sale?.status === "Returned";

    const getStatus = () => {
        if (isReturned) return "Returned";
        if (sale?.balanceAmount > 0 && sale?.paidAmount > 0) return "Partial";
        if (sale?.paidAmount === 0) return "Unpaid";
        return "Completed";
    };

    const handleReturn = async () => {
        if (!sale || isReturned) return;

        const ok = confirm("Return this invoice?");
        if (!ok) return;

        try {
            setReturning(true);
            await returnSale(sale.invoiceNumber);
            alert("Returned successfully");
            await loadSale();
        } catch (err: any) {
            alert(err?.response?.data || "Failed");
        } finally {
            setReturning(false);
        }
    };

    const handlePrint = () => {
        if (!sale) return;

        // Map your sale data to the ReceiptData format
        const receiptData: ReceiptData = {
            invoiceNumber: sale.invoiceNumber,
            items: (sale.items ?? []).map((item: any) => ({
                name: item.productName || item.name || "Product",
                quantity: item.quantity,
                price: item.unitPrice
            })),
            customerName: sale.customer?.name,
            customerPhone: sale.customer?.phone,
            total: sale.totalAmount,
            paid: sale.paidAmount || 0,
            balance: sale.balanceAmount || 0,
            change: sale.change || 0,
            paymentMode: sale.paymentMode || "credit"
        };

        printReceipt(receiptData);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#EEF1EF] p-4 md:p-6">
                <div className="max-w-3xl mx-auto space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-16 rounded-2xl bg-black/5 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!sale) {
        return (
            <div className="min-h-screen bg-[#EEF1EF] flex items-center justify-center p-6">
                <div className="text-center">
                    <p className="text-black/40 text-sm">Invoice not found</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-3 text-[#4338CA] text-sm font-medium hover:underline cursor-pointer"
                    >
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    const statusColor = isReturned
        ? "bg-red-50 text-red-600"
        : sale.balanceAmount > 0
            ? "bg-amber-50 text-amber-700"
            : "bg-emerald-50 text-[#0B6E4F]";

    return (
        <div className="min-h-screen bg-[#EEF1EF] p-4 md:p-6 font-sans text-[#14181C]">
            <div className="max-w-3xl mx-auto space-y-5">

                {/* HEADER */}
                <div className="flex flex-wrap justify-between items-center gap-3">

                    <div className="flex gap-2 items-center flex-wrap">
                        <h1 className="text-xl font-bold font-mono">
                            {sale.invoiceNumber}
                        </h1>

                        <span className={`text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full ${statusColor}`}>
                            {getStatus()}
                        </span>
                    </div>

                    <div className="flex gap-2">

                        {!isReturned && (
                            <button
                                onClick={handleReturn}
                                disabled={returning}
                                className="text-[13px] font-medium px-3.5 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {returning ? "Processing…" : "Return invoice"}
                            </button>
                        )}

                        <button
                            onClick={handlePrint}
                            className="text-[13px] font-medium px-3.5 py-2 rounded-xl bg-[#4338CA] text-white hover:bg-[#3730A3] cursor-pointer transition shadow-sm"
                        >
                            🖨️ Print
                        </button>

                        <button
                            onClick={() => navigate(-1)}
                            className="text-[13px] font-medium bg-white border border-black/10 text-black/60 px-3.5 py-2 rounded-xl hover:bg-[#F3F6F4] cursor-pointer transition shadow-sm"
                        >
                            Back
                        </button>

                    </div>

                </div>

                {/* CUSTOMER INFO */}
                {sale.customer && (

                    <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#F3F6F4] flex items-center justify-center text-[#4338CA] font-semibold text-sm shrink-0">
                            {(sale.customer.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-medium text-[14px]">{sale.customer.name}</p>
                            <p className="text-[13px] text-black/40 font-mono">{sale.customer.phone}</p>
                        </div>
                    </div>
                )}

                {/* ITEMS */}
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-4">
                    <p className="text-[11px] font-semibold tracking-widest text-black/40 uppercase mb-2">
                        Items
                    </p>

                    <div className="divide-y divide-dashed divide-black/10">
                        {(sale.items ?? []).map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center py-3">

                                <div>
                                    <p className="font-medium text-[14px]">
                                        {item.productName || item.name || "Product"}
                                    </p>

                                    <p className="text-[13px] text-black/40 font-mono mt-0.5">
                                        {item.quantity} × Rs {item.unitPrice}
                                    </p>
                                </div>

                                <div className="font-mono font-semibold text-[14px]">
                                    Rs {item.total}
                                </div>

                            </div>
                        ))}
                    </div>
                </div>

                {/* PAYMENT SUMMARY */}
                <div className="bg-[#12171A] rounded-2xl p-5 shadow-sm space-y-3">

                    <div className="flex justify-between items-center">
                        <span className="text-[11px] tracking-widest uppercase text-white/40 font-semibold">Total</span>
                        <span className="font-mono font-semibold text-[15px] text-white">Rs {sale.totalAmount}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-[11px] tracking-widest uppercase text-white/40 font-semibold">Paid</span>
                        <span className="font-mono text-[15px] text-[#4ADE9A]">
                            Rs {sale.paidAmount || 0}
                        </span>
                    </div>

                    <div className="h-px bg-white/10" />

                    <div>
                        <p className="text-[11px] tracking-widest uppercase text-white/40 font-semibold">Balance</p>
                        <p
                            className={`mt-1 font-mono text-3xl font-semibold tabular-nums ${(sale.balanceAmount || 0) > 0
                                ? "text-[#F87171] [text-shadow:0_0_18px_rgba(248,113,113,0.35)]"
                                : "text-[#4ADE9A] [text-shadow:0_0_18px_rgba(74,222,154,0.35)]"
                                }`}
                        >
                            Rs {sale.balanceAmount || 0}
                        </p>
                    </div>

                </div>

                {/* PAYMENT HISTORY */}
                {sale.payments?.length > 0 && (
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-black/5">
                        <p className="text-[11px] font-semibold tracking-widest text-black/40 uppercase mb-2">
                            Payments
                        </p>

                        <div className="divide-y divide-dashed divide-black/10">
                            {sale.payments.map((p: any, i: number) => (
                                <div key={i} className="flex justify-between text-[13px] py-2.5">
                                    <span className="text-black/50">{new Date(p.paidAt).toLocaleString()}</span>
                                    <span className="font-mono font-medium">Rs {p.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}