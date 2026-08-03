import { useEffect, useState } from "react";
import Input from "../ui/Input";
import { printBarcode } from "../../utils/printBarcode";

interface Props {
  form: any;
  setForm: (v: any) => void;
  categories: any[];
}

function generateBarcode() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${timestamp}${random}`;
}

export default function ProductForm({ form, setForm, categories }: Props) {
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printCopies, setPrintCopies] = useState(1);

  useEffect(() => {
    if (!form.barcode) {
      setForm({ ...form, barcode: generateBarcode() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenPrintModal = () => {
    if (!form.barcode) return;
    setPrintCopies(1);
    setIsPrintModalOpen(true);
  };

  const handleConfirmPrint = () => {
    if (printCopies < 1) return;

    printBarcode({
      productName: form.name || "Unnamed product",
      barcode: form.barcode,
      price: form.price,
      copies: printCopies,
    });

    setIsPrintModalOpen(false);
  };

  return (
    <div className="space-y-5">

      {/* IDENTITY */}
      <div className="space-y-3">
        <p className="text-[11px] font-semibold tracking-widest text-black/40 uppercase">
          Identity
        </p>

        <Input
          label="Product Name"
          placeholder="Enter product name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Input
              label="Barcode"
              placeholder="Auto-generated"
              value={form.barcode}
              onChange={(e) =>
                setForm({ ...form, barcode: e.target.value })
              }
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setForm({ ...form, barcode: generateBarcode() })
                }
                className="text-[#4338CA] text-[12px] font-medium hover:underline cursor-pointer"
              >
                Generate new
              </button>

              <button
                type="button"
                onClick={handleOpenPrintModal}
                disabled={!form.barcode}
                className="text-[#0B6E4F] disabled:text-black/30 disabled:cursor-not-allowed text-[12px] font-medium hover:underline cursor-pointer"
              >
                Print barcode
              </button>
            </div>
          </div>

          <Input
            label="SKU"
            placeholder="Stock keeping unit"
            value={form.sku}
            onChange={(e) =>
              setForm({ ...form, sku: e.target.value })
            }
          />
        </div>
      </div>

      {/* PRICING */}
      <div className="space-y-3">
        <p className="text-[11px] font-semibold tracking-widest text-black/40 uppercase">
          Pricing
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Selling Price"
            type="number"
            placeholder="0.00"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: Number(e.target.value) })
            }
          />

          <Input
            label="Cost Price"
            type="number"
            placeholder="0.00"
            value={form.costPrice}
            onChange={(e) =>
              setForm({ ...form, costPrice: Number(e.target.value) })
            }
          />
        </div>
      </div>

      {/* STOCK */}
      <div className="space-y-3">
        <p className="text-[11px] font-semibold tracking-widest text-black/40 uppercase">
          Stock
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Stock Quantity"
            type="number"
            placeholder="0"
            value={form.stockQty}
            onChange={(e) =>
              setForm({ ...form, stockQty: Number(e.target.value) })
            }
          />

          <Input
            label="Reorder Level"
            type="number"
            placeholder="Minimum stock alert"
            value={form.reorderLevel}
            onChange={(e) =>
              setForm({ ...form, reorderLevel: Number(e.target.value) })
            }
          />
        </div>
      </div>

      {/* CATEGORY DROPDOWN */}
      <div className="space-y-3">
        <p className="text-[11px] font-semibold tracking-widest text-black/40 uppercase">
          Organization
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] text-black/60 font-medium">
            Category
          </label>

          <select
            value={form.categoryId}
            onChange={(e) =>
              setForm({ ...form, categoryId: e.target.value })
            }
            className="border border-black/10 bg-[#FAFAF8] p-2.5 rounded-xl text-[14px] cursor-pointer outline-none focus:ring-2 focus:ring-[#4338CA]/30 focus:border-[#4338CA] transition"
          >
            <option value="">Select category</option>

            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}

          </select>
        </div>
      </div>

      {/* PRINT BARCODE MODAL */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl">

            <h2 className="text-lg font-semibold text-[#14181C]">
              Print barcode stickers
            </h2>

            <p className="text-[13px] text-black/60">
              How many stickers do you want to print?
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-black/50 uppercase tracking-wide">
                Number of copies
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={printCopies}
                onChange={(e) => setPrintCopies(Number(e.target.value))}
                className="border border-black/10 bg-[#FAFAF8] p-3 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-[#0B6E4F]/30 focus:border-[#0B6E4F] transition font-mono text-center text-lg"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-[#F3F6F4] hover:bg-[#E7ECE9] text-black/70 rounded-xl font-medium text-[14px] cursor-pointer transition"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmPrint}
                className="flex-1 px-4 py-2.5 bg-[#0B6E4F] hover:bg-[#0A5F44] text-white rounded-xl font-medium text-[14px] cursor-pointer transition"
              >
                Print {printCopies} {printCopies === 1 ? "sticker" : "stickers"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}