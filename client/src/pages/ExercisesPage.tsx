import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Filter } from 'lucide-react';
import { exerciseApi } from '../api/exerciseApi';
import { Exercise, TargetAudience } from '../types';
import { CategoryFilter } from '../components/exercises/CategoryFilter';
import { ExerciseCard } from '../components/exercises/ExerciseCard';
import { ExerciseModal } from '../components/exercises/ExerciseModal';
import { Skeleton } from '../components/common/Skeleton';

export const ExercisesPage: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAudience, setSelectedAudience] = useState<TargetAudience>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const data = await exerciseApi.getExercises();
        setExercises(data);
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesCategory =
        selectedCategory === 'all' || ex.category === selectedCategory;
      const matchesDifficulty =
        selectedDifficulty === 'all' || ex.difficulty === selectedDifficulty;
      const matchesAudience =
        selectedAudience === 'all' ||
        ex.target_audience === selectedAudience ||
        ex.target_audience === 'all' ||
        !ex.target_audience;
      const matchesSearch =
        searchTerm === '' ||
        ex.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.description.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesDifficulty && matchesAudience && matchesSearch;
    });
  }, [exercises, selectedCategory, selectedDifficulty, selectedAudience, searchTerm]);

  const handleStartExercise = (exercise: Exercise) => {
    setActiveExercise(exercise);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-heading tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-8 h-8 text-brand-600" />
            Exercise & Mobility Library
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Desk-friendly exercises with 3D biomechanical mannequin guidance and voice coach instructions. Complete any activity to earn +20 points.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 shadow-sm">
            {filteredExercises.length} Exercises Available
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
            ✨ WebGL 3D Kinematics
          </span>
        </div>
      </div>

      {/* Filter Bar with Audience Selector */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedDifficulty={selectedDifficulty}
        onSelectDifficulty={setSelectedDifficulty}
        selectedAudience={selectedAudience}
        onSelectAudience={setSelectedAudience}
      />

      {/* Exercise Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-60" />
          ))}
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-surface-border rounded-2xl bg-surface-subtle/50 max-w-md mx-auto">
          <Filter className="w-8 h-8 text-charcoal-muted mx-auto mb-2" />
          <h3 className="font-bold text-charcoal-heading text-base">No exercises match your search</h3>
          <p className="text-xs text-charcoal-muted mt-1">
            Try choosing &quot;All Profiles&quot; or clearing your category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onStart={handleStartExercise}
            />
          ))}
        </div>
      )}

      {/* Interactive Modal */}
      <ExerciseModal
        exercise={activeExercise}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
