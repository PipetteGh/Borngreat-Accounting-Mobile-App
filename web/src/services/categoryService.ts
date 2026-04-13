import api from './api';

export const categoryService = {
  async getCategories(type?: string) {
    const response = await api.get('/categories', { params: { type } });
    return response.data.categories || [];
  }
};
