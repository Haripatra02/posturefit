import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://fwvzyafnjvsarnqbnbva.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const DEMO_USERS = [
  {
    email: 'alex.rivera@posturefit.demo',
    password: 'password123',
    display_name: 'Alex Rivera',
    timezone: 'UTC',
    role: 'user',
    daily_goal: 3,
    work_duration: 30,
    break_duration: 5,
    streak_days: 7,
  },
  {
    email: 'sarah.chen@techcorp.io',
    password: 'password123',
    display_name: 'Sarah Chen',
    timezone: 'America/New_York',
    role: 'user',
    daily_goal: 4,
    work_duration: 45,
    break_duration: 5,
    streak_days: 14,
  },
  {
    email: 'marcus.johnson@designhub.co',
    password: 'password123',
    display_name: 'Marcus Johnson',
    timezone: 'America/Chicago',
    role: 'user',
    daily_goal: 3,
    work_duration: 25,
    break_duration: 5,
    streak_days: 5,
  },
  {
    email: 'elena.rostova@medresearch.org',
    password: 'password123',
    display_name: 'Elena Rostova',
    timezone: 'Europe/London',
    role: 'admin',
    daily_goal: 4,
    work_duration: 30,
    break_duration: 5,
    streak_days: 21,
  },
];

async function seed() {
  console.log('===========================================================');
  console.log('🌱 Starting PostureFit Comprehensive Live Supabase Seeder');
  console.log('Supabase URL:', supabaseUrl);
  console.log('===========================================================');

  // 1. Fetch available exercises and challenges from Supabase
  const { data: exercises, error: exErr } = await supabase.from('exercises').select('id, title, category');
  if (exErr || !exercises || exercises.length === 0) {
    throw new Error(`Failed to load exercises: ${exErr?.message}`);
  }
  const { data: challenges, error: chErr } = await supabase.from('challenges').select('id, title');
  if (chErr || !challenges || challenges.length === 0) {
    throw new Error(`Failed to load challenges: ${chErr?.message}`);
  }

  console.log(`Loaded ${exercises.length} exercises and ${challenges.length} challenges from Supabase.`);

  // 2. Fetch existing users from auth
  const { data: existingUsersData } = await supabase.auth.admin.listUsers();
  const existingUsers = existingUsersData?.users || [];
  console.log(`Found ${existingUsers.length} existing auth users in Supabase.`);

  // 3. Ensure demo users exist in Auth and have profiles
  const userMap = new Map<string, { id: string; email: string; display_name: string; timezone: string }>();

  for (const demo of DEMO_USERS) {
    let authUser = existingUsers.find((u) => u.email?.toLowerCase() === demo.email.toLowerCase());

    if (!authUser) {
      console.log(`Creating auth user: ${demo.email}...`);
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: demo.email,
        password: demo.password,
        email_confirm: true,
        user_metadata: {
          display_name: demo.display_name,
          timezone: demo.timezone,
        },
      });

      if (createErr || !created.user) {
        console.error(`Error creating user ${demo.email}:`, createErr?.message);
        continue;
      }
      authUser = created.user;
    } else {
      // Ensure password is set to password123 and confirmed
      await supabase.auth.admin.updateUserById(authUser.id, {
        password: demo.password,
        email_confirm: true,
        user_metadata: {
          display_name: demo.display_name,
          timezone: demo.timezone,
        },
      });
    }

    userMap.set(demo.email, {
      id: authUser.id,
      email: demo.email,
      display_name: demo.display_name,
      timezone: demo.timezone,
    });

    // Ensure Profile
    await supabase.from('profiles').upsert({
      id: authUser.id,
      email: demo.email,
      display_name: demo.display_name,
      timezone: demo.timezone,
      updated_at: new Date().toISOString(),
    });

    // Ensure Preferences
    await supabase.from('user_preferences').upsert({
      user_id: authUser.id,
      work_duration: demo.work_duration,
      break_duration: demo.break_duration,
      daily_goal: demo.daily_goal,
      reminders_enabled: true,
      sound_enabled: true,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    });

    // Ensure Role
    await supabase.from('user_roles').upsert({
      user_id: authUser.id,
      role: demo.role,
    });
  }

  // Also include the user's personal test account if it exists (e.g. gopaled@gmail.com)
  const gopalUser = existingUsers.find((u) => u.email?.toLowerCase() === 'gopaled@gmail.com');
  if (gopalUser) {
    userMap.set('gopaled@gmail.com', {
      id: gopalUser.id,
      email: 'gopaled@gmail.com',
      display_name: 'Gopal (Active Member)',
      timezone: 'Asia/Calcutta',
    });
    await supabase.from('profiles').upsert({
      id: gopalUser.id,
      email: 'gopaled@gmail.com',
      display_name: 'Gopal (Active Member)',
      timezone: 'Asia/Calcutta',
      updated_at: new Date().toISOString(),
    });
    await supabase.from('user_preferences').upsert({
      user_id: gopalUser.id,
      work_duration: 30,
      break_duration: 5,
      daily_goal: 3,
      reminders_enabled: true,
      sound_enabled: true,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    });
  }

  // 4. Generate realistic historical activity for each user
  console.log('\n--- Seeding Work Sessions, Completions, Rewards & Badges ---');

  for (const [email, user] of userMap.entries()) {
    const isAlex = email.includes('alex.rivera');
    const isGopal = email.includes('gopaled');
    const daysBack = isAlex ? 7 : isGopal ? 5 : 4;

    console.log(`Seeding past ${daysBack} days for ${user.display_name} (${email})...`);

    const neckExercises = exercises.filter((e) => e.category === 'neck_shoulder');
    const wristExercises = exercises.filter((e) => e.category === 'wrist_hand');
    const seatedExercises = exercises.filter((e) => e.category === 'seated_mobility');

    for (let dayOffset = daysBack - 1; dayOffset >= 0; dayOffset--) {
      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() - dayOffset);
      const dateStr = sessionDate.toISOString().split('T')[0];

      // A) Morning work session
      const morningStart = new Date(sessionDate);
      morningStart.setHours(9, 15, 0, 0);
      const morningEnd = new Date(morningStart.getTime() + 30 * 60 * 1000);

      const morningSessionId = uuidv4();
      await supabase.from('work_sessions').upsert({
        id: morningSessionId,
        user_id: user.id,
        work_duration_minutes: 30,
        breaks_taken: 1,
        session_status: 'completed',
        created_at: morningStart.toISOString(),
      });

      // Break reward
      await supabase.from('reward_events').upsert({
        user_id: user.id,
        event_type: 'break_completion',
        points_delta: 10,
        source_reference: `${morningSessionId}_break_1`,
        idempotency_key: `break:${morningSessionId}:1`,
        created_at: morningEnd.toISOString(),
      });

      // B) Completed Exercise 1
      const ex1 = neckExercises[dayOffset % neckExercises.length] || exercises[0];
      const comp1Time = new Date(morningEnd.getTime() + 2 * 60 * 1000);
      const comp1Id = uuidv4();
      await supabase.from('activity_completions').upsert({
        id: comp1Id,
        user_id: user.id,
        exercise_id: ex1.id,
        completed_at: comp1Time.toISOString(),
        duration_seconds: 60,
        completion_status: 'completed',
        idempotency_key: `seed_${user.id}_ex1_${dateStr}`,
      });
      await supabase.from('reward_events').upsert({
        user_id: user.id,
        event_type: 'exercise_completion',
        points_delta: 20,
        source_reference: comp1Id,
        idempotency_key: `act_comp:${comp1Id}`,
        created_at: comp1Time.toISOString(),
      });

      // C) Afternoon work session
      const afternoonStart = new Date(sessionDate);
      afternoonStart.setHours(14, 0, 0, 0);
      const afternoonEnd = new Date(afternoonStart.getTime() + 45 * 60 * 1000);

      const afternoonSessionId = uuidv4();
      await supabase.from('work_sessions').upsert({
        id: afternoonSessionId,
        user_id: user.id,
        work_duration_minutes: 45,
        breaks_taken: 1,
        session_status: 'completed',
        created_at: afternoonStart.toISOString(),
      });

      // Break reward
      await supabase.from('reward_events').upsert({
        user_id: user.id,
        event_type: 'break_completion',
        points_delta: 10,
        source_reference: `${afternoonSessionId}_break_1`,
        idempotency_key: `break:${afternoonSessionId}:1`,
        created_at: afternoonEnd.toISOString(),
      });

      // D) Guided 5-Minute Challenge
      const challenge = challenges[dayOffset % challenges.length] || challenges[0];
      const chCompTime = new Date(afternoonEnd.getTime() + 3 * 60 * 1000);
      const chCompId = uuidv4();
      await supabase.from('activity_completions').upsert({
        id: chCompId,
        user_id: user.id,
        challenge_id: challenge.id,
        completed_at: chCompTime.toISOString(),
        duration_seconds: 300,
        completion_status: 'completed',
        idempotency_key: `seed_${user.id}_ch_${dateStr}`,
      });
      await supabase.from('reward_events').upsert({
        user_id: user.id,
        event_type: 'challenge_completion',
        points_delta: 60,
        source_reference: chCompId,
        idempotency_key: `act_comp:${chCompId}`,
        created_at: chCompTime.toISOString(),
      });

      // E) Daily Goal Bonus (completed >= 3 actions today)
      await supabase.from('reward_events').upsert({
        user_id: user.id,
        event_type: 'daily_goal_bonus',
        points_delta: 50,
        source_reference: `daily_goal_${dateStr}`,
        idempotency_key: `daily_goal:${user.id}:${dateStr}`,
        created_at: chCompTime.toISOString(),
      });
    }

    // F) 7-Day Streak Bonus for eligible users
    if (daysBack >= 7) {
      await supabase.from('reward_events').upsert({
        user_id: user.id,
        event_type: 'streak_milestone_bonus',
        points_delta: 100,
        source_reference: `streak_7_milestone`,
        idempotency_key: `streak_7:${user.id}:7`,
        created_at: new Date().toISOString(),
      });
    }

    // G) Award Badges
    const badgesToAward = ['first_step', 'streak_3'];
    if (daysBack >= 7) {
      badgesToAward.push('streak_7', 'challenge_champ', 'break_pro_10', 'desk_athlete');
    }

    for (const badgeId of badgesToAward) {
      const { data: existingBadge } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', user.id)
        .eq('badge_id', badgeId)
        .maybeSingle();

      if (!existingBadge) {
        await supabase.from('user_badges').insert({
          user_id: user.id,
          badge_id: badgeId,
          awarded_at: new Date().toISOString(),
        });
      }
    }
  }

  console.log('\n===========================================================');
  console.log('✅ Supabase Seeding Completed Successfully!');
  console.log('===========================================================');

  // Verify final counts
  for (const tbl of [
    'profiles',
    'user_preferences',
    'user_roles',
    'work_sessions',
    'activity_completions',
    'reward_events',
    'user_badges',
  ]) {
    const { count } = await supabase.from(tbl).select('*', { count: 'exact', head: true });
    console.log(`Table ${tbl.padEnd(22)}: ${count} rows`);
  }
}

seed().catch((err) => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
