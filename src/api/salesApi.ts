import { api } from "./axios";

// =========================
// GET ALL SALES
// =========================
export const getSales = async () => {
    const res = await api.get("/sales");

    return res.data.map((sale: any) => ({
        id: sale.Id,
        invoiceNumber: sale.InvoiceNumber,
        totalAmount: Number(sale.TotalAmount),
        paidAmount: Number(sale.PaidAmount),
        balanceAmount: Number(sale.BalanceAmount),
        createdAt: sale.CreatedAt,
        status: sale.Status,
        isCreditSale: sale.IsCreditSale,

        customerName: sale.CustomerName,
        customerPhone: sale.CustomerPhone,

        itemsCount: sale.itemsCount,
    }));
};

// =========================
// GET SALE BY ID
// =========================
export const getSaleById = async (id: string) => {
    const res = await api.get(`/sales/${id}`);

    const sale = res.data;

    return {
        id: sale.Id,
        invoiceNumber: sale.InvoiceNumber,
        totalAmount: Number(sale.TotalAmount),
        paidAmount: Number(sale.PaidAmount),
        balanceAmount: Number(sale.BalanceAmount),
        createdAt: sale.CreatedAt,
        status: sale.Status,
        isCreditSale: sale.IsCreditSale,

        customer: sale.Customers
            ? {
                id: sale.Customers.Id,
                name: sale.Customers.Name,
                phone: sale.Customers.Phone,
            }
            : null,

        items: (sale.SaleItems || []).map((item: any) => ({
            productName: item.Products.Name,
            quantity: item.Quantity,
            unitPrice: Number(item.UnitPrice),
            total: Number(item.Total),
        })),

        payments: (sale.CreditPayments || []).map((payment: any) => ({
            amount: Number(payment.Amount),
            paidAt: payment.PaidAt,
        })),
    };
};

// =========================
// RETURN SALE
// =========================
export const returnSale = async (invoiceNumber: string) => {
    const res = await api.post(`/sales/return/${invoiceNumber}`);
    return res.data;
};