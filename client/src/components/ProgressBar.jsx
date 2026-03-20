import React from 'react';
import { motion } from 'framer-motion';
import styles from './ProgressBar.module.css';

export const ProgressBar = ({ progress = 0, label = 'Progress', showLabel = true }) => {
  return (
    <div className={styles.container}>
      {showLabel && (
        <div className={styles.header}>
          <span className={styles.label}>{label}</span>
          <span className={styles.percentage}>{Math.round(progress)}%</span>
        </div>
      )}
      <div className={styles.track}>
        <motion.div
          className={styles.fill}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        {/* Shimmer effect */}
        <div className={styles.shimmer} />
      </div>
    </div>
  );
};
