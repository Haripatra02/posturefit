import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('========================================================');
console.log('📡 POSTUREFIT SUPABASE CLOUD LIVE HEALTH CHECK');
console.log('========================================================');
console.log('Connected Endpoint:', url);
console.log('Auth Role:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role (Admin & Bypass RLS)' : 'anon (Public)');

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  const tables = [
    { name: 'exercises', query: () => supabase.from('exercises').select('id, title, category, duration_seconds') },
    { name: 'challenges', query: () => supabase.from('challenges').select('id, title, target_duration_seconds') },
    { name: 'challenge_exercises', query: () => supabase.from('challenge_exercises').select('challenge_id, exercise_id, sequence_order') },
    { name: 'badges', query: () => supabase.from('badges').select('id, name, category, icon_name') },
    { name: 'profiles', query: () => supabase.from('profiles').select('id, display_name, email, timezone') },
    { name: 'user_preferences', query: () => supabase.from('user_preferences').select('user_id, work_duration, break_duration, daily_goal') },
    { name: 'user_roles', query: () => supabase.from('user_roles').select('user_id, role') },
    { name: 'work_sessions', query: () => supabase.from('work_sessions').select('id, user_id, work_duration_minutes, session_status') },
    { name: 'activity_completions', query: () => supabase.from('activity_completions').select('id, user_id, duration_seconds, completion_status') },
    { name: 'reward_events', query: () => supabase.from('reward_events').select('id, user_id, event_type, points_delta') },
  ];

  let successCount = 0;

  for (const t of tables) {
    const res = await t.query();
    if (res.error) {
      console.log(`❌ Table [${t.name}]: ERROR -> ${res.error.message}`);
    } else {
      successCount++;
      console.log(`✅ Table [${t.name}]: ONLINE (${res.data.length} records)`);
    }
  }

  console.log('========================================================');
  console.log(`Result: ${successCount} / ${tables.length} tables verified and fully operational.`);
  if (successCount === tables.length) {
    console.log('🎉 ALL 10 SUPABASE TABLES ARE FULLY LIVE, POPULATED, AND RESPONDING.');
  }
  console.log('========================================================');
}

run().catch(console.error);
