import { app } from '../../app';
import { execSync } from 'node:child_process';
import { test, beforeAll, afterAll, describe, beforeEach, expect } from 'vitest';
import request from 'supertest';


describe('Meal Routes', ()=> {

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

    describe('CRUD Meals', () => {

        test('User can create a new meal', async () => {

            const NewManUser = {
                'username': 'yago.gomes',
                'password': '123456',
                'gender': 'men'
            };

            await request(app.server)
                .post('/api/user/register')
                .send(NewManUser)
                .expect(201);

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
            await request(app.server)
                .post('/api/meal/create')
                .set('Cookie', cookie)
                .send({
                    name: 'Meal',
                    description: 'Lunch',
                    mealHour: '2024-02-24T15:13:19.627Z',
                    inDiet: false
                })
                .expect(201);

        });

        test('User can get all meals', async () => {

            const NewManUser = {
                'username': 'yago.gomes',
                'password': '123456',
                'gender': 'men'
            };

            await request(app.server)
                .post('/api/user/register')
                .send(NewManUser)
                .expect(201);

            const loginResponse = await request(app.server)
                .post('/api/user/login')
                .send({
                    username: 'yago.gomes',
                    password: '123456'
                })
                .expect(200);
        
            // Extrai o cookie do header da resposta
            const cookie = loginResponse.headers['set-cookie'][0];

            // Create first meal
            await request(app.server)
                .post('/api/meal/create')
                .set('Cookie', cookie)
                .send({
                    name: 'First',
                    description: 'Meal',
                    mealHour: '2024-02-24T15:13:19.627Z',
                    inDiet: false
                })
                .expect(201);
            // Create second meal
            await request(app.server)
                .post('/api/meal/create')
                .set('Cookie', cookie)
                .send({
                    name: 'Second',
                    description: 'Meal',
                    mealHour: '2024-02-24T15:13:19.627Z',
                    inDiet: true
                })
                .expect(201);
            
            const responseMeals = await request(app.server)
                .get('/api/meal/')
                .set('Cookie', cookie)
                .expect(200);

            expect(responseMeals.body.meals.length).toBe(2);
        });

        test('User can get meals by id', async () => {

            const NewManUser = {
                'username': 'yago.gomes',
                'password': '123456',
                'gender': 'men'
            };

            await request(app.server)
                .post('/api/user/register')
                .send(NewManUser)
                .expect(201);

            const loginResponse = await request(app.server)
                .post('/api/user/login')
                .send({
                    username: 'yago.gomes',
                    password: '123456'
                })
                .expect(200);
        
            // Extrai o cookie do header da resposta
            const cookie = loginResponse.headers['set-cookie'][0];

            // Create first meal
            await request(app.server)
                .post('/api/meal/create')
                .set('Cookie', cookie)
                .send({
                    name: 'First',
                    description: 'Meal',
                    mealHour: '2024-02-24T15:13:19.627Z',
                    inDiet: false
                })
                .expect(201);
            
            const responseMeals = await request(app.server)
                .get('/api/meal/')
                .set('Cookie', cookie)
                .expect(200);

            const mealId = responseMeals.body.meals[0].id;

            const mealResponse = await request(app.server)
                .get(`/api/meal/${mealId}`)
                .set('Cookie', cookie)
                .expect(200);


            expect(mealResponse.body.meal).toEqual(expect.objectContaining({
                id: expect.any(String),
                name: 'First',
                description: 'Meal',
                inDiet: false,
                mealHour: '2024-02-24T15:13:19.627Z',
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                userId: expect.any(String),
            }));
        });

        test('User can edit meals using id', async () => {

            const NewManUser = {
                'username': 'yago.gomes',
                'password': '123456',
                'gender': 'men'
            };

            await request(app.server)
                .post('/api/user/register')
                .send(NewManUser)
                .expect(201);

            const loginResponse = await request(app.server)
                .post('/api/user/login')
                .send({
                    username: 'yago.gomes',
                    password: '123456'
                })
                .expect(200);
        
            // Extrai o cookie do header da resposta
            const cookie = loginResponse.headers['set-cookie'][0];

            // Create first meal
            await request(app.server)
                .post('/api/meal/create')
                .set('Cookie', cookie)
                .send({
                    name: 'First',
                    description: 'Meal',
                    mealHour: '2024-02-24T15:13:19.627Z',
                    inDiet: false
                })
                .expect(201);
            
            const responseMeals = await request(app.server)
                .get('/api/meal/')
                .set('Cookie', cookie)
                .expect(200);

            const mealId = responseMeals.body.meals[0].id;

            const mealResponse = await request(app.server)
                .patch(`/api/meal/${mealId}`)
                .set('Cookie', cookie)
                .send({
                    name: 'Edited Name',
                    description: 'Edited Description',
                    inDiet: true,
                    mealHour: '2024-02-23T15:13:19.627Z',
                })
                .expect(200);


            expect(mealResponse.body.meal).toEqual(expect.objectContaining({
                id: expect.any(String),
                name: 'Edited Name',
                description: 'Edited Description',
                inDiet: true,
                mealHour: '2024-02-23T15:13:19.627Z',
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                userId: expect.any(String),
            }));
        });

        test('User can delete meals by id', async () => {

            const NewManUser = {
                'username': 'yago.gomes',
                'password': '123456',
                'gender': 'men'
            };

            await request(app.server)
                .post('/api/user/register')
                .send(NewManUser)
                .expect(201);

            const loginResponse = await request(app.server)
                .post('/api/user/login')
                .send({
                    username: 'yago.gomes',
                    password: '123456'
                })
                .expect(200);
        
            // Extrai o cookie do header da resposta
            const cookie = loginResponse.headers['set-cookie'][0];

            // Create first meal
            await request(app.server)
                .post('/api/meal/create')
                .set('Cookie', cookie)
                .send({
                    name: 'First',
                    description: 'Meal',
                    mealHour: '2024-02-24T15:13:19.627Z',
                    inDiet: false
                })
                .expect(201);
            
            const responseMeals = await request(app.server)
                .get('/api/meal/')
                .set('Cookie', cookie)
                .expect(200);

            const mealId = responseMeals.body.meals[0].id;

            await request(app.server)
                .delete(`/api/meal/${mealId}`)
                .set('Cookie', cookie)
                .expect(200);


            
        });
    });

});