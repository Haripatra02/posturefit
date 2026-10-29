import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Volume2,
  VolumeX,
  HelpCircle,
  Mic,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import { Exercise } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ExerciseAnimation3D } from './ExerciseAnimation3D';
import { rewardApi } from '../../api/rewardApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSound } from '../../hooks/useSound';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';

interface ExerciseModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

export const ExerciseModal: React.FC<ExerciseModalProps> = ({
  exercise,
  isOpen,
  onClose,
  onCompleted,
}) => {
  if (!exercise) return null;

  const { isAuthenticated, preferences } = useAuth();
  const { showToast } = useToast();
  const { playChime, playVictory } = useSound(preferences?.sound_enabled ?? true);
  const {
    isSpeaking,
    isVoiceEnabled,
    setIsVoiceEnabled,
    speakExerciseOverview,
    speakStep,
    speakWhatAreWeDoing,
    stopSpeaking,
  } = useVoiceAssistant();

  const [remaining, setRemaining] = useState<number>(exercise.duration_seconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  // Reset state when opening a new exercise
  useEffect(() => {
    if (isOpen && exercise) {
      setRemaining(exercise.duration_seconds);
      setIsRunning(false);
      setIsSubmitting(false);
      setCheckedSteps({});
      stopSpeaking();
    }
  }, [isOpen, exercise, stopSpeaking]);

  // Clean up speech on close
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  // Countdown timer
  useEffect(() => {
    let interval: number | null = null;
    if (isRunning && remaining > 0) {
      interval = window.setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remaining, playChime]);

  const toggleStep = (idx: number, stepText: string) => {
    const nextState = !checkedSteps[idx];
    setCheckedSteps((prev) => ({ ...prev, [idx]: nextState }));
    if (nextState && isVoiceEnabled) {
      speakStep(idx + 1, stepText);
    }
  };

  const handleStartTimer = () => {
    setIsRunning(true);
    if (isVoiceEnabled) {
      speakExerciseOverview(exercise);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    stopSpeaking();

    try {
      const idempotencyKey = `ex_${exercise.id}_${Date.now()}`;
      let points = 20;

      if (isAuthenticated) {
        const res = await rewardApi.completeActivity({
          exercise_id: exercise.id,
          duration_seconds: exercise.duration_seconds - remaining,
          completion_status: 'completed',
          idempotency_key: idempotencyKey,
        });
        points = res.pointsAwarded || 20;

        if (res.newlyEarnedBadges && res.newlyEarnedBadges.length > 0) {
          res.newlyEarnedBadges.forEach((b: any) => {
            showToast({
              type: 'badge',
              title: `Badge Unlocked: ${b.badge?.name || 'Achievement'}!`,
              message: b.badge?.description,
              duration: 6000,
            });
          });
        }
      }

      playVictory();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0d9488', '#14b8a6', '#f59e0b', '#3b82f6'],
      });

      showToast({
        type: 'success',
        title: `Activity Complete! +${points} pts`,
        message: 'Excellent posture reset. Keep building healthy habits!',
      });

      if (onCompleted) onCompleted();
      onClose();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Could not record completion',
        message: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const formattedTimer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const audienceBadge = () => {
    if (exercise.target_audience === 'student') {
      return (
        <Badge variant="blue" size="sm">
          <GraduationCap className="w-3 h-3 mr-1" /> Student Study Break
        </Badge>
      );
    }
    if (exercise.target_audience === 'office') {
      return (
        <Badge variant="amber" size="sm">
          <Briefcase className="w-3 h-3 mr-1" /> Office Desk Routine
        </Badge>
      );
    }
    return (
      <Badge variant="brand" size="sm">
        Universal Wellness
      </Badge>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-5">
        {/* Header */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="brand">{exercise.category.replace('_', ' ')}</Badge>
            <Badge variant="default">{exercise.difficulty}</Badge>
            {audienceBadge()}
            <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200 flex items-center gap-1 ml-auto">
              <Sparkles className="w-3.5 h-3.5" /> +20 pts
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-heading">
            {exercise.title}
          </h2>
          <p className="text-sm text-charcoal-muted mt-1 leading-relaxed">
            {exercise.description}
          </p>
        </div>

        {/* 🎙️ Voice Assistant Control Strip */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-brand-50 via-teal-50 to-brand-50 border border-brand-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isSpeaking
                  ? 'bg-brand-600 text-white animate-pulse'
                  : 'bg-white text-brand-700 border border-brand-200'
              }`}
            >
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-charcoal-heading flex items-center gap-1.5">
                Voice Coach
                {isSpeaking && (
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                )}
              </p>
              <p className="text-[11px] text-charcoal-muted">
                {isSpeaking ? 'Reading instructions aloud...' : 'Audio guidance for screen-free stretching'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* What are we doing? Button */}
            <button
              onClick={() => speakWhatAreWeDoing(exercise, remaining)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-brand-200 text-brand-800 hover:bg-brand-100 transition-colors font-medium text-[11px] flex items-center gap-1 shadow-sm"
              title="Ask voice assistant: What exercise are we doing?"
            >
              <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
              &quot;What are we doing?&quot;
            </button>

            {/* Read All Button */}
            <button
              onClick={() => speakExerciseOverview(exercise)}
              className="px-2.5 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors font-medium text-[11px] flex items-center gap-1 shadow-sm"
              title="Read full exercise overview"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Read Aloud
            </button>

            {/* Voice Mute / Unmute */}
            <button
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setIsVoiceEnabled(!isVoiceEnabled);
              }}
              className="p-1.5 rounded-lg bg-white border border-surface-border text-charcoal-body hover:bg-surface-subtle"
              title={isVoiceEnabled ? 'Mute voice coach' : 'Enable voice coach'}
            >
              {isVoiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-brand-600" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
            </button>
          </div>
        </div>

        {/* 🏃 Animated 3D Exercise Demonstration */}
        <ExerciseAnimation3D exercise={exercise} isPlaying={isRunning} />

        {/* Guided Interactive Timer widget */}
        <div className="bg-surface-subtle rounded-2xl p-4 sm:p-5 border border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white border border-surface-border flex items-center justify-center font-mono font-bold text-xl text-charcoal-heading shadow-sm">
              {formattedTimer}
            </div>
            <div>
              <p className="text-xs font-semibold text-charcoal-heading">Activity Timer</p>
              <p className="text-xs text-charcoal-muted">
                {remaining === 0 ? 'Time completed!' : isRunning ? 'In progress...' : 'Paced duration'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isRunning ? (
              <Button size="sm" variant="secondary" onClick={() => setIsRunning(false)}>
                <Pause className="w-4 h-4 mr-1" /> Pause
              </Button>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={handleStartTimer}
                disabled={remaining === 0}
              >
                <Play className="w-4 h-4 mr-1 fill-white" /> Start
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsRunning(false);
                setRemaining(exercise.duration_seconds);
                stopSpeaking();
              }}
              title="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Instructions checklist */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-charcoal-heading uppercase tracking-wider">
              Step-by-Step Instructions
            </h3>
            <span className="text-[11px] text-charcoal-muted">Click step to listen</span>
          </div>

          <ol className="space-y-2.5">
            {exercise.instructions.map((step, idx) => {
              const isChecked = Boolean(checkedSteps[idx]);
              return (
                <li
                  key={idx}
                  onClick={() => toggleStep(idx, step)}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-sm transition-all cursor-pointer select-none ${
                    isChecked
                      ? 'bg-brand-50/50 border-brand-200 text-charcoal-heading'
                      : 'bg-white border-surface-border text-charcoal-body hover:bg-surface-subtle'
                  }`}
                >
                  <span
                    className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                      isChecked ? 'bg-brand-600 text-white' : 'bg-surface-subtle text-charcoal-muted border border-surface-border'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className={`leading-relaxed ${isChecked ? 'line-through text-charcoal-muted' : ''}`}>
                    {step}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Safety Notes alert */}
        {exercise.safety_notes && (
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <strong className="font-semibold">Ergonomic Safety Note: </strong>
              <span>{exercise.safety_notes}</span>
            </div>
          </div>
        )}

        {/* Completion button */}
        <div className="pt-3 border-t border-surface-border flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleComplete}
            isLoading={isSubmitting}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Mark Complete (+20 pts)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
