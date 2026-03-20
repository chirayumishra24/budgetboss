import { create } from 'zustand';
import { sounds } from '../utils/sounds';

// Load saved game state from localStorage
const loadSavedState = () => {
  try {
    const saved = localStorage.getItem('budgetboss_save');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const savedState = loadSavedState();

export const useGameStore = create((set, get) => ({
  // Global Game State
  playerName: savedState?.playerName || '',
  level: savedState?.level || 1,
  xp: savedState?.xp || 0,
  maxLevelXp: 1000,
  isShaking: false,
  emotionalState: 'calm', // calm, stressed, panic
  gameOver: false,

  // Player Profile
  badges: savedState?.badges || [],
  streak: savedState?.streak || 0,
  totalEarnings: savedState?.totalEarnings || 0,

  // Mentor
  mentorMessage: null,

  // Achievement queue
  pendingAchievement: null,

  // Level 1: Wallet & Expenses
  walletBalance: savedState?.walletBalance || 50000,
  income: 50000,
  needs: savedState?.needs || 0,
  wants: savedState?.wants || 0,
  investments: savedState?.investments || 0,
  creditScore: savedState?.creditScore || 750,

  // Level 3 & 4: Portfolio
  portfolioValue: 0,
  holdings: savedState?.holdings || [],

  // ─── Save to localStorage ─────────────────────────────
  saveGame: () => {
    const state = get();
    try {
      localStorage.setItem('budgetboss_save', JSON.stringify({
        playerName: state.playerName,
        level: state.level,
        xp: state.xp,
        walletBalance: state.walletBalance,
        creditScore: state.creditScore,
        badges: state.badges,
        streak: state.streak,
        totalEarnings: state.totalEarnings,
        holdings: state.holdings,
        needs: state.needs,
        wants: state.wants,
        investments: state.investments,
      }));
    } catch (error) {
      console.error("Error saving game:", error);
    }
  },

  // ─── Actions ─────────────────────────────
  setPlayerName: (playerName) => {
    set({ playerName });
    get().saveGame();
  },

  setLevel: (level) => {
    sounds.levelUp();
    set({ level });
    get().saveGame();
  },

  addXp: (amount) => {
    set((state) => ({
      xp: Math.min(state.maxLevelXp, state.xp + amount),
    }));
    get().saveGame();
  },

  // Shake
  triggerShake: () => {
    set({ isShaking: true });
    setTimeout(() => set({ isShaking: false }), 500);
  },

  // Emotional
  setEmotionalState: (emotionalState) => set({ emotionalState }),

  // Mentor
  setMentorMessage: (mentorMessage) => set({ mentorMessage }),
  dismissMentor: () => set({ mentorMessage: null }),

  // Badges & Achievements
  unlockBadge: (badge) => {
    const { badges } = get();
    if (!badges.includes(badge)) {
      sounds.success();
      set({
        badges: [...badges, badge],
        pendingAchievement: badge,
      });
      get().saveGame();
    }
  },
  clearAchievement: () => set({ pendingAchievement: null }),

  // Streak
  incrementStreak: () => {
    set((state) => ({ streak: state.streak + 1 }));
    get().saveGame();
  },

  // Game Over
  triggerGameOver: () => {
    sounds.crash();
    set({ gameOver: true, emotionalState: 'panic' });
  },
  resetGame: () => {
    const { playerName } = get();
    set({
      playerName,
      level: 1, xp: 0, walletBalance: 50000, needs: 0, wants: 0,
      investments: 0, creditScore: 750, holdings: [], portfolioValue: 0,
      gameOver: false, emotionalState: 'calm', badges: [], streak: 0,
      totalEarnings: 0, mentorMessage: null, pendingAchievement: null,
    });
    get().saveGame();
  },

  // ─── Level 1 ─────────────────────────────
  allocateFunds: (category, amount) => {
    let changed = false;
    set((state) => {
      if (state.walletBalance >= amount) {
        sounds.coin();
        changed = true;
        return {
          walletBalance: state.walletBalance - amount,
          [category]: state[category] + amount,
        };
      }
      return state;
    });
    if (changed) get().saveGame();
  },

  // Transfer investments to wallet for Level 3+
  completeLevel1: () => {
    const { investments } = get();
    sounds.levelUp();
    set({ walletBalance: investments, level: 2 });
    get().saveGame();
  },

  penalizeCreditScore: (penalty) => {
    sounds.alert();
    set((state) => ({
      creditScore: Math.max(300, state.creditScore - penalty),
      emotionalState: state.creditScore - penalty < 500 ? 'panic' : 'stressed',
    }));
    get().saveGame();
  },

  // ─── Level 3 ─────────────────────────────
  addDividend: (amount) => {
    sounds.dividend();
    set((state) => ({
      walletBalance: state.walletBalance + amount,
      totalEarnings: state.totalEarnings + amount,
    }));
    get().saveGame();
  },

  // ─── Level 4 ─────────────────────────────
  buyStock: (symbol, price, qty) => {
    let changed = false;
    set((state) => {
      const cost = price * qty;
      if (state.walletBalance >= cost) {
        sounds.click();
        changed = true;
        const existing = state.holdings.find(h => h.symbol === symbol);
        let newHoldings;
        if (existing) {
          newHoldings = state.holdings.map(h =>
            h.symbol === symbol
              ? { ...h, qty: h.qty + qty, avgPrice: ((h.avgPrice * h.qty) + cost) / (h.qty + qty) }
              : h
          );
        } else {
          newHoldings = [...state.holdings, { symbol, qty, avgPrice: price }];
        }
        return {
          walletBalance: state.walletBalance - cost,
          holdings: newHoldings,
        };
      }
      return state;
    });
    if (changed) get().saveGame();
  },

  updateWallet: (amount) => {
    set((state) => ({
      walletBalance: state.walletBalance + amount,
    }));
    get().saveGame();
  },
}));
