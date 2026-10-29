import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Flame,
  Award,
  Filter,
} from 'lucide-react';
import { challengeApi } from '../api/challengeApi';
import { Challenge, TargetAudience } from '../types';
import { ChallengeRunner } from '../components/challenge/ChallengeRunner';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';

export const ChallengePage: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [selectedAudience, setSelectedAudience] = useState<TargetAudience>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const data = await challengeApi.getChallenges();
        setChallenges(data);
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      const matchesAudience =
        selectedAudience === 'all' ||
        c.target_audience === selectedAudience ||
        c.target_audience === 'all' ||
        !c.target_audience;

      const titleLower = c.title.toLowerCase();
      let difficultyTier = 'intermediate';
      if (titleLower.includes('morning') || titleLower.includes('wake-up')) {
        difficultyTier = 'beginner';
      } else if (titleLower.includes('advanced') || titleLower.includes('power')) {
        difficultyTier = 'advanced';
      }

      const matchesDifficulty =
        selectedDifficulty === 'all' || difficultyTier === selectedDifficulty;

      return matchesAudience && matchesDifficulty;
    });
  }, [challenges, selectedAudience, selectedDifficulty]);

  if (activeChallenge) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ChallengeRunner
          challenge={activeChallenge}
          onExit={() => setActiveChallenge(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-charcoal-heading tracking-tight flex items-center gap-2.5">
            <Zap className="w-8 h-8 text-amber-500 fill-amber-500" />
            5-Minute Guided Posture Challenges
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1 max-w-2xl">
            Curated 5-step movement flows with real-time 3D humanoid animation, speed controls, form guidance, and hands-free voice coach narration. Complete any flow to earn <strong>+60 Points</strong> and advance your streak.
          </p>
        </div>
      </div>

      {/* Filter Bar: Audience & Difficulty */}
      <div className="p-4 rounded-2xl bg-surface-subtle/80 border border-surface-border space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Audience Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-charcoal-muted mr-1">Target Profile:</span>
            <button
              type="button"
              onClick={() => setSelectedAudience('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedAudience === 'all'
                  ? 'bg-brand-600 text-white shadow-2xs'
                  : 'bg-white text-charcoal-body border border-surface-border hover:bg-surface-subtle'
              }`}
            >
              All Profiles
            </button>
            <button
              type="button"
              onClick={() => setSelectedAudience('student')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedAudience === 'student'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-charcoal-body border border-surface-border hover:bg-surface-subtle'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Study Routines</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedAudience('office')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedAudience === 'office'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white text-charcoal-body border border-surface-border hover:bg-surface-subtle'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Office & Desk Workers</span>
            </button>
          </div>

          {/* Difficulty Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-charcoal-muted mr-1">Difficulty:</span>
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-charcoal-heading text-white shadow-2xs'
                    : 'bg-white text-charcoal-body border border-surface-border hover:bg-surface-subtle'
                }`}
              >
                {diff === 'all'
                  ? 'All Levels'
                  : diff === 'beginner'
                  ? '🌱 Beginner'
                  : diff === 'intermediate'
                  ? '⚖️ Intermediate'
                  : '⚡ Hard'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Challenge Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : filteredChallenges.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-surface-border rounded-2xl bg-surface-subtle/50 max-w-md mx-auto">
          <Filter className="w-8 h-8 text-charcoal-muted mx-auto mb-2" />
          <h3 className="font-bold text-charcoal-heading text-base">No challenges match your filters</h3>
          <p className="text-xs text-charcoal-muted mt-1">
            Try choosing &quot;All Profiles&quot; or clearing your difficulty filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => {
            const exerciseCount = challenge.exercises?.length || 5;
            const targetMins = Math.round(challenge.target_duration_seconds / 60);

            const titleLower = challenge.title.toLowerCase();
            const difficulty = titleLower.includes('morning')
              ? 'Beginner'
              : titleLower.includes('advanced')
              ? 'Hard / Advanced'
              : 'Intermediate';

            const getAudienceBadge = () => {
              if (challenge.target_audience === 'student') {
                return (
                  <Badge variant="blue" size="sm">
                    <GraduationCap className="w-3 h-3 mr-1" /> Student Routine
                  </Badge>
                );
              }
              if (challenge.target_audience === 'office') {
                return (
                  <Badge variant="amber" size="sm">
                    <Briefcase className="w-3 h-3 mr-1" /> Office Corporate
                  </Badge>
                );
              }
              return (
                <Badge variant="brand" size="sm">
                  Universal Reset
                </Badge>
              );
            };

            return (
              <Card
                key={challenge.id}
                hoverable
                className="flex flex-col justify-between h-full p-6 sm:p-7 relative overflow-hidden group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {getAudienceBadge()}
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-accent-amber" /> +60 pts
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-charcoal-heading group-hover:text-brand-700 transition-colors">
                    {challenge.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-charcoal-muted mt-2 leading-relaxed">
                    {challenge.description}
                  </p>

                  {/* Level & Format Pills */}
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-surface-subtle text-charcoal-heading border border-surface-border">
                      {difficulty}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                      5 Guided Exercises
                    </span>
                  </div>

                  {/* Exercises list preview */}
                  <div className="mt-5 space-y-2 border-t border-surface-border pt-4">
                    <p className="text-xs font-bold text-charcoal-heading uppercase tracking-wider mb-2">
                      Structured Flow:
                    </p>
                    {challenge.exercises?.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-charcoal-body truncate">
                        <span className="w-4 h-4 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-[10px] shrink-0 border border-brand-200">
                          {i + 1}
                        </span>
                        <span className="truncate">{item.exercise?.title?.split('(')[0].trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-charcoal-muted font-bold">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    <span>~{targetMins} minutes</span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveChallenge(challenge)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Start 5-Min Challenge
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
