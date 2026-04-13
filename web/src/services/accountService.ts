import api from './api';

export interface Account {
  id: number;
  user_id: number;
  name: string;
  type: string;
  initial_balance: number;
  current_balance?: number;
  created_at: string;
  updated_at: string;
}

export const accountService = {
  async getAccounts(): Promise<Account[]> {
    const response = await api.get('/accounts');
    return response.data.accounts || [];
  },

  async createAccount(data: Partial<Account>): Promise<Account> {
    const response = await api.post('/accounts/create', data);
    return response.data.account;
  },

  async updateAccount(data: Partial<Account>): Promise<Account> {
    const response = await api.post('/accounts/update', data);
    return response.data.account;
  },

  async deleteAccount(id: number): Promise<void> {
    await api.post('/accounts/delete', { id });
  }
};
