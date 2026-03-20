import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { GlassCard } from '../components/GlassCard';
import { sounds } from '../utils/sounds';
import styles from './Level2.module.css';
import { ArrowRight, CheckCircle } from 'lucide-react';

const STAGES = [
  { key: 'oms', label: 'OMS', icon: '📋', desc: 'Checking wallet funds...' },
  { key: 'exchange', label: 'Exchange', icon: '🏛️', desc: 'Matching buy order...' },
  { key: 'cdsl', label: 'CDSL Vault', icon: '🔐', desc: 'Securing in Demat...' },
];

export const Level2 = () => {
  const { setLevel, addXp, unlockBadge, setMentorMessage, incrementStreak } = useGameStore();
  const [orderStatus, setOrderStatus] = useState('idle');
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    setMentorMessage(
      "Now let's look under the hood. When you buy a stock on Zerodha or Groww, " +
      "it doesn't just magically appear. Your order passes through the OMS, gets matched " +
      "on the Exchange, and finally settles in your CDSL Demat account. Click 'Buy' to see it happen."
    );
  }, [setMentorMessage]);

  const handleBuy = () => {
    sounds.click();
    setOrderStatus('oms');

    setTimeout(() => {
      sounds.click();
      setOrderStatus('exchange');
    }, 2000);

    setTimeout(() => {
      sounds.vaultOpen();
      setOrderStatus('cdsl');
    }, 4000);

    setTimeout(() => {
      sounds.success();
      setOrderStatus('done');
      setCountdown(24); // T+1 = 24 hours
      unlockBadge('First Trade');
      incrementStreak();

      setMentorMessage(
        "Your shares are now locked in the CDSL vault! 🔐 Fun fact: In India, " +
        "stock settlements follow T+1 — meaning the shares officially become yours " +
        "the next business day. This is called 'settlement'."
      );

      setTimeout(() => {
        addXp(250);
        setLevel(3);
      }, 3000);
    }, 6000);
  };

  // T+1 countdown
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 100);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const getStageState = (stageKey) => {
    const order = ['oms', 'exchange', 'cdsl', 'done'];
    const current = order.indexOf(orderStatus);
    const target = order.indexOf(stageKey);
    if (current > target) return 'completed';
    if (current === target) return 'active';
    return 'pending';
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <h2>Level 2: The Plumbing</h2>
        <p>See the machinery behind every stock trade. Watch your order flow through OMS → Exchange → CDSL Vault.</p>
      </div>

      <GlassCard className={styles.tradingDesk}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '2.5rem' }}>🏢</div>
          <div>
            <h3 style={{ margin: 0 }}>RELIANCE INDUSTRIES</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>NSE: RELIANCE · ₹2,500.00</p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleBuy}
          disabled={orderStatus !== 'idle'}
          style={{ marginTop: '16px' }}
        >
          {orderStatus === 'idle' ? '🛒 Buy 1 Share @ ₹2,500' : '⏳ Processing Order...'}
        </button>
      </GlassCard>

      {/* Pipeline */}
      <div className={styles.pipeline}>
        {STAGES.map((stage, i) => {
          const state = getStageState(stage.key);
          return (
            <React.Fragment key={stage.key}>
              {i > 0 && (
                <motion.div
                  className={styles.connector}
                  animate={{ opacity: state !== 'pending' ? 1 : 0.3 }}
                >
                  <div className={styles.connectorLine} style={{
                    background: state === 'completed' || (state === 'active' && i > 0)
                      ? 'var(--success)' : 'rgba(255,255,255,0.1)',
                  }} />
                  {state === 'active' && (
                    <motion.div
                      className={styles.dataPacket}
                      animate={{ left: ['0%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                </motion.div>
              )}

              <motion.div
                className={`${styles.node} ${styles[state]}`}
                animate={{
                  scale: state === 'active' ? 1.08 : 1,
                  borderColor: state === 'completed' ? 'var(--success)'
                    : state === 'active' ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                }}
              >
                <span className={styles.nodeIcon}>{stage.icon}</span>
                <h4 style={{ margin: '6px 0 2px' }}>{stage.label}</h4>
                {state === 'active' && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ margin: 0, fontSize: '0.7rem', color: 'var(--accent)' }}
                  >
                    {stage.desc}
                  </motion.p>
                )}
                {state === 'completed' && <CheckCircle size={18} color="var(--success)" style={{ marginTop: '4px' }} />}
                {state === 'active' && (
                  <motion.div
                    className={styles.pulse}
                    animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                )}
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>

      {/* T+1 Timer */}
      {countdown !== null && (
        <GlassCard style={{ textAlign: 'center', marginTop: '16px' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>T+1 SETTLEMENT</p>
          <h2 className="accent-text" style={{ margin: '4px 0' }}>⏱️ {countdown}h remaining</h2>
        </GlassCard>
      )}

      {/* Done */}
      <AnimatePresence>
        {orderStatus === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.successMessage}
          >
            <CheckCircle color="var(--success)" size={48} />
            <h3>Settlement Complete!</h3>
            <p>1 share of RELIANCE is now safely in your CDSL Demat Vault.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
