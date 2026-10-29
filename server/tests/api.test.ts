import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { Express } from 'express';

describe('PostureFit API Endpoints', () => {
  let app: Express;
  let testToken: string;

  beforeAll(async () => {
    app = createApp();

    // Register a test user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'tester@posturefit.test',
        password: 'password123',
        display_name: 'Test Engineer',
        timezone: 'UTC',
      });

    testToken = res.body.data.token;
  });

  it('GET /api/health returns 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('GET /api/exercises returns seeded exercise list', async () => {
    const res = await request(app).get('/api/exercises');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(5);
  });

  it('GET /api/exercises?category=neck_shoulder filters by category', async () => {
    const res = await request(app).get('/api/exercises?category=neck_shoulder');
    expect(res.status).toBe(200);
    expect(res.body.data.every((e: any) => e.category === 'neck_shoulder')).toBe(true);
  });

  it('GET /api/challenges returns 5-minute challenges', async () => {
    const res = await request(app).get('/api/challenges');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].exercises.length).toBeGreaterThan(0);
  });

  it('POST /api/sessions/start initiates a work session', async () => {
    const res = await request(app)
      .post('/api/sessions/start')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ planned_duration: 1800 });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('in_progress');
    expect(res.body.data.planned_duration).toBe(1800);
  });

  it('POST /api/rewards/complete-activity records completion and awards points', async () => {
    const idempotencyKey = `test-run-${Date.now()}`;
    const res = await request(app)
      .post('/api/rewards/complete-activity')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        exercise_id: '00000000-0000-0000-0000-000000000001',
        duration_seconds: 60,
        completion_status: 'completed',
        idempotency_key: idempotencyKey,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.pointsAwarded).toBe(20);
  });

  it('GET /api/progress/dashboard retrieves personalized dashboard stats', async () => {
    const res = await request(app)
      .get('/api/progress/dashboard')
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.today).toBeDefined();
    expect(res.body.data.gamification).toBeDefined();
    expect(res.body.data.weekly_chart.length).toBe(7);
  });

  it('rejects unauthenticated requests to protected endpoints', async () => {
    const res = await request(app).get('/api/progress/dashboard');
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/reset-password securely accepts email for reset instructions', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: 'tester@posturefit.test' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('instructions have been sent');
  });

  it('POST /api/auth/reset-password rejects unauthenticated password change attempts without a token (Anti-Takeover)', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({
        email: 'tester@posturefit.test',
        new_password: 'malicious_overwrite_pass',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('recovery token');
  });

  it('rejects unauthenticated requests to admin management routes', async () => {
    const res = await request(app)
      .post('/api/admin/exercises')
      .send({ title: 'Unauthorized Exercise' });

    expect(res.status).toBe(401);
  });

  it('rejects admin access when x-admin-key is invalid or empty', async () => {
    const res = await request(app)
      .post('/api/admin/exercises')
      .set('x-admin-key', 'bogus-key')
      .send({ title: 'Unauthorized Exercise' });

    expect(res.status).toBe(401);
  });
});
