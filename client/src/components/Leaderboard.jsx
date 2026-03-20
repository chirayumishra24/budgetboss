import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import styles from './Leaderboard.module.css';

const STORAGE_KEY = 'budgetboss_leaderboard';

export const saveScore = (name, portfolioValue, walletBalance) => {
  const entries = getLeaderboard();
  entries.push({
    name,
    totalValue: portfolioValue + walletBalance,
    portfolioValue,
    cashBalance: walletBalance,
    date: new Date().toLocaleDateString('en-IN'),
    timestamp: Date.now(),
  });
  entries.sort((a, b) => b.totalValue - a.totalValue);
  const top10 = entries.slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(top10));
  return top10;
};

export const getLeaderboard = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
};

export const Leaderboard = ({ onClose }) => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    setEntries(getLeaderboard());
  }, []);

  const getMedal = (i) => {
    if (i === 0) return 'GOLD';
    if (i === 1) return 'SILVER';
    if (i === 2) return 'BRONZE';
    return `#${i + 1}`;
  };

  return (
    <div className={styles.overlay}>
      <GlassCard className={styles.card}>
        <div className={styles.header}>
          <h2>Leaderboard</h2>
          <button className="btn" onClick={onClose} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>Close</button>
        </div>

        {entries.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '32px 0' }}>No scores yet. Complete a trading session to appear here.</p>
        ) : (
          <div className={styles.list}>
            {entries.map((entry, i) => (
              <motion.div
                key={entry.timestamp}
                className={`${styles.row} ${i < 3 ? styles.topThree : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <span className={`${styles.rank} ${i < 3 ? styles[`rank${i}`] : ''}`}>{getMedal(i)}</span>
                <div className={styles.info}>
                  <span className={styles.name}>{entry.name}</span>
                  <span className={styles.date}>{entry.date}</span>
                </div>
                <span className={styles.value}>Rs.{entry.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};
