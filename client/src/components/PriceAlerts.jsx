import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../utils/sounds';
import styles from './PriceAlerts.module.css';

export const usePriceAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [triggered, setTriggered] = useState([]);

  const addAlert = (symbol, targetPrice, direction) => {
    sounds.click();
    setAlerts(prev => [...prev, {
      id: Date.now(),
      symbol,
      targetPrice: parseFloat(targetPrice),
      direction, // 'above' or 'below'
      active: true,
    }]);
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const checkAlerts = (prices) => {
    const newTriggered = [];
    setAlerts(prev => prev.map(alert => {
      if (!alert.active) return alert;
      const currentPrice = prices[alert.symbol];
      if (!currentPrice) return alert;

      const hit = alert.direction === 'above'
        ? currentPrice >= alert.targetPrice
        : currentPrice <= alert.targetPrice;

      if (hit) {
        sounds.alert();
        newTriggered.push({
          ...alert,
          currentPrice,
          time: new Date().toLocaleTimeString(),
        });
        return { ...alert, active: false };
      }
      return alert;
    }));

    if (newTriggered.length > 0) {
      setTriggered(prev => [...newTriggered, ...prev].slice(0, 10));
    }
  };

  return { alerts, triggered, addAlert, removeAlert, checkAlerts };
};

export const PriceAlertPanel = ({ alerts, triggered, onAdd, onRemove, stocks }) => {
  const [symbol, setSymbol] = useState('');
  const [target, setTarget] = useState('');
  const [direction, setDirection] = useState('above');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (symbol && target) {
      onAdd(symbol, target, direction);
      setTarget('');
    }
  };

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Price Alerts</h3>

      <form onSubmit={handleSubmit} className={styles.form}>
        <select value={symbol} onChange={e => setSymbol(e.target.value)} className={styles.select}>
          <option value="">Select stock</option>
          {stocks.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={direction} onChange={e => setDirection(e.target.value)} className={styles.select}>
          <option value="above">Goes above</option>
          <option value="below">Falls below</option>
        </select>
        <input
          type="number"
          placeholder="Target price"
          value={target}
          onChange={e => setTarget(e.target.value)}
          className={styles.input}
          step="0.01"
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
          Set Alert
        </button>
      </form>

      {alerts.filter(a => a.active).length > 0 && (
        <div className={styles.alertList}>
          <p className={styles.subLabel}>Active Alerts</p>
          {alerts.filter(a => a.active).map(a => (
            <div key={a.id} className={styles.alertRow}>
              <span><strong>{a.symbol}</strong> {a.direction} Rs.{a.targetPrice}</span>
              <button className={styles.removeBtn} onClick={() => onRemove(a.id)}>X</button>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {triggered.length > 0 && (
          <div className={styles.triggeredList}>
            <p className={styles.subLabel}>Triggered</p>
            {triggered.slice(0, 5).map((t, i) => (
              <motion.div
                key={t.id + '-' + i}
                className={styles.triggeredRow}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <span><strong>{t.symbol}</strong> hit Rs.{t.currentPrice.toFixed(2)} ({t.direction} Rs.{t.targetPrice})</span>
                <span className={styles.time}>{t.time}</span>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
