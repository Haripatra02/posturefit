import React from 'react';
import { Search, GraduationCap, Briefcase, Users } from 'lucide-react';
import { TargetAudience } from '../../types';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedDifficulty: string;
  onSelectDifficulty: (difficulty: string) => void;
  selectedAudience: TargetAudience;
  onSelectAudience: (audience: TargetAudience) => void;
}

export const CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All Activities' },
  { id: 'neck_shoulder', label: 'Neck & Shoulders' },
  { id: 'wrist_hand', label: 'Wrists & Hands' },
  { id: 'chest_upper_body', label: 'Chest & Upper Body' },
  { id: 'seated_mobility', label: 'Seated Mobility' },
  { id: 'leg_ankle', label: 'Legs & Ankles' },
  { id: 'standing_breaks', label: 'Standing Movement' },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  searchTerm,
  onSearchChange,
  selectedDifficulty,
  onSelectDifficulty,
  selectedAudience,
  onSelectAudience,
}) => {
  return (
    <div className="space-y-4">
      {/* Audience Tailoring Tabs (Student vs Office Worker vs All) */}
      <div className="flex items-center gap-2 p-1.5 bg-surface-subtle rounded-2xl border border-surface-border overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => onSelectAudience('all')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            selectedAudience === 'all'
              ? 'bg-white text-brand-800 shadow-sm'
              : 'text-charcoal-muted hover:text-charcoal-heading'
          }`}
        >
          <Users className="w-4 h-4 text-brand-600" />
          <span>All Profiles</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectAudience('student')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            selectedAudience === 'student'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-charcoal-muted hover:text-charcoal-heading'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-blue-300" />
          <span>🎓 Student Study Routine (Backpack & Laptop Fatigue)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectAudience('office')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            selectedAudience === 'office'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-charcoal-muted hover:text-charcoal-heading'
          }`}
        >
          <Briefcase className="w-4 h-4 text-amber-200" />
          <span>💼 Office & Desk Worker (Mouse, Meetings & Ergonomics)</span>
        </button>
      </div>

      {/* Search and Difficulty Filter row */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search exercises (e.g. chin tuck, wrist, spine)..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all shadow-sm"
          />
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-charcoal-muted uppercase mr-1">Level:</span>
          {[
            { id: 'all', label: 'All Levels' },
            { id: 'beginner', label: '🌱 Beginner' },
            { id: 'intermediate', label: '⚖️ Intermediate' },
            { id: 'advanced', label: '⚡ Hard' },
          ].map((diff) => (
            <button
              key={diff.id}
              onClick={() => onSelectDifficulty(diff.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                selectedDifficulty === diff.id
                  ? 'bg-charcoal-heading text-white shadow-xs'
                  : 'bg-white border border-surface-border text-charcoal-body hover:bg-surface-subtle'
              }`}
            >
              {diff.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                active
                  ? 'bg-brand-700 text-white shadow-sm ring-1 ring-brand-700'
                  : 'bg-white text-charcoal-body border border-surface-border hover:border-brand-300 hover:bg-surface-subtle'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
