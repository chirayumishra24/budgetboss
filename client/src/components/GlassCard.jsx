import React from 'react';
import { motion } from 'framer-motion';

export const GlassCard = ({ children, className = '', animate = true, delay = 0, ...rest }) => {
  const content = (
    <div className={`glass-panel ${className}`} {...rest}>
      {children}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};
