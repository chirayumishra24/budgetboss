import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { GlassCard } from '../components/GlassCard';
import { sounds } from '../utils/sounds';
import styles from './Level3.module.css';

const MOCK_STOCKS = [
  { id: 1, name: 'Tech Alpha', basePrice: 150, yrGrowth: 1.15, sector: 'Technology', divYield: 0.005 },
  { id: 2, name: 'Bank Prime', basePrice: 80, yrGrowth: 1.05, sector: 'Banking', divYield: 0.035 },
  { id: 3, name: 'Pharma Plus', basePrice: 120, yrGrowth: 1.08, sector: 'Healthcare', divYield: 0.015 },
  { id: 4, name: 'Green Energy', basePrice: 60, yrGrowth: 1.22, sector: 'Energy', divYield: 0.008 },
];

const YEAR_MIN = 2014;
const YEAR_MAX = 2024;

// Pre-compute deterministic prices for every stock and year
const PRICES = (() => {
  const data = {};
  MOCK_STOCKS.forEach(s => {
    data[s.name] = {};
    for (let yr = YEAR_MIN; yr <= YEAR_MAX; yr++) {
      const elapsed = yr - YEAR_MIN;
      const noise = Math.sin(s.id * 1000 + yr * 7) * 10;
      data[s.name][yr] = Math.max(1, s.basePrice * Math.pow(s.yrGrowth, elapsed) + noise);
    }
  });
  return data;
})();

const generateSparkline = (stockName, fromYear, toYear) => {
  const pts = [];
  for (let y = fromYear; y <= toYear; y++) {
    pts.push(PRICES[stockName][y]);
  }
  return pts;
};

