import { v4 as uuidv4 } from 'uuid';
import { getSupabase, isSupabaseConfigured } from './supabase.js';
import { SEED_BADGES, SEED_CHALLENGES, SEED_EXERCISES } from './seedData.js';
import {
  ActivityCompletion,
  Badge,
  Challenge,
  Exercise,
  Profile,
  RewardEvent,
  UserBadge,
  UserPreferences,
  UserRole,
  WorkSession,
} from '../types/index.js';

// In-memory persistent collections (survives requests during server lifecycle)
class DataStore {
  profiles: Map<string, Profile> = new Map();
  userRoles: Map<string, UserRole> = new Map();
  userPreferences: Map<string, UserPreferences> = new Map();
  exercises: Map<string, Exercise> = new Map();
  challenges: Map<string, Challenge> = new Map();
  workSessions: Map<string, WorkSession> = new Map();
  activityCompletions: Map<string, ActivityCompletion> = new Map();
  rewardEvents: Map<string, RewardEvent> = new Map();
  badges: Map<string, Badge> = new Map();
  userBadges: Map<string, UserBadge> = new Map(); // key: `${userId}:${badgeId}`

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // Seed default exercises
    for (const ex of SEED_EXERCISES) {
      this.exercises.set(ex.id, { ...ex });
    }
    // Seed default challenges
    for (const ch of SEED_CHALLENGES) {
      this.challenges.set(ch.id, { ...ch });
    }
    // Seed default badges
    for (const b of SEED_BADGES) {
      this.badges.set(b.id, { ...b });
    }
  }

  // --- Profiles & Preferences ---
  async getProfile(userId: string): Promise<Profile | null> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (!error && data) return data as Profile;
    }
    return this.profiles.get(userId) || null;
  }

  async upsertProfile(profile: Partial<Profile> & { id: string; email: string }): Promise<Profile> {
    const existing = this.profiles.get(profile.id);
    const updated: Profile = {
      id: profile.id,
      display_name: profile.display_name || existing?.display_name || profile.email.split('@')[0],
      email: profile.email,
      timezone: profile.timezone || existing?.timezone || 'UTC',
      avatar_url: profile.avatar_url || existing?.avatar_url,
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.profiles.set(profile.id, updated);

    // Also ensure preferences exist
    if (!this.userPreferences.has(profile.id)) {
      this.userPreferences.set(profile.id, {
        user_id: profile.id,
        work_duration: 30,
        break_duration: 5,
        daily_goal: 3,
        reminders_enabled: true,
        sound_enabled: true,
        onboarding_completed: false,
        updated_at: new Date().toISOString(),
      });
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      await supabase.from('profiles').upsert(updated);
    }

    return updated;
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      const { data, error } = await supabase.from('user_preferences').select('*').eq('user_id', userId).single();
      if (!error && data) return data as UserPreferences;
    }

    let prefs = this.userPreferences.get(userId);
    if (!prefs) {
      prefs = {
        user_id: userId,
        work_duration: 30,
        break_duration: 5,
        daily_goal: 3,
        reminders_enabled: true,
        sound_enabled: true,
        onboarding_completed: false,
        updated_at: new Date().toISOString(),
      };
      this.userPreferences.set(userId, prefs);

      if (isSupabaseConfigured()) {
        const supabase = getSupabase()!;
        await supabase.from('user_preferences').upsert(prefs);
      }
    }
    return prefs;
  }

  async updatePreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = await this.getPreferences(userId);
    const updated: UserPreferences = {
      ...current,
      ...updates,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };
    this.userPreferences.set(userId, updated);

    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      await supabase.from('user_preferences').upsert(updated);
    }

    return updated;
  }

  // --- Roles ---
  async getUserRole(userId: string): Promise<UserRole> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).single();
      if (data?.role) return data.role as UserRole;
    }
    return this.userRoles.get(userId) || 'user';
  }

  async setUserRole(userId: string, role: UserRole): Promise<void> {
    this.userRoles.set(userId, role);
    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      await supabase.from('user_roles').upsert({ user_id: userId, role });
    }
  }

  // --- Exercises ---
  async getExercises(category?: string, includeInactive = false): Promise<Exercise[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      let query = supabase.from('exercises').select('*');
      if (!includeInactive) query = query.eq('is_active', true);
      if (category) query = query.eq('category', category);
      const { data, error } = await query;
      if (!error && data) return data as Exercise[];
    }

    let list = Array.from(this.exercises.values());
    if (!includeInactive) list = list.filter((e) => e.is_active);
    if (category) list = list.filter((e) => e.category === category);
    return list;
  }

  async getExerciseById(id: string): Promise<Exercise | null> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      const { data, error } = await supabase.from('exercises').select('*').eq('id', id).single();
      if (!error && data) return data as Exercise;
    }
    return this.exercises.get(id) || null;
  }

  async createExercise(exercise: Omit<Exercise, 'id' | 'created_at'>): Promise<Exercise> {
    const id = uuidv4();
    const created: Exercise = {
      ...exercise,
      id,
      created_at: new Date().toISOString(),
    };
    this.exercises.set(id, created);

    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      await supabase.from('exercises').insert(created);
    }

    return created;
  }

  async updateExercise(id: string, updates: Partial<Exercise>): Promise<Exercise | null> {
    const existing = this.exercises.get(id);
    if (!existing) return null;

    const updated: Exercise = {
      ...existing,
      ...updates,
      id,
      updated_at: new Date().toISOString(),
    };
    this.exercises.set(id, updated);

    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      await supabase.from('exercises').update(updated).eq('id', id);
    }

    return updated;
  }

  async deleteExercise(id: string): Promise<boolean> {
    const existing = this.exercises.get(id);
    if (!existing) return false;
    this.exercises.delete(id);

    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      await supabase.from('exercises').delete().eq('id', id);
    }
    return true;
  }

  // --- Challenges ---
  async getChallenges(): Promise<Challenge[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      const { data, error } = await supabase.from('challenges').select('*').eq('is_active', true);
      if (!error && data) {
        // Also load challenge exercises
        const challenges: Challenge[] = [];
        for (const ch of data) {
          const { data: mappings } = await supabase
            .from('challenge_exercises')
            .select('sequence_order, planned_duration_seconds, exercises(*)')
            .eq('challenge_id', ch.id)
            .order('sequence_order', { ascending: true });

          challenges.push({
            ...ch,
            exercises: mappings?.map((m: any) => ({
              sequence_order: m.sequence_order,
              planned_duration_seconds: m.planned_duration_seconds,
              exercise: m.exercises,
            })) || [],
          });
        }
        return challenges;
      }
    }

    return Array.from(this.challenges.values()).filter((c) => c.is_active);
  }

  async getChallengeById(id: string): Promise<Challenge | null> {
    const challenges = await this.getChallenges();
    return challenges.find((c) => c.id === id) || null;
  }

  // --- Work Sessions ---
  async createWorkSession(session: Omit<WorkSession, 'id' | 'created_at'>): Promise<WorkSession> {
    const id = uuidv4();
    const created: WorkSession = {
      ...session,
      id,
      created_at: new Date().toISOString(),
    };
    this.workSessions.set(id, created);

    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      await supabase.from('work_sessions').insert({
        id: created.id,
        user_id: created.user_id,
        work_duration_minutes: Math.round((created.planned_duration || 1800) / 60),
        breaks_taken: created.breaks_taken || 0,
        session_status: created.status || 'in_progress',
        created_at: created.created_at,
      });
    }

    return created;
  }

  async updateWorkSession(id: string, updates: Partial<WorkSession>): Promise<WorkSession | null> {
    let existing = this.workSessions.get(id);
    if (!existing && isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      const { data } = await supabase.from('work_sessions').select('*').eq('id', id).single();
      if (data) {
        existing = {
          id: data.id,
          user_id: data.user_id,
          started_at: data.created_at,
          ended_at: data.created_at,
          status: data.session_status || 'completed',
          planned_duration: (data.work_duration_minutes || 30) * 60,
          actual_tracked_duration: (data.work_duration_minutes || 30) * 60,
          breaks_taken: data.breaks_taken || 0,
          created_at: data.created_at,
        };
      }
    }
    if (!existing) return null;

    const updated: WorkSession = {
      ...existing,
      ...updates,
      id,
    };
    this.workSessions.set(id, updated);

    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      await supabase
        .from('work_sessions')
        .update({
          work_duration_minutes: Math.round((updated.actual_tracked_duration || updated.planned_duration || 1800) / 60),
          breaks_taken: updated.breaks_taken || 0,
          session_status: updated.status || 'completed',
        })
        .eq('id', id);
    }

    return updated;
  }

  async getUserWorkSessions(userId: string, limit = 50): Promise<WorkSession[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      const { data, error } = await supabase
        .from('work_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (!error && data) {
        return data.map((r: any) => ({
          id: r.id,
          user_id: r.user_id,
          started_at: r.created_at,
          ended_at: r.created_at,
          status: r.session_status || 'completed',
          planned_duration: (r.work_duration_minutes || 30) * 60,
          actual_tracked_duration: (r.work_duration_minutes || 30) * 60,
          breaks_taken: r.breaks_taken || 0,
          created_at: r.created_at,
        })) as WorkSession[];
      }
    }

    return Array.from(this.workSessions.values())
      .filter((s) => s.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  // --- Activity Completions ---
  async getActivityCompletionByIdempotency(idempotencyKey: string): Promise<ActivityCompletion | null> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      const { data } = await supabase
        .from('activity_completions')
        .select('*')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();
      if (data) return data as ActivityCompletion;
    }
    return (
      Array.from(this.activityCompletions.values()).find(
        (a) => a.idempotency_key === idempotencyKey
      ) || null
    );
  }

  async createActivityCompletion(completion: Omit<ActivityCompletion, 'id' | 'created_at'>): Promise<ActivityCompletion> {
    // Check idempotency
    const existing = await this.getActivityCompletionByIdempotency(completion.idempotency_key);
    if (existing) {
      return existing;
    }

    const id = uuidv4();
    const created: ActivityCompletion = {
      ...completion,
      id,
      created_at: new Date().toISOString(),
    };
    this.activityCompletions.set(id, created);

    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      await supabase.from('activity_completions').insert({
        id: created.id,
        user_id: created.user_id,
        exercise_id: created.exercise_id || null,
        challenge_id: created.challenge_id || null,
        duration_seconds: created.duration_seconds || 60,
        completion_status: created.completion_status || 'completed',
        completed_at: created.completed_at || created.created_at,
        idempotency_key: created.idempotency_key || null,
      });
    }

    return created;
  }

  async getUserCompletions(userId: string, limit = 100): Promise<ActivityCompletion[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      const { data, error } = await supabase
        .from('activity_completions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);
      if (!error && data) return data as ActivityCompletion[];
    }

    return Array.from(this.activityCompletions.values())
      .filter((a) => a.user_id === userId)
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
      .slice(0, limit);
  }

  // --- Reward Events Ledger ---
  async addRewardEvent(event: Omit<RewardEvent, 'id' | 'created_at'>): Promise<RewardEvent | null> {
    // Strict idempotency check to avoid duplicate points
    const existing = Array.from(this.rewardEvents.values()).find(
      (r) => r.idempotency_key === event.idempotency_key
    );
    if (existing) {
      return existing; // idempotent return
    }

    const id = uuidv4();
    const created: RewardEvent = {
      ...event,
      id,
      created_at: new Date().toISOString(),
    };
    this.rewardEvents.set(id, created);

    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      await supabase.from('reward_events').insert(created);
    }

    return created;
  }

  async getUserRewardEvents(userId: string): Promise<RewardEvent[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      const { data, error } = await supabase
        .from('reward_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) return data as RewardEvent[];
    }

    return Array.from(this.rewardEvents.values())
      .filter((r) => r.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // --- Badges ---
  async getBadges(): Promise<Badge[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      const { data, error } = await supabase.from('badges').select('*');
      if (!error && data && data.length > 0) return data as Badge[];
    }
    return Array.from(this.badges.values());
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      const { data, error } = await supabase
        .from('user_badges')
        .select('user_id, badge_id, awarded_at, badges(*)')
        .eq('user_id', userId);
      if (!error && data) {
        return data.map((ub: any) => ({
          user_id: ub.user_id,
          badge_id: ub.badge_id,
          earned_at: ub.awarded_at || (ub as any).earned_at || new Date().toISOString(),
          badge: ub.badges || this.badges.get(ub.badge_id),
        }));
      }
    }

    const list = Array.from(this.userBadges.values()).filter((ub) => ub.user_id === userId);
    return list.map((ub) => ({
      ...ub,
      badge: this.badges.get(ub.badge_id),
    }));
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge | null> {
    const key = `${userId}:${badgeId}`;
    if (this.userBadges.has(key)) {
      return this.userBadges.get(key)!;
    }

    const earned: UserBadge = {
      user_id: userId,
      badge_id: badgeId,
      earned_at: new Date().toISOString(),
      badge: this.badges.get(badgeId),
    };
    this.userBadges.set(key, earned);

    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      const { data: existing } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_id', badgeId)
        .maybeSingle();

      if (!existing) {
        await supabase.from('user_badges').insert({
          user_id: userId,
          badge_id: badgeId,
          awarded_at: earned.earned_at,
        });
      }
    }

    return earned;
  }
}

export const store = new DataStore();
