import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { GlassCard } from '../components/GlassCard';
import { sounds } from '../utils/sounds';
import styles from './Level1.module.css';

const CATEGORY_META = {
  needs: { label: 'Needs', icon: '🏠', ideal: '50%', color: 'var(--accent)' },
  wants: { label: 'Wants', icon: '🛍️', ideal: '30%', color: 'var(--warning)' },
  investments: { label: 'Investments', icon: '📈', ideal: '20%', color: 'var(--success)' },
};

export const Level1 = () => {
  const {
    walletBalance, needs, wants, investments, income,
    allocateFunds, deallocateFunds, penalizeCreditScore, addXp, completeLevel1,
    unlockBadge, setMentorMessage, setEmotionalState, incrementStreak,
    playerName,
  } = useGameStore();

  const [dragAmount, setDragAmount] = useState(1000);
  const [warning, setWarning] = useState(null);
  const [showIntro, setShowIntro] = useState(true);

  // Intro mentor message
  useEffect(() => {
    setTimeout(() => {
      setMentorMessage(
        `Welcome, ${playerName || 'rookie'}. You just got your first paycheck of Rs.50,000. ` +
        "The 50/30/20 rule is your lifeline: 50% Needs, 30% Wants, 20% Investments. " +
        "Drag the coin or click a category to allocate. Don't overspend on Wants."
      );
      setShowIntro(false);
    }, 4000);
  }, [setMentorMessage]);

  // Leak Detector
  useEffect(() => {
    const wantsPct = (wants / income) * 100;
    if (wantsPct > 30) {
      setWarning(`FINANCIAL STRESS! Wants at ${wantsPct.toFixed(0)}% (limit: 30%)`);
      penalizeCreditScore(25);
      setEmotionalState('stressed');
    } else if (wantsPct > 20) {
      setWarning(null);
      setEmotionalState('stressed');
    } else {
      setWarning(null);
      setEmotionalState('calm');
    }
  }, [wants, income, penalizeCreditScore, setEmotionalState]);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('amount', dragAmount.toString());
  };

  const handleDrop = (e, category) => {
    e.preventDefault();
    const amount = parseInt(e.dataTransfer.getData('amount'), 10);
    if (amount && walletBalance >= amount) {
      allocateFunds(category, amount);
    }
  };

  const handleClickAllocate = (category) => {
    if (walletBalance >= dragAmount) {
      allocateFunds(category, dragAmount);
    }
  };

  const allowDrop = (e) => e.preventDefault();

  const handleComplete = () => {
    if (walletBalance === 0) {
      sounds.success();
      incrementStreak();

      // Check badge conditions
      const wantsPct = (wants / income) * 100;
      if (wantsPct <= 30 && (investments / income) >= 0.2) {
        unlockBadge('Budget Master');
      }

      setMentorMessage(
        `Great work. You've completed your first budget cycle. ` +
        `Your Rs.${investments.toLocaleString('en-IN')} in Investments is now your trading capital for the next levels. ` +
        `The more you invested, the more you have to work with.`
      );

      setTimeout(() => {
        addXp(250);
        completeLevel1(); // Transfers investments → wallet
      }, 500);
    }
  };

  const allocated = needs + wants + investments;
  const allocationPcts = {
    needs: income > 0 ? ((needs / income) * 100).toFixed(0) : 0,
    wants: income > 0 ? ((wants / income) * 100).toFixed(0) : 0,
    investments: income > 0 ? ((investments / income) * 100).toFixed(0) : 0,
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection} id="level-header">
        <h2>Level 1: Cash Flow Engine</h2>
        <p>Allocate ₹{income.toLocaleString('en-IN')} using the 50/30/20 rule. Drag the coin or click a category.</p>
      </div>

      <AnimatePresence>
        {warning && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={styles.warningAlert}
          >
            ⚠️ {warning}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.dashboard}>
        {/* Wallet */}
        <GlassCard className={styles.walletCard} id="wallet-card">
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Remaining</p>
          <motion.h1
            key={walletBalance}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={walletBalance === 0 ? "success-text" : "accent-text"}
            style={{ fontSize: '2.2rem', margin: '8px 0' }}
          >
            ₹{walletBalance.toLocaleString('en-IN')}
          </motion.h1>

          <motion.div
            className={styles.draggableCoin}
            draggable
            onDragStart={handleDragStart}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <span style={{ fontSize: '1.5rem' }}>🪙</span>
            ₹{dragAmount.toLocaleString('en-IN')}
          </motion.div>

          <div className={styles.amountSelector}>
            {[1000, 2000, 5000, 10000].map(amt => (
              <button
                key={amt}
                className={`btn ${dragAmount === amt ? 'btn-primary' : ''}`}
                onClick={() => { setDragAmount(amt); sounds.click(); }}
                style={{ fontSize: '0.8rem', padding: '8px 14px' }}
              >
                ₹{(amt / 1000).toFixed(0)}K
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Categories */}
        <div className={styles.categories} id="budget-categories">
          {Object.entries(CATEGORY_META).map(([key, meta]) => {
            const value = key === 'needs' ? needs : key === 'wants' ? wants : investments;
            const pct = allocationPcts[key];
            const isOver = key === 'wants' && pct > 30;

            return (
              <GlassCard key={key} className={styles.categoryCard} id={`category-${key}`}>
                <div
                  className={styles.dropZone}
                  onDrop={(e) => handleDrop(e, key)}
                  onDragOver={allowDrop}
                  onClick={() => handleClickAllocate(key)}
                >
                  <span style={{ fontSize: '2rem', marginBottom: '8px' }}>{meta.icon}</span>
                  <h3 style={{ margin: '4px 0' }}>{meta.label} ({meta.ideal})</h3>
                  <motion.h2
                    key={value}
                    initial={{ scale: 1.15 }}
                    animate={{ scale: 1 }}
                    className={isOver ? "danger-text" : ""}
                    style={{ margin: '4px 0' }}
                  >
                    ₹{value.toLocaleString('en-IN')}
                  </motion.h2>
                  <p style={{ margin: 0, fontSize: '0.8rem' }}>
                    {pct}% allocated
                  </p>

                  {/* Fill bar */}
                  <div className={styles.fillTrack}>
                    <motion.div
                      className={styles.fillBar}
                      animate={{ width: `${Math.min(100, pct)}%` }}
                      style={{
                        background: isOver ? 'var(--danger)' : meta.color,
                        boxShadow: isOver ? '0 0 10px var(--danger-glow)' : `0 0 10px ${meta.color}40`,
                      }}
                    />
                  </div>

                  <div className={styles.categoryActions} onClick={(e) => e.stopPropagation()}>
                    <button 
                      className={styles.actionBtn} 
                      onClick={() => deallocateFunds(key, dragAmount)}
                      disabled={value < dragAmount}
                    >
                      −
                    </button>
                    <button 
                      className={styles.actionBtn} 
                      onClick={() => allocateFunds(key, dragAmount)}
                      disabled={walletBalance < dragAmount}
                    >
                      +
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Investable Surplus */}
      <GlassCard style={{ marginTop: '16px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Investable Surplus (S = I − N − W)
        </p>
        <h2 className="success-text" style={{ margin: '4px 0' }}>
          ₹{Math.max(0, income - needs - wants).toLocaleString('en-IN')}
        </h2>
      </GlassCard>

      <div className={styles.footer} id="complete-btn">
        <button
          className="btn btn-success"
          onClick={handleComplete}
          disabled={walletBalance > 0}
        >
          ✅ Complete Level
        </button>
      </div>
    </div>
  );
};
