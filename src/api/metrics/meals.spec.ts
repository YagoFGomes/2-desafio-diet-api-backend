import { app } from '../../app';
import { execSync } from 'node:child_process';
import { test, beforeAll, afterAll, describe, beforeEach, expect } from 'vitest';
import request from 'supertest';


describe('Metrics Routes', ()=> {

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

    describe('Get Metrics', () => {
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

            // Create 1 meal
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

            // Create 2 meal
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

            // Create 3 meal
            await request(app.server)
                .post('/api/meal/create')
                .set('Cookie', cookie)
                .send({
                    name: 'Third',
                    description: 'Meal',
                    mealHour: '2024-02-24T15:13:19.627Z',
                    inDiet: true
                })
                .expect(201);

            // Create 4 meal
            await request(app.server)
                .post('/api/meal/create')
                .set('Cookie', cookie)
                .send({
                    name: 'Fourth',
                    description: 'Meal',
                    mealHour: '2024-02-24T15:13:19.627Z',
                    inDiet: true
                })
                .expect(201);
            
            await request(app.server)
                .post('/api/meal/create')
                .set('Cookie', cookie)
                .send({
                    name: 'Fifth',
                    description: 'Meal',
                    mealHour: '2024-02-24T15:13:19.627Z',
                    inDiet: false
                })
                .expect(201);
                
            await request(app.server)
                .post('/api/meal/create')
                .set('Cookie', cookie)
                .send({
                    name: 'Sixth',
                    description: 'Meal',
                    mealHour: '2024-02-24T15:13:19.627Z',
                    inDiet: true
                })
                .expect(201);
            
            const responseMeals = await request(app.server)
                .get('/api/user/metrics')
                .set('Cookie', cookie)
                .expect(200);

            expect(responseMeals.body).toEqual(expect.objectContaining({
                userId: expect.any(String),
                metrics: expect.objectContaining({
                    countMeals: 6,
                    mealsInDiet: 4,
                    mealsOutDiet: 2,
                    bestStrick: 3
                })
            }));
        });
    });

});