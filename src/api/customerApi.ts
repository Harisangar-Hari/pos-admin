import { api } from "./axios";

// =========================
// CREDIT SUMMARY
// =========================
export const getCreditCustomers = async () => {
    const res = await api.get("/customers/credit-summary");

    return res.data.map((c: any) => ({
        id: c.Id,
        name: c.Name,
        phone: c.Phone,

        loyaltyPoints: c.LoyaltyPoints,
        loyaltyTier: c.LoyaltyTier,

        totalPurchases: Number(c.TotalPurchases),
        totalPaid: Number(c.TotalPaid),
        totalBalance: Number(c.TotalBalance),

        totalInvoices: c.TotalInvoices,
        activeCreditSales: c.ActiveCreditSales,
    }));
};

// =========================
// CREATE CUSTOMER
// =========================
export const createCustomer = async (data: {
    name: string;
    phone: string;
}) => {
    const res = await api.post("/customers", {
        Name: data.name,
        Phone: data.phone,
    });

    return {
        id: res.data.Id,
        name: res.data.Name,
        phone: res.data.Phone,
        createdAt: res.data.CreatedAt,
        loyaltyPoints: res.data.LoyaltyPoints,
        loyaltyTier: res.data.LoyaltyTier,
        totalSpent: Number(res.data.TotalSpent),
    };
};

export const getCustomerInvoices = async (id: string) => {
    const res = await api.get(`/customers/${id}/invoices`);

    return {
        customer: {
            Id: res.data.customer.Id,
            Name: res.data.customer.Name,
            Phone: res.data.customer.Phone,
        },

        invoices: res.data.invoices.map((invoice: any) => ({
            Id: invoice.Id,
            InvoiceNumber: invoice.InvoiceNumber,
            TotalAmount: Number(invoice.TotalAmount),
            PaidAmount: Number(invoice.PaidAmount),
            BalanceAmount: Number(invoice.BalanceAmount),
            CreatedAt: invoice.CreatedAt,
        })),
    };
};