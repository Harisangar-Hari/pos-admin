import { api } from "./axios";

export const getProducts = async () => {

  const res = await api.get("/products");

  return res.data.map((p: any) => ({

    id: p.Id,

    name: p.Name,

    barcode: p.Barcode,

    sku: p.SKU,

    price: Number(p.Price),

    costPrice: Number(p.CostPrice),

    stockQty: p.StockQty,

    reorderLevel: p.ReorderLevel,

    categoryId: p.CategoryId,

    category: p.Categories
      ? {
        id: p.Categories.Id,
        name: p.Categories.Name
      }
      : null

  }));

};

export const createProduct = async (data: any) => {
  const res = await api.post("/products", data);
  return res.data;
};

export const updateProduct = async (id: string, data: any) => {
  const res = await api.put(`/products/${id}`, data);
  return res.data;
};

export const deleteProduct = async (id: string) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};