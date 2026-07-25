import { useEffect, useState } from "react";
import { getProducts } from "../api/productsApi";
import { api } from "../api/axios";
import { useToast } from "../store/toastStore";
import { getSuppliers, createSupplier } from "../api/supplierApi";

interface Product {
    id: string;
    name: string;
    costPrice: number;
    stockQty: number;
}

interface Supplier {
    id: string;
    name: string;
    phone: string;
}

interface CartItem {
    productId: string;
    name: string;
    quantity: number;
    costPrice: number;
}

export default function Purchases() {
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);

    const [selectedSupplierId, setSelectedSupplierId] = useState("");

    const { showToast } = useToast();


    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [newSupplierName, setNewSupplierName] = useState("");
    const [newSupplierPhone, setNewSupplierPhone] = useState("");
    const [newSupplierEmail, setNewSupplierEmail] = useState("");
    const [newSupplierAddress, setNewSupplierAddress] = useState("");

    useEffect(() => {
        loadProducts();
        loadSuppliers();
    }, []);

    const loadProducts = async () => {
        const res = await getProducts();
        setProducts(res);
    };

    const loadSuppliers = async () => {
        try {
            const res = await getSuppliers();
            setSuppliers(res);
        } catch {
            showToast("Failed to load suppliers", "error");
        }
    };

    const addToCart = (p: Product) => {
        const exists = cart.find(c => c.productId === p.id);

        if (exists) {
            setCart(
                cart.map(c =>
                    c.productId === p.id
                        ? { ...c, quantity: c.quantity + 1 }
                        : c
                )
            );
        } else {
            setCart([
                ...cart,
                {
                    productId: p.id,
                    name: p.name,
                    quantity: 1,
                    costPrice: p.costPrice,
                },
            ]);
        }
    };

    const updateQty = (id: string, qty: number) => {
        setCart(
            cart.map(c =>
                c.productId === id ? { ...c, quantity: qty } : c
            )
        );
    };

    const updateCostPrice = (id: string, price: number) => {
        setCart(
            cart.map(c =>
                c.productId === id ? { ...c, costPrice: price } : c
            )
        );
    };

    const removeItem = (id: string) => {
        setCart(cart.filter(c => c.productId !== id));
    };

    const total = cart.reduce(
        (sum, i) => sum + i.costPrice * i.quantity,
        0
    );

    const submitPurchase = async () => {
        if (!selectedSupplierId)
            return showToast("Select supplier", "error");

        if (cart.length === 0)
            return showToast("Cart empty", "error");

        try {
            await api.post("/purchases", {
                supplierId: selectedSupplierId,
                items: cart.map(i => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    costPrice: i.costPrice,
                })),
            });

            showToast("Purchase saved", "success");

            setCart([]);
            setSelectedSupplierId("");
            loadProducts();
        } catch {
            showToast("Failed to save purchase", "error");
        }
    };
    const handleAddSupplier = async () => {
        if (!newSupplierName || !newSupplierPhone)
            return showToast("Enter supplier name & phone", "error");

        try {
            const res = await createSupplier({
                name: newSupplierName,
                phone: newSupplierPhone,
                email: newSupplierEmail,
                address: newSupplierAddress,
            });

            setSuppliers((prev) => [...prev, res]);
            setSelectedSupplierId(res.id);

            setShowSupplierModal(false);

            setNewSupplierName("");
            setNewSupplierPhone("");
            setNewSupplierEmail("");
            setNewSupplierAddress("");

            showToast("Supplier added", "success");
        } catch {
            showToast("Failed to add supplier", "error");
        }
    };

    return (
        <div className="min-h-screen bg-[#EEF1EF] p-4 md:p-6 font-sans text-[#14181C]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">

                {/* LEFT: PRODUCTS */}
                <div className="lg:col-span-2 bg-white p-4 rounded-2xl shadow-sm border border-black/5">
                    <h2 className="text-[11px] font-semibold tracking-widest text-black/40 uppercase mb-3">
                        Products
                    </h2>

                    {products.length === 0 ? (
                        <div className="py-12 text-center text-black/30 text-sm">
                            No products found
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {products.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => addToCart(p)}
                                    className="border border-black/10 p-3 rounded-xl cursor-pointer hover:border-[#0B6E4F]/40 hover:bg-[#F3F6F4] transition"
                                >
                                    <p className="font-medium text-[14px]">{p.name}</p>
                                    <p className="text-[12px] text-black/40 mt-1">
                                        Stock: <span className="font-mono">{p.stockQty}</span>
                                    </p>
                                    <p className="text-[12px] text-[#0B6E4F] font-mono font-semibold mt-0.5">
                                        Rs {p.costPrice}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: CART */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-black/5 space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-[11px] font-semibold tracking-widest text-black/40 uppercase">
                            Supplier
                        </h3>

                        <button
                            onClick={() => setShowSupplierModal(true)}
                            className="text-[#4338CA] text-[13px] font-medium hover:underline cursor-pointer"
                        >
                            + Add supplier
                        </button>
                    </div>

                    {/* SUPPLIER SELECT */}
                    <select
                        className="w-full border border-black/10 bg-[#FAFAF8] p-3 rounded-xl cursor-pointer text-[14px] outline-none focus:ring-2 focus:ring-[#4338CA]/30 focus:border-[#4338CA] transition"
                        value={selectedSupplierId}
                        onChange={(e) => setSelectedSupplierId(e.target.value)}
                    >
                        <option value="">Select supplier</option>
                        {suppliers.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.name} - {s.phone}
                            </option>
                        ))}
                    </select>

                    {cart.length === 0 ? (
                        <div className="py-8 text-center text-black/30 text-sm">
                            Tap a product to add it to this purchase
                        </div>
                    ) : (
                        <div className="divide-y divide-dashed divide-black/10">
                            {cart.map(i => (
                                <div key={i.productId} className="py-3 space-y-2 first:pt-0">

                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-[14px]">{i.name}</p>
                                        <button
                                            onClick={() => removeItem(i.productId)}
                                            className="text-red-500/70 hover:text-red-600 cursor-pointer transition"
                                            aria-label="Remove item"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m-8 0l1 13a2 2 0 002 2h4a2 2 0 002-2l1-13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {/* COST PRICE */}
                                        <div>
                                            <label className="text-[10px] font-semibold tracking-widest text-black/40 uppercase">
                                                Cost price
                                            </label>
                                            <input
                                                type="number"
                                                value={i.costPrice}
                                                onChange={(e) =>
                                                    updateCostPrice(
                                                        i.productId,
                                                        Number(e.target.value)
                                                    )
                                                }
                                                className="w-full mt-1 border border-black/10 bg-[#FAFAF8] p-2 rounded-lg font-mono text-[13px] outline-none focus:ring-2 focus:ring-[#0B6E4F]/30 focus:border-[#0B6E4F] transition"
                                            />
                                        </div>

                                        {/* QUANTITY */}
                                        <div>
                                            <label className="text-[10px] font-semibold tracking-widest text-black/40 uppercase">
                                                Quantity
                                            </label>
                                            <input
                                                type="number"
                                                value={i.quantity}
                                                onChange={(e) =>
                                                    updateQty(i.productId, Number(e.target.value))
                                                }
                                                className="w-full mt-1 border border-black/10 bg-[#FAFAF8] p-2 rounded-lg font-mono text-[13px] outline-none focus:ring-2 focus:ring-[#0B6E4F]/30 focus:border-[#0B6E4F] transition"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* TOTAL */}
                    <div className="bg-[#12171A] rounded-2xl p-4">
                        <p className="text-[11px] tracking-widest uppercase text-white/40 font-semibold">
                            Total
                        </p>
                        <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-[#4ADE9A] [text-shadow:0_0_18px_rgba(74,222,154,0.35)]">
                            Rs {total}
                        </p>
                    </div>

                    <button
                        onClick={submitPurchase}
                        className="w-full bg-[#0B6E4F] hover:bg-[#0A5F44] text-white p-3.5 rounded-2xl font-semibold tracking-wide cursor-pointer transition shadow-sm"
                    >
                        Save purchase
                    </button>
                </div>

            </div>

            {showSupplierModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-5 rounded-2xl w-full max-w-sm space-y-3 shadow-xl">

                        <h2 className="text-[15px] font-semibold">Add supplier</h2>

                        <input
                            placeholder="Name"
                            value={newSupplierName}
                            onChange={(e) => setNewSupplierName(e.target.value)}
                            className="w-full border border-black/10 bg-[#FAFAF8] p-3 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-[#4338CA]/30 focus:border-[#4338CA] transition"
                        />

                        <input
                            placeholder="Phone"
                            value={newSupplierPhone}
                            onChange={(e) => setNewSupplierPhone(e.target.value)}
                            className="w-full border border-black/10 bg-[#FAFAF8] p-3 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-[#4338CA]/30 focus:border-[#4338CA] transition"
                        />

                        <input
                            placeholder="Email"
                            value={newSupplierEmail}
                            onChange={(e) => setNewSupplierEmail(e.target.value)}
                            className="w-full border border-black/10 bg-[#FAFAF8] p-3 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-[#4338CA]/30 focus:border-[#4338CA] transition"
                        />

                        <textarea
                            placeholder="Address"
                            value={newSupplierAddress}
                            onChange={(e) => setNewSupplierAddress(e.target.value)}
                            rows={3}
                            className="w-full border border-black/10 bg-[#FAFAF8] p-3 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-[#4338CA]/30 focus:border-[#4338CA] transition resize-none"
                        />

                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={handleAddSupplier}
                                className="flex-1 bg-[#4338CA] hover:bg-[#372FA6] text-white p-2.5 rounded-xl font-medium text-[14px] cursor-pointer transition"
                            >
                                Save
                            </button>

                            <button
                                onClick={() => setShowSupplierModal(false)}
                                className="flex-1 bg-[#F3F6F4] hover:bg-[#E7ECE9] text-black/70 p-2.5 rounded-xl font-medium text-[14px] cursor-pointer transition"
                            >
                                Cancel
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>

    );
}