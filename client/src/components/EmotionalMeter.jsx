import React from 'react';
import { motion } from 'framer-motion';
import styles from './EmotionalMeter.module.css';

export const EmotionalMeter = ({ state = 'calm' }) => {
  // state: calm, stressed, panic
  const configs = {
    calm: { color: '#4caf50', speed: 1.2, label: '💚 Calm', size: 10 },
    stressed: { color: '#ffcf33', speed: 0.6, label: '💛 Stressed', size: 14 },
    panic: { color: '#f44336', speed: 0.3, label: '❤️‍🔥 PANIC', size: 18 },
  };
  
  const cfg = configs[state] || configs.calm;

  return (
    <div className={styles.meter}>
      <motion.div
        className={styles.pulse}
        animate={{
          scale: [1, 1.3, 1],
          boxShadow: [
            `0 0 ${cfg.size}px ${cfg.color}`,
            `0 0 ${cfg.size * 3}px ${cfg.color}`,
            `0 0 ${cfg.size}px ${cfg.color}`
          ]
        }}
        transition={{ repeat: Infinity, duration: cfg.speed, ease: 'easeInOut' }}
        style={{ background: cfg.color }}
      />
      <span className={styles.label} style={{ color: cfg.color }}>{cfg.label}</span>
    </div>
  );
};
