const request = require('supertest');
const app = require('../app');

const EMAIL = 'wladyslawa@onet.pl';
const PASSWORD = 'wladyslawa@onet.pl';
const CURRENCY_CODE_1 = 'USD';
const CURRENCY_CODE_2 = 'EUR';
const RATE_1_2 = 10;
const WRONG_DATA = 'PIPAPAPIAPAPO';
const AMOUNT_SMALL = 1;
const AMOUNT_NORMAL = 10;
const AMOUNT_BIG = 100;

//-----------------------------------------------------------------------------
// Tests for transactions
// Checks: deposit, withdraw and exchange transactions
//-----------------------------------------------------------------------------


// Data required for transactions
describe('POST /api/auth/register', () => {
    it('Creates a new user for transaction testing', async () => {
        const response = await request(app).post(`/api/auth/register`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('User created successfully');
    });
});
describe('POST /api/wallet/create', () => {
    it('Creates a new wallet for transaction testing', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;
        
        const response = await request(app).post(`/api/wallet/create`).set('Authorization', `Bearer ${token}`);
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('Wallet created successfully');
    });
});

describe('Transactions works corectly with correct data', () => {
    it('Deposits money to wallet with without existing currency wallet (POST /api/transaction/deposit)', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;
        
        const response = await request(app).post(`/api/transaction/deposit`).set('Authorization', `Bearer ${token}`).send({ amount: AMOUNT_SMALL, currency: CURRENCY_CODE_1 });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Deposit successful');
        // After test CURRENCY_CODE_1 wallet has amount of AMOUNT_SMALL
    });
    it('Deposits money to wallet with existing currency wallet (POST /api/transaction/deposit)', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;
        
        const response11 = await request(app).post(`/api/transaction/deposit`).set('Authorization', `Bearer ${token}`).send({ amount: AMOUNT_SMALL, currency: CURRENCY_CODE_1 });
        expect(response11.statusCode).toBe(200);
        expect(response11.body.message).toBe('Deposit successful');
        
        const response12 = await request(app).post(`/api/transaction/deposit`).set('Authorization', `Bearer ${token}`).send({ amount: AMOUNT_NORMAL, currency: CURRENCY_CODE_1 });
        expect(response12.statusCode).toBe(200);
        expect(response12.body.message).toBe('Deposit successful');
        
        const response22 = await request(app).get(`/api/wallet/`).set('Authorization', `Bearer ${token}`);
        expect(response22.statusCode).toBe(200);

        // [
        //     { "amount": 12, "currency": "USD", "id": 42, "wallet_id": 35 },
        // ]
        expect(response22.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ currency: `${CURRENCY_CODE_1}`, amount: 12 })
            ])
        );
        // After test CURRENCY_CODE_1 wallet has amount of (2 * AMOUNT_SMALL + AMOUNT_NORMAL)
    });
    it('Withdraws money from wallet with existing currency wallet (POST /api/transaction/withdraw)', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;
        
        const response11 = await request(app).post(`/api/transaction/deposit`).set('Authorization', `Bearer ${token}`).send({ amount: AMOUNT_SMALL, currency: CURRENCY_CODE_1 });
        expect(response11.statusCode).toBe(200);
        expect(response11.body.message).toBe('Deposit successful');
        
        const response12 = await request(app).post(`/api/transaction/withdraw`).set('Authorization', `Bearer ${token}`).send({ amount: AMOUNT_SMALL, currency: CURRENCY_CODE_1 });
        expect(response12.statusCode).toBe(200);
        expect(response12.body.message).toBe('Withdraw successful');
        const response13 = await request(app).post(`/api/transaction/withdraw`).set('Authorization', `Bearer ${token}`).send({ amount: AMOUNT_NORMAL, currency: CURRENCY_CODE_1 });
        expect(response13.statusCode).toBe(200);
        expect(response13.body.message).toBe('Withdraw successful');
        // After test CURRENCY_CODE_1 wallet has amount of (2 * AMOUNT_SMALL)
    });
    it('Exchanges money from one currency wallet to another (POST /api/transaction/exchange)', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;
        
        const response11 = await request(app).post(`/api/transaction/exchange`).set('Authorization', `Bearer ${token}`)
        .send({ fromCurrency: CURRENCY_CODE_1, toCurrency: CURRENCY_CODE_2, fromAmount: AMOUNT_SMALL, toAmount: AMOUNT_NORMAL, rate: RATE_1_2 });
        expect(response11.statusCode).toBe(200);
        expect(response11.body.message).toBe('Exchange successful');

        const response22 = await request(app).get(`/api/wallet/`).set('Authorization', `Bearer ${token}`);
        expect(response22.statusCode).toBe(200);
        expect(response22.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ currency: `${CURRENCY_CODE_1}`, amount: 1 }),
                expect.objectContaining({ currency: `${CURRENCY_CODE_2}`, amount: 10 })
            ])
        );
        // After test
        // CURRENCY_CODE_1 wallet has amount of AMOUNT_SMALL
        // CURRENCY_CODE_2 wallet has amount of AMOUNT_NORMAL
    })
    it('Gets transaction history with a 200 status code', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;
        const response = await request(app).get(`/api/transaction/history`).set('Authorization', `Bearer ${token}`);
        expect(response.statusCode).toBe(200);
        
        const response11 = await request(app).get(`/api/transaction/history`).set('Authorization', `Bearer ${token}`).query({ limit: 2, order: 'asc' });
        expect(response11.statusCode).toBe(200);
        // {
        //   id: 249,
        //   wallet_id: 285,
        //   type: 'deposit',
        //   from_currency: null,
        //   to_currency: 'USD',
        //   from_amount: null,
        //   to_amount: 1,
        //   rate: null,
        //   date: '2025-12-09T23:20:51.458'
        // },
        // {
        //   id: 250,
        //   wallet_id: 285,
        //   type: 'deposit',
        //   from_currency: null,
        //   to_currency: 'USD',
        //   from_amount: null,
        //   to_amount: 1,
        //   rate: null,
        //   date: '2025-12-09T23:20:51.519'
        // }
        expect(response11.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: expect.any(Number), wallet_id: expect.any(Number), type: 'deposit', from_currency: null, to_currency: `${CURRENCY_CODE_1}`, from_amount: null, to_amount: 1, rate: null, date: expect.any(String) }),
                expect.objectContaining({ id: expect.any(Number), wallet_id: expect.any(Number), type: 'deposit', from_currency: null, to_currency: `${CURRENCY_CODE_1}`, from_amount: null, to_amount: 1, rate: null, date: expect.any(String) }),
            ])
        );


        const response12 = await request(app).get(`/api/transaction/history`).set('Authorization', `Bearer ${token}`).query({ limit: 2, order: 'desc' });
        expect(response12.statusCode).toBe(200);
        //     {
        //       id: 219,
        //       wallet_id: 259,
        //       type: 'withdraw',
        //       from_currency: 'USD',
        //       to_currency: null,
        //       from_amount: 10,
        //       to_amount: null,
        //       rate: null,
        //       date: '2025-12-09'
        //     },
        //     {
        //       id: 220,
        //       wallet_id: 259,
        //       type: 'exchange',
        //       from_currency: 'USD',
        //       to_currency: 'EUR',
        //       from_amount: 1,
        //       to_amount: 10,
        //       rate: 10,
        //       date: '2025-12-09'
        //     }
        expect(response12.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: expect.any(Number), wallet_id: expect.any(Number), type: 'withdraw', from_currency: `${CURRENCY_CODE_1}`, to_currency: null, from_amount: 10, to_amount: null, rate: null, date: expect.any(String) }),
                expect.objectContaining({ id: expect.any(Number), wallet_id: expect.any(Number), type: 'exchange', from_currency: `${CURRENCY_CODE_1}`, to_currency: `${CURRENCY_CODE_2}`, from_amount: 1, to_amount: 10, rate: 10, date: expect.any(String) }),
            ])
        );
    });
});


// Cleanup
describe('Cleanup', () => {
    it('Deletes wallet after transaction testing (POST /api/wallet/delete)', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;

        const response11 = await request(app).delete(`/api/wallet/delete`).set('Authorization', `Bearer ${token}`);
        expect(response11.statusCode).toBe(200);
        expect(response11.body.message).toBe('Wallet with all currency wallets deleted successfully');
    });
    it('Deletes a user after wallet testing (DELETE /api/auth/delete)', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;
        const response = await request(app).delete(`/api/auth/delete`).set('Authorization', `Bearer ${token}`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('User deleted successfully');
    });
});