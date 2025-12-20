const request = require('supertest');
const app = require('../app');

const TABLE_LETTER = 'A';
const CURRENCY_CODE_1 = 'USD';
const CURRENCY_CODE_2 = 'EUR';
const DATE_1 = '2024-10-10';
const DATE_2 = '2024-10-13';

//-----------------------------------------------------------------------------
// Tests for nbp routes
// Checks: deposit, withdraw and exchange transactions
//-----------------------------------------------------------------------------

describe('NBP API works corectly with correct data', () => {
    it('Returns table of currencies rates (GET /api/nbp/table/:tableLetter)', async () => {
        const response0 = await request(app).get(`/api/nbp/table/${TABLE_LETTER}`);
        expect(response0.statusCode).toBe(200);
        expect(response0.body.success).toBe(true);
        expect(response0.body.data).toEqual(expect.arrayContaining([]));
    });
    it('Returns table of currencies rates in date range (GET /api/nbp/table/:tableLetter?startDate&endDate)', async () => {
        const response0 = await request(app).get(`/api/nbp/table/${TABLE_LETTER}?startDate=${DATE_1}&endDate=${DATE_2}`);
        expect(response0.statusCode).toBe(200);
        expect(response0.body.success).toBe(true);
        expect(response0.body.data).toEqual(expect.arrayContaining([]));

        const response11 = await request(app).get(`/api/nbp/table/${TABLE_LETTER}?startDate=${DATE_2}&endDate=${DATE_1}`);
        expect(response11.statusCode).toBe(200);
        expect(response11.body.success).toBe(true);
        expect(response11.body.data).toEqual(expect.arrayContaining([]));
        
        const response20 = await request(app).get(`/api/nbp/table/${TABLE_LETTER}?endDate=${DATE_2}&startDate=${DATE_1}`);
        expect(response20.statusCode).toBe(200);
        expect(response20.body.success).toBe(true);
        expect(response20.body.data).toEqual(expect.arrayContaining([]));
    });
    
    it('Returns table of exchange rates (GET /api/nbp/rate/:tableLetter/:currencyCode)', async () => {
        const response0 = await request(app).get(`/api/nbp/rate/${TABLE_LETTER}/${CURRENCY_CODE_1}`);
        expect(response0.statusCode).toBe(200);
        expect(response0.body.success).toBe(true);
        expect(response0.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ date: expect.any(String), rate: expect.any(Number) })
        ]));
        
        const response1 = await request(app).get(`/api/nbp/rate/${TABLE_LETTER}/${CURRENCY_CODE_2}`);
        expect(response1.statusCode).toBe(200);
        expect(response1.body.success).toBe(true);
        expect(response1.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ date: expect.any(String), rate: expect.any(Number) })
        ]));
    });
    
    it('Returns table of exchange rates in date range (GET /api/nbp/rate/:tableLetter/:currencyCode?startDate&endDate)', async () => {
        const response0 = await request(app).get(`/api/nbp/rate/${TABLE_LETTER}/${CURRENCY_CODE_1}?startDate=${DATE_1}&endDate=${DATE_2}`);
        expect(response0.statusCode).toBe(200);
        expect(response0.body.success).toBe(true);
        expect(response0.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ date: expect.any(String), rate: expect.any(Number) })
        ]));
        
        const response1 = await request(app).get(`/api/nbp/rate/${TABLE_LETTER}/${CURRENCY_CODE_2}?startDate=${DATE_1}&endDate=${DATE_2}`);
        expect(response1.statusCode).toBe(200);
        expect(response1.body.success).toBe(true);
        expect(response1.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ date: expect.any(String), rate: expect.any(Number) })
        ]));
        
        const response11 = await request(app).get(`/api/nbp/rate/${TABLE_LETTER}/${CURRENCY_CODE_1}?startDate=${DATE_2}&endDate=${DATE_1}`);
        expect(response11.statusCode).toBe(200);
        expect(response11.body.success).toBe(true);
        expect(response11.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ date: expect.any(String), rate: expect.any(Number) })
        ]));
        
        const response12 = await request(app).get(`/api/nbp/rate/${TABLE_LETTER}/${CURRENCY_CODE_2}?endDate=${DATE_1}&startDate=${DATE_2}`);
        expect(response12.statusCode).toBe(200);
        expect(response12.body.success).toBe(true);
        expect(response12.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ date: expect.any(String), rate: expect.any(Number) })
        ]));
    });
});