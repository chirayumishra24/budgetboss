import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { sounds } from '../utils/sounds';
import styles from './DailyChallenge.module.css';

const REWARDS = [
  { label: 'Rs.500 Bonus', value: 500, color: 'var(--success)' },
  { label: '50 XP', value: 50, type: 'xp', color: 'var(--accent)' },
  { label: 'Rs.1000 Bonus', value: 1000, color: 'var(--success)' },
  { label: '100 XP', value: 100, type: 'xp', color: 'var(--accent)' },
  { label: 'Rs.2000 Jackpot', value: 2000, color: '#fbbf24' },
  { label: '25 XP', value: 25, type: 'xp', color: 'var(--accent)' },
  { label: 'Rs.750 Bonus', value: 750, color: 'var(--success)' },
  { label: 'No Reward', value: 0, color: 'var(--text-secondary)' },
];

const STORAGE_KEY = 'budgetboss_last_spin';

export const DailyChallenge = ({ onReward, onClose }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);

  const lastSpin = localStorage.getItem(STORAGE_KEY);
  const today = new Date().toDateString();
  const alreadySpun = lastSpin === today;

  const spin = () => {
    if (spinning || alreadySpun) return;
    sounds.click();
    setSpinning(true);

    const winIndex = Math.floor(Math.random() * REWARDS.length);
    const extraRotations = 360 * 5;
    const segmentAngle = 360 / REWARDS.length;
    const targetAngle = extraRotations + (360 - winIndex * segmentAngle - segmentAngle / 2);

    setRotation(targetAngle);

    setTimeout(() => {
      setSpinning(false);
      setResult(REWARDS[winIndex]);
      localStorage.setItem(STORAGE_KEY, today);
      if (REWARDS[winIndex].value > 0) {
        sounds.success();
        onReward(REWARDS[winIndex]);
      }
    }, 4000);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Daily Challenge</h2>
          <button className="btn" onClick={onClose} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>Close</button>
        </div>

        <div className={styles.wheelContainer}>
          <motion.div
            className={styles.wheel}
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.2, 0.8, 0.3, 1] }}
          >
            {REWARDS.map((r, i) => {
              const angle = (i * 360) / REWARDS.length;
              return (
                <div
                  key={i}
                  className={styles.segment}
                  style={{
                    transform: `rotate(${angle}deg)`,
                    color: r.color,
                  }}
                >
                  <span className={styles.segmentLabel}>{r.label}</span>
                </div>
              );
            })}
          </motion.div>
          <div className={styles.pointer} />
        </div>

        {result && (
          <motion.div
            className={styles.result}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3 style={{ color: result.color }}>{result.value > 0 ? `You won: ${result.label}` : 'Better luck tomorrow!'}</h3>
          </motion.div>
        )}

        <button
          className="btn btn-primary"
          onClick={spin}
          disabled={spinning || alreadySpun}
          style={{ width: '100%', marginTop: '16px' }}
        >
          {alreadySpun ? 'Come back tomorrow' : spinning ? 'Spinning...' : 'Spin the Wheel'}
        </button>
      </div>
    </div>
  );
};
