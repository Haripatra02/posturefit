import React from 'react';
import { Clock, Play, GraduationCap, Briefcase } from 'lucide-react';
import { Exercise } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../components/../common/Button';

interface ExerciseCardProps {
  exercise: Exercise;
  onStart: (exercise: Exercise) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onStart }) => {
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'neck_shoulder':
        return 'Neck & Shoulders';
      case 'wrist_hand':
        return 'Wrists & Hands';
      case 'chest_upper_body':
        return 'Chest & Upper Body';
      case 'seated_mobility':
        return 'Seated Mobility';
      case 'leg_ankle':
        return 'Legs & Ankles';
      case 'standing_breaks':
        return 'Standing Movement';
      default:
        return cat;
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'beginner':
        return <Badge variant="success">Beginner</Badge>;
      case 'intermediate':
        return <Badge variant="amber">Intermediate</Badge>;
      default:
        return <Badge variant="default">{diff}</Badge>;
    }
  };

  const getAudienceBadge = () => {
    if (exercise.target_audience === 'student') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
          <GraduationCap className="w-3 h-3" /> Student
        </span>
      );
    }
    if (exercise.target_audience === 'office') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
          <Briefcase className="w-3 h-3" /> Office
        </span>
      );
    }
    return null;
  };

  return (
    <Card hoverable className="flex flex-col justify-between h-full group">
      <div>
        {/* Badges row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="brand">{getCategoryLabel(exercise.category)}</Badge>
            {getAudienceBadge()}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-charcoal-muted font-medium shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span>{exercise.duration_seconds}s</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-base text-charcoal-heading group-hover:text-brand-700 transition-colors line-clamp-1">
          {exercise.title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-charcoal-muted mt-2 line-clamp-2 leading-relaxed">
          {exercise.description}
        </p>
      </div>

      {/* Footer info & start action */}
      <div className="mt-5 pt-4 border-t border-surface-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getDifficultyBadge(exercise.difficulty)}
          <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
            +20 pts
          </span>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => onStart(exercise)}
          rightIcon={<Play className="w-3.5 h-3.5 fill-current" />}
        >
          Start
        </Button>
      </div>
    </Card>
  );
};
