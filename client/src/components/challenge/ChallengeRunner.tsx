import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Sparkles,
  AlertTriangle,
  Volume2,
  VolumeX,
  HelpCircle,
  Mic,
  Wind,
  ShieldCheck,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Challenge } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ExerciseAnimation3D } from '../exercises/ExerciseAnimation3D';
import { rewardApi } from '../../api/rewardApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSound } from '../../hooks/useSound';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';

interface ChallengeRunnerProps {
  challenge: Challenge;
  onExit: () => void;
}

export const ChallengeRunner: React.FC<ChallengeRunnerProps> = ({ challenge, onExit }) => {
  const navigate = useNavigate();
  const { isAuthenticated, preferences } = useAuth();
  const { showToast } = useToast();
  const { playChime, playVictory } = useSound(preferences?.sound_enabled ?? true);
  const {
    isSpeaking,
    isVoiceEnabled,
    setIsVoiceEnabled,
    speak,
    speakWhatAreWeDoing,
    stopSpeaking,
  } = useVoiceAssistant();

  const exercises = challenge.exercises || [];
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const currentItem = exercises[currentIndex];
  const currentExercise = currentItem?.exercise;
  const targetDuration = currentItem?.planned_duration_seconds || 60;

  const [remainingSeconds, setRemainingSeconds] = useState<number>(targetDuration);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [pointsEarned, setPointsEarned] = useState<number>(60);
  const [newBadges, setNewBadges] = useState<any[]>([]);
  const [confirmExitOpen, setConfirmExitOpen] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Update timer duration and voice announce when switching exercise
  useEffect(() => {
    if (currentItem && currentExercise) {
      setRemainingSeconds(currentItem.planned_duration_seconds || 60);
      setIsRunning(true);
      if (isVoiceEnabled) {
        speak(
          `Exercise ${currentIndex + 1} of ${exercises.length}. ${currentExercise.title}. ${currentExercise.description}`
        );
      }
    }
  }, [currentIndex, currentItem, currentExercise, exercises.length, isVoiceEnabled, speak]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  // Exercise countdown timer
  useEffect(() => {
    let interval: number | null = null;
    if (isRunning && remainingSeconds > 0 && !isCompleted) {
      interval = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            playChime();
            setCompletedSteps((c) => ({ ...c, [currentIndex]: true }));

            // Automatically advance if not at the last exercise
            if (currentIndex < exercises.length - 1) {
              setCurrentIndex((idx) => idx + 1);
              return 0;
            } else {
              // Final exercise finished!
              triggerChallengeCompletion();
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remainingSeconds, isCompleted, currentIndex, exercises.length, playChime]);

  const triggerChallengeCompletion = async () => {
    setIsCompleted(true);
    setIsRunning(false);
    stopSpeaking();

    try {
      const idempotencyKey = `chal_${challenge.id}_${Date.now()}`;
      let pts = 60;

      if (isAuthenticated) {
        const res = await rewardApi.completeActivity({
          challenge_id: challenge.id,
          duration_seconds: challenge.target_duration_seconds,
          completion_status: 'completed',
          idempotency_key: idempotencyKey,
        });

        pts = res.pointsAwarded || 60;
        if (res.newlyEarnedBadges && res.newlyEarnedBadges.length > 0) {
          setNewBadges(res.newlyEarnedBadges);
          res.newlyEarnedBadges.forEach((b: any) => {
            showToast({
              type: 'badge',
              title: `Badge Unlocked: ${b.badge?.name || 'Achievement'}!`,
              message: b.badge?.description,
            });
          });
        }
      }

      setPointsEarned(pts);
      playVictory();
      if (isVoiceEnabled) {
        speak('Outstanding! You completed all 5 movements of the Posture Challenge. 60 points added to your score.');
      }

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0d9488', '#14b8a6', '#f59e0b', '#3b82f6', '#10b981'],
      });

      showToast({
        type: 'success',
        title: `Challenge Completed! +${pts} Points`,
        message: 'Your spine, shoulders, and postural stabilizers thank you!',
      });
    } catch {
      // Fallback
    }
  };

  const handleNext = () => {
    setCompletedSteps((c) => ({ ...c, [currentIndex]: true }));
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      triggerChallengeCompletion();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const progressPercent = Math.round(((currentIndex + 1) / exercises.length) * 100);

  // Minutes and seconds formatting
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Timer ring percentage
  const stepPercent = Math.round(((targetDuration - remainingSeconds) / targetDuration) * 100);

  if (isCompleted) {
    return (
      <Card className="max-w-2xl mx-auto p-8 sm:p-12 text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-6 shadow-sm animate-bounce">
          <Trophy className="w-10 h-10 text-accent-amber" />
        </div>

        <h2 className="text-3xl font-extrabold text-charcoal-heading">
          5-Minute Challenge Complete! 🎉
        </h2>
        <p className="text-charcoal-muted text-base mt-2 max-w-md mx-auto leading-relaxed">
          You finished all {exercises.length} guided movements for <strong>{challenge.title}</strong>.
        </p>

        {/* Points Banner */}
        <div className="my-8 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-brand-50 border border-brand-200 text-brand-900">
          <Sparkles className="w-6 h-6 text-brand-600" />
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Reward Awarded</p>
            <p className="text-2xl font-black text-brand-900">+{pointsEarned} Points</p>
          </div>
        </div>

        {/* Unlocked Badges */}
        {newBadges.length > 0 && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-left">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
              New Badges Unlocked:
            </p>
            <div className="flex flex-wrap gap-2">
              {newBadges.map((b: any, idx: number) => (
                <Badge key={idx} variant="amber" size="md">
                  🏆 {b.badge?.name || 'Achievement'}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Navigation actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="outline" size="lg" onClick={onExit}>
            Back to Challenges
          </Button>
          <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header & Exit button */}
      <div className="flex items-center justify-between text-sm">
        <Button variant="ghost" size="sm" onClick={() => setConfirmExitOpen(true)}>
          ← Exit Challenge
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="brand" size="md">
            {challenge.title}
          </Badge>
          <span className="text-xs font-bold text-charcoal-muted">
            Step {currentIndex + 1} of {exercises.length}
          </span>
        </div>
      </div>

      {/* 5-Step Visual Progression Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {exercises.map((item, idx) => {
          const isCurrent = idx === currentIndex;
          const isDone = completedSteps[idx] || idx < currentIndex;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`p-2.5 rounded-2xl border text-left transition-all ${
                isCurrent
                  ? 'bg-brand-600 text-white border-brand-700 shadow-md ring-2 ring-brand-300'
                  : isDone
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-white text-charcoal-muted border-surface-border hover:bg-surface-subtle'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                <span>Step {idx + 1}</span>
                {isDone ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                ) : null}
              </div>
              <p
                className={`text-xs font-bold truncate ${
                  isCurrent ? 'text-white' : 'text-charcoal-heading'
                }`}
              >
                {item.exercise?.title.split('(')[0].trim()}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Challenge Workout Card */}
      <Card className="p-6 sm:p-8 relative overflow-hidden space-y-6">
        {/* Category & Duration header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border pb-4">
          <div className="flex items-center gap-2">
            <Badge variant="brand">{currentExercise?.category.replace('_', ' ')}</Badge>
            <Badge
              variant={
                currentExercise?.difficulty === 'advanced'
                  ? 'amber'
                  : currentExercise?.difficulty === 'intermediate'
                  ? 'blue'
                  : 'brand'
              }
            >
              Level: {currentExercise?.difficulty}
            </Badge>
          </div>
          <div className="text-xs text-charcoal-muted font-bold flex items-center gap-1.5">
            <span>Interval: {targetDuration} seconds</span>
          </div>
        </div>

        {/* Exercise Title & Description */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-charcoal-heading tracking-tight">
            {currentExercise?.title}
          </h2>
          <p className="text-sm text-charcoal-muted mt-1 leading-relaxed">
            {currentExercise?.description}
          </p>
        </div>

        {/* 🎙️ Voice Assistant Banner */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-teal-50 via-brand-50 to-teal-50 border border-brand-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
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
                AI Voice Coach
                {isSpeaking && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
              </p>
              <p className="text-[11px] text-charcoal-muted">
                {isSpeaking ? 'Narrating posture guidance...' : 'Hands-free audio coaching active'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentExercise && (
              <button
                type="button"
                onClick={() => speakWhatAreWeDoing(currentExercise, remainingSeconds)}
                className="px-3 py-1.5 rounded-xl bg-white border border-brand-200 text-brand-900 hover:bg-brand-100 transition-colors font-bold text-xs flex items-center gap-1 shadow-2xs"
              >
                <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
                <span>&quot;What are we doing?&quot;</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setIsVoiceEnabled(!isVoiceEnabled);
              }}
              className="p-2 rounded-xl bg-white border border-surface-border text-charcoal-body hover:bg-surface-subtle"
              title={isVoiceEnabled ? 'Mute voice coach' : 'Enable voice coach'}
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4 text-brand-600" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
            </button>
          </div>
        </div>

        {/* 🏃 3D Anatomical Humanoid Demonstration Engine */}
        {currentExercise && (
          <div className="space-y-2">
            <ExerciseAnimation3D exercise={currentExercise} isPlaying={isRunning} />
          </div>
        )}

        {/* Active Countdown & Controls Center */}
        <div className="p-6 bg-gradient-to-b from-surface-subtle to-white rounded-3xl border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Circular Countdown Progress */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="text-slate-200 stroke-current"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="text-brand-600 stroke-current transition-all duration-1000 ease-linear"
                  strokeWidth="6"
                  strokeDasharray={213}
                  strokeDashoffset={213 - (213 * stepPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute font-mono font-black text-xl text-charcoal-heading">
                {seconds}s
              </span>
            </div>

            <div>
              <p className="text-3xl font-mono font-black text-charcoal-heading tracking-tight">
                {formattedTime}
              </p>
              <p className="text-xs font-bold text-charcoal-muted uppercase tracking-wider">
                {isRunning ? 'Interval In Progress' : 'Paused'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant={isRunning ? 'secondary' : 'primary'}
              size="md"
              onClick={() => setIsRunning(!isRunning)}
              leftIcon={isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            >
              {isRunning ? 'Pause' : 'Resume'}
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => setRemainingSeconds(targetDuration)}
              title="Reset interval"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Form Coaching: Right vs. Wrong Visual Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Correct Posture Form:
            </h4>
            <p className="text-xs text-emerald-950 leading-relaxed">
              {currentExercise?.instructions[1] || 'Maintain level chin, open ribcage, and breathe smoothly through movement.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
            <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Avoid This Mistake:
            </h4>
            <p className="text-xs text-amber-950 leading-relaxed">
              {currentExercise?.safety_notes || 'Do not jut chin forward, shrug shoulders, or hold breath.'}
            </p>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-black text-charcoal-heading uppercase tracking-wider">
            Step-by-Step Instructions:
          </h3>
          <ul className="space-y-2">
            {currentExercise?.instructions.map((step, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-surface-border text-xs sm:text-sm text-charcoal-body leading-relaxed"
              >
                <span className="shrink-0 w-6 h-6 rounded-xl bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-xs border border-brand-200">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="pt-6 border-t border-surface-border flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          <Button
            variant="primary"
            onClick={handleNext}
            rightIcon={
              currentIndex === exercises.length - 1 ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            }
          >
            {currentIndex === exercises.length - 1 ? 'Finish Challenge (+60 pts)' : 'Next Step'}
          </Button>
        </div>
      </Card>

      {/* Confirmation Exit Modal */}
      <Modal
        isOpen={confirmExitOpen}
        onClose={() => setConfirmExitOpen(false)}
        title="Leave Challenge?"
        description="Leaving now will pause your challenge streak and discard this session's progress. Are you sure you want to stop?"
      >
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setConfirmExitOpen(false)}>
            Continue Activity
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setConfirmExitOpen(false);
              stopSpeaking();
              onExit();
            }}
          >
            Yes, Leave
          </Button>
        </div>
      </Modal>
    </div>
  );
};
