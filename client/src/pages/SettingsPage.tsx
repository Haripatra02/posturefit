import React, { useState } from 'react';
import {
  Settings,
  User,
  Clock,
  Coffee,
  Bell,
  Volume2,
  Globe,
  LogOut,
  Save,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

export const SettingsPage: React.FC = () => {
  const { user, profile, preferences, updateProfile, updatePreferences, logout } = useAuth();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [timezone, setTimezone] = useState(profile?.timezone || 'UTC');
  const [workDuration, setWorkDuration] = useState<number>(preferences?.work_duration || 30);
  const [breakDuration, setBreakDuration] = useState<number>(preferences?.break_duration || 5);
  const [dailyGoal, setDailyGoal] = useState<number>(preferences?.daily_goal || 3);
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(preferences?.reminders_enabled ?? true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(preferences?.sound_enabled ?? true);

  const [isSaving, setIsSaving] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        display_name: displayName.trim(),
        timezone,
      });

      await updatePreferences({
        work_duration: workDuration,
        break_duration: breakDuration,
        daily_goal: dailyGoal,
        reminders_enabled: remindersEnabled,
        sound_enabled: soundEnabled,
      });

      showToast({
        type: 'success',
        title: 'Settings updated successfully!',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Failed to update settings',
        message: err.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetData = () => {
    localStorage.removeItem('posturefit_timer_state');
    showToast({
      type: 'info',
      title: 'Local timer session state reset',
    });
    setConfirmResetOpen(false);
  };

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Kolkata',
    'Australia/Sydney',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-heading tracking-tight flex items-center gap-2.5">
            <Settings className="w-8 h-8 text-brand-600" />
            User Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Customize focus durations, break audio cues, and habit goals.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={logout} leftIcon={<LogOut className="w-4 h-4 text-red-500" />}>
          Sign Out
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <Card className="p-6">
          <h3 className="font-bold text-base text-charcoal-heading mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-brand-600" />
            Profile Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-heading uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-heading uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm bg-stone-100 text-charcoal-muted cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-heading uppercase tracking-wider mb-1.5">
                Timezone (for Daily Streaks)
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Timer & Break Durations Card */}
        <Card className="p-6">
          <h3 className="font-bold text-base text-charcoal-heading mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-600" />
            Timer & Sitting Intervals
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-charcoal-heading uppercase tracking-wider mb-1.5">
                Work Session Duration (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={workDuration}
                onChange={(e) => setWorkDuration(parseInt(e.target.value, 10) || 30)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-heading uppercase tracking-wider mb-1.5">
                Break Duration (Minutes)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={breakDuration}
                onChange={(e) => setBreakDuration(parseInt(e.target.value, 10) || 5)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-heading uppercase tracking-wider mb-1.5">
                Daily Movement Goal (Breaks/Day)
              </label>
              <input
                type="number"
                min={1}
                max={15}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(parseInt(e.target.value, 10) || 3)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
              />
            </div>
          </div>
        </Card>

        {/* Alerts & Sound Card */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-charcoal-heading flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-600" />
            Alerts & Audio Settings
          </h3>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-subtle">
            <div>
              <p className="text-sm font-semibold text-charcoal-heading">Browser Break Notifications</p>
              <p className="text-xs text-charcoal-muted">Display a reminder when a sitting block completes</p>
            </div>
            <input
              type="checkbox"
              checked={remindersEnabled}
              onChange={(e) => setRemindersEnabled(e.target.checked)}
              className="w-5 h-5 text-brand-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-subtle">
            <div>
              <p className="text-sm font-semibold text-charcoal-heading">Sound Effects & Chimes</p>
              <p className="text-xs text-charcoal-muted">Play a pleasant chime when timers complete</p>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-5 h-5 text-brand-600 rounded cursor-pointer"
            />
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save All Preferences
          </Button>
        </div>
      </form>

      {/* Account Management & Reset */}
      <Card className="p-6 border-red-100 bg-red-50/20">
        <h3 className="font-bold text-sm text-red-800 uppercase tracking-wider mb-2">
          Timer Session Reset
        </h3>
        <p className="text-xs text-charcoal-muted mb-4 leading-relaxed">
          Clear any active in-browser timer caches or session interruptions stored in your local storage.
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirmResetOpen(true)}
          className="text-red-600 border-red-200 hover:bg-red-50"
          leftIcon={<Trash2 className="w-4 h-4" />}
        >
          Reset Local Timer Cache
        </Button>
      </Card>

      <Modal
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        title="Reset Local Timer Storage?"
        description="This will clear in-progress timer countdowns stored locally on this computer."
      >
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setConfirmResetOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleResetData}>
            Confirm Reset
          </Button>
        </div>
      </Modal>
    </div>
  );
};
