import React, { useEffect, useState } from 'react';
import { useGameStore } from './store/useGameStore';
import { ProgressBar } from './components/ProgressBar';
import { ParticleBackground } from './components/ParticleBackground';
import { NewsTicker } from './components/NewsTicker';
import { Mentor } from './components/Mentor';
import { AchievementPopup } from './components/AchievementPopup';
import { EmotionalMeter } from './components/EmotionalMeter';
import { Quiz } from './components/Quiz';
import { Leaderboard } from './components/Leaderboard';
import { DailyChallenge } from './components/DailyChallenge';
import { MentorChat } from './components/MentorChat';
import { Level1 } from './levels/Level1';
import { Level2 } from './levels/Level2';
import { Level3 } from './levels/Level3';
import { Level4 } from './levels/Level4';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from './utils/sounds';

function App() {
  const {
    level, xp, maxLevelXp, creditScore, isShaking,
    emotionalState, gameOver, badges, streak,
    mentorMessage, dismissMentor,
    pendingAchievement, clearAchievement, resetGame,
    walletBalance, addXp, updateWallet,
    playerName, setPlayerName,
  } = useGameStore();

  const [showNameModal, setShowNameModal] = useState(!playerName);
  const [nameInput, setNameInput] = useState('');
  const [showIntro, setShowIntro] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizForLevel, setQuizForLevel] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showDailyChallenge, setShowDailyChallenge] = useState(false);
  const [showMentorChat, setShowMentorChat] = useState(false);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setPlayerName(trimmed);
    setShowNameModal(false);
    setShowIntro(true);
    setTimeout(() => setShowIntro(false), 3500);
  };

  // Show daily challenge on first load if not spun today
  useEffect(() => {
    const lastSpin = localStorage.getItem('budgetboss_last_spin');
    const today = new Date().toDateString();
    if (lastSpin !== today) {
      setTimeout(() => setShowDailyChallenge(true), 4500);
    }
  }, []);

  // Quiz gate: trigger quiz when level changes (except level 1)
  const handleLevelComplete = (nextLevel) => {
    if (nextLevel <= 3) {
      setQuizForLevel(nextLevel - 1);
      setShowQuiz(true);
    }
  };

  const handleQuizPass = (score) => {
    addXp(score * 50);
    setTimeout(() => setShowQuiz(false), 2000);
  };

  const handleQuizFail = () => {
    setTimeout(() => setShowQuiz(false), 2000);
  };

  const handleDailyReward = (reward) => {
    if (reward.type === 'xp') {
      addXp(reward.value);
    } else {
      updateWallet(reward.value);
    }
  };

  const renderLevel = () => {
    switch (level) {
      case 1: return <Level1 />;
      case 2: return <Level2 />;
      case 3: return <Level3 />;
      case 4: return <Level4 />;
      default: return <Level1 />;
    }
  };

  const levelNames = {
    1: 'Cash Flow Engine',
    2: 'The Plumbing',
    3: 'Wealth Builder',
    4: 'The Pit',
  };

  return (
    <>
      <ParticleBackground />

      {/* Name Entry Modal */}
      <AnimatePresence>
        {showNameModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 10000,
              background: '#0a0f1e',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '24px', padding: '24px',
            }}
          >
            <motion.h1
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              style={{ fontSize: '2.8rem', color: '#38bdf8', margin: 0 }}
            >
              Budget Boss
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}
            >
              From Financial Zero to Market Hero
            </motion.p>

            <motion.form
              onSubmit={handleNameSubmit}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '16px', width: '100%', maxWidth: '360px', marginTop: '16px',
              }}
            >
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                Enter your name to begin
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="Your name"
                autoFocus
                maxLength={24}
                style={{
                  width: '100%', padding: '14px 20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '12px', color: '#f1f5f9',
                  fontSize: '1.1rem', textAlign: 'center',
                  fontFamily: 'var(--font-main)',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!nameInput.trim()}
                style={{ padding: '12px 40px', fontSize: '1rem', width: '100%' }}
              >
                Let's Go
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intro splash */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: '#0a0f1e',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '16px',
            }}
          >
            <motion.h1
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              style={{ fontSize: '3rem', color: '#38bdf8', margin: 0 }}
            >
              Welcome, {playerName}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ color: '#94a3b8', fontSize: '1.1rem' }}
            >
              Your financial journey starts now.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Overlay */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 8000,
              background: 'rgba(10, 15, 30, 0.95)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '20px'
            }}
          >
            <motion.h1
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ fontSize: '3rem', color: '#ef4444' }}
            >
              GAME OVER
            </motion.h1>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '400px', textAlign: 'center' }}>
              You went bankrupt. The market shows no mercy. But every great investor started with a failure.
            </p>
            <button className="btn btn-primary" onClick={resetGame}>
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Gate */}
      <AnimatePresence>
        {showQuiz && quizForLevel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 7000,
              background: 'rgba(10, 15, 30, 0.95)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '24px',
            }}
          >
            <Quiz level={quizForLevel} onPass={handleQuizPass} onFail={handleQuizFail} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlays */}
      <Mentor message={mentorMessage} onDismiss={dismissMentor} />
      <AchievementPopup badge={pendingAchievement} onComplete={clearAchievement} />
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
      {showDailyChallenge && <DailyChallenge onReward={handleDailyReward} onClose={() => setShowDailyChallenge(false)} />}
      <AnimatePresence>
        <MentorChat isOpen={showMentorChat} onClose={() => setShowMentorChat(false)} />
      </AnimatePresence>

      {/* News Ticker */}
      <NewsTicker />

      <motion.div
        animate={isShaking ? { x: [-8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.35 }}
        style={{
          position: 'relative', zIndex: 1,
          padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%',
        }}
      >
        {/* Header */}
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '24px', flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <h1 className="accent-text" style={{ margin: 0, fontSize: '1.6rem' }}>
              Budget Boss
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
              Level {level}: {levelNames[level]}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <EmotionalMeter state={emotionalState} />

            {/* Quick action buttons */}
            <button className="btn" onClick={() => setShowLeaderboard(true)} style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
              Leaderboard
            </button>
            <button className="btn" onClick={() => setShowDailyChallenge(true)} style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
              Daily Bonus
            </button>
            <button className="btn" onClick={() => setShowMentorChat(c => !c)} style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
              Ask Arjun
            </button>

            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Credit</p>
              <h3 style={{ margin: 0 }} className={creditScore < 500 ? 'danger-text' : 'success-text'}>
                {creditScore}
              </h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Wallet</p>
              <h3 style={{ margin: 0 }} className="accent-text">
                Rs.{walletBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h3>
            </div>
          </div>
        </header>

        {/* Progress + badges row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <div style={{ flex: 1 }}>
            <ProgressBar progress={(xp / maxLevelXp) * 100} label={`Level ${level} XP`} />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {badges.map((b) => (
              <motion.span
                key={b}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '20px', padding: '4px 12px',
                  fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent)',
                }}
              >
                {b}
              </motion.span>
            ))}
          </div>
          {streak > 0 && (
            <span style={{
              background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.3)',
              borderRadius: '20px', padding: '4px 12px',
              fontSize: '0.7rem', fontWeight: 600, color: 'var(--warning)',
            }}>
              {streak} streak
            </span>
          )}
        </div>

        {/* Level Content */}
        <AnimatePresence mode="wait">
          <motion.main
            key={level}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            style={{ marginTop: '24px' }}
          >
            {renderLevel()}
          </motion.main>
        </AnimatePresence>
      </motion.div>
    </>
  );
}

export default App;
