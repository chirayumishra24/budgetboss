-- server/schema.sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    wallet_balance DECIMAL(15,2) DEFAULT 10000.00,
    credit_score INTEGER DEFAULT 750,
    current_level INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS demat_holdings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    isin VARCHAR(12) NOT NULL,
    stock_name VARCHAR(100) NOT NULL,
    qty INTEGER NOT NULL,
    blocked_status BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(10) NOT NULL, -- BUY, SELL
    stock_name VARCHAR(100) NOT NULL,
    qty INTEGER NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert dummy user
INSERT INTO users (username, wallet_balance) VALUES ('player1', 10000.00) ON CONFLICT DO NOTHING;
