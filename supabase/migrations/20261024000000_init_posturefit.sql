-- ========================================================
-- PostureFit - Initial Database Schema & Seed Migration
-- Migration: 20261024000000_init_posturefit.sql
-- ========================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- 1. PROFILES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    email TEXT,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================
-- 2. USER ROLES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================
-- 3. USER PREFERENCES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    work_duration INTEGER NOT NULL DEFAULT 30, -- in minutes
    break_duration INTEGER NOT NULL DEFAULT 5, -- in minutes
    daily_goal INTEGER NOT NULL DEFAULT 3,     -- number of activities/breaks per day
    reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================
-- 4. EXERCISES TABLE (Curated catalog)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'neck_shoulder',
        'wrist_hand',
        'chest_upper_body',
        'seated_mobility',
        'leg_ankle',
        'standing_breaks'
    )),
    duration_seconds INTEGER NOT NULL DEFAULT 60 CHECK (duration_seconds > 0),
    difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    instructions JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of step strings
    safety_notes TEXT,
    media_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================
-- 5. CHALLENGES TABLE (Guided multi-exercise activities)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_duration_seconds INTEGER NOT NULL DEFAULT 300, -- approx 5 minutes
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================
-- 6. CHALLENGE EXERCISES (Mapping & Sequence)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.challenge_exercises (
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL CHECK (sequence_order >= 1),
    planned_duration_seconds INTEGER NOT NULL DEFAULT 60,
    PRIMARY KEY (challenge_id, sequence_order)
);

-- ========================================================
-- 7. WORK SESSIONS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.work_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'paused', 'completed', 'cancelled')),
    planned_duration INTEGER NOT NULL, -- in seconds
    actual_tracked_duration INTEGER NOT NULL DEFAULT 0, -- in seconds
    breaks_taken INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================
-- 8. ACTIVITY COMPLETIONS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.activity_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_seconds INTEGER NOT NULL,
    completion_status TEXT NOT NULL DEFAULT 'completed' CHECK (completion_status IN ('completed', 'skipped', 'interrupted')),
    idempotency_key TEXT UNIQUE,
    points_awarded INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================
-- 9. BADGES TABLE (Achievement definitions)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'milestone',
    icon_name TEXT NOT NULL DEFAULT 'Award',
    achievement_rule JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================
-- 10. USER BADGES TABLE (Earned badges)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.user_badges (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);

