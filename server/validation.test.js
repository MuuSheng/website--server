const request = require('supertest');
const express = require('express');
const validator = require('./validation');

// 创建一个测试应用
const app = express();
app.use(express.json());

app.post('/test-validate-username', (req, res) => {
  const { username } = req.body;
  const result = validator.validateUsername(username);
  res.json(result);
});

app.post('/test-validate-password', (req, res) => {
  const { password } = req.body;
  const result = validator.validatePassword(password);
  res.json(result);
});

describe('Validation Functions', () => {
  describe('validateUsername', () => {
    it('should validate a correct username', async () => {
      const response = await request(app)
        .post('/test-validate-username')
        .send({ username: 'testuser' })
        .expect(200);
      
      expect(response.body.isValid).toBe(true);
    });

    it('should reject an empty username', async () => {
      const response = await request(app)
        .post('/test-validate-username')
        .send({ username: '' })
        .expect(200);
      
      expect(response.body.isValid).toBe(false);
    });

    it('should reject a username that is too short', async () => {
      const response = await request(app)
        .post('/test-validate-username')
        .send({ username: 'ab' })
        .expect(200);
      
      expect(response.body.isValid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate a correct password', async () => {
      const response = await request(app)
        .post('/test-validate-password')
        .send({ password: 'password123' })
        .expect(200);
      
      expect(response.body.isValid).toBe(true);
    });

    it('should reject an empty password', async () => {
      const response = await request(app)
        .post('/test-validate-password')
        .send({ password: '' })
        .expect(200);
      
      expect(response.body.isValid).toBe(false);
    });

    it('should reject a password without numbers', async () => {
      const response = await request(app)
        .post('/test-validate-password')
        .send({ password: 'password' })
        .expect(200);
      
      expect(response.body.isValid).toBe(false);
    });

    it('should reject a password without letters', async () => {
      const response = await request(app)
        .post('/test-validate-password')
        .send({ password: '123456' })
        .expect(200);
      
      expect(response.body.isValid).toBe(false);
    });
  });
});