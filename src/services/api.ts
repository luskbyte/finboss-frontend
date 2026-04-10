import axios from 'axios';
import type { Income, Expense, Investment, DashboardSummary } from '../types';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
});

type ApiIncome = Income & { Date?: string };
type ApiExpense = Expense & { Date?: string };

const normalizeIncome = (item: ApiIncome): Income => ({
    ...item,
    date: item.date ?? item.Date ?? '',
});

const normalizeExpense = (item: ApiExpense): Expense => ({
    ...item,
    date: item.date ?? item.Date ?? '',
});

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' });

const parseDate = (value?: string) => {
    if (!value) return null;

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildDashboardFallback = async (year?: number): Promise<DashboardSummary> => {
    const [incomes, expenses, investments] = await Promise.all([
        api.get<ApiIncome[] | null>('/incomes').then(r => (r.data ?? []).map(normalizeIncome)),
        api.get<ApiExpense[] | null>('/expenses').then(r => (r.data ?? []).map(normalizeExpense)),
        api.get<Investment[] | null>('/investments').then(r => r.data ?? []).catch(() => []),
    ]);

    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};
    const monthlyMap = new Map<number, { month: string; income: number; expenses: number; balance: number }>();

    const ensureMonth = (date: Date) => {
        const monthIndex = date.getMonth();

        if (!monthlyMap.has(monthIndex)) {
            monthlyMap.set(monthIndex, {
                month: monthFormatter.format(date).replace('.', ''),
                income: 0,
                expenses: 0,
                balance: 0,
            });
        }

        return monthlyMap.get(monthIndex)!;
    };

    const filteredIncomes = incomes.filter((item) => {
        const parsed = parseDate(item.date);
        return parsed && (!year || parsed.getFullYear() === year);
    });

    const filteredExpenses = expenses.filter((item) => {
        const parsed = parseDate(item.date);
        return parsed && (!year || parsed.getFullYear() === year);
    });

    for (const income of filteredIncomes) {
        const parsed = parseDate(income.date);
        if (!parsed) continue;

        incomeByCategory[income.category] = (incomeByCategory[income.category] ?? 0) + income.amount;
        ensureMonth(parsed).income += income.amount;
    }

    for (const expense of filteredExpenses) {
        const parsed = parseDate(expense.date);
        if (!parsed) continue;

        expenseByCategory[expense.category] = (expenseByCategory[expense.category] ?? 0) + expense.amount;
        ensureMonth(parsed).expenses += expense.amount;
    }

    const monthlyBalance = Array.from(monthlyMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([, entry]) => ({
            ...entry,
            balance: entry.income - entry.expenses,
        }));

    const totalIncome = filteredIncomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
    const totalInvested = investments.reduce((sum, item) => sum + item.quantity * item.buy_price, 0);
    const portfolioValue = investments.reduce((sum, item) => sum + item.quantity * item.current_price, 0);
    const portfolioReturn = totalInvested > 0 ? ((portfolioValue - totalInvested) / totalInvested) * 100 : 0;

    return {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        balance: totalIncome - totalExpenses,
        total_invested: totalInvested,
        portfolio_value: portfolioValue,
        portfolio_return: portfolioReturn,
        income_by_category: incomeByCategory,
        expense_by_category: expenseByCategory,
        monthly_balance: monthlyBalance,
    };
};

export const dashboardApi = {
    getSummary: async (year?: number) => {
        try {
            const response = await api.get<DashboardSummary>('/dashboard', { params: { year } });
            return response.data;
        } catch {
            return buildDashboardFallback(year);
        }
    },
};

export const incomeApi = {
    list: () => api.get<ApiIncome[] | null>('/incomes').then(r => (r.data ?? []).map(normalizeIncome)),
    create: (data: Omit<Income, 'id' | 'created_at' | 'updated_at'>) =>
        api.post<ApiIncome>('/incomes', data).then(r => normalizeIncome(r.data)),
    update: (id: number, data: Omit<Income, 'id' | 'created_at' | 'updated_at'>) =>
        api.put<ApiIncome>(`/incomes/${id}`, data).then(r => normalizeIncome(r.data)),
    delete: (id: number) => api.delete(`/incomes/${id}`),
};

export const expenseApi = {
    list: () => api.get<ApiExpense[] | null>('/expenses').then(r => (r.data ?? []).map(normalizeExpense)),
    create: (data: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) =>
        api.post<ApiExpense>('/expenses', data).then(r => normalizeExpense(r.data)),
    update: (id: number, data: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) =>
        api.put<ApiExpense>(`/expenses/${id}`, data).then(r => normalizeExpense(r.data)),
    delete: (id: number) => api.delete(`/expenses/${id}`),
};

export const investmentApi = {
    list: () => api.get<Investment[] | null>('/investments').then(r => r.data ?? []),
    create: (data: Omit<Investment, 'id' | 'created_at' | 'updated_at'>) =>
        api.post<Investment>('/investments', data).then(r => r.data),
    update: (id: number, data: Omit<Investment, 'id' | 'created_at' | 'updated_at'>) =>
        api.put<Investment>(`/investments/${id}`, data).then(r => r.data),
    delete: (id: number) => api.delete(`/investments/${id}`),
};