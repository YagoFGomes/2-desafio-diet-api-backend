import { app } from '../../app';
import { execSync } from 'node:child_process';
import { test, beforeAll, afterAll, describe, beforeEach, expect } from 'vitest';
import request from 'supertest';

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

            await request(app.server)
                .post('/api/user/register')
                .send(NewManUser)
                .expect(201);

            const NewWomanUser = {
                'username': 'thais.nunes',
                'password': '123456',
                'gender': 'woman'
            };

            await request(app.server)
                .post('/api/user/register')
                .send(NewWomanUser)
                .expect(201);
        });
    });

    describe('Loggin user', () => {
        test('User can loggin using username and password', async () => {

            const NewUser = {
                'username': 'yago.gomes',
                'password': '123456',
                'gender': 'men'
            };

            await request(app.server)
                .post('/api/user/register')
                .send(NewUser)
                .expect(201);

            // Faz o login para obter o cookie com o JWT
            await request(app.server)
                .post('/api/user/login')
                .send({
                    username: 'yago.gomes',
                    password: '123456'
                })
                .expect(200);

        });
    });

    describe('Can get a user info', () => {
        test('User can get their info using JWT token', async () => {
            // Cria um novo usuário
            const newUser = {
                username: 'yago.gomes',
                password: '123456',
                gender: 'men'
            };
        
            // Registra o usuário
            await request(app.server)
                .post('/api/user/register')
                .send(newUser);
        
            // Faz o login para obter o cookie com o JWT
            const loginResponse = await request(app.server)
                .post('/api/user/login')
                .send({
                    username: 'yago.gomes',
                    password: '123456'
                })
                .expect(200);
        
            // Extrai o cookie do header da resposta
            const cookie = loginResponse.headers['set-cookie'][0];

            // Usa o cookie para acessar a rota de informações do usuário
            const userResponse = await request(app.server)
                .get('/api/user/')
                .set('Cookie', cookie)
                .expect(200);
            const userInfo = userResponse.body.user;
        
            // Valida as informações do usuário
            expect(userInfo).toEqual(expect.objectContaining({
                id: expect.any(String),
                username: 'yago.gomes',
                gender: 'men',
                profileImage: expect.any(String) // ou a URL exata se você souber
            }));
        });
    });

    describe('User can logout', ()=> {
        test('User can logout and cookie is cleared', async () => {
            // Cria um novo usuário
            const newUser = {
                username: 'yago.gomes',
                password: '123456',
                gender: 'men'
            };
        
            // Registra o usuário
            await request(app.server)
                .post('/api/user/register')
                .send(newUser);
        
            // Faz o login para obter o cookie com o JWT
            const loginResponse = await request(app.server)
                .post('/api/user/login')
                .send({
                    username: 'yago.gomes',
                    password: '123456'
                });
        
            // Extrai o cookie do header da resposta
            const cookie = loginResponse.headers['set-cookie'];
        
            // Faz a requisição de logout
            const logoutResponse = await request(app.server)
                .post('/api/user/logout')
                .set('Cookie', cookie)
                .expect(200);
        
            // Verifica se o cookie foi removido
            expect(logoutResponse.headers['set-cookie']).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('session=;')
                ])
            );
        
            // Verifica a mensagem de resposta
            expect(logoutResponse.body.message).toBe('Logout successfuly');
        });
    });
});