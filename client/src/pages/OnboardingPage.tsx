import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Clock, Coffee, Bell, Target, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const OnboardingPage: React.FC = () => {
  const { profile, preferences, updateProfile, updatePreferences } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [workDuration, setWorkDuration] = useState<number>(preferences?.work_duration || 30);
  const [breakDuration, setBreakDuration] = useState<number>(preferences?.break_duration || 5);
  const [dailyGoal, setDailyGoal] = useState<number>(preferences?.daily_goal || 3);
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(preferences?.reminders_enabled ?? true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      if (displayName.trim() && displayName !== profile?.display_name) {
        await updateProfile({ display_name: displayName.trim() });
      }

      await updatePreferences({
        work_duration: workDuration,
        break_duration: breakDuration,
        daily_goal: dailyGoal,
        reminders_enabled: remindersEnabled,
        sound_enabled: preferences?.sound_enabled ?? true,
        onboarding_completed: true,
      });

      showToast({
        type: 'success',
        title: 'Preferences saved!',
        message: 'Welcome to your personalized PostureFit dashboard.',
      });

      navigate('/dashboard');
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error saving preferences',
        message: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <Card className="w-full max-w-xl p-6 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-heading">
            Personalize Your Routine
          </h1>
          <p className="text-sm text-charcoal-muted mt-1 max-w-md mx-auto">
            Set your desk rhythm and daily movement goals. You can adjust these anytime in Settings.
          </p>
        </div>

        <div className="space-y-6">
          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-heading uppercase tracking-wider mb-1.5">
              What should we call you?
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
            />
          </div>

          {/* Work Duration Presets */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-4 h-4 text-brand-600" />
              <label className="text-xs font-semibold text-charcoal-heading uppercase tracking-wider">
                Focus Session Length
              </label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[20, 25, 30, 45].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setWorkDuration(mins)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    workDuration === mins
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-white border-surface-border text-charcoal-body hover:bg-surface-subtle'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Break Duration Presets */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Coffee className="w-4 h-4 text-accent-amber" />
              <label className="text-xs font-semibold text-charcoal-heading uppercase tracking-wider">
                Movement Break Duration
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[3, 5, 10].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setBreakDuration(mins)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    breakDuration === mins
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-white border-surface-border text-charcoal-body hover:bg-surface-subtle'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Daily Goal */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <label className="text-xs font-semibold text-charcoal-heading uppercase tracking-wider">
                Daily Movement Goal
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 5].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setDailyGoal(g)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    dailyGoal === g
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-white border-surface-border text-charcoal-body hover:bg-surface-subtle'
                  }`}
                >
                  {g} breaks / day
                </button>
              ))}
            </div>
          </div>

          {/* Reminders Toggle */}
          <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-brand-600" />
              <div>
                <p className="text-sm font-bold text-charcoal-heading">Enable Break Reminders</p>
                <p className="text-xs text-charcoal-muted">Receive gentle alerts when it is time to move</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={remindersEnabled}
              onChange={(e) => setRemindersEnabled(e.target.checked)}
              className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-surface-border flex items-center justify-between">
            <Button variant="ghost" onClick={handleSkip}>
              Skip for Now
            </Button>
            <Button
              variant="primary"
              onClick={handleFinish}
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
