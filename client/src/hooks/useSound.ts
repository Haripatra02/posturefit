import { useCallback } from 'react';

/**
 * Web Audio API synthesized sound generator.
 * Works reliably without downloading external audio files.
 */
export function useSound(soundEnabled = true) {
  const getAudioContext = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      return AudioCtx ? new AudioCtx() : null;
    } catch {
      return null;
    }
  }, []);

  // Play gentle alert chime for break reminder
  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Tone 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.8);

      // Tone 2 (higher harmony)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.15); // E5
      gain2.gain.setValueAtTime(0.15, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 1.2);
    } catch {
      // Audio autoplay policy handled silently
    }
  }, [soundEnabled, getAudioContext]);

  // Cheerful ascending arpeggio for achievement / challenge completion
  const playVictory = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.1;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch {
      // Audio autoplay policy handled silently
    }
  }, [soundEnabled, getAudioContext]);

  return { playChime, playVictory };
}
