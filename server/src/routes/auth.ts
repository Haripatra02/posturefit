import { Router, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { getSupabase, isSupabaseConfigured } from '../db/supabase.js';
import { store } from '../db/store.js';
import { config } from '../config.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  display_name: z.string().min(2, 'Display name must be at least 2 characters'),
  timezone: z.string().default('UTC'),
});

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  new_password: z.string().min(6, 'Password must be at least 6 characters'),
});

// POST /api/auth/register
router.post('/register', validateBody(registerSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { email, password, display_name, timezone } = req.body;

  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      let user: any = null;
      let accessToken: string | null = null;

      // When Service Role Key is present, auto-confirm email for frictionless user onboarding
      if (config.supabaseServiceRoleKey) {
        const { data: adminData, error: adminErr } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { display_name, timezone: timezone || 'UTC' },
        });

        if (adminErr) {
          const isExisting =
            adminErr.message.toLowerCase().includes('already') ||
            adminErr.message.toLowerCase().includes('registered') ||
            (adminErr as any).status === 422;
          res.status(400).json({
            success: false,
            error: isExisting
              ? 'An account with this email address already exists. Please sign in instead.'
              : adminErr.message,
          });
          return;
        }
        user = adminData.user;

        // Acquire genuine JWT access token via immediate sign-in
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!signInErr && signInData?.session) {
          accessToken = signInData.session.access_token;
        }
      } else {
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name, timezone },
          },
        });

        if (signUpErr || !signUpData.user) {
          res.status(400).json({ success: false, error: signUpErr?.message || 'Registration failed' });
          return;
        }
        user = signUpData.user;
        accessToken = signUpData.session?.access_token || null;
      }

      await store.upsertProfile({ id: user.id, email, display_name, timezone: timezone || 'UTC' });

      res.status(201).json({
        success: true,
        data: {
          user: { id: user.id, email: user.email, display_name },
          token: accessToken || `mock_token_${user.id}`,
        },
      });
      return;
    }

    // Local / Offline fallback mode: Generate unique user ID and profile
    const userId = uuidv4();
    const profile = await store.upsertProfile({
      id: userId,
      email,
      display_name,
      timezone: timezone || 'UTC',
    });

    res.status(201).json({
      success: true,
      data: {
        user: { id: profile.id, email: profile.email, display_name: profile.display_name },
        token: `mock_token_${userId}`,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Special handling for demo user: auto-provision if not yet in Supabase Auth
      if (error && email.toLowerCase() === 'alex.rivera@posturefit.demo' && config.supabaseServiceRoleKey) {
        await supabase.auth.admin.createUser({
          email: 'alex.rivera@posturefit.demo',
          password: 'password123',
          email_confirm: true,
          user_metadata: { display_name: 'Alex Rivera', timezone: 'UTC' },
        });

        const retry = await supabase.auth.signInWithPassword({
          email: 'alex.rivera@posturefit.demo',
          password: 'password123',
        });
        if (!retry.error && retry.data) {
          data = retry.data;
          error = null;
        }
      }

      if (error || !data?.user || !data?.session) {
        const message = error?.message?.toLowerCase().includes('invalid login credentials')
          ? 'Invalid email or password. Please verify your credentials.'
          : error?.message || 'Authentication failed';
        res.status(401).json({ success: false, error: message });
        return;
      }

      const authUser = data.user;
      const session = data.session;

      // Ensure profile and preferences are guaranteed to exist
      let profile = await store.getProfile(authUser.id);
      if (!profile) {
        profile = await store.upsertProfile({
          id: authUser.id,
          email: authUser.email || email,
          display_name: authUser.user_metadata?.display_name || email.split('@')[0],
          timezone: authUser.user_metadata?.timezone || 'UTC',
        });
      }
      await store.getPreferences(authUser.id);

      res.json({
        success: true,
        data: {
          user: {
            id: authUser.id,
            email: authUser.email,
            display_name: profile.display_name,
          },
          token: session.access_token,
        },
      });
      return;
    }

    // Local / Offline fallback mode: Find existing profile or create one
    let profile = Array.from(store.profiles.values()).find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (!profile) {
      const userId = uuidv4();
      profile = await store.upsertProfile({
        id: userId,
        email,
        display_name: email.split('@')[0],
      });
    }

    res.json({
      success: true,
      data: {
        user: { id: profile.id, email: profile.email, display_name: profile.display_name },
        token: `mock_token_${profile.id}`,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Login failed' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', validateBody(resetPasswordSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { email, new_password } = req.body;

  try {
    if (isSupabaseConfigured() && config.supabaseServiceRoleKey) {
      const supabase = getSupabase()!;
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) {
        res.status(500).json({ success: false, error: 'Failed to access user directory' });
        return;
      }

      const user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!user) {
        res.status(404).json({ success: false, error: 'No account registered with this email address.' });
        return;
      }

      const updateRes = await supabase.auth.admin.updateUserById(user.id, {
        password: new_password,
        email_confirm: true,
      });

      if (updateRes.error) {
        res.status(400).json({ success: false, error: updateRes.error.message });
        return;
      }

      res.json({
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.',
      });
      return;
    }

    // Local / Offline fallback
    res.json({
      success: true,
      message: 'Password reset successfully for local offline mode.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Password reset failed' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    let [profile, preferences, role] = await Promise.all([
      store.getProfile(userId),
      store.getPreferences(userId),
      store.getUserRole(userId),
    ]);

    if (!profile) {
      profile = await store.upsertProfile({
        id: userId,
        email: req.user!.email,
        display_name: req.user!.email.split('@')[0],
        timezone: 'UTC',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: userId,
          email: req.user!.email,
          role,
        },
        profile,
        preferences,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch user data' });
  }
});

export default router;
