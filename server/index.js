require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Endpoint: Mock T+1 Settlement for Level 2
app.post('/api/trade', async (req, res) => {
  const { userId, symbol, qty, price, type } = req.body;
  // Game logic: this would normally deduct wallet and insert into demat_holdings
  // For now, we simulate success
  res.json({ success: true, message: 'Order submitted to OMS', status: 'PROCESSING' });
});

// Sync frontend state updates to DB
app.post('/api/sync-game', async (req, res) => {
  const { userId, level, walletBalance, creditScore } = req.body;
  try {
    await pool.query(
      `UPDATE users SET current_level = $1, wallet_balance = $2, credit_score = $3 WHERE id = $4`,
      [level, walletBalance, creditScore, userId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DB Schema initialization endpoint (for prototyping)
app.get('/api/init', async (req, res) => {
  try {
    await pool.query(`
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
        type VARCHAR(10) NOT NULL,
        stock_name VARCHAR(100) NOT NULL,
        qty INTEGER NOT NULL,
        price DECIMAL(15,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      INSERT INTO users (username, wallet_balance) VALUES ('player1', 10000.00) ON CONFLICT DO NOTHING;
    `);
    res.send("Database schema initialized successfully.");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
