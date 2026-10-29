import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Clock, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface ActivityItem {
  id: string;
  type: 'exercise' | 'challenge';
  title: string;
  completed_at: string;
  duration_seconds: number;
  points: number;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const formatTime = (iso: string) => {
    try {
      const date = new Date(iso);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(date);
    } catch {
      return iso;
    }
  };

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-base text-charcoal-heading">Recent Activity</h3>
          <p className="text-xs text-charcoal-muted mt-0.5">Your recently recorded movement actions</p>
        </div>
        <Link to="/progress" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 px-4 border border-dashed border-surface-border rounded-2xl bg-surface-subtle/50">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-2">
            <Activity className="w-5 h-5" />
          </div>
          <p className="font-semibold text-sm text-charcoal-heading">No activities recorded yet</p>
          <p className="text-xs text-charcoal-muted mt-1 max-w-xs mx-auto">
            Start a work session or complete a quick 60-second exercise to log your first activity and earn points!
          </p>
          <Link to="/exercises" className="inline-block mt-3">
            <Button size="sm" variant="primary">
              Explore Exercise Library
            </Button>
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-surface-border">
          {activities.map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    act.type === 'challenge'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-brand-50 text-brand-700 border border-brand-200'
                  }`}
                >
                  {act.type === 'challenge' ? <Zap className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-charcoal-heading truncate">{act.title}</p>
                  <div className="flex items-center gap-2 text-xs text-charcoal-muted mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {act.duration_seconds}s
                    </span>
                    <span>•</span>
                    <span>{formatTime(act.completed_at)}</span>
                  </div>
                </div>
              </div>

              <span className="shrink-0 text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> +{act.points} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
