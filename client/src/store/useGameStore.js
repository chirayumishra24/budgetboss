import { create } from 'zustand';
import { sounds } from '../utils/sounds';

export const useGameStore = create((set, get) => ({
  // Global Game State
  playerName: '',
  level: 1,
  xp: 0,
  maxLevelXp: 1000,
  isShaking: false,
  emotionalState: 'calm', // calm, stressed, panic
  gameOver: false,

  // Player Profile
  badges: [],
  streak: 0,
  totalEarnings: 0,

  // Mentor
  mentorMessage: null,

  // Achievement queue
  pendingAchievement: null,

  // Level 1: Wallet & Expenses
  walletBalance: 50000,
  income: 50000,
  needs: 0,
  wants: 0,
  investments: 0,
  creditScore: 750,

  // Level 3 & 4: Portfolio
  portfolioValue: 0,
  holdings: [],

  // ─── Actions ─────────────────────────────
  setPlayerName: (playerName) => set({ playerName }),

  setLevel: (level) => {
    sounds.levelUp();
    set({ level });
  },

  addXp: (amount) => set((state) => ({
    xp: Math.min(state.maxLevelXp, state.xp + amount),
  })),

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
    }
  },
  clearAchievement: () => set({ pendingAchievement: null }),

  // Streak
  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),

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
  },

  // ─── Level 1 ─────────────────────────────
  allocateFunds: (category, amount) => set((state) => {
    if (state.walletBalance >= amount) {
      sounds.coin();
      return {
        walletBalance: state.walletBalance - amount,
        [category]: state[category] + amount,
      };
    }
    return state;
  }),

  // Transfer investments to wallet for Level 3+
  completeLevel1: () => {
    const { investments } = get();
    sounds.levelUp();
    set({ walletBalance: investments, level: 2 });
  },

  penalizeCreditScore: (penalty) => {
    sounds.alert();
    set((state) => ({
      creditScore: Math.max(300, state.creditScore - penalty),
      emotionalState: state.creditScore - penalty < 500 ? 'panic' : 'stressed',
    }));
  },

  // ─── Level 3 ─────────────────────────────
  addDividend: (amount) => {
    sounds.dividend();
    set((state) => ({
      walletBalance: state.walletBalance + amount,
      totalEarnings: state.totalEarnings + amount,
    }));
  },

  // ─── Level 4 ─────────────────────────────
  buyStock: (symbol, price, qty) => set((state) => {
    const cost = price * qty;
    if (state.walletBalance >= cost) {
      sounds.click();
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
  }),

  updateWallet: (amount) => set((state) => ({
    walletBalance: state.walletBalance + amount,
  })),
}));
