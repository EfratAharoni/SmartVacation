// Basic test setup example
import { expect } from 'chai';
import request from 'supertest';
import app from '../main.js'; // Adjust import path

describe('API Tests', () => {
  describe('GET /api/attractions', () => {
    it('should return all attractions', (done) => {
      request(app)
        .get('/api/attractions')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.be.an('array');
          done();
        });
    });
  });
});