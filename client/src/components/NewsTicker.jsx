import React from 'react';
import styles from './NewsTicker.module.css';

const HEADLINES = [
  "🔴 SENSEX surges 500 points on strong FII inflows",
  "📉 Rupee falls to 83.5 against USD amid global uncertainty",
  "🏦 RBI keeps repo rate unchanged at 6.5%",
  "📈 Nifty IT index rallies 3% on US earnings beat",
  "⚠️ Crude oil spikes above $90 on geopolitical tensions",
  "💰 SIP inflows hit record ₹18,000 Cr in March",
  "🚀 Small-cap index crosses 50,000 for the first time",
  "📊 Gold prices touch ₹72,000 per 10 grams",
  "🏢 Adani Group stocks surge after credit upgrade",
  "⬇️ Paytm shares drop 15% on regulatory concerns",
];

export const NewsTicker = () => {
  const doubledHeadlines = [...HEADLINES, ...HEADLINES];
  
  return (
    <div className={styles.ticker}>
      <div className={styles.tickerContent}>
        {doubledHeadlines.map((h, i) => (
          <span key={i} className={styles.headline}>{h}</span>
        ))}
      </div>
    </div>
  );
};
