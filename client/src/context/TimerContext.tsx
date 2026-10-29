import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { sessionApi } from '../api/sessionApi';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useSound } from '../hooks/useSound';
import { useNotification } from '../hooks/useNotification';

export type TimerMode = 'work' | 'break';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'break_prompt';

interface PersistedTimerState {
  mode: TimerMode;
  status: TimerStatus;
  workDuration: number; // in seconds
  breakDuration: number; // in seconds
  targetEndAt: number | null; // epoch timestamp ms
  remainingSeconds: number;
  activeSessionId: string | null;
  breaksTaken: number;
  lastTick: number;
}

interface TimerContextType {
  mode: TimerMode;
  status: TimerStatus;
  remainingSeconds: number;
  totalDuration: number;
  progressPercent: number;
  activeSessionId: string | null;
  breaksTaken: number;
  isBreakModalOpen: boolean;
  startWork: (minutes?: number) => Promise<void>;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  startBreak: (minutes?: number) => void;
  finishBreak: () => Promise<void>;
  skipBreak: () => void;
  setIsBreakModalOpen: (open: boolean) => void;
  setWorkDurationMinutes: (minutes: number) => void;
  setBreakDurationMinutes: (minutes: number) => void;
}

const STORAGE_KEY = 'posturefit_timer_state';

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { preferences, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { sendNotification } = useNotification();

  // Sound hook
  const soundEnabled = preferences?.sound_enabled ?? true;
  const { playChime, playVictory } = useSound(soundEnabled);

  // Default durations from preferences or defaults
  const defaultWorkSeconds = (preferences?.work_duration || 30) * 60;
  const defaultBreakSeconds = (preferences?.break_duration || 5) * 60;

  const [mode, setMode] = useState<TimerMode>('work');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [workDuration, setWorkDuration] = useState<number>(defaultWorkSeconds);
  const [breakDuration, setBreakDuration] = useState<number>(defaultBreakSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(defaultWorkSeconds);
  const [targetEndAt, setTargetEndAt] = useState<number | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [breaksTaken, setBreaksTaken] = useState<number>(0);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState<boolean>(false);

  const timerIntervalRef = useRef<number | null>(null);

  // Sync preference updates into default state if timer is idle
  useEffect(() => {
    if (status === 'idle') {
      if (preferences?.work_duration) {
        const sec = preferences.work_duration * 60;
        setWorkDuration(sec);
        if (mode === 'work') setRemainingSeconds(sec);
      }
      if (preferences?.break_duration) {
        const sec = preferences.break_duration * 60;
        setBreakDuration(sec);
        if (mode === 'break') setRemainingSeconds(sec);
      }
    }
  }, [preferences, status, mode]);

  // Save state to localStorage
  const saveStateToStorage = useCallback(
    (newState: Partial<PersistedTimerState>) => {
      const stateToSave: PersistedTimerState = {
        mode,
        status,
        workDuration,
        breakDuration,
        targetEndAt,
        remainingSeconds,
        activeSessionId,
        breaksTaken,
        lastTick: Date.now(),
        ...newState,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    },
    [mode, status, workDuration, breakDuration, targetEndAt, remainingSeconds, activeSessionId, breaksTaken]
  );

  // Handle timer completion (work finished -> break prompt)
  const handleTimerComplete = useCallback(async () => {
    if (mode === 'work') {
      setStatus('break_prompt');
      setRemainingSeconds(0);
      setTargetEndAt(null);
      setIsBreakModalOpen(true);

      // Play alert chime
      playChime();

      // Browser notification
      if (preferences?.reminders_enabled) {
        sendNotification('Time for a Movement Break! 🌿', {
          body: 'Great focus session! Stand up, stretch, or take a quick 5-minute movement break.',
        });
      }

      showToast({
        type: 'info',
        title: 'Focus interval completed!',
        message: 'Step away from the screen for a mindful movement break.',
      });

      // Update backend session duration
      if (activeSessionId && isAuthenticated) {
        sessionApi.updateSession(activeSessionId, {
          status: 'in_progress',
          actual_tracked_duration: workDuration,
        }).catch(() => {});
      }

      saveStateToStorage({
        status: 'break_prompt',
        remainingSeconds: 0,
        targetEndAt: null,
      });
    } else {
      // Break completed
      setStatus('idle');
      setMode('work');
      setRemainingSeconds(workDuration);
      setTargetEndAt(null);
      playVictory();

      showToast({
        type: 'success',
        title: 'Break completed! Ready to focus?',
        message: 'Your body thanks you. Sit back with balanced posture.',
      });

      saveStateToStorage({
        mode: 'work',
        status: 'idle',
        remainingSeconds: workDuration,
        targetEndAt: null,
      });
    }
  }, [
    mode,
    workDuration,
    activeSessionId,
    isAuthenticated,
    preferences,
    playChime,
    playVictory,
    sendNotification,
    showToast,
    saveStateToStorage,
  ]);

  // Recalculate remaining seconds from timestamps
  const recalculateFromTimestamp = useCallback(() => {
    if (status !== 'running' || !targetEndAt) return;

    const now = Date.now();
    const diffSeconds = Math.max(0, Math.round((targetEndAt - now) / 1000));

    if (diffSeconds <= 0) {
      handleTimerComplete();
    } else {
      setRemainingSeconds(diffSeconds);
    }
  }, [status, targetEndAt, handleTimerComplete]);

  // Listen for tab focus / device wakeup
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        recalculateFromTimestamp();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', recalculateFromTimestamp);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', recalculateFromTimestamp);
    };
  }, [recalculateFromTimestamp]);

  // Interval ticker
  useEffect(() => {
    if (status === 'running') {
      timerIntervalRef.current = window.setInterval(() => {
        recalculateFromTimestamp();
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [status, recalculateFromTimestamp]);

  // Load persisted state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PersistedTimerState = JSON.parse(saved);
        setMode(parsed.mode);
        setWorkDuration(parsed.workDuration);
        setBreakDuration(parsed.breakDuration);
        setActiveSessionId(parsed.activeSessionId);
        setBreaksTaken(parsed.breaksTaken || 0);

        if (parsed.status === 'running' && parsed.targetEndAt) {
          const now = Date.now();
          const diff = Math.max(0, Math.round((parsed.targetEndAt - now) / 1000));
          if (diff <= 0) {
            setStatus('break_prompt');
            setRemainingSeconds(0);
            setIsBreakModalOpen(true);
          } else {
            setStatus('running');
            setTargetEndAt(parsed.targetEndAt);
            setRemainingSeconds(diff);
          }
        } else if (parsed.status === 'paused') {
          setStatus('paused');
          setRemainingSeconds(parsed.remainingSeconds);
        } else if (parsed.status === 'break_prompt') {
          setStatus('break_prompt');
          setRemainingSeconds(0);
          setIsBreakModalOpen(true);
        } else {
          setStatus('idle');
          setRemainingSeconds(parsed.mode === 'work' ? parsed.workDuration : parsed.breakDuration);
        }
      }
    } catch {
      // Ignore corrupted storage
    }
  }, []);

  // START WORK SESSION
  const startWork = async (customMinutes?: number) => {
    const durSec = (customMinutes || workDuration / 60) * 60;
    const now = Date.now();
    const end = now + durSec * 1000;

    let sessionId = activeSessionId;
    if (!sessionId && isAuthenticated) {
      try {
        const session = await sessionApi.startSession(durSec);
        sessionId = session.id;
        setActiveSessionId(session.id);
      } catch {
        // Fallback gracefully
      }
    }

    setMode('work');
    setStatus('running');
    setWorkDuration(durSec);
    setRemainingSeconds(durSec);
    setTargetEndAt(end);
    setIsBreakModalOpen(false);

    saveStateToStorage({
      mode: 'work',
      status: 'running',
      workDuration: durSec,
      remainingSeconds: durSec,
      targetEndAt: end,
      activeSessionId: sessionId,
    });
  };

  // PAUSE
  const pauseTimer = () => {
    if (status !== 'running') return;
    setStatus('paused');
    setTargetEndAt(null);

    saveStateToStorage({
      status: 'paused',
      remainingSeconds,
      targetEndAt: null,
    });
  };

  // RESUME
  const resumeTimer = () => {
    if (status !== 'paused') return;
    const now = Date.now();
    const end = now + remainingSeconds * 1000;

    setStatus('running');
    setTargetEndAt(end);

    saveStateToStorage({
      status: 'running',
      targetEndAt: end,
    });
  };

  // RESET
  const resetTimer = () => {
    setStatus('idle');
    setMode('work');
    setRemainingSeconds(workDuration);
    setTargetEndAt(null);

    if (activeSessionId && isAuthenticated) {
      sessionApi.updateSession(activeSessionId, {
        status: 'cancelled',
        actual_tracked_duration: Math.max(0, workDuration - remainingSeconds),
      }).catch(() => {});
    }

    setActiveSessionId(null);
    setBreaksTaken(0);

    saveStateToStorage({
      status: 'idle',
      mode: 'work',
      remainingSeconds: workDuration,
      targetEndAt: null,
      activeSessionId: null,
      breaksTaken: 0,
    });
  };

  // START BREAK
  const startBreak = (customMinutes?: number) => {
    const durSec = (customMinutes || breakDuration / 60) * 60;
    const now = Date.now();
    const end = now + durSec * 1000;

    setMode('break');
    setStatus('running');
    setBreakDuration(durSec);
    setRemainingSeconds(durSec);
    setTargetEndAt(end);
    setIsBreakModalOpen(false);

    saveStateToStorage({
      mode: 'break',
      status: 'running',
      breakDuration: durSec,
      remainingSeconds: durSec,
      targetEndAt: end,
    });
  };

  // FINISH BREAK
  const finishBreak = async () => {
    let pts = 10;
    const nextBreaks = breaksTaken + 1;
    setBreaksTaken(nextBreaks);

    if (activeSessionId && isAuthenticated) {
      try {
        const res = await sessionApi.recordBreak(activeSessionId);
        pts = res.pointsAwarded || 10;
      } catch {
        // Fallback
      }
    }

    showToast({
      type: 'success',
      title: `Break recorded! +${pts} points`,
      message: 'Keep up the healthy movement balance!',
    });

    setStatus('idle');
    setMode('work');
    setRemainingSeconds(workDuration);
    setTargetEndAt(null);
    setIsBreakModalOpen(false);
    playVictory();

    saveStateToStorage({
      mode: 'work',
      status: 'idle',
      remainingSeconds: workDuration,
      targetEndAt: null,
      breaksTaken: nextBreaks,
    });
  };

  // SKIP BREAK
  const skipBreak = () => {
    setStatus('idle');
    setMode('work');
    setRemainingSeconds(workDuration);
    setTargetEndAt(null);
    setIsBreakModalOpen(false);

    saveStateToStorage({
      mode: 'work',
      status: 'idle',
      remainingSeconds: workDuration,
      targetEndAt: null,
    });
  };

  const totalDuration = mode === 'work' ? workDuration : breakDuration;
  const progressPercent = totalDuration > 0 ? Math.min(100, Math.round(((totalDuration - remainingSeconds) / totalDuration) * 100)) : 0;

  return (
    <TimerContext.Provider
      value={{
        mode,
        status,
        remainingSeconds,
        totalDuration,
        progressPercent,
        activeSessionId,
        breaksTaken,
        isBreakModalOpen,
        startWork,
        pauseTimer,
        resumeTimer,
        resetTimer,
        startBreak,
        finishBreak,
        skipBreak,
        setIsBreakModalOpen,
        setWorkDurationMinutes: (m) => setWorkDuration(m * 60),
        setBreakDurationMinutes: (m) => setBreakDuration(m * 60),
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
