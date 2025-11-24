const request = require('supertest');
const app = require('../app');

const EMAIL = 'aleksandra@wp.pl';
const PASSWORD = 'aleksandra@wp.pl';
const NEW_PASSWORD = 'aleksandra@wp.pl';
const WRONG_DATA = 'WRONG@wp.pl';


//-----------------------------------------------------------------------------
// Tests for auth
// Checks: register, login, change password, delete account
//-----------------------------------------------------------------------------



// Test for user account working
describe('POST /api/auth/register', () => {
    it('Resonse with a 201 status code', async () => {
        const response = await request(app).post(`/api/auth/register`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('User created successfully');
    });
});

describe('POST /api/auth/login', () => {
    it('Resonse with a 200 status code and token', async () => {
        const response = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBeDefined();
    });
});

describe('PUT /api/auth/change-password', () => {
    it('Resonse with a 200 status code', async () => {
        const response = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response.body.token;
        const passwordChangeResponse = await request(app).put(`/api/auth/change-password`).set({ Authorization: `Bearer ${token}` }).send({ oldPassword: `${PASSWORD}`, newPassword: `${NEW_PASSWORD}` });
        expect(passwordChangeResponse.statusCode).toBe(200);
        expect(passwordChangeResponse.body.message).toBe("Password changed successfully");
    })
})

describe('DELETE /api/auth/delete', () => {
    it('Resonse with a 200 status code', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;
        const response = await request(app).delete(`/api/auth/delete`).set('Authorization', `Bearer ${token}`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('User deleted successfully');
    });
});


// Test for inccorrect data provided
describe('POST /api/auth/register', () => {
    it('Resonse with a 400 status code', async () => {
        const response1 = await request(app).post(`/api/auth/register`).send({ email: `${EMAIL}` });
        expect(response1.statusCode).toBe(400);
        expect(response1.body.message).toBe('Email and password are required');

        const response2 = await request(app).post(`/api/auth/register`).send({ password: `${PASSWORD}` });
        expect(response2.statusCode).toBe(400);
        expect(response2.body.message).toBe('Email and password are required');

        // TODO User needs to be deleted
        const response3 = await request(app).post(`/api/auth/register`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        expect(response3.statusCode).toBe(201);
        const response4 = await request(app).post(`/api/auth/register`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        expect(response4.statusCode).toBe(400);
        expect(response4.body.message).toBe('User already exists');
    });
});
describe('POST /api/auth/login', () => {
    it('Resonse with a 400 status code', async () => {
        const response20 = await request(app).post(`/api/auth/login`).send({ password: `${PASSWORD}` });
        const response21 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}` });
        const response22 = await request(app).post(`/api/auth/login`).send({});
        expect(response20.statusCode).toBe(400);
        expect(response20.body.message).toBe('Email and password are required');
        expect(response21.statusCode).toBe(400);
        expect(response21.body.message).toBe('Email and password are required');
        expect(response22.statusCode).toBe(400);
        expect(response22.body.message).toBe('Email and password are required');

    });
    it('Resonse with a 401 status code', async () => {
        const response30 = await request(app).post(`/api/auth/login`).send({ email: `${WRONG_DATA}`, password: `${WRONG_DATA}` });
        const response31 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${WRONG_DATA}` });
        const response32 = await request(app).post(`/api/auth/login`).send({ email: `${WRONG_DATA}`, password: `${PASSWORD}` });
        expect(response30.statusCode).toBe(401);
        expect(response30.body.message).toBe('Invalid email or password');
        expect(response31.statusCode).toBe(401);
        expect(response31.body.message).toBe('Invalid email or password');
        expect(response32.statusCode).toBe(401);
        expect(response32.body.message).toBe('Invalid email or password');
    });
});
describe('PUT /api/auth/change-password', () => {
    it('Resonse with a 401 status code', async () => {
        const response1 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response1.body.token;

        const response2 = await request(app).put(`/api/auth/change-password`).set({ Authorization: `Bearer ${token}ABCD` }).send({ oldPassword: `${PASSWORD}`, newPassword: `${NEW_PASSWORD}` });
        expect(response2.statusCode).toBe(403);
        expect(response2.body.message).toBe("Invalid token");

        const response3 = await request(app).put(`/api/auth/change-password`).set({ Authorization: `Bearer ${token}` }).send({ oldPassword: `${WRONG_DATA}`, newPassword: `${NEW_PASSWORD}` });
        expect(response3.statusCode).toBe(401);
        expect(response3.body.message).toBe("Invalid password");
    })
})
describe('DELETE /api/auth/delete', () => {
    it('Resonse with a 401 status code', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;

        const response10 = await request(app).delete(`/api/auth/delete`).set({ Authorization: `Bearer ${token}` }).send({ email: `${WRONG_DATA}`, password: `${PASSWORD}` });
        expect(response10.statusCode).toBe(401);
        expect(response10.body.message).toBe('Invalid email or password');

        const response11 = await request(app).delete(`/api/auth/delete`).set({ Authorization: `Bearer ${token}` }).send({ email: `${EMAIL}`, password: `${WRONG_DATA}` });
        expect(response11.statusCode).toBe(401);
        expect(response11.body.message).toBe('Invalid email or password');
    });
    it('Resonse with a 403 status code', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;
        const response = await request(app).delete(`/api/auth/delete`).set('Authorization', `Bearer ${token}ABCD`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        expect(response.statusCode).toBe(403);
        expect(response.body.message).toBe('Invalid token');
    });

    // TODO User needs to be deleted
    it('Resonse with a 200 status code', async () => {
        const response0 = await request(app).post(`/api/auth/login`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        const token = response0.body.token;
        const response = await request(app).delete(`/api/auth/delete`).set('Authorization', `Bearer ${token}`).send({ email: `${EMAIL}`, password: `${PASSWORD}` });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('User deleted successfully');
    })
});