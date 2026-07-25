import Input from "../ui/Input";

interface Props {
  form: any;
  setForm: (v: any) => void;
  categories: any[];
}

export default function ProductForm({ form, setForm, categories }: Props) {
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
          <Input
            label="Barcode"
            placeholder="Scan or enter barcode"
            value={form.barcode}
            onChange={(e) =>
              setForm({ ...form, barcode: e.target.value })
            }
          />

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

    </div>
  );
}