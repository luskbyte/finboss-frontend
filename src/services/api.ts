import axios from 'axios';
import type { Income, Expense, Investment, DashboardSummary } from '../types';

const api = axios.create({ baseURL: '/api/V1' });

export const dashboardApi = {
    getSummary: (year?: number) =>
        api.get<DashboardSummary>('/dashboard', { params: { year } }).then(r => r.data),
};

export const incomeApi = {
    list: () => api.get<Income[]>('/incomes').then(r => r.data),
    create: (data: Omit<Income, 'id' | 'created_at' | 'updated_at'>) =>
        api.post<Income>('/incomes', data).then(r => r.data),
    update: (id: number, data: Omit<Income, 'id' | 'created_at' | 'updated_at'>) =>
        api.put<Income>(`/incomes/${id}`, data).then(r => r.data),
    delete: (id: number) => api.delete(`/incomes/${id}`),
};

export const expenseApi = {
    list: () => api.get<Expense[]>('/expenses').then(r => r.data),
    create: (data: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) =>
        api.post<Expense>('/expenses', data).then(r => r.data),
    update: (id: number, data: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) =>
        api.put<Expense>(`/expenses/${id}`, data).then(r => r.data),
    delete: (id: number) => api.delete(`/expenses/${id}`),
};

export const investmentApi = {
    list: () => api.get<Investment[]>('/investments').then(r => r.data),
    create: (data: Omit<Investment, 'id' | 'created_at' | 'updated_at'>) =>
        api.post<Investment>('/investments', data).then(r => r.data),
    update: (id: number, data: Omit<Investment, 'id' | 'created_at' | 'updated_at'>) =>
        api.put<Investment>(`/investments/${id}`, data).then(r => r.data),
    delete: (id: number) => api.delete(`/investments/${id}`),
};