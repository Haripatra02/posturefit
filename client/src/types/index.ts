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
  created_at?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target_duration_seconds: number;
  is_active: boolean;
  target_audience?: TargetAudience;
  exercises?: {
    sequence_order: number;
    planned_duration_seconds: number;
    exercise: Exercise;
  }[];
}

export interface Profile {
  id: string;
  display_name: string;
  email: string;
  timezone: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  user_id: string;
  work_duration: number; // in minutes
  break_duration: number; // in minutes
  daily_goal: number; // count of activities/breaks
  reminders_enabled: boolean;
  sound_enabled: boolean;
  onboarding_completed: boolean;
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

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  icon_name: string;
  earned?: boolean;
  earned_at?: string | null;
}

export interface DashboardData {
  profile: Profile;
  preferences: UserPreferences;
  today: {
    date: string;
    completed_activities: number;
    breaks_taken: number;
    points_earned: number;
    daily_goal: number;
    goal_progress_percent: number;
  };
  gamification: GamificationSummary;
  today_challenge: Challenge | null;
  weekly_chart: {
    date: string;
    day: string;
    activities: number;
    breaks: number;
    points: number;
  }[];
  recent_activity: {
    id: string;
    type: 'exercise' | 'challenge';
    title: string;
    completed_at: string;
    duration_seconds: number;
    points: number;
  }[];
}

export interface WorkSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  status: 'in_progress' | 'paused' | 'completed' | 'cancelled';
  planned_duration: number;
  actual_tracked_duration: number;
  breaks_taken: number;
  created_at: string;
}

export interface RewardEvent {
  id: string;
  user_id: string;
  event_type: string;
  points_delta: number;
  source_reference?: string;
  idempotency_key: string;
  created_at: string;
}
