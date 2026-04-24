import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './TutorialOverlay.module.css';
import { Tooltip } from './Tooltip';
import { FINANCIAL_TERMS } from '../utils/financialTerms';

export const TutorialOverlay = ({ steps, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState(null);

  const step = steps[currentStep];

  useEffect(() => {
    if (step.targetId) {
      const updateRect = () => {
        const el = document.getElementById(step.targetId);
        if (el) {
          const rect = el.getBoundingClientRect();
          setHighlightRect({
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
          });
        } else {
          setHighlightRect(null);
        }
      };

      // Small delay to ensure DOM is ready
      const timer = setTimeout(updateRect, 100);
      window.addEventListener('resize', updateRect);
      window.addEventListener('scroll', updateRect);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateRect);
        window.removeEventListener('scroll', updateRect);
      };
    } else {
      setHighlightRect(null);
    }
  }, [currentStep, step.targetId]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const formatTextWithTooltips = (text) => {
    if (!text) return text;
    const terms = Object.keys(FINANCIAL_TERMS);
    const regex = new RegExp(`(${terms.join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => {
      const termKey = terms.find(t => t.toLowerCase() === part.toLowerCase());
      if (termKey) {
        return (
          <Tooltip key={i} text={FINANCIAL_TERMS[termKey]}>
            <span className={styles.termHighlight}>{part}</span>
          </Tooltip>
        );
      }
      return part;
    });
  };

  return (
    <div className={styles.overlay}>
      <AnimatePresence>
        {highlightRect && (
          <motion.div
            className={styles.highlight}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              top: highlightRect.top,
              left: highlightRect.left,
              width: highlightRect.width,
              height: highlightRect.height,
            }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className={styles.card}
          style={highlightRect ? {
            position: 'fixed',
            top: highlightRect.top > window.innerHeight / 2 ? 'auto' : Math.min(window.innerHeight - 350, highlightRect.top + highlightRect.height + 20),
            bottom: highlightRect.top > window.innerHeight / 2 ? Math.min(window.innerHeight - 100, (window.innerHeight - highlightRect.top) + 20) : 'auto',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9005,
          } : {
            position: 'fixed',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9005,
          }}
        >
          <div className={styles.mentorInfo}>
            <div className={styles.avatar}>👨‍🏫</div>
            <div>
              <h3 className={styles.mentorName}>Arjun</h3>
              <p className={styles.stepCount}>Step {currentStep + 1} of {steps.length}</p>
            </div>
          </div>

          <div className={styles.content}>
            <h2 className={styles.title}>{step.title}</h2>
            <p className={styles.description}>{formatTextWithTooltips(step.description)}</p>
          </div>

          <div className={styles.footer}>
            <button className={styles.skipBtn} onClick={onComplete}>Skip Tutorial</button>
            <button className="btn btn-primary" onClick={handleNext} style={{ pointerEvents: 'auto', cursor: 'pointer', position: 'relative', zIndex: 9010 }}>
              {currentStep === steps.length - 1 ? 'Got it!' : 'Next'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
