import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './MarketEvent.module.css';

const EVENTS = [
  { title: 'RBI Rate Cut', desc: 'Reserve Bank cuts repo rate by 25bps. Banking stocks rally.', effect: 'bullish', sector: 'Banking', magnitude: 1.5 },
  { title: 'IT Earnings Beat', desc: 'Major IT companies report strong quarterly earnings.', effect: 'bullish', sector: 'Technology', magnitude: 1.3 },
  { title: 'Crude Oil Spike', desc: 'Oil prices surge on geopolitical tensions. Markets drop.', effect: 'bearish', sector: 'All', magnitude: 1.8 },
  { title: 'FII Selloff', desc: 'Foreign investors pull $2B from Indian markets.', effect: 'bearish', sector: 'All', magnitude: 2.0 },
  { title: 'Budget Boost', desc: 'Finance Minister announces tax relief for middle class.', effect: 'bullish', sector: 'All', magnitude: 1.4 },
  { title: 'Pharma Approval', desc: 'New drug approved by DCGI. Healthcare sector rallies.', effect: 'bullish', sector: 'Healthcare', magnitude: 1.6 },
  { title: 'Global Recession Fear', desc: 'US unemployment data spooks global markets.', effect: 'bearish', sector: 'All', magnitude: 2.2 },
  { title: 'Rupee Strengthens', desc: 'INR gains against USD on strong FDI inflows.', effect: 'bullish', sector: 'Technology', magnitude: 1.2 },
  { title: 'Adani Shock', desc: 'Short-seller report tanks conglomerate stocks.', effect: 'bearish', sector: 'Energy', magnitude: 2.5 },
  { title: 'IPO Frenzy', desc: 'New IPO oversubscribed 75x. Market sentiment soars.', effect: 'bullish', sector: 'All', magnitude: 1.3 },
];

export const useMarketEvents = () => {
  const [currentEvent, setCurrentEvent] = useState(null);

  const triggerRandomEvent = () => {
    const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    setCurrentEvent(event);
    setTimeout(() => setCurrentEvent(null), 6000);
    return event;
  };

  return { currentEvent, triggerRandomEvent, setCurrentEvent };
};

export const MarketEventBanner = ({ event }) => {
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className={`${styles.banner} ${styles[event.effect]}`}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div className={styles.indicator}>{event.effect === 'bullish' ? 'BULLISH' : 'BEARISH'}</div>
          <div className={styles.content}>
            <h3 className={styles.title}>{event.title}</h3>
            <p className={styles.desc}>{event.desc}</p>
          </div>
          <span className={styles.sector}>{event.sector}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
