import { useEffect, useState } from "react";
import { getDailyCash } from "../api/cashDashboard";

interface CashEntry {
    id: string;
    type: "IN" | "OUT";
    amount: number;
    description?: string;
    date: string;
}

export default function CashDashboard() {
    const [date, setDate] = useState<string>(
        new Date().toISOString().split("T")[0]
    );

    const [data, setData] = useState<any>(null);
    const [entries, setEntries] = useState<CashEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [date]);

    const loadData = async () => {
        try {
            setLoading(true);

            const res = await getDailyCash(date);

            setData(res);
            setEntries(res?.entries ?? []);
        } catch (err) {
            console.error("Cash dashboard error:", err);
            setData(null);
            setEntries([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#EEF1EF] p-4 md:p-6 font-sans text-[#14181C]">
            <div className="max-w-6xl mx-auto space-y-5">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">Cash Dashboard</h1>

                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border border-black/10 bg-white shadow-sm px-3 py-2.5 rounded-xl cursor-pointer text-[14px] outline-none focus:ring-2 focus:ring-black/10 transition"
                    />
                </div>

                {/* SUMMARY */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-black/5 relative overflow-hidden">
                        <div className="absolute left-0 top-0 h-full w-1 bg-[#0B6E4F]" />
                        <p className="text-[11px] font-semibold tracking-widest text-black/40 uppercase">
                            Total in
                        </p>
                        <p className="text-2xl font-mono font-bold mt-1 text-[#0B6E4F]">
                            Rs {data?.totalIn ?? 0}
                        </p>
                    </div>

                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-black/5 relative overflow-hidden">
                        <div className="absolute left-0 top-0 h-full w-1 bg-red-500" />
                        <p className="text-[11px] font-semibold tracking-widest text-black/40 uppercase">
                            Total out
                        </p>
                        <p className="text-2xl font-mono font-bold mt-1 text-red-600">
                            Rs {data?.totalOut ?? 0}
                        </p>
                    </div>

                    <div className="p-4 bg-[#12171A] rounded-2xl shadow-sm">
                        <p className="text-[11px] font-semibold tracking-widest text-white/40 uppercase">
                            Balance
                        </p>
                        <p className="text-2xl font-mono font-bold mt-1 tabular-nums text-[#4ADE9A] [text-shadow:0_0_18px_rgba(74,222,154,0.35)]">
                            Rs {data?.balance ?? 0}
                        </p>
                    </div>

                </div>

                {/* TABLE */}
                <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-black/5">
                    <table className="min-w-full border-collapse text-[13px]">

                        {/* HEADER */}
                        <thead>
                            <tr className="text-left text-black/40 border-b border-black/5">
                                <th className="p-4 font-semibold text-[11px] uppercase tracking-widest">Type</th>
                                <th className="font-semibold text-[11px] uppercase tracking-widest">Amount</th>
                                <th className="font-semibold text-[11px] uppercase tracking-widest">Description</th>
                                <th className="font-semibold text-[11px] uppercase tracking-widest pr-4">Date</th>
                            </tr>
                        </thead>

                        {/* BODY */}
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="text-center p-8 text-black/30">
                                        Loading...
                                    </td>
                                </tr>
                            ) : entries.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center p-10 text-black/30">
                                        No entries found
                                    </td>
                                </tr>
                            ) : (
                                entries.map((item, index) => (
                                    <tr
                                        key={item.id ?? index}
                                        className="border-b border-black/5 last:border-0 hover:bg-[#FAFAF8] transition"
                                    >
                                        <td className="p-4">
                                            <span
                                                className={`text-[10px] font-semibold tracking-wide uppercase px-2 py-1 rounded-full ${item.type === "IN"
                                                    ? "bg-[#0B6E4F]/10 text-[#0B6E4F]"
                                                    : "bg-red-50 text-red-600"
                                                    }`}
                                            >
                                                {item.type}
                                            </span>
                                        </td>

                                        <td className={`font-mono font-semibold ${item.type === "IN" ? "text-[#0B6E4F]" : "text-red-600"}`}>
                                            {item.type === "IN" ? "+" : "−"} Rs {item.amount}
                                        </td>

                                        <td className="text-black/60">
                                            {item.description ?? "-"}
                                        </td>

                                        <td className="text-[12px] text-black/40 pr-4">
                                            {new Date(item.date).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                    </table>
                </div>
            </div>
        </div>
    );
}