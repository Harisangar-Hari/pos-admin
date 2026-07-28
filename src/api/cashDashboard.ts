import { api } from "./axios";


export interface CashEntry {

    id: string;

    date: string;

    type: "IN" | "OUT";

    amount: number;

    category: string;

    referenceId: string;

    description: string;

    createdAt: string;

}


export interface DailyCashDashboard {

    date: string;

    totalIn: number;

    totalOut: number;

    balance: number;

    entries: CashEntry[];

}


export const getDailyCash = async (
    date: string
): Promise<DailyCashDashboard> => {

    const res = await api.get(`/cash-dashboard/daily?date=${date}`);


    const data = res.data;


    return {

        date: data.date,

        totalIn: Number(data.totalIn ?? 0),

        totalOut: Number(data.totalOut ?? 0),

        balance: Number(data.balance ?? 0),


        entries: (data.entries ?? []).map((e: any) => ({

            id: e.Id,

            date: e.Date,

            type: e.Type,

            amount: Number(e.Amount ?? 0),

            category: e.Category,

            referenceId: e.ReferenceId,

            description: e.Description,

            createdAt: e.CreatedAt

        }))

    };

};

export const addManualCash = async (data: any) => {

    const res = await api.post(
        "/cash-dashboard/manual",
        data
    );

    return res.data;

};