-- ========================================================
-- 11. REWARD EVENTS TABLE (Immutable points ledger)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.reward_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'exercise_completion',
        'challenge_completion',
        'break_completion',
        'daily_goal_bonus',
        'streak_milestone_bonus',
        'badge_earned'
    )),
    points_delta INTEGER NOT NULL CHECK (points_delta >= 0),
    source_reference TEXT,
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================
-- INDEXES FOR FAST QUERYING
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_work_sessions_user_date ON public.work_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_completions_user_date ON public.activity_completions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_reward_events_user_date ON public.reward_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON public.exercises(category, is_active);
CREATE INDEX IF NOT EXISTS idx_challenge_exercises_seq ON public.challenge_exercises(challenge_id, sequence_order);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_events ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = $1 AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can select & update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- User roles: Users can view their own role; only service_role can modify
CREATE POLICY "Users can view own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- User Preferences: Users can select, insert, and update their own preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Exercises: Public read for active exercises, Admin full access
CREATE POLICY "Active exercises are viewable by all users" ON public.exercises
    FOR SELECT USING (is_active = TRUE OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert exercises" ON public.exercises
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update exercises" ON public.exercises
    FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete exercises" ON public.exercises
    FOR DELETE USING (public.is_admin(auth.uid()));

-- Challenges & Challenge Exercises: Public read
CREATE POLICY "Challenges viewable by all" ON public.challenges
    FOR SELECT USING (is_active = TRUE OR public.is_admin(auth.uid()));
CREATE POLICY "Challenge exercises viewable by all" ON public.challenge_exercises
    FOR SELECT USING (TRUE);

-- Work sessions: Users can manage their own sessions
CREATE POLICY "Users can view own work sessions" ON public.work_sessions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own work sessions" ON public.work_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own work sessions" ON public.work_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Activity completions: Users can view own completions
CREATE POLICY "Users can view own completions" ON public.activity_completions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON public.activity_completions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Badges: Viewable by all authenticated users
CREATE POLICY "Badges are viewable by all" ON public.badges
    FOR SELECT USING (TRUE);

-- User badges: Users can view their earned badges
CREATE POLICY "Users can view own badges" ON public.user_badges
    FOR SELECT USING (auth.uid() = user_id);

-- Reward events: Ledger is read-only for users (writes handled via trusted backend)
CREATE POLICY "Users can view own reward ledger" ON public.reward_events
    FOR SELECT USING (auth.uid() = user_id);

-- ========================================================
-- TRIGGERS & AUTOMATION
-- ========================================================

-- Auto-provision profile and default preferences on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, email, timezone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC')
    );

    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercises_modtime
    BEFORE UPDATE ON public.exercises
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_preferences_modtime
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================================
-- SEED DATA: BADGES
-- ========================================================
INSERT INTO public.badges (id, name, description, category, icon_name, achievement_rule) VALUES
('first_step', 'First Step', 'Completed your very first movement break or exercise activity.', 'milestone', 'Footprints', '{"type": "activity_count", "threshold": 1}'::jsonb),
('streak_3', 'Habit Former', 'Maintained a healthy posture and movement streak for 3 consecutive days.', 'streak', 'Flame', '{"type": "streak_days", "threshold": 3}'::jsonb),
('streak_7', 'Weekly Warrior', 'Maintained an active movement streak for 7 consecutive days!', 'streak', 'Zap', '{"type": "streak_days", "threshold": 7}'::jsonb),
('streak_14', 'Fortnight Focus', 'Maintained a 14-day movement streak!', 'streak', 'Sparkles', '{"type": "streak_days", "threshold": 14}'::jsonb),
('streak_30', 'Posture Master', 'Achieved a full 30-day movement streak. True posture discipline!', 'streak', 'Crown', '{"type": "streak_days", "threshold": 30}'::jsonb),
('challenge_champ', '5-Minute Champion', 'Completed 5 guided Five-Minute ergonomic challenges.', 'challenge', 'Trophy', '{"type": "challenge_count", "threshold": 5}'::jsonb),
('break_pro_10', 'Break Maestro', 'Successfully took 10 scheduled movement breaks during work sessions.', 'breaks', 'Clock', '{"type": "break_count", "threshold": 10}'::jsonb),
('desk_athlete', 'Desk Athlete', 'Accumulated over 500 total posture awareness points.', 'points', 'Medal', '{"type": "points_total", "threshold": 500}'::jsonb),
('neck_rescuer', 'Neck & Shoulder Hero', 'Completed 10 upper body and neck mobility exercises.', 'category', 'ShieldCheck', '{"type": "category_count", "category": "neck_shoulder", "threshold": 10}'::jsonb),
('seated_zen', 'Ergonomic Zen', 'Maintained an optimal daily movement goal 5 days in a row.', 'consistency', 'Target', '{"type": "daily_goal_streak", "threshold": 5}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ========================================================
-- SEED DATA: CURATED ERGONOMIC EXERCISES (25 INDUSTRY STANDARD)
-- ========================================================
INSERT INTO public.exercises (id, title, description, category, duration_seconds, difficulty, instructions, safety_notes) VALUES
('00000000-0000-0000-0000-000000000001', 'Diaphragmatic Breath & Posture Reset', 'Restores three-dimensional ribcage expansion, activates parasympathetic calm, and aligns spinal curves.', 'seated_mobility', 60, 'beginner', '["Sit tall away from the backrest with feet flat on the floor.", "Inhale slowly through nose for 4s expanding ribs.", "Hold breath for 2s lengthening head to ceiling.", "Exhale slowly through relaxed lips for 4s softening ribs."]', 'Do not shrug shoulders up on inhale; breathe deep into lower ribs.'),
('00000000-0000-0000-0000-000000000002', 'Chin Tucks (Cervical Retraction)', 'Realigns cervical spine curvature, activates deep neck flexors, and reverses screen-induced forward head slouch.', 'neck_shoulder', 60, 'beginner', '["Sit tall with back straight and gaze level.", "Gently slide chin straight backward as if making a subtle double chin.", "Hold retracted position for 5s feeling gentle lengthening at skull base.", "Release gently to neutral and repeat 8-10 times."]', 'Do not tilt head down toward chest; keep jaw parallel to floor.'),
('00000000-0000-0000-0000-000000000003', 'Shoulder Blade Squeezes (Scapular Retraction)', 'Strengthens middle trapezius and rhomboids while opening pectoralis muscles tightened from typing.', 'neck_shoulder', 60, 'beginner', '["Sit tall with elbows bent at 90 degrees by your ribs.", "Gently draw shoulder blades back and down toward spine.", "Hold squeeze for 4-5s while breathing smoothly.", "Slowly release to neutral and repeat 10 times."]', 'Keep upper traps and neck relaxed; do not shrug shoulders upward.'),
('00000000-0000-0000-0000-000000000004', 'Seated Thoracic Cat-Cow Flow', 'Mobilizes the thoracic spine, hydrates intervertebral discs, and alleviates mid-back stiffness.', 'seated_mobility', 60, 'beginner', '["Rest hands on knees with feet hip-width apart.", "Inhale: lift chest upward and arch spine forward into Cow pose.", "Exhale: round upper back, tuck chin, and draw navel inward into Cat pose.", "Flow rhythmically with deep breaths for 8-10 cycles."]', 'Keep movement smooth and continuous; do not force end-range flexion.'),
('00000000-0000-0000-0000-000000000005', 'Seated Ankle Pumps & Heel Taps', 'Activates calf venous muscle pumps to increase blood return from lower limbs during long seated stretches.', 'leg_ankle', 60, 'beginner', '["Sit tall with knees bent at 90 degrees and feet flat.", "Lift both heels as high as possible pressing toes down for 2s.", "Lower heels and immediately pull toes up toward shins for 2s.", "Alternate between heel and toe lifts rhythmically for 20-25 cycles."]', 'Move both ankles simultaneously without rocking your torso.'),
('00000000-0000-0000-0000-000000000006', 'Cervical Retraction with Overpressure', 'Advanced McKenzie method cervical glide that restores lordotic cervical curve and unloads posterior facet joints.', 'neck_shoulder', 60, 'intermediate', '["Perform a standard chin tuck retracting head backward.", "Place two fingertips on chin and apply gentle steady backward overpressure.", "Hold for 3s feeling decompression at skull base.", "Release overpressure and return to neutral; repeat 8-10 times."]', 'Apply light pressure only; discontinue if dizzy or experiencing sharp pain.'),
('00000000-0000-0000-0000-000000000007', 'Upper Trapezius Lateral Stretch', 'Relieves chronic tension along top of shoulder and side of neck caused by hunched typing.', 'neck_shoulder', 60, 'beginner', '["Sit tall and grasp chair edge with right hand to anchor shoulder down.", "Gently tilt left ear toward left shoulder until soothing stretch is felt.", "Hold steadily for 20-25s with deep breathing.", "Return smoothly to center and repeat on opposite side."]', 'Do not pull hard with hand; allow gravity to create gentle stretch.'),
('00000000-0000-0000-0000-000000000008', 'Levator Scapulae Corner Stretch', 'Targets levator scapulae running from upper cervical vertebrae to shoulder blade.', 'neck_shoulder', 60, 'intermediate', '["Sit tall and turn head 45 degrees to the left.", "Gently lower chin down toward left shirt pocket.", "Rest left hand over crown of head applying gentle guidance downward.", "Hold for 20-25s and repeat on right side."]', 'Ensure opposite shoulder stays relaxed away from ear.'),
('00000000-0000-0000-0000-000000000009', 'Seated W-to-Y Posture Retraction', 'Activates lower trapezius and serratus anterior while reversing rounded shoulder postures.', 'neck_shoulder', 60, 'intermediate', '["Bend elbows by your sides forming a W with thumbs pointing backward.", "Squeeze shoulder blades back and down for 3s.", "Slide arms smoothly upward into high Y shape keeping shoulders down.", "Hold Y for 2s, return to W, and repeat for 10-12 pulses."]', 'Avoid arching lower back as you reach into Y; keep core gently engaged.'),
('00000000-0000-0000-0000-000000000010', 'Doorway Pectoral & Anterior Shoulder Opener', 'Lengthens tight pectoralis major and minor muscles that pull shoulders forward.', 'chest_upper_body', 60, 'beginner', '["Stand in open doorway with forearms on door frame at 90-degree angles.", "Step forward gently with one foot until stretch is felt across chest.", "Maintain upright spine and level chin for 25-30s.", "Switch forward foot and repeat for second set."]', 'Keep elbows at or below shoulder height to avoid impingement strain.'),
('00000000-0000-0000-0000-000000000011', 'Desk Wrist & Forearm Flexor Extensor Glides', 'Relieves carpal tunnel compression and stretches repetitive-strain forearm muscles from keyboard use.', 'wrist_hand', 60, 'beginner', '["Extend right arm forward, palm facing away with fingers up.", "Gently draw fingers back for flexor stretch for 15s.", "Flip hand with fingers pointing down; gently pull back for extensor stretch for 15s.", "Repeat both stretches on left arm."]', 'Apply gentle pressure across all fingers; do not isolate single finger.'),
('00000000-0000-0000-0000-000000000012', 'Finger Tendon Glides & Palm Expansions', 'Enhances synovial fluid circulation and tendon excursion through carpal canal.', 'wrist_hand', 60, 'beginner', '["Hold hands upright with fingers straight and together.", "Bend fingers into flat tabletop hook for 2s.", "Roll into full fist with fingers curled over palms for 2s.", "Open hands wide and fan fingers apart for 2s.", "Repeat sequence smoothly 8-10 times."]', 'Perform with fluid, gentle motion; do not squeeze with maximum force.'),
('00000000-0000-0000-0000-000000000013', 'Seated Torso & Thoracic Spinal Rotation', 'Decompresses thoracic vertebrae and restores rotational mobility restricted by sitting.', 'seated_mobility', 60, 'intermediate', '["Sit tall with feet flat on floor and hips anchored to chair.", "Cross arms over chest resting hands on opposite shoulders.", "Slowly rotate ribcage and shoulders left, keeping knees forward.", "Hold rotation for 3 breaths, return center, and rotate right.", "Complete 4-5 controlled rotations to each side."]', 'Initiate twist from mid-back ribcage rather than neck or lower back.'),
('00000000-0000-0000-0000-000000000014', 'Seated Figure-4 Piriformis & Hip Opener', 'Relieves deep hip tension and decompresses sciatic pathways constricted by sitting.', 'seated_mobility', 60, 'intermediate', '["Sit upright on front half of chair with left foot planted.", "Rest right ankle across left knee, allowing right knee to open outward.", "Keep back flat and hinge forward from hips until outer glute stretch is felt.", "Hold steadily for 25s with deep breathing, then switch legs."]', 'Hinge from hips with neutral spine; do not round lower back.'),
('00000000-0000-0000-0000-000000000015', 'Standing Calf Raises & Venous Circulation Pumps', 'Builds ankle stability, engages gastroc-soleus complex, and prevents blood pooling.', 'leg_ankle', 60, 'intermediate', '["Stand behind chair with fingertips resting lightly on backrest.", "Drive through balls of feet to lift heels into full plantarflexion.", "Hold peak contraction at top for 2 full seconds.", "Lower heels down with control over 3 seconds.", "Perform 15-20 smooth, controlled repetitions."]', 'Distribute weight evenly across first and second toes; avoid rolling ankles.'),
('00000000-0000-0000-0000-000000000016', 'Backpack Shoulder & Clavicle Reset', 'Releases brachial plexus pressure and clavicular depression caused by heavy bags.', 'neck_shoulder', 60, 'beginner', '["Stand or sit tall with arms hanging by your sides.", "Inhale: shrug both shoulders straight up toward ears.", "Roll shoulders back, squeezing shoulder blades together.", "Exhale: press shoulders down firmly away from ears.", "Repeat for 10 backward circles, then 5 forward circles."]', 'Move smoothly without jerking neck; emphasize downward roll.'),
('00000000-0000-0000-0000-000000000017', 'Thoracic Open-Book Mobility', 'Counters laptop hunch by opening anterior chest walls and mobilizing facet joints.', 'chest_upper_body', 60, 'intermediate', '["Sit tall with hands clasped behind back of head, elbows forward.", "Inhale: slowly flare both elbows wide to sides, expanding chest.", "Hold open position for 3s while squeezing shoulder blades.", "Exhale: draw elbows back toward each other gently.", "Repeat sequence for 8-10 repetitions."]', 'Do not pull forward on neck with hands; rest hands lightly on occiput.'),
('00000000-0000-0000-0000-000000000018', 'Seated Hamstring & Sciatic Nerve Floss', 'Improves neural mobility and relieves hamstring tightness from study sessions.', 'leg_ankle', 60, 'intermediate', '["Sit on front edge of chair with right leg extended straight, heel on floor.", "Flex right ankle pointing toes up toward ceiling.", "Hinge forward from hips until mild hamstring stretch is felt.", "Point toes forward then flex back in rhythmic flossing for 10 reps.", "Switch to left leg and repeat."]', 'Keep movement gentle; reduce range if tingling occurs.'),
('00000000-0000-0000-0000-000000000019', 'Standing Hip Flexor Psoas Lunge', 'Lengthens chronically shortened iliopsoas muscles that cause anterior pelvic tilt.', 'standing_breaks', 60, 'intermediate', '["Stand next to desk for balance and step right foot back into shallow lunge.", "Tuck pelvis slightly under and gently squeeze right glute.", "Shift hips forward until deep stretch is felt along front of right hip.", "Hold for 25s with deep breathing, then switch to left leg."]', 'Keep torso upright; avoid leaning backward from lumbar spine.'),
('00000000-0000-0000-0000-000000000020', 'Desk Push-Away Lat & Spine Decompression', 'Provides axial traction along spine and opens latissimus dorsi muscles.', 'standing_breaks', 60, 'intermediate', '["Stand 2 feet from desk, placing palms flat on desk edge shoulder-width apart.", "Hinge hips back and lower chest between arms until torso is parallel to ground.", "Press into hands while pulling hips back to create spinal traction.", "Hold for 25-30s with deep breathing; stand up slowly and repeat."]', 'Ensure desk is sturdy and won''t slide; keep soft micro-bend in knees.'),
('00000000-0000-0000-0000-000000000021', 'Isometric Wall Angels with Full Contact', 'Physical therapy standard for correcting forward posture and building scapular endurance.', 'chest_upper_body', 60, 'advanced', '["Stand heels 4 inches from wall, resting sacrum, upper back, and head against wall.", "Raise arms into W position with elbows and hands pressed against wall.", "Slowly glide arms upward into Y shape maintaining continuous wall contact.", "Hold top position for 2s, then slide back down into W.", "Perform 8-10 slow, controlled repetitions."]', 'Do not arch lower back off wall to keep hands touching.'),
('00000000-0000-0000-0000-000000000022', 'Deep Chair Squats with Overhead Posture Reach', 'Builds lower-body power and core rigidity while reinforcing thoracic spine extension.', 'standing_breaks', 60, 'advanced', '["Stand 6 inches in front of chair with feet shoulder-width apart.", "Raise both arms overhead in line with ears.", "Hinge hips back and bend knees, lowering until glutes tap chair seat.", "Drive through heels to stand back up tall locking hips out.", "Perform 10-12 smooth repetitions."]', 'Ensure knees track in line with toes and do not collapse inward.'),
('00000000-0000-0000-0000-000000000023', 'Standing Thoracic Windmill Reach', 'Integrates thoracic rotation with hamstring length and core anti-rotation stability.', 'standing_breaks', 60, 'advanced', '["Stand with feet wide, turning left foot out 45 degrees.", "Raise right arm straight up toward ceiling, eyes focused on right hand.", "Hinge hips back and slide left hand down inside of left shin toward ankle.", "Rotate chest open toward ceiling for 2s, then return upright.", "Perform 5 reps on left side, switch stance and repeat on right side."]', 'Keep vertical arm locked toward ceiling throughout movement.'),
('00000000-0000-0000-0000-000000000024', 'Single-Leg Balance with Postural Hinge', 'Challenges proprioception, ankle stabilizers, and gluteus medius control.', 'leg_ankle', 60, 'advanced', '["Stand tall near desk for balance support.", "Lift left foot 2 inches off floor, balancing on right leg with micro-bend in knee.", "Maintain upright spine and hinge forward 20 degrees at hips.", "Hold balance for 20-25s focusing on stationary point.", "Switch to left leg and repeat."]', 'Keep hips level; do not let floating hip rotate upward.'),
('00000000-0000-0000-0000-000000000025', 'Prone Cobra Scapular Endurance Hold', 'Strengthens posterior chain extensors, lowers kyphosis, and builds fatigue resistance.', 'neck_shoulder', 60, 'advanced', '["Stand or sit tall on chair edge with spine elongated and chest lifted.", "Rotate arms outward so palms face forward with thumbs pointing away.", "Squeeze shoulder blades down and back opening collarbones to maximum width.", "Tuck chin slightly and hold active contraction for 10s while breathing.", "Release for 3s and repeat for 4-5 total endurance holds."]', 'Breathe continuously throughout hold; do not hold breath.')
ON CONFLICT (id) DO NOTHING;

-- ========================================================
-- SEED DATA: 5-MINUTE GUIDED CHALLENGES (5 CURATED SEGMENTS)
-- ========================================================
INSERT INTO public.challenges (id, title, description, target_duration_seconds, is_active) VALUES
('10000000-0000-0000-0000-000000000001', '🌅 5-Minute Morning Posture Wake-Up', 'A gentle, restorative 5-step flow designed to awaken breathing, gently align the spine, and stimulate full-body circulation.', 300, TRUE),
('10000000-0000-0000-0000-000000000002', '💻 5-Minute Tech-Neck & Cervical Decompressor', 'Directly targets forward-head slouch, levator tension, and cervical compression caused by hours staring at laptops or monitors.', 300, TRUE),
('10000000-0000-0000-0000-000000000003', '💼 5-Minute Corporate Desk & Carpal Guard', 'Engineered for office professionals battling keyboard wrist stiffness, tight hip flexors, and static cubicle stiffness.', 300, TRUE),
('10000000-0000-0000-0000-000000000004', '🎓 5-Minute Student Study Cram & Backpack Relief', 'Relieves compressed shoulders from heavy school bags, couch slouching, and marathon study sessions.', 300, TRUE),
('10000000-0000-0000-0000-000000000005', '⚡ 5-Minute Advanced Posture Power & Alignment', 'Challenging physical therapy sequence to build deep scapular endurance, kinetic stability, and upright stamina.', 300, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Map exercises into Challenge 1: Morning Posture Wake-Up
INSERT INTO public.challenge_exercises (challenge_id, exercise_id, sequence_order, planned_duration_seconds) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 1, 60),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 2, 60),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 3, 60),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 4, 60),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 5, 60)
ON CONFLICT (challenge_id, sequence_order) DO NOTHING;

