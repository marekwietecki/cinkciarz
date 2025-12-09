const request = require('supertest');
const app = require('../app');

const EMAIL = 'wlodzimierz@onet.pl';
const PASSWORD = 'wlodzimierz@onet.pl';
const CURRENCY_CODE_1 = 'USD';
const CURRENCY_CODE_2 = 'EUR';
const WRONG_DATA = 'PIPAPAPIAPAPO';

//-----------------------------------------------------------------------------
// Tests for wallet
// Checks: creating and deleting wallet, creating and deleting currency wallet
//-----------------------------------------------------------------------------


describe('POST /api/auth/register', () => {
    it('Creates a new user for wallet testing', async () => {
        const response = await request(app).post(`/api/auth/register`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('User created successfully');
    });
});


// Test for wallet working correctly
describe('Wallet working corectly with correct data', () => {
    it('Create wallet response with a 201 status code', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;

        const response = await request(app).post(`/api/wallet/create`).set('Authorization', `Bearer ${token}`);
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('Wallet created successfully');
    });
    it('Create currency wallets response with a 201 status code', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;

        const response10 = await request(app).post(`/api/wallet/create/${CURRENCY_CODE_1}`).set('Authorization', `Bearer ${token}`);
        expect(response10.statusCode).toBe(201);
        expect(response10.body.message).toBe(`Currency wallet (${CURRENCY_CODE_1}) created successfully`);

        const response11 = await request(app).post(`/api/wallet/create/${CURRENCY_CODE_2}`).set('Authorization', `Bearer ${token}`);
        expect(response11.statusCode).toBe(201);
        expect(response11.body.message).toBe(`Currency wallet (${CURRENCY_CODE_2}) created successfully`);
    });

    it('Get all currency wallets response with a 200 status code', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;

        const response = await request(app).get(`/api/wallet/`).set('Authorization', `Bearer ${token}`);
        expect(response.statusCode).toBe(200);

        // [
        //     { "amount": 0, "currency": "USD", "id": 42, "wallet_id": 35 },
        //     { "amount": 0, "currency": "EUR", "id": 43, "wallet_id": 35 }
        // ]
        expect(response.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ currency: `${CURRENCY_CODE_1}`, amount: 0 }),
                expect.objectContaining({ currency: `${CURRENCY_CODE_2}`, amount: 0 })
            ])
        );
    });

    it('Get wallet id and user_id with a 200 status code', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;

        const response = await request(app).get(`/api/wallet/id`).set('Authorization', `Bearer ${token}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBeGreaterThan(0);
        expect(response.body.user_id).toBeGreaterThan(0);
    });

    it('Delete one currency wallet and the wallet (which deletes second currency wallet)  - response with a 200 status code', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;

        const response10 = await request(app).delete(`/api/wallet/delete/${CURRENCY_CODE_1}`).set('Authorization', `Bearer ${token}`);
        expect(response10.statusCode).toBe(200);
        expect(response10.body.message).toBe(`Currency wallet (${CURRENCY_CODE_1}) deleted successfully`);

        const response11 = await request(app).delete(`/api/wallet/delete`).set('Authorization', `Bearer ${token}`);
        expect(response11.statusCode).toBe(200);
        expect(response11.body.message).toBe('Wallet with all currency wallets deleted successfully');
    });

});

describe('Wallet working corectly with WRONG data', () => {
    it('Get all currency wallets response with a 404 status code', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;
        
        const response = await request(app).get(`/api/wallet/`).set('Authorization', `Bearer ${token}`);
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Wallet not found');
    });

    it('Create wallet response with a 400 status code', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;

        const response10 = await request(app).post(`/api/wallet/create`).set('Authorization', `Bearer ${token}`);
        expect(response10.statusCode).toBe(201);
        expect(response10.body.message).toBe('Wallet created successfully');

        const response11 = await request(app).post(`/api/wallet/create`).set('Authorization', `Bearer ${token}`);
        expect(response11.statusCode).toBe(400);
        expect(response11.body.message).toBe('Wallet already exists');
    });

    it('Create currency wallets response with a 400 status code', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;
        
        const response10 = await request(app).post(`/api/wallet/create/${WRONG_DATA}`).set('Authorization', `Bearer ${token}`);
        expect(response10.statusCode).toBe(400);
        expect(response10.body.message).toBe('Invalid currency code');
        
        const response20 = await request(app).post(`/api/wallet/create/${CURRENCY_CODE_1}`).set('Authorization', `Bearer ${token}`);
        expect(response20.statusCode).toBe(201);
        expect(response20.body.message).toBe(`Currency wallet (${CURRENCY_CODE_1}) created successfully`);
        const response21 = await request(app).post(`/api/wallet/create/${CURRENCY_CODE_1}`).set('Authorization', `Bearer ${token}`);
        expect(response21.statusCode).toBe(400);
        expect(response21.body.message).toBe('Currency wallet already exists');
    });

    it('Delete one currency wallet response with a 400 status code', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;

        const response10 = await request(app).delete(`/api/wallet/delete/${WRONG_DATA}`).set('Authorization', `Bearer ${token}`);
        expect(response10.statusCode).toBe(400);
        expect(response10.body.message).toBe('Invalid currency code');
    });

    it('Delete one currency wallet response with a 404 status code', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;

        const response10 = await request(app).delete(`/api/wallet/delete/${CURRENCY_CODE_2}`).set('Authorization', `Bearer ${token}`);
        expect(response10.statusCode).toBe(404);
        expect(response10.body.message).toBe('Currency wallet not found');
    });

    // Cleanup
    it('Delete wallet response with a 200 status code', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;

        const response10 = await request(app).delete(`/api/wallet/delete/`).set('Authorization', `Bearer ${token}`);
        expect(response10.statusCode).toBe(200);
        expect(response10.body.message).toBe('Wallet with all currency wallets deleted successfully');
    });
});

describe('DELETE /api/auth/delete', () => {
    it('Deletes a user after wallet testing', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;
        const response = await request(app).delete(`/api/auth/delete`).set('Authorization', `Bearer ${token}`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('User deleted successfully');
    });
});