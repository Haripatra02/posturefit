import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Coffee, Sparkles, Settings2, Info } from 'lucide-react';
import { useTimer } from '../../context/TimerContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';

export const WorkTimer: React.FC = () => {
  const {
    mode,
    status,
    remainingSeconds,
    totalDuration,
    progressPercent,
    startWork,
    pauseTimer,
    resumeTimer,
    resetTimer,
    startBreak,
    breaksTaken,
    setWorkDurationMinutes,
  } = useTimer();

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [customDurationOpen, setCustomDurationOpen] = useState(false);
  const [customInput, setCustomInput] = useState(30);

  // Formatting MM:SS
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG circle math
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const handleResetClick = () => {
    if (status === 'running' || status === 'paused') {
      setConfirmResetOpen(true);
    } else {
      resetTimer();
    }
  };

  const handleSelectWorkMinutes = (m: number) => {
    if (status === 'idle') {
      setWorkDurationMinutes(m);
    }
  };

  return (
    <Card className="flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-brand-50/70 to-transparent pointer-events-none" />

      {/* Mode Indicator & Duration Presets */}
      <div className="flex flex-col items-center gap-3 mb-6 z-10 w-full max-w-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-brand-50 text-brand-800 border border-brand-200">
          {mode === 'work' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
              Focus & Sitting Session
            </>
          ) : (
            <>
              <Coffee className="w-3.5 h-3.5 text-accent-amber" />
              Movement & Posture Break
            </>
          )}
        </div>

        {status === 'idle' && mode === 'work' && (
          <div className="flex items-center gap-1.5 p-1 bg-surface-subtle rounded-xl border border-surface-border">
            {[20, 25, 30, 45, 60].map((m) => {
              const active = totalDuration === m * 60;
              return (
                <button
                  key={m}
                  onClick={() => handleSelectWorkMinutes(m)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-charcoal-muted hover:text-charcoal-heading'
                  }`}
                >
                  {m}m
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Radial Progress Ring */}
      <div className="relative my-4 flex items-center justify-center">
        <svg className="w-64 h-64 sm:w-72 sm:h-72 -rotate-90 transform" viewBox="0 0 260 260">
          {/* Background circle */}
          <circle
            cx="130"
            cy="130"
            r={radius}
            className="stroke-stone-100"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Animated progress stroke */}
          <circle
            cx="130"
            cy="130"
            r={radius}
            className={`transition-all duration-700 ease-linear ${
              mode === 'work' ? 'stroke-brand-600' : 'stroke-accent-amber'
            }`}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Timer Typography */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-charcoal-heading font-mono">
            {formattedTime}
          </span>
          <span className="text-xs font-medium text-charcoal-muted mt-1 uppercase tracking-wider">
            {status === 'running'
              ? 'Remaining'
              : status === 'paused'
              ? 'Session Paused'
              : status === 'break_prompt'
              ? 'Interval Finished'
              : 'Ready to Start'}
          </span>
        </div>
      </div>

      {/* Control Action Buttons */}
      <div className="flex items-center gap-3 mt-6 z-10">
        {status === 'idle' && (
          <Button
            size="lg"
            variant="primary"
            onClick={() => startWork()}
            leftIcon={<Play className="w-5 h-5 fill-white" />}
            className="px-8 shadow-md"
          >
            Start Work Session
          </Button>
        )}

        {status === 'running' && (
          <Button
            size="lg"
            variant="secondary"
            onClick={pauseTimer}
            leftIcon={<Pause className="w-5 h-5" />}
            className="px-6"
          >
            Pause
          </Button>
        )}

        {status === 'paused' && (
          <Button
            size="lg"
            variant="primary"
            onClick={resumeTimer}
            leftIcon={<Play className="w-5 h-5 fill-white" />}
            className="px-6"
          >
            Resume
          </Button>
        )}

        {(status === 'running' || status === 'paused') && (
          <>
            <Button
              size="lg"
              variant="outline"
              onClick={handleResetClick}
              leftIcon={<RotateCcw className="w-4 h-4 text-charcoal-muted" />}
              title="Reset session"
            >
              Reset
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => startBreak(5)}
              leftIcon={<Coffee className="w-4 h-4 text-brand-600" />}
              className="text-brand-700 bg-brand-50 hover:bg-brand-100"
            >
              Take Break Now
            </Button>
          </>
        )}
      </div>

      {/* Ergonomic & Study Posture Cue */}
      <div className="mt-6 w-full max-w-md p-3.5 rounded-2xl bg-gradient-to-r from-teal-50 via-brand-50 to-teal-50 border border-brand-200/80 text-xs text-brand-950 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-brand-900">Desk & Study Alignment Cue:</p>
          <p className="text-brand-800 text-[11px] leading-relaxed mt-0.5">
            {mode === 'work'
              ? 'Plant feet flat, relax shoulders down from ears, and ensure your eye gaze hits the top third of your display.'
              : 'Stand up tall, roll your shoulders backward 5 times, and take a deep breath into your lower ribs.'}
          </p>
        </div>
      </div>

      {/* Session Stats summary pill */}
      <div className="mt-6 flex items-center gap-6 text-xs text-charcoal-muted pt-4 border-t border-surface-border w-full justify-center">
        <span className="flex items-center gap-1.5">
          <Coffee className="w-4 h-4 text-accent-amber" />
          Breaks this session: <strong className="text-charcoal-heading">{breaksTaken}</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-brand-600" />
          Break reward: <strong className="text-charcoal-heading">+10 pts</strong>
        </span>
      </div>

      {/* Medical disclaimer note */}
      <div className="mt-4 flex items-center gap-2 text-[11px] text-charcoal-muted/80 max-w-sm text-center">
        <Info className="w-3.5 h-3.5 shrink-0 text-charcoal-muted" />
        <span>Tracks active time duration. Does not claim to detect body posture automatically.</span>
      </div>

      {/* Confirmation Reset Modal */}
      <Modal
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        title="Reset Active Session?"
        description="Resetting will cancel current interval progress. Are you sure you want to stop?"
      >
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setConfirmResetOpen(false)}>
            Continue Session
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              resetTimer();
              setConfirmResetOpen(false);
            }}
          >
            Yes, Reset
          </Button>
        </div>
      </Modal>
    </Card>
  );
};
