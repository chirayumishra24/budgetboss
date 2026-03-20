import React, { useEffect, useRef, useState } from 'react';
import { createChart, AreaSeries } from 'lightweight-charts';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { GlassCard } from '../components/GlassCard';
import { sounds } from '../utils/sounds';
import { generatePortfolioPDF } from '../utils/pdfExport';
import styles from './Level4.module.css';

// Simulated stocks available for trading
const TRADEABLE_STOCKS = [
  { symbol: 'NIFTY50', name: 'Nifty 50 Index', basePrice: 100, color: '#38bdf8', volatility: 1 },
  { symbol: 'RELIANCE', name: 'Reliance Industries', basePrice: 2500, color: '#22c55e', volatility: 1.3 },
  { symbol: 'TCS', name: 'Tata Consultancy', basePrice: 3800, color: '#a78bfa', volatility: 0.8 },
  { symbol: 'INFY', name: 'Infosys Ltd', basePrice: 1500, color: '#f59e0b', volatility: 1.1 },
];

export const Level4 = () => {
  const {
    walletBalance, triggerShake, addXp, updateWallet, holdings,
    setEmotionalState, unlockBadge, setMentorMessage,
    triggerGameOver, incrementStreak, playerName,
  } = useGameStore();

  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const timeCounterRef = useRef(Math.floor(Date.now() / 1000));

  const [activeTab, setActiveTab] = useState('trading'); // 'trading' | 'portfolio'
  const [activeStock, setActiveStock] = useState(TRADEABLE_STOCKS[0]);
  const [prices, setPrices] = useState(() => {
    const obj = {};
    TRADEABLE_STOCKS.forEach(s => { obj[s.symbol] = s.basePrice; });
    return obj;
  });
  const pricesRef = useRef({});

  const [position, setPosition] = useState(null);
  const [leverage, setLeverage] = useState(1);
  const [marginCall, setMarginCall] = useState(false);
  const [pnl, setPnl] = useState(0);
  const [totalTrades, setTotalTrades] = useState(0);
  const [wins, setWins] = useState(0);
  const [redTint, setRedTint] = useState(false);
  const [closedTrades, setClosedTrades] = useState([]);

  const heartbeatRef = useRef(null);
  const tickIntervalRef = useRef(null);
  const stockHistoryRef = useRef({});

  // Init prices ref
  useEffect(() => {
    const obj = {};
    TRADEABLE_STOCKS.forEach(s => { obj[s.symbol] = s.basePrice; });
    pricesRef.current = obj;

    // Init history with guaranteed unique ascending timestamps
    let baseTime = Math.floor(Date.now() / 1000) - 300;
    TRADEABLE_STOCKS.forEach(s => {
      const data = [];
      let p = s.basePrice;
      for (let i = 0; i < 200; i++) {
        p += (Math.random() - 0.5) * 3 * s.volatility;
        p = Math.max(1, p);
        data.push({ time: baseTime + i, value: p });
      }
      stockHistoryRef.current[s.symbol] = data;
      pricesRef.current[s.symbol] = p;
    });
    timeCounterRef.current = baseTime + 200;
    setPrices({ ...pricesRef.current });
  }, []);

  // Mentor intro
  useEffect(() => {
    setMentorMessage(
      "Welcome to The Pit. You can now trade multiple stocks — switch between them using the tabs above the chart. " +
      "Check your Portfolio tab to see all holdings with real-time P&L. You can also download a PDF report."
    );
  }, [setMentorMessage]);

  // Chart setup
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 350,
      layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#94a3b8' },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.03)' },
        horzLines: { color: 'rgba(255,255,255,0.03)' },
      },
      crosshair: { mode: 0 },
      timeScale: { timeVisible: true, secondsVisible: true },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)' },
    });
    chartRef.current = chart;

    const areaSeries = chart.addSeries(AreaSeries, {
      topColor: activeStock.color + '40',
      bottomColor: activeStock.color + '05',
      lineColor: activeStock.color,
      lineWidth: 2,
    });
    seriesRef.current = areaSeries;

    // Load history for active stock — deduplicate timestamps
    if (stockHistoryRef.current[activeStock.symbol]) {
      const raw = stockHistoryRef.current[activeStock.symbol];
      const seen = new Set();
      const deduped = raw.filter(d => {
        if (seen.has(d.time)) return false;
        seen.add(d.time);
        return true;
      });
      areaSeries.setData(deduped);
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [activeStock.symbol, activeTab]);

  // Global tick loop — updates ALL stock prices every 400ms
  useEffect(() => {
    tickIntervalRef.current = setInterval(() => {
      const newPrices = { ...pricesRef.current };
      timeCounterRef.current += 1;
      const tickTime = timeCounterRef.current;

      TRADEABLE_STOCKS.forEach(stock => {
        let change = (Math.random() - 0.5) * 4 * stock.volatility;
        if (Math.random() > 0.97) change = (Math.random() > 0.5 ? 1 : -1) * (8 + Math.random() * 12) * stock.volatility;
        if (Math.random() > 0.995) {
          change = (-20 + Math.random() * 5) * stock.volatility;
          if (stock.symbol === activeStock.symbol) sounds.crash();
        }

        const newPrice = Math.max(1, pricesRef.current[stock.symbol] + change);
        newPrices[stock.symbol] = newPrice;

        // Update history with unique incrementing time
        if (!stockHistoryRef.current[stock.symbol]) stockHistoryRef.current[stock.symbol] = [];
        stockHistoryRef.current[stock.symbol].push({ time: tickTime, value: newPrice });
      });

      pricesRef.current = newPrices;
      setPrices({ ...newPrices });

      // Update chart for active stock
      if (seriesRef.current) {
        seriesRef.current.update({
          time: tickTime,
          value: newPrices[activeStock.symbol],
        });
      }
    }, 400);

    return () => clearInterval(tickIntervalRef.current);
  }, [activeStock.symbol]);

  // P&L + Emotional State + Margin Call
  useEffect(() => {
    if (position) {
      const currentPrice = prices[position.symbol] || position.entryPrice;
      const diff = position.type === 'LONG'
        ? (currentPrice - position.entryPrice)
        : (position.entryPrice - currentPrice);
      const currentPnl = diff * position.size * position.leverage;
      setPnl(currentPnl);

      if (currentPnl < -50) {
        setEmotionalState('panic');
        setRedTint(true);
        if (!heartbeatRef.current) {
          heartbeatRef.current = setInterval(() => sounds.heartbeat(), 800);
        }
      } else if (currentPnl < -20) {
        setEmotionalState('stressed');
        setRedTint(false);
        if (heartbeatRef.current) { clearInterval(heartbeatRef.current); heartbeatRef.current = null; }
      } else {
        setEmotionalState('calm');
        setRedTint(false);
        if (heartbeatRef.current) { clearInterval(heartbeatRef.current); heartbeatRef.current = null; }
      }

      if (diff < -8) triggerShake();

      if (currentPnl < 0 && Math.abs(currentPnl) >= walletBalance) {
        setMarginCall(true);
        sounds.crash();
        triggerShake();
        if (heartbeatRef.current) { clearInterval(heartbeatRef.current); heartbeatRef.current = null; }
        setPosition(null);
        if (walletBalance <= 0) triggerGameOver();
      }
    }

    return () => {
      if (heartbeatRef.current) { clearInterval(heartbeatRef.current); heartbeatRef.current = null; }
    };
  }, [prices, position, walletBalance]);

  const handleTrade = (type) => {
    sounds.click();
    const size = 10;
    setPosition({ type, entryPrice: prices[activeStock.symbol], size, leverage, symbol: activeStock.symbol, stockName: activeStock.name });
    setMarginCall(false);
    setTotalTrades(t => t + 1);
  };

  const closePosition = () => {
    const realized = pnl;
    if (realized > 0) {
      sounds.success();
      setWins(w => w + 1);
    } else {
      sounds.drop();
    }
    updateWallet(realized);

    setClosedTrades(prev => [...prev, {
      symbol: position.symbol,
      stockName: position.stockName,
      type: position.type,
      entry: position.entryPrice,
      exit: prices[position.symbol],
      pnl: realized,
      leverage: position.leverage,
      time: new Date().toLocaleTimeString(),
    }]);

    setPosition(null);
    setPnl(0);
    setEmotionalState('calm');
    setRedTint(false);
    if (heartbeatRef.current) { clearInterval(heartbeatRef.current); heartbeatRef.current = null; }

    if (totalTrades >= 3) {
      unlockBadge('Risk Taker');
      incrementStreak();
    }
  };

  const handleSwitchStock = (stock) => {
    setActiveStock(stock);
    sounds.click();
  };

  const handleExportPDF = () => {
    sounds.success();
    const portfolioData = {
      playerName,
      walletBalance,
      holdings: holdings.map(h => ({
        ...h,
        currentPrice: prices[h.symbol] || h.avgPrice,
        pnl: ((prices[h.symbol] || h.avgPrice) - h.avgPrice) * h.qty,
      })),
      closedTrades,
      totalTrades,
      wins,
    };
    generatePortfolioPDF(portfolioData);
  };

  // Calculate portfolio data — simulate drift for Level 3 stocks not in live price feed
  const portfolioHoldings = holdings.map(h => {
    let cp;
    if (prices[h.symbol] !== undefined) {
      cp = prices[h.symbol];
    } else {
      // Simulate a small random drift for Level 3 holdings
      const drift = 1 + (Math.sin(Date.now() / 2000 + h.avgPrice) * 0.03);
      cp = h.avgPrice * drift;
    }
    const holdingPnl = (cp - h.avgPrice) * h.qty;
    const pctChange = ((cp - h.avgPrice) / h.avgPrice * 100);
    return { ...h, currentPrice: cp, pnl: holdingPnl, pctChange };
  });

  const totalPortfolioValue = portfolioHoldings.reduce((a, h) => a + (h.currentPrice * h.qty), 0);
  const totalPortfolioPnl = portfolioHoldings.reduce((a, h) => a + h.pnl, 0);

  return (
    <div className={`${styles.container} ${redTint ? styles.redTint : ''}`}>
      {/* Tab Switcher */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${activeTab === 'trading' ? styles.tabActive : ''}`}
          onClick={() => { setActiveTab('trading'); sounds.click(); }}
        >
          📈 Trading Pit
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'portfolio' ? styles.tabActive : ''}`}
          onClick={() => { setActiveTab('portfolio'); sounds.click(); }}
        >
          💼 My Portfolio
        </button>
      </div>

      {/* Margin Call Overlay */}
      <AnimatePresence>
        {marginCall && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.marginCall}
          >
            <motion.h1 animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>
              🚨 MARGIN CALL 🚨
            </motion.h1>
            <p>Your losses exceeded your available balance. Position Liquidated.</p>
            <button className="btn" onClick={() => setMarginCall(false)} style={{ marginTop: '12px' }}>Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── TRADING TAB ─── */}
      {activeTab === 'trading' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          {/* Stock Tabs */}
          <div className={styles.stockTabs}>
            {TRADEABLE_STOCKS.map(stock => (
              <button
                key={stock.symbol}
                className={`${styles.stockTab} ${activeStock.symbol === stock.symbol ? styles.stockTabActive : ''}`}
                onClick={() => handleSwitchStock(stock)}
                style={{ borderBottomColor: activeStock.symbol === stock.symbol ? stock.color : 'transparent' }}
              >
                <span className={styles.stockTabSymbol}>{stock.symbol}</span>
                <span className={styles.stockTabPrice} style={{ color: stock.color }}>
                  Rs.{(prices[stock.symbol] || stock.basePrice).toFixed(2)}
                </span>
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className={styles.chartArea}>
            <div ref={chartContainerRef} className={styles.chart} />
            <div className={styles.priceOverlay}>
              <span className={styles.stockLabel}>{activeStock.name}</span>
              <span className={styles.livePrice} style={{ color: activeStock.color }}>
                Rs.{(prices[activeStock.symbol] || activeStock.basePrice).toFixed(2)}
              </span>
              <span className={styles.liveDot} style={{ background: activeStock.color }} />
            </div>
          </div>

          {/* Controls */}
          <div className={styles.controlPanel}>
            <GlassCard className={styles.tradingCard}>
              <h3 style={{ margin: '0 0 12px' }}>Trade {activeStock.symbol}</h3>
              <div className={styles.leverageSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Leverage</label>
                  <span className={leverage >= 4 ? 'danger-text' : 'accent-text'} style={{ fontWeight: 800, fontSize: '1.2rem' }}>
                    {leverage}x
                  </span>
                </div>
                <input
                  type="range" min="1" max="5" value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  className={styles.leverageSlider}
                  disabled={!!position}
                />
                {leverage >= 4 && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--danger)' }}>
                    ⚠️ High leverage = high risk
                  </p>
                )}
              </div>

              <div className={styles.buttons}>
                <button className="btn btn-success" onClick={() => handleTrade('LONG')} disabled={!!position}>📈 Long</button>
                <button className="btn btn-danger" onClick={() => handleTrade('SHORT')} disabled={!!position}>📉 Short</button>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.miniStat}><p>Trades</p><h4>{totalTrades}</h4></div>
                <div className={styles.miniStat}><p>Wins</p><h4 className="success-text">{wins}</h4></div>
                <div className={styles.miniStat}><p>Win Rate</p><h4>{totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(0) : 0}%</h4></div>
              </div>
            </GlassCard>

            <GlassCard className={styles.positionCard}>
              <h3 style={{ marginBottom: '12px' }}>Active Position</h3>
              {position ? (
                <div>
                  <div className={styles.positionDetails}>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>STOCK</p>
                      <h3 style={{ margin: '2px 0' }}>{position.symbol}</h3>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>TYPE</p>
                      <h3 className={position.type === 'LONG' ? 'success-text' : 'danger-text'} style={{ margin: '2px 0' }}>
                        {position.type === 'LONG' ? '📈' : '📉'} {position.type}
                      </h3>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ENTRY</p>
                      <h3 style={{ margin: '2px 0' }}>Rs.{position.entryPrice.toFixed(2)}</h3>
                    </div>
                  </div>
                  <div className={styles.pnlBlock}>
                    <p style={{ margin: 0, fontSize: '0.75rem' }}>UNREALIZED P&L ({position.leverage}x)</p>
                    <motion.h1
                      key={pnl.toFixed(0)}
                      initial={{ scale: 1.05 }}
                      animate={{ scale: 1 }}
                      className={pnl >= 0 ? "success-text" : "danger-text"}
                      style={{ margin: '4px 0', fontSize: '2rem' }}
                    >
                      {pnl >= 0 ? '+' : ''}Rs.{pnl.toFixed(2)}
                    </motion.h1>
                  </div>
                  <button className="btn" onClick={closePosition} style={{ width: '100%', marginTop: '12px' }}>
                    ✅ Close & Realize P&L
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>📊</p>
                  <p style={{ margin: 0 }}>No active position. Select a stock and trade.</p>
                </div>
              )}
            </GlassCard>
          </div>
        </motion.div>
      )}

      {/* ─── PORTFOLIO TAB ─── */}
      {activeTab === 'portfolio' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          {/* Summary Cards */}
          <div className={styles.portfolioSummary}>
            <GlassCard className={styles.summaryCard}>
              <p className={styles.summaryLabel}>Total Portfolio Value</p>
              <h2 className="accent-text">Rs.{totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h2>
            </GlassCard>
            <GlassCard className={styles.summaryCard}>
              <p className={styles.summaryLabel}>Total P&L</p>
              <h2 className={totalPortfolioPnl >= 0 ? "success-text" : "danger-text"}>
                {totalPortfolioPnl >= 0 ? '+' : ''}Rs.{totalPortfolioPnl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </h2>
            </GlassCard>
            <GlassCard className={styles.summaryCard}>
              <p className={styles.summaryLabel}>Cash Available</p>
              <h2>Rs.{walletBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h2>
            </GlassCard>
          </div>

          {/* Holdings Table */}
          <GlassCard style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Holdings ({portfolioHoldings.length})</h3>
              <button className="btn btn-primary" onClick={handleExportPDF} style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
                Download PDF
              </button>
            </div>

            {portfolioHoldings.length > 0 ? (
              <div className={styles.holdingsTable}>
                <div className={styles.tableHeader}>
                  <span>Stock</span><span>Qty</span><span>Avg Price</span><span>Current</span><span>P&L</span><span>Change</span>
                </div>
                {portfolioHoldings.map((h, i) => (
                  <motion.div
                    key={h.symbol}
                    className={styles.tableRow}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span style={{ fontWeight: 700 }}>{h.symbol}</span>
                    <span>{h.qty}</span>
                    <span>Rs.{h.avgPrice.toFixed(2)}</span>
                    <motion.span
                      key={h.currentPrice.toFixed(0)}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                    >
                      Rs.{h.currentPrice.toFixed(2)}
                    </motion.span>
                    <span className={h.pnl >= 0 ? 'success-text' : 'danger-text'} style={{ fontWeight: 700 }}>
                      {h.pnl >= 0 ? '+' : ''}Rs.{h.pnl.toFixed(2)}
                    </span>
                    <span className={h.pctChange >= 0 ? 'success-text' : 'danger-text'}>
                      {h.pctChange >= 0 ? '▲' : '▼'} {Math.abs(h.pctChange).toFixed(2)}%
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', padding: '32px 0' }}>No holdings yet. Buy stocks in Level 3 first!</p>
            )}
          </GlassCard>

          {/* Trade History */}
          {closedTrades.length > 0 && (
            <GlassCard style={{ marginTop: '16px' }}>
              <h3 style={{ marginBottom: '12px' }}>Trade History</h3>
              <div className={styles.holdingsTable}>
                <div className={styles.tableHeader}>
                  <span>Stock</span><span>Type</span><span>Entry</span><span>Exit</span><span>P&L</span><span>Time</span>
                </div>
                {closedTrades.slice().reverse().map((t, i) => (
                  <div key={i} className={styles.tableRow}>
                    <span style={{ fontWeight: 700 }}>{t.symbol}</span>
                    <span className={t.type === 'LONG' ? 'success-text' : 'danger-text'}>{t.type}</span>
                    <span>Rs.{t.entry.toFixed(2)}</span>
                    <span>Rs.{t.exit.toFixed(2)}</span>
                    <span className={t.pnl >= 0 ? 'success-text' : 'danger-text'} style={{ fontWeight: 700 }}>
                      {t.pnl >= 0 ? '+' : ''}Rs.{t.pnl.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '0.8rem' }}>{t.time}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </motion.div>
      )}
    </div>
  );
};
