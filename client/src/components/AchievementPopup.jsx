import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AchievementPopup.module.css';

const BADGE_ICONS = {
  'Budget Master': '🎯',
  'Smart Investor': '📈',
  'Risk Taker': '🔥',
  'First Trade': '🏅',
  'Survivor': '🛡️',
};

export const AchievementPopup = ({ badge, onComplete }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (badge) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [badge, onComplete]);

  return (
    <AnimatePresence>
      {visible && badge && (
        <motion.div
          className={styles.popup}
          initial={{ x: 300, opacity: 0, scale: 0.8 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 300, opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', damping: 18, stiffness: 200 }}
        >
          <div className={styles.icon}>{BADGE_ICONS[badge] || '🏆'}</div>
          <div>
            <p className={styles.label}>Achievement Unlocked!</p>
            <h3 className={styles.badgeName}>{badge}</h3>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
