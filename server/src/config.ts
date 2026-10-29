import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  adminSecretKey: process.env.ADMIN_SECRET_KEY || 'posturefit_super_secret_admin_token_2026',

  // Gamification Point Values (Enforced securely on backend)
  points: {
    exerciseCompletion: parseInt(process.env.POINTS_EXERCISE_COMPLETION || '20', 10),
    breakCompletion: parseInt(process.env.POINTS_BREAK_COMPLETION || '10', 10),
    dailyGoalBonus: parseInt(process.env.POINTS_DAILY_GOAL_BONUS || '50', 10),
    streak7DayBonus: parseInt(process.env.POINTS_STREAK_7_DAY_BONUS || '100', 10),
  },

  // Level Progression: Each level requires N * 100 points
  getLevel(points: number) {
    if (points < 100) return { level: 1, name: 'Posture Novice', threshold: 100, current: points };
    if (points < 250) return { level: 2, name: 'Ergonomic Explorer', threshold: 250, current: points };
    if (points < 500) return { level: 3, name: 'Desk Mover', threshold: 500, current: points };
    if (points < 850) return { level: 4, name: 'Spine Guardian', threshold: 850, current: points };
    if (points < 1300) return { level: 5, name: 'Mobility Master', threshold: 1300, current: points };
    if (points < 2000) return { level: 6, name: 'Posture Champion', threshold: 2000, current: points };
    return { level: 7, name: 'Ergonomic Legend', threshold: points + 500, current: points };
  },
};
