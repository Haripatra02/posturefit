import { z } from 'zod';

// ==========================================
// USER & PROFILE TYPES
// ==========================================
export interface Profile {
  id: string;
  display_name: string;
  email: string;
  timezone: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'user' | 'admin' | 'moderator';

export interface UserPreferences {
  user_id: string;
  work_duration: number; // in minutes (e.g. 25, 30, 45, 60)
  break_duration: number; // in minutes (e.g. 3, 5, 10)
  daily_goal: number; // count of daily breaks/activities
  reminders_enabled: boolean;
  sound_enabled: boolean;
  onboarding_completed: boolean;
  updated_at: string;
}

// Zod schemas for validation
export const updateProfileSchema = z.object({
  display_name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  timezone: z.string().default('UTC'),
});

export const updatePreferencesSchema = z.object({
  work_duration: z.number().int().min(5).max(180).optional(),
  break_duration: z.number().int().min(1).max(30).optional(),
  daily_goal: z.number().int().min(1).max(20).optional(),
  reminders_enabled: z.boolean().optional(),
  sound_enabled: z.boolean().optional().default(true),
  onboarding_completed: z.boolean().optional(),
});

// ==========================================
// EXERCISE & CHALLENGE TYPES
// ==========================================
export type ExerciseCategory =
  | 'neck_shoulder'
  | 'wrist_hand'
  | 'chest_upper_body'
  | 'seated_mobility'
  | 'leg_ankle'
  | 'standing_breaks';

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type TargetAudience = 'all' | 'student' | 'office';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  category: ExerciseCategory;
  duration_seconds: number;
  difficulty: ExerciseDifficulty;
  instructions: string[];
  safety_notes?: string;
  media_url?: string;
  is_active: boolean;
  target_audience?: TargetAudience;
  created_at: string;
  updated_at?: string;
}

export const exerciseSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  category: z.enum([
    'neck_shoulder',
    'wrist_hand',
    'chest_upper_body',
    'seated_mobility',
    'leg_ankle',
    'standing_breaks',
  ]),
  duration_seconds: z.number().int().min(15).max(600),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  instructions: z.array(z.string().min(3)).min(1),
  safety_notes: z.string().optional(),
  media_url: z.string().url().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  target_audience: z.enum(['all', 'student', 'office']).optional().default('all'),
});

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target_duration_seconds: number;
  is_active: boolean;
  target_audience?: TargetAudience;
  created_at: string;
  exercises?: {
    sequence_order: number;
    planned_duration_seconds: number;
    exercise: Exercise;
  }[];
}

// ==========================================
// WORK SESSION TYPES
// ==========================================
export type SessionStatus = 'in_progress' | 'paused' | 'completed' | 'cancelled';

export interface WorkSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  status: SessionStatus;
  planned_duration: number; // in seconds
  actual_tracked_duration: number; // in seconds
  breaks_taken: number;
  created_at: string;
}

export const startSessionSchema = z.object({
  planned_duration: z.number().int().min(60).max(28800), // 1 min to 8 hours
});

export const updateSessionSchema = z.object({
  status: z.enum(['in_progress', 'paused', 'completed', 'cancelled']),
  actual_tracked_duration: z.number().int().min(0),
  breaks_taken: z.number().int().min(0).optional(),
});

// ==========================================
// ACTIVITY COMPLETION & GAMIFICATION
// ==========================================
export type CompletionStatus = 'completed' | 'skipped' | 'interrupted';

export interface ActivityCompletion {
  id: string;
  user_id: string;
  exercise_id?: string;
  challenge_id?: string;
  completed_at: string;
  duration_seconds: number;
  completion_status: CompletionStatus;
  idempotency_key: string;
  points_awarded: number;
  created_at: string;
}

export const completeActivitySchema = z.object({
  exercise_id: z.string().uuid().optional(),
  challenge_id: z.string().uuid().optional(),
  duration_seconds: z.number().int().min(10),
  completion_status: z.enum(['completed', 'skipped', 'interrupted']).default('completed'),
  idempotency_key: z.string().min(10).max(100),
});

export type RewardEventType =
  | 'exercise_completion'
  | 'challenge_completion'
  | 'break_completion'
  | 'daily_goal_bonus'
  | 'streak_milestone_bonus'
  | 'badge_earned';

export interface RewardEvent {
  id: string;
  user_id: string;
  event_type: RewardEventType;
  points_delta: number;
  source_reference?: string;
  idempotency_key: string;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  icon_name: string;
  achievement_rule: {
    type: string;
    threshold?: number;
    category?: string;
  };
}

export interface UserBadge {
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface GamificationSummary {
  total_points: number;
  level: number;
  level_name: string;
  level_progress_percent: number;
  points_to_next_level: number;
  current_streak: number;
  longest_streak: number;
  badges_earned_count: number;
  total_activities_count: number;
  total_breaks_count: number;
}
