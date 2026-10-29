import React, { useState, useEffect } from 'react';
import {
  Timer as TimerIcon,
  Coffee,
  CheckCircle2,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  ShieldAlert,
} from 'lucide-react';
import { WorkTimer } from '../components/timer/WorkTimer';
import { BreakPromptModal } from '../components/timer/BreakPromptModal';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { sessionApi } from '../api/sessionApi';
import { WorkSession } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { useToast } from '../context/ToastContext';

export const TimerPage: React.FC = () => {
  const { preferences, updatePreferences } = useAuth();
  const { permission, requestPermission } = useNotification();
  const { showToast } = useToast();

  const [history, setHistory] = useState<WorkSession[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const sessions = await sessionApi.getSessionHistory(10);
        setHistory(sessions);
      } catch {
        // Fallback
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, []);

  const toggleSound = async () => {
    const current = preferences?.sound_enabled ?? true;
    await updatePreferences({ sound_enabled: !current });
    showToast({
      type: 'info',
      title: !current ? 'Sound enabled' : 'Sound muted',
    });
  };

  const handleNotificationToggle = async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (granted) {
        await updatePreferences({ reminders_enabled: true });
        showToast({
          type: 'success',
          title: 'Notifications enabled!',
          message: 'You will receive break reminders when your focus timer finishes.',
        });
      } else {
        showToast({
          type: 'error',
          title: 'Notification permission denied',
          message: 'Please enable notifications in your browser settings.',
        });
      }
    } else {
      const current = preferences?.reminders_enabled ?? true;
      await updatePreferences({ reminders_enabled: !current });
      showToast({
        type: 'info',
        title: !current ? 'Reminders enabled' : 'Reminders disabled',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-heading tracking-tight flex items-center gap-2.5">
            <TimerIcon className="w-8 h-8 text-brand-600" />
            Work & Sitting Session Timer
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Track focused desk blocks and take punctual posture-restoring breaks.
          </p>
        </div>

        {/* Quick Preferences Toggles */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={toggleSound}
            leftIcon={
              preferences?.sound_enabled ?? true ? (
                <Volume2 className="w-4 h-4 text-brand-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-charcoal-muted" />
              )
            }
          >
            Sound {preferences?.sound_enabled ?? true ? 'On' : 'Off'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleNotificationToggle}
            leftIcon={
              preferences?.reminders_enabled ?? true ? (
                <Bell className="w-4 h-4 text-brand-600" />
              ) : (
                <BellOff className="w-4 h-4 text-charcoal-muted" />
              )
            }
          >
            Reminders {preferences?.reminders_enabled ?? true ? 'On' : 'Off'}
          </Button>
        </div>
      </div>

      {/* Main Grid: Timer Component + Posture Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Core Timer Widget */}
        <div className="lg:col-span-2">
          <WorkTimer />
        </div>

        {/* Right Column: Ergonomic Posture Checklist */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-charcoal-heading uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600" />
              Sitting Posture Checklist
            </h3>

            <ul className="space-y-3 text-xs sm:text-sm text-charcoal-body">
              {[
                { title: 'Eye Level Monitor', desc: 'Top 1/3 of screen level with eye line' },
                { title: 'Relaxed Shoulders', desc: 'Elbows at 90° resting naturally near ribcage' },
                { title: 'Lumbar Support', desc: 'Lower back supported by chair backrest or cushion' },
                { title: 'Feet Flat on Floor', desc: 'Knees level with or slightly below hip crease' },
                { title: 'Gentle Chin Retraction', desc: 'Avoid jutting neck forward toward monitor' },
              ].map((item, idx) => (
                <li key={idx} className="p-3 rounded-xl bg-surface-subtle border border-surface-border">
                  <p className="font-semibold text-charcoal-heading">{item.title}</p>
                  <p className="text-charcoal-muted text-xs mt-0.5">{item.desc}</p>
                </li>
              ))}
            </ul>
          </Card>

          {/* Session History */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-charcoal-heading uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              Recent Sessions
            </h3>

            {history.length === 0 ? (
              <p className="text-xs text-charcoal-muted">
                Completed work intervals and breaks will appear here.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto no-scrollbar">
                {history.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-surface-subtle text-xs"
                  >
                    <div>
                      <p className="font-semibold text-charcoal-heading">
                        {Math.round((s.actual_tracked_duration || s.planned_duration) / 60)} min session
                      </p>
                      <p className="text-charcoal-muted text-[11px]">
                        {s.breaks_taken} {s.breaks_taken === 1 ? 'break' : 'breaks'} taken
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase ${
                        s.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <BreakPromptModal />
    </div>
  );
};