export const Level3 = () => {
  const {
    walletBalance, buyStock, addDividend, setLevel, addXp, holdings,
    unlockBadge, setMentorMessage, incrementStreak,
  } = useGameStore();

  // Investments: array of { stockName, buyYear, holdTillYear, qty, buyPrice }
  const [investments, setInvestments] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [buyYear, setBuyYear] = useState(YEAR_MIN);
  const [holdTillYear, setHoldTillYear] = useState(YEAR_MAX);
  const [viewYear, setViewYear] = useState(YEAR_MIN);
  const [showBuyPanel, setShowBuyPanel] = useState(false);

  useEffect(() => {
    setMentorMessage(
      "Welcome to the Time Machine. Pick a stock, choose when to buy and how long to hold. " +
      "Then use the slider to scrub through the years and watch your investment grow or shrink in real time."
    );
  }, [setMentorMessage]);

  const handleSelectStock = (stock) => {
    setSelectedStock(stock);
    setBuyYear(YEAR_MIN);
    setHoldTillYear(YEAR_MAX);
    setShowBuyPanel(true);
    sounds.click();
  };

  const handleInvest = () => {
    if (!selectedStock) return;
    const price = PRICES[selectedStock.name][buyYear];
    const qty = 10;
    const cost = price * qty;

    if (walletBalance < cost) return;

    sounds.coin();
    buyStock(selectedStock.name, price, qty);

    setInvestments(prev => [...prev, {
      stockName: selectedStock.name,
      buyYear,
      holdTillYear,
      qty,
      buyPrice: price,
      sector: selectedStock.sector,
      divYield: selectedStock.divYield,
    }]);

    setShowBuyPanel(false);
    setSelectedStock(null);
  };

  const handleComplete = () => {
    if (investments.length === 0) return;
    sounds.success();

    // Pay out dividends for all investments
    let totalDiv = 0;
    investments.forEach(inv => {
      const yearsHeld = inv.holdTillYear - inv.buyYear;
      const avgPrice = (PRICES[inv.stockName][inv.buyYear] + PRICES[inv.stockName][inv.holdTillYear]) / 2;
      totalDiv += Math.round(avgPrice * inv.qty * inv.divYield * yearsHeld);
    });
    if (totalDiv > 0) addDividend(totalDiv);

    unlockBadge('Smart Investor');
    incrementStreak();
    setMentorMessage(
      `Great investing. You earned Rs.${totalDiv.toLocaleString('en-IN')} in dividends across your holdings. ` +
      "Now let's see if you can handle the pressure of live trading."
    );
    setTimeout(() => {
      addXp(250);
      setLevel(4);
    }, 500);
  };

  // Calculate portfolio metrics at current view year
  const portfolioAtView = investments.map(inv => {
    const currentPrice = PRICES[inv.stockName][Math.min(Math.max(viewYear, inv.buyYear), inv.holdTillYear)] || inv.buyPrice;
    const currentValue = currentPrice * inv.qty;
    const investedValue = inv.buyPrice * inv.qty;
    const pnl = currentValue - investedValue;
    const pctChange = ((currentPrice - inv.buyPrice) / inv.buyPrice * 100);
    const isActive = viewYear >= inv.buyYear && viewYear <= inv.holdTillYear;
    const yearsHeld = Math.max(0, Math.min(viewYear, inv.holdTillYear) - inv.buyYear);
    const divEarned = Math.round(currentPrice * inv.qty * inv.divYield * yearsHeld);

    return { ...inv, currentPrice, currentValue, investedValue, pnl, pctChange, isActive, divEarned };
  });

  const totalValue = portfolioAtView.reduce((a, p) => a + (p.isActive ? p.currentValue : 0), 0);
  const totalInvested = portfolioAtView.reduce((a, p) => a + (p.isActive ? p.investedValue : 0), 0);
  const totalPnl = totalValue - totalInvested;
  const totalDiv = portfolioAtView.reduce((a, p) => a + (p.isActive ? p.divEarned : 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <h2>Level 3: Wealth Builder</h2>
        <p>Pick stocks, choose your entry year and holding period, then scrub through time to watch growth.</p>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <GlassCard className={styles.statCard}>
          <p className={styles.statLabel}>Cash</p>
          <h2 className="success-text">Rs.{walletBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h2>
        </GlassCard>
        <GlassCard className={styles.statCard}>
          <p className={styles.statLabel}>Portfolio @ {viewYear}</p>
          <motion.h2 key={totalValue.toFixed(0)} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="accent-text">
            Rs.{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </motion.h2>
        </GlassCard>
        <GlassCard className={styles.statCard}>
          <p className={styles.statLabel}>P&L</p>
          <h2 className={totalPnl >= 0 ? 'success-text' : 'danger-text'}>
            {totalPnl >= 0 ? '+' : ''}Rs.{totalPnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </h2>
        </GlassCard>
      </div>

      {/* Time Slider */}
      <GlassCard className={styles.timeMachineCard}>
        <div className={styles.timeMachineHeader}>
          <h3>Time Machine</h3>
          <span className={styles.yearBadge}>{viewYear}</span>
        </div>
        <input
          type="range" min={YEAR_MIN} max={YEAR_MAX} value={viewYear}
          onChange={(e) => setViewYear(parseInt(e.target.value))}
          className={styles.slider}
        />
        <div className={styles.yearLabels}>
          <span>2014</span><span>2016</span><span>2018</span><span>2020</span><span>2022</span><span>2024</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
          Slide to see how your investments perform over time. Buy first, then watch growth.
        </p>
      </GlassCard>

      {/* Stock Picker */}
      <h3 style={{ margin: '20px 0 12px' }}>Select a Stock to Invest</h3>
      <div className={styles.stockGrid}>
        {MOCK_STOCKS.map(stock => {
          const currentPrice = PRICES[stock.name][viewYear];
          const priceChange = currentPrice - stock.basePrice;
          const pctChange = ((priceChange / stock.basePrice) * 100).toFixed(1);
          const sparkline = generateSparkline(stock.name, YEAR_MIN, viewYear);
          const alreadyHeld = investments.filter(i => i.stockName === stock.name).reduce((a, i) => a + i.qty, 0);

          return (
            <GlassCard
              key={stock.id}
              className={`${styles.stockCard} ${selectedStock?.id === stock.id ? styles.stockCardSelected : ''}`}
              onClick={() => handleSelectStock(stock)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.stockHeader}>
                <div>
                  <h3 style={{ margin: 0 }}>{stock.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem' }}>{stock.sector} | Div: {(stock.divYield * 100).toFixed(1)}%</p>
                </div>
              </div>

              <div className={styles.priceRow}>
                <h2 style={{ margin: '8px 0' }}>Rs.{currentPrice.toFixed(0)}</h2>
                <span className={priceChange >= 0 ? 'success-text' : 'danger-text'} style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {priceChange >= 0 ? '▲' : '▼'} {pctChange}%
                </span>
              </div>

              <div className={styles.sparkline}>
                <svg viewBox={`0 0 ${sparkline.length * 10} 40`} className={styles.sparklineSvg}>
                  <polyline
                    fill="none"
                    stroke={priceChange >= 0 ? 'var(--success)' : 'var(--danger)'}
                    strokeWidth="2"
                    points={sparkline.map((v, i) => {
                      const min = Math.min(...sparkline);
                      const max = Math.max(...sparkline);
                      const range = max - min || 1;
                      return `${i * 10},${40 - ((v - min) / range) * 36}`;
                    }).join(' ')}
                  />
                </svg>
              </div>

              {alreadyHeld > 0 && (
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>Holding: <strong>{alreadyHeld}</strong> shares</p>
              )}
            </GlassCard>
          );
        })}
      </div>

      {/* Buy Panel */}
      <AnimatePresence>
        {showBuyPanel && selectedStock && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <GlassCard style={{ marginTop: '16px' }}>
              <h3 style={{ margin: '0 0 16px' }}>Invest in {selectedStock.name}</h3>

              <div className={styles.buyForm}>
                <div className={styles.buyField}>
                  <label>Buy Year</label>
                  <select value={buyYear} onChange={e => setBuyYear(parseInt(e.target.value))} className={styles.selectInput}>
                    {Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MIN + i).map(y => (
                      <option key={y} value={y}>{y} — Rs.{PRICES[selectedStock.name][y].toFixed(0)}/share</option>
                    ))}
                  </select>
                </div>

                <div className={styles.buyField}>
                  <label>Hold Till Year</label>
                  <select value={holdTillYear} onChange={e => setHoldTillYear(parseInt(e.target.value))} className={styles.selectInput}>
                    {Array.from({ length: YEAR_MAX - buyYear }, (_, i) => buyYear + 1 + i).map(y => (
                      <option key={y} value={y}>{y} — Rs.{PRICES[selectedStock.name][y].toFixed(0)}/share</option>
                    ))}
                  </select>
                </div>

                <div className={styles.buyField}>
                  <label>Quantity</label>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>10 shares</p>
                </div>

                <div className={styles.buyField}>
                  <label>Total Cost</label>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700 }} className="accent-text">
                    Rs.{(PRICES[selectedStock.name][buyYear] * 10).toFixed(0)}
                  </p>
                </div>
              </div>

              {/* Preview */}
              <div className={styles.previewCard}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Projected Growth</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.7rem' }}>Buy @ {buyYear}</p>
                    <h3 style={{ margin: '2px 0' }}>Rs.{(PRICES[selectedStock.name][buyYear] * 10).toFixed(0)}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.5rem', color: 'var(--text-secondary)' }}>→</div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '0.7rem' }}>Value @ {holdTillYear}</p>
                    <h3 style={{ margin: '2px 0' }} className={
                      PRICES[selectedStock.name][holdTillYear] >= PRICES[selectedStock.name][buyYear] ? 'success-text' : 'danger-text'
                    }>
                      Rs.{(PRICES[selectedStock.name][holdTillYear] * 10).toFixed(0)}
                    </h3>
                  </div>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '0.8rem', textAlign: 'center' }} className={
                  PRICES[selectedStock.name][holdTillYear] >= PRICES[selectedStock.name][buyYear] ? 'success-text' : 'danger-text'
                }>
                  {((PRICES[selectedStock.name][holdTillYear] / PRICES[selectedStock.name][buyYear] - 1) * 100).toFixed(1)}% return over {holdTillYear - buyYear} years
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleInvest}
                  disabled={walletBalance < PRICES[selectedStock.name][buyYear] * 10}
                  style={{ flex: 1 }}
                >
                  Confirm Investment
                </button>
                <button className="btn" onClick={() => { setShowBuyPanel(false); setSelectedStock(null); }} style={{ flex: 0.5 }}>
                  Cancel
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Investments */}
      {investments.length > 0 && (
        <GlassCard style={{ marginTop: '16px' }}>
          <h3 style={{ margin: '0 0 12px' }}>Your Investments @ {viewYear}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {portfolioAtView.map((inv, i) => (
              <div key={i} className={styles.investmentRow} style={{ opacity: inv.isActive ? 1 : 0.4 }}>
                <div style={{ flex: 1 }}>
                  <strong>{inv.stockName}</strong>
                  <span style={{ fontSize: '0.75rem', marginLeft: '8px', color: 'var(--text-secondary)' }}>
                    {inv.buyYear}–{inv.holdTillYear} | {inv.qty} shares
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700 }}>Rs.{inv.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  <span className={inv.pnl >= 0 ? 'success-text' : 'danger-text'} style={{ marginLeft: '10px', fontWeight: 600, fontSize: '0.85rem' }}>
                    {inv.pnl >= 0 ? '+' : ''}{inv.pctChange.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          {totalDiv > 0 && (
            <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Estimated dividends earned so far: <strong className="success-text">+Rs.{totalDiv.toLocaleString('en-IN')}</strong>
            </p>
          )}
        </GlassCard>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <button className="btn btn-success" onClick={handleComplete} disabled={investments.length === 0}>
          Enter The Pit
        </button>
      </div>
    </div>
  );
};
