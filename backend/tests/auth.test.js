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
    it('should register a new learner', async () => {
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

    it('should register a new employer with company name and mobile', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'employer@example.com',
          password: 'Password123!',
          role: 'Employer',
          companyName: 'Test Company Inc',
          mobile: '1234567890',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('userId');
    });

    it('should register a new issuer with institution name and mobile', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Smith',
          email: 'issuer@example.com',
          password: 'Password123!',
          role: 'Issuer',
          institutionName: 'Test University',
          mobile: '9876543210',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('userId');
    });

    it('should return 400 for employer without company name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'employer2@example.com',
          password: 'Password123!',
          role: 'Employer',
          mobile: '1234567890',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 for issuer without institution name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Smith',
          email: 'issuer2@example.com',
          password: 'Password123!',
          role: 'Issuer',
          mobile: '9876543210',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 for invalid mobile number', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'employer3@example.com',
          password: 'Password123!',
          role: 'Employer',
          companyName: 'Test Company',
          mobile: '123', // Invalid - not 10 digits
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
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
