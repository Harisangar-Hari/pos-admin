import { useEffect, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/productsApi";

import ProductForm from "../components/forms/ProductForm";
import { getCategories } from "../api/categoriesApi";

interface Product {
  id: string;
  name: string;
  barcode: string;
  sku: string;
  price: number;
  costPrice: number;
  stockQty: number;
  reorderLevel: number;
  categoryId?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    barcode: "",
    sku: "",
    price: 0,
    costPrice: 0,
    stockQty: 0,
    reorderLevel: 0,
    categoryId: "",
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const openCreate = () => {
    setForm({
      name: "",
      barcode: "",
      sku: "",
      price: 0,
      costPrice: 0,
      stockQty: 0,
      reorderLevel: 0,
      categoryId: "",
    });

    setEditId(null);
    setIsModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      barcode: p.barcode,
      sku: p.sku,
      price: p.price,
      costPrice: p.costPrice,
      stockQty: p.stockQty,
      reorderLevel: p.reorderLevel,
      categoryId: p.categoryId || "",
    });

    setEditId(p.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await updateProduct(editId, form);
      } else {
        await createProduct(form);
      }

      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;

    try {
      await deleteProduct(id);
      loadProducts();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-xl bg-black/5 animate-pulse"
          />
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
            Products
          </h1>
          <p className="text-[13px] text-black/40 mt-0.5">
            {products.length} {products.length === 1 ? "product" : "products"} in catalog
          </p>
        </div>

        <button
          onClick={openCreate}
          className="bg-[#0B6E4F] hover:bg-[#0A5F44] text-white px-4 py-2.5 rounded-xl font-medium text-[14px] cursor-pointer transition shadow-sm inline-flex items-center gap-1.5 justify-center"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add product
        </button>
      </div>

      {/* ================= MOBILE VIEW ================= */}
      <div className="md:hidden space-y-3">

        {products.length === 0 && (
          <div className="bg-white rounded-2xl border border-black/5 py-12 text-center text-black/30 text-sm">
            No products yet — add your first one
          </div>
        )}

        {products.map((p) => {
          const category = categories.find(c => c.id === p.categoryId);
          const lowStock = p.stockQty <= p.reorderLevel;

          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow-sm border border-black/5 p-4 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-[#14181C] text-[15px]">
                  {p.name}
                </div>
                {lowStock && (
                  <span className="text-[10px] font-semibold tracking-wide uppercase bg-red-50 text-red-600 px-2 py-1 rounded-full shrink-0">
                    Low stock
                  </span>
                )}
              </div>

              <div className="text-[12px] text-black/40 font-mono">
                {p.barcode}
              </div>

              <div className="flex justify-between text-sm pt-1">
                <span className="text-black/40 text-[12px] uppercase tracking-wide font-semibold">Price</span>
                <span className="font-mono font-semibold">Rs {p.price}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-black/40 text-[12px] uppercase tracking-wide font-semibold">Stock</span>
                <span className={`font-mono font-semibold ${lowStock ? "text-red-600" : ""}`}>
                  {p.stockQty}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-black/40 text-[12px] uppercase tracking-wide font-semibold">Category</span>
                <span>{category ? category.name : "—"}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => openEdit(p)}
                  className="flex-1 bg-[#F3F6F4] hover:bg-[#E7ECE9] text-black/70 py-2 rounded-xl font-medium text-[13px] cursor-pointer transition"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(p.id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl font-medium text-[13px] cursor-pointer transition"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}

      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-black/5 overflow-x-auto">

        <table className="w-full text-[13px]">

          <thead className="text-left text-black/40">
            <tr className="border-b border-black/5">
              <th className="p-4 font-semibold text-[11px] uppercase tracking-widest">Name</th>
              <th className="font-semibold text-[11px] uppercase tracking-widest">Barcode</th>
              <th className="font-semibold text-[11px] uppercase tracking-widest">Price</th>
              <th className="font-semibold text-[11px] uppercase tracking-widest">Stock</th>
              <th className="font-semibold text-[11px] uppercase tracking-widest">Category</th>
              <th className="font-semibold text-[11px] uppercase tracking-widest text-right pr-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-black/30">
                  No products yet — add your first one
                </td>
              </tr>
            )}

            {products.map((p) => {
              const category = categories.find(
                (c) => c.id === p.categoryId
              );
              const lowStock = p.stockQty <= p.reorderLevel;

              return (
                <tr
                  key={p.id}
                  className="border-b border-black/5 last:border-0 hover:bg-[#FAFAF8] transition"
                >
                  <td className="p-4 font-medium text-[#14181C]">
                    {p.name}
                  </td>

                  <td className="font-mono text-black/50">{p.barcode}</td>

                  <td className="font-mono font-semibold">Rs {p.price}</td>

                  <td>
                    <span className={`font-mono font-semibold ${lowStock ? "text-red-600" : ""}`}>
                      {p.stockQty}
                    </span>
                    {lowStock && (
                      <span className="ml-2 text-[10px] font-semibold tracking-wide uppercase bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                        Low
                      </span>
                    )}
                  </td>

                  <td className="text-black/60">
                    {category ? category.name : "—"}
                  </td>

                  <td className="p-2 pr-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEdit(p)}
                        className="px-3 py-1.5 bg-[#F3F6F4] hover:bg-[#E7ECE9] text-black/70 rounded-lg font-medium cursor-pointer transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium cursor-pointer transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">

            <h2 className="text-lg font-semibold text-[#14181C]">
              {editId ? "Edit product" : "Add product"}
            </h2>

            <ProductForm
              form={form}
              setForm={setForm}
              categories={categories}
            />

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 bg-[#F3F6F4] hover:bg-[#E7ECE9] text-black/70 rounded-xl font-medium text-[14px] cursor-pointer transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
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