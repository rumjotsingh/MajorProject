import request from 'supertest';
import app from '../server.js';
import User from '../models/User.model.js';

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Setup test database connection
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
          role: 'Learner',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('userId');
    });

    it('should return 409 for duplicate email', async () => {
      // First registration
      await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'Password123!',
      });

      // Duplicate registration
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User 2',
        email: 'duplicate@example.com',
        password: 'Password123!',
      });

      expect(res.statusCode).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Register user first
      await request(app).post('/api/auth/register').send({
        name: 'Login Test',
        email: 'login@example.com',
        password: 'Password123!',
      });

      // Login
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'Password123!',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should return 401 for invalid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'WrongPassword',
      });

      expect(res.statusCode).toBe(401);
    });
  });
});
