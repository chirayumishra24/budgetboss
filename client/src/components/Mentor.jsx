import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Mentor.module.css';

const MENTOR_AVATAR = '🧑‍💼';

export const Mentor = ({ message, onDismiss }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.card}
            initial={{ y: 60, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className={styles.avatarRow}>
              <div className={styles.avatar}>{MENTOR_AVATAR}</div>
              <div>
                <h4 className={styles.name}>Arjun — Your Finance Mentor</h4>
                <p className={styles.subtitle}>Level-up your financial IQ</p>
              </div>
            </div>
            <div className={styles.bubble}>
              <p>{message}</p>
            </div>
            <button className="btn btn-primary" onClick={onDismiss} style={{ marginTop: '12px', alignSelf: 'flex-end' }}>
              Got it!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
