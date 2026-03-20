import React from 'react';
import { motion } from 'framer-motion';
import styles from './Heatmap.module.css';

const SECTORS = [
  { name: 'Banking', stocks: ['HDFCBANK', 'ICICIBANK', 'SBIN', 'KOTAK'] },
  { name: 'Technology', stocks: ['TCS', 'INFY', 'WIPRO', 'HCL'] },
  { name: 'Energy', stocks: ['RELIANCE', 'ONGC', 'BPCL', 'IOC'] },
  { name: 'Healthcare', stocks: ['SUN', 'DR REDDY', 'CIPLA', 'DIVIS'] },
  { name: 'FMCG', stocks: ['HINDUNILEVER', 'ITC', 'NESTLE', 'BRITANNIA'] },
  { name: 'Auto', stocks: ['MARUTI', 'TATA MOTORS', 'M&M', 'BAJAJ'] },
];

export const Heatmap = ({ priceChanges = {} }) => {
  // Generate random changes if none provided
  const getChange = (stock) => {
    if (priceChanges[stock] !== undefined) return priceChanges[stock];
    return (Math.random() - 0.48) * 6; // slight bullish bias
  };

  const getColor = (change) => {
    if (change > 2) return '#16a34a';
    if (change > 0.5) return '#22c55e';
    if (change > -0.5) return '#64748b';
    if (change > -2) return '#ef4444';
    return '#dc2626';
  };

  const getSize = (change) => Math.max(1, Math.min(2, Math.abs(change) / 2));

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Market Heatmap</h3>
      <div className={styles.grid}>
        {SECTORS.map(sector => (
          <div key={sector.name} className={styles.sector}>
            <h4 className={styles.sectorName}>{sector.name}</h4>
            <div className={styles.stockGrid}>
              {sector.stocks.map(stock => {
                const change = getChange(stock);
                return (
                  <motion.div
                    key={stock}
                    className={styles.cell}
                    style={{
                      background: getColor(change),
                      flex: getSize(change),
                    }}
                    whileHover={{ scale: 1.05 }}
                    title={`${stock}: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%`}
                  >
                    <span className={styles.stockName}>{stock}</span>
                    <span className={styles.stockChange}>
                      {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
