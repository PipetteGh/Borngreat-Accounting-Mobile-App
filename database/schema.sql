CREATE DATABASE IF NOT EXISTS borngreat_accounting;
USE borngreat_accounting;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    currency_symbol VARCHAR(10) DEFAULT '$',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expense_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS income_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) DEFAULT 'Cash', -- e.g., Cash, Bank, Mobile Money
    initial_balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_id INT,
    type ENUM('income', 'expense') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    category_id INT NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    month_year CHAR(7) NOT NULL, -- Format: YYYY-MM
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_budget (user_id, category_id, month_year),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE CASCADE
);

-- Seed Expense Categories
INSERT INTO expense_categories (name, icon, color, sort_order) VALUES
('Food & Drinks', 'fast-food', '#ffffff', 1),
('Transportation', 'car', '#ffffff', 2),
('Housing', 'home', '#ffffff', 3),
('Utilities', 'flash', '#ffffff', 4),
('Entertainment', 'play-circle', '#ffffff', 5),
('Shopping', 'cart', '#ffffff', 6),
('Health', 'medical', '#ffffff', 7),
('Education', 'book', '#ffffff', 8),
('Personal Care', 'brush', '#ffffff', 9),
('Gifts', 'gift', '#ffffff', 10),
('Travel', 'airplane', '#ffffff', 11),
('Others', 'ellipsis-horizontal', '#ffffff', 12);

-- Seed Income Categories
INSERT INTO income_categories (name, icon, color, sort_order) VALUES
('Salary', 'cash', '#ffffff', 1),
('Freelance', 'laptop', '#ffffff', 2),
('Investments', 'trending-up', '#ffffff', 3),
('Gifts', 'gift', '#ffffff', 4),
('Rental', 'key', '#ffffff', 5),
('Others', 'ellipsis-horizontal', '#ffffff', 6);
