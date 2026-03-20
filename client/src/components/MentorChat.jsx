import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './MentorChat.module.css';

const FAQ = [
  { keywords: ['sip', 'systematic'], answer: 'A SIP (Systematic Investment Plan) lets you invest a fixed amount regularly in mutual funds. It averages out market volatility through rupee cost averaging — one of the safest ways to build wealth over time.' },
  { keywords: ['mutual fund', 'mf'], answer: 'Mutual funds pool money from many investors and invest in stocks, bonds, or other securities. They are managed by professional fund managers. Great for beginners who do not want to pick individual stocks.' },
  { keywords: ['demat', 'account'], answer: 'A Demat account holds your shares in electronic form. In India, CDSL and NSDL are the two depositories. You need a Demat account linked to a broker (like Zerodha or Groww) to buy stocks.' },
  { keywords: ['ipo'], answer: 'An IPO (Initial Public Offering) is when a company sells shares to the public for the first time. You can apply via your broker. Oversubscribed IPOs are in high demand but don\'t always guarantee listing gains.' },
  { keywords: ['tax', 'stcg', 'ltcg', 'capital gain'], answer: 'In India: STCG (shares held < 1 year) is taxed at 15%. LTCG (shares held > 1 year) above Rs.1 lakh is taxed at 10%. Dividends are taxed at your income tax slab rate.' },
  { keywords: ['leverage', 'margin'], answer: 'Leverage means trading with borrowed money. 5x leverage means Rs.1000 controls Rs.5000 worth of stock. It amplifies both profits AND losses. A 20% drop with 5x leverage wipes out your entire capital.' },
  { keywords: ['stop loss', 'stoploss'], answer: 'A stop-loss is an order to sell a stock if it drops below a set price. It limits your downside risk. For example, buying at Rs.100 with a stop-loss at Rs.90 means max loss is 10%.' },
  { keywords: ['nifty', 'sensex', 'index'], answer: 'Nifty 50 tracks the top 50 NSE stocks. Sensex tracks 30 BSE stocks. They represent overall market health. Index funds that track these are one of the best long-term investments.' },
  { keywords: ['dividend'], answer: 'A dividend is a portion of company profits distributed to shareholders. Not all companies pay dividends. Companies like ITC and Coal India are known for high dividend yields.' },
  { keywords: ['risk', 'diversif'], answer: 'Diversification means spreading investments across sectors and asset classes. Don\'t put all eggs in one basket. A mix of stocks, bonds, and gold reduces overall portfolio risk.' },
  { keywords: ['inflation'], answer: 'Inflation erodes purchasing power. If inflation is 6% and your savings earn 4%, you\'re losing 2% in real terms. That\'s why investing in equities (average 12-15% returns) beats keeping money in a savings account.' },
  { keywords: ['budget', '50/30/20'], answer: 'The 50/30/20 rule: 50% of income for Needs (rent, food), 30% for Wants (entertainment, dining), 20% for Savings and Investments. It\'s a simple framework to avoid overspending.' },
  { keywords: ['hello', 'hi', 'hey'], answer: 'Hello! I\'m Arjun, your finance mentor. Ask me about SIPs, mutual funds, taxation, leverage, or any financial concept. I\'m here to help you learn.' },
];

export const MentorChat = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'mentor', text: 'Hello! I\'m Arjun, your finance mentor. Ask me anything about investing, trading, or personal finance.' },
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getResponse = (query) => {
    const lower = query.toLowerCase();
    for (const item of FAQ) {
      if (item.keywords.some(kw => lower.includes(kw))) {
        return item.answer;
      }
    }
    return 'That\'s a great question. While I don\'t have a specific answer for that, I recommend checking resources like Varsity by Zerodha or the SEBI investor education portal. Try asking about SIPs, mutual funds, taxes, leverage, or dividends.';
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');

    // Simulate typing delay
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'mentor', text: getResponse(userMsg) }]);
    }, 500 + Math.random() * 500);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className={styles.container}
      initial={{ y: 400, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 400, opacity: 0 }}
    >
      <div className={styles.header}>
        <div>
          <h4 style={{ margin: 0 }}>Arjun — Finance Mentor</h4>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Ask me about investing, trading, taxes...</p>
        </div>
        <button onClick={onClose} className={styles.closeBtn}>X</button>
      </div>

      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            className={`${styles.bubble} ${styles[msg.role]}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {msg.text}
          </motion.div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className={styles.inputBar}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question..."
          className={styles.textInput}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
          Send
        </button>
      </form>
    </motion.div>
  );
};
