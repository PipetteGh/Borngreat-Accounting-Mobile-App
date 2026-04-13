export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 1, name: 'Food & Drinks', icon: 'fast-food', color: '#ffffff' },
  { id: 2, name: 'Transportation', icon: 'car', color: '#ffffff' },
  { id: 3, name: 'Housing', icon: 'home', color: '#ffffff' },
  { id: 4, name: 'Utilities', icon: 'flash', color: '#ffffff' },
  { id: 5, name: 'Entertainment', icon: 'play-circle', color: '#ffffff' },
  { id: 6, name: 'Shopping', icon: 'cart', color: '#ffffff' },
  { id: 7, name: 'Health', icon: 'medical', color: '#ffffff' },
  { id: 8, name: 'Education', icon: 'book', color: '#ffffff' },
  { id: 9, name: 'Personal Care', icon: 'brush', color: '#ffffff' },
  { id: 10, name: 'Gifts', icon: 'gift', color: '#ffffff' },
  { id: 11, name: 'Travel', icon: 'airplane', color: '#ffffff' },
  { id: 12, name: 'Others', icon: 'ellipsis-horizontal', color: '#ffffff' },
  { id: 13, name: 'Family & Childcare', icon: 'people', color: '#ffffff' },
  { id: 14, name: 'Family Support', icon: 'heart', color: '#ffffff' },
  { id: 15, name: 'Subscriptions', icon: 'albums', color: '#ffffff' },
  { id: 16, name: 'Insurance', icon: 'shield-checkmark', color: '#ffffff' },
  { id: 17, name: 'Taxes', icon: 'document-text', color: '#ffffff' },
  { id: 18, name: 'Debt Repayment', icon: 'cash', color: '#ffffff' },
  { id: 19, name: 'Investments', icon: 'trending-up', color: '#ffffff' },
  { id: 20, name: 'Savings', icon: 'wallet', color: '#ffffff' },
  { id: 21, name: 'Donations & Charity', icon: 'hand-left', color: '#ffffff' },
  { id: 22, name: 'Communication', icon: 'call', color: '#ffffff' },
  { id: 23, name: 'Clothing', icon: 'shirt', color: '#ffffff' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 1, name: 'Salary', icon: 'cash', color: '#ffffff' },
  { id: 2, name: 'Freelance', icon: 'laptop', color: '#ffffff' },
  { id: 3, name: 'Investments', icon: 'trending-up', color: '#ffffff' },
  { id: 4, name: 'Gifts', icon: 'gift', color: '#ffffff' },
  { id: 5, name: 'Rental', icon: 'key', color: '#ffffff' },
  { id: 6, name: 'Others', icon: 'ellipsis-horizontal', color: '#ffffff' },
  { id: 7, name: 'Side Hustle', icon: 'briefcase', color: '#ffffff' },
  { id: 8, name: 'Dividends', icon: 'pie-chart', color: '#ffffff' },
  { id: 9, name: 'Refunds', icon: 'return-up-back', color: '#ffffff' },
  { id: 10, name: 'Awards/Grants', icon: 'medal', color: '#ffffff' },
  { id: 14, name: 'Business Income', icon: 'storefront', color: '#ffffff' },
  { id: 15, name: 'Allowance', icon: 'card', color: '#ffffff' },
  { id: 16, name: 'Savings Interest', icon: 'analytics', color: '#ffffff' },
];
