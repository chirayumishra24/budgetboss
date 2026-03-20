// Sound Engine using Web Audio API — zero dependencies
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;

const getCtx = () => {
  if (!ctx) ctx = new AudioCtx();
  return ctx;
};

const playTone = (freq, duration, type = 'sine', volume = 0.15) => {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
  } catch (e) { /* silent fail */ }
};

export const sounds = {
  coin: () => {
    playTone(1200, 0.1, 'sine', 0.12);
    setTimeout(() => playTone(1600, 0.15, 'sine', 0.1), 80);
  },

  success: () => {
    playTone(523, 0.12, 'sine', 0.1);
    setTimeout(() => playTone(659, 0.12, 'sine', 0.1), 120);
    setTimeout(() => playTone(784, 0.2, 'sine', 0.12), 240);
  },

  alert: () => {
    playTone(440, 0.15, 'square', 0.08);
    setTimeout(() => playTone(440, 0.15, 'square', 0.08), 200);
    setTimeout(() => playTone(440, 0.15, 'square', 0.08), 400);
  },

  drop: () => {
    playTone(600, 0.15, 'sawtooth', 0.06);
    setTimeout(() => playTone(300, 0.3, 'sawtooth', 0.05), 100);
  },

  click: () => {
    playTone(800, 0.05, 'sine', 0.06);
  },

  heartbeat: () => {
    playTone(60, 0.15, 'sine', 0.2);
    setTimeout(() => playTone(60, 0.1, 'sine', 0.15), 150);
  },

  crash: () => {
    // Low rumble
    playTone(80, 0.6, 'sawtooth', 0.15);
    playTone(60, 0.8, 'square', 0.1);
  },

  vaultOpen: () => {
    playTone(200, 0.3, 'triangle', 0.1);
    setTimeout(() => playTone(400, 0.2, 'triangle', 0.08), 200);
    setTimeout(() => playTone(300, 0.4, 'sine', 0.12), 400);
  },

  levelUp: () => {
    [523, 587, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.18, 'sine', 0.1), i * 100);
    });
  },

  dividend: () => {
    playTone(880, 0.08, 'sine', 0.08);
    setTimeout(() => playTone(1100, 0.08, 'sine', 0.08), 80);
    setTimeout(() => playTone(1320, 0.12, 'sine', 0.1), 160);
  },
};
