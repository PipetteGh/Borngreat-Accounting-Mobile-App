import api from './api';

export interface Budget {
  id: number;
  user_id: number;
  category_id: number;
  amount: number;
  period: string;
  created_at?: string;
}

export const budgetService = {
  async getBudgets(monthYear: string) {
    const response = await api.get(`/budgets?month_year=${monthYear}`);
    return response.data.budgets || [];
  },

  async saveBudget(data: { category_id: number; amount: number; month_year: string }) {
    const response = await api.post('/budgets', data);
    return response.data;
  },

  async deleteBudget(id: number) {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  }
};
