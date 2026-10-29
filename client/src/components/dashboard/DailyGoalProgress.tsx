import React from 'react';
import { Target, CheckCircle2, Sparkles } from 'lucide-react';
import { Card } from '../common/Card';

interface DailyGoalProgressProps {
  completedActions: number;
  targetGoal: number;
  progressPercent: number;
}

export const DailyGoalProgress: React.FC<DailyGoalProgressProps> = ({
  completedActions,
  targetGoal,
  progressPercent,
}) => {
  const isGoalReached = completedActions >= targetGoal;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-base text-charcoal-heading">Daily Movement Goal</h3>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Aim for {targetGoal} breaks or posture activities every workday
          </p>
        </div>

        <div className="text-right">
          <span className="text-xl sm:text-2xl font-black text-charcoal-heading">
            {completedActions}
          </span>
          <span className="text-xs text-charcoal-muted font-medium">/{targetGoal}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-surface-subtle h-3 rounded-full overflow-hidden border border-surface-border">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isGoalReached ? 'bg-emerald-500' : 'bg-brand-600'
          }`}
          style={{ width: `${Math.min(100, progressPercent)}%` }}
        />
      </div>

      {/* Footer message */}
      <div className="mt-4 flex items-center justify-between text-xs">
        {isGoalReached ? (
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Daily goal completed! +50 bonus points earned</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-charcoal-muted">
            <Sparkles className="w-4 h-4 text-accent-amber" />
            <span>
              {targetGoal - completedActions} more{' '}
              {targetGoal - completedActions === 1 ? 'activity' : 'activities'} to hit today&apos;s goal
            </span>
          </div>
        )}
        <span className="font-bold text-charcoal-heading">{progressPercent}%</span>
      </div>
    </Card>
  );
};
