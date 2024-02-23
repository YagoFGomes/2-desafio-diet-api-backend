import { app } from '../../app';
import { execSync } from 'node:child_process';
import { test, beforeAll, afterAll, describe, beforeEach, expect } from 'vitest';
import request from 'supertest';
import { compare}  from 'bcryptjs';

describe('User Routes', ()=> {

    beforeAll(async () => {
        await app.ready();
    });
    
    // tudo que tiver aqui roda depois dos testes
    afterAll(async () => {
        await app.close();
    });
    
    beforeEach(async () => {
        execSync('npx prisma migrate reset --force');
    });

    describe('Create user and validate fields', () => {

        test('Can create a new user', async () => {

            const NewManUser = {
                'username': 'yago.gomes',
                'password': '123456',
                'gender': 'men'
            };

            const responseCreateManUser = await request(app.server)
                .post('/api/user/register')
                .send(NewManUser)
                .expect(201);

            const menObjectUser = responseCreateManUser.body.user;

            expect(menObjectUser).toEqual(expect.objectContaining({
                id: expect.any(String),
                username: 'yago.gomes',
                password: expect.any(String),
                gender: 'men',
                profileImage: '/public/default-profile-images/default-image-men.png'
            }));

            const NewWomanUser = {
                'username': 'thais.nunes',
                'password': '123456',
                'gender': 'woman'
            };

            const responseCreateWomanUser = await request(app.server)
                .post('/api/user/register')
                .send(NewWomanUser)
                .expect(201);

            const womanObjectUser = responseCreateWomanUser.body.user;

            expect(womanObjectUser).toEqual(expect.objectContaining({
                id: expect.any(String),
                username: 'thais.nunes',
                password: expect.any(String),
                gender: 'woman',
                profileImage: '/public/default-profile-images/default-image-woman.png'
            }));

        });

        test('User id must be uuid4', async () => {

            const NewManUser = {
                'username': 'yago.gomes',
                'password': '123456',
                'gender': 'men'
            };

            const responseCreateManUser = await request(app.server)
                .post('/api/user/register')
                .send(NewManUser)
                .expect(201);

            const menObjectUser = responseCreateManUser.body.user;

            // regex to verify if is uuid4
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            expect(uuidRegex.test(menObjectUser.id)).toBe(true);
        });

        test('User password must be hashed', async () => {

            const NewManUser = {
                'username': 'yago.gomes',
                'password': '123456',
                'gender': 'men'
            };

            const responseCreateManUser = await request(app.server)
                .post('/api/user/register')
                .send(NewManUser)
                .expect(201);

            const menObjectUser = responseCreateManUser.body.user;

            // verify if password is hashed
            const isMatch = await compare('123456', menObjectUser.password);
            expect(isMatch).toBe(true);
        });
    });

    describe('Loggin user', () => {
        test.only('User can loggin using username and password', async () => {

            const NewUser = {
                'username': 'yago.gomes',
                'password': '123456',
                'gender': 'men'
            };

            await request(app.server)
                .post('/api/user/register')
                .send(NewUser)
                .expect(201);

            const userLogin = {
                'username': 'yago.gomes',
                'password': '123456',
            };

            const userLoginResponse = await request(app.server)
                .post('/api/user/login')
                .send(userLogin)
                .expect(200);

            const objectUser = userLoginResponse.body.user;

            expect(objectUser).toEqual(expect.objectContaining({
                id: expect.any(String),
                username: 'yago.gomes',
                profileImage: '/public/default-profile-images/default-image-men.png'
            }));
        });
    });
});