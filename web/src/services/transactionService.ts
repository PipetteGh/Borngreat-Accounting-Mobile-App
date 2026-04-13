import api from './api';

export interface Transaction {
  id: number;
  user_id: number;
  account_id: number;
  category_id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  transaction_date: string;
  created_at?: string;
}

export const transactionService = {
  async getTransactions(params?: any) {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  async createTransaction(data: Partial<Transaction>) {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  async updateTransaction(data: Partial<Transaction> & { id: number }) {
    const { id, ...payload } = data;
    const response = await api.put(`/transactions/${id}`, payload);
    return response.data;
  },

  async deleteTransaction(id: number) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  }
};
