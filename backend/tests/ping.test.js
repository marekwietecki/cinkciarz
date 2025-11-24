const request = require('supertest');
const app = require('../app');

describe('GET /api/ping', () => {
    it('Resonse with a 200 status code', async () => {
        const response = await request(app).get('/api/ping');
        expect(response.statusCode).toBe(200);
    });
});