-- Map exercises into Challenge 2: Tech-Neck Decompressor
INSERT INTO public.challenge_exercises (challenge_id, exercise_id, sequence_order, planned_duration_seconds) VALUES
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 1, 60),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', 2, 60),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000008', 3, 60),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000009', 4, 60),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 5, 60)
ON CONFLICT (challenge_id, sequence_order) DO NOTHING;

-- Map exercises into Challenge 3: Corporate Desk & Carpal Guard
INSERT INTO public.challenge_exercises (challenge_id, exercise_id, sequence_order, planned_duration_seconds) VALUES
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000011', 1, 60),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000012', 2, 60),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000013', 3, 60),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000014', 4, 60),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000015', 5, 60)
ON CONFLICT (challenge_id, sequence_order) DO NOTHING;

-- Map exercises into Challenge 4: Student Study Cram
INSERT INTO public.challenge_exercises (challenge_id, exercise_id, sequence_order, planned_duration_seconds) VALUES
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000016', 1, 60),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000017', 2, 60),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000018', 3, 60),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000019', 4, 60),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000020', 5, 60)
ON CONFLICT (challenge_id, sequence_order) DO NOTHING;

-- Map exercises into Challenge 5: Advanced Posture Power
INSERT INTO public.challenge_exercises (challenge_id, exercise_id, sequence_order, planned_duration_seconds) VALUES
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000021', 1, 60),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000022', 2, 60),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000023', 3, 60),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000024', 4, 60),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000025', 5, 60)
ON CONFLICT (challenge_id, sequence_order) DO NOTHING;
