import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { RequiredParametersIncorrect } from '../../erros/required-parameters-incorrect';
import { prisma } from '../../lib/prisma';
import { getUserIDFromToken } from '../../utils/validate-token';

export async function userMeel(app: FastifyInstance){
    app.post('/create', async (request, reply) => {
        const jwt_token = request.cookies.session;
        
        if(jwt_token){
            const id = await getUserIDFromToken(request, reply, jwt_token);
            
            const mealBodySchema = z.object({
                name: z.string(),        
                description: z.string(),
                inDiet: z.boolean()
            });

            const _body = mealBodySchema.safeParse(request.body);
        
            if(_body.success == false){
                throw new RequiredParametersIncorrect();
            }

            const {name, description, inDiet} = _body.data;

            await prisma.meals.create({
                data: {
                    name,
                    description,
                    inDiet,
                    userId: id
                }
            });

            reply.status(201).send();
        } 
    });

    app.get('/', async (request, reply) => {
        const jwt_token = request.cookies.session;
        
        if(jwt_token){
            const id = await getUserIDFromToken(request, reply, jwt_token);

            const all_meals = await prisma.meals.findMany({
                where: {
                    userId: id
                }
            });

            reply.status(200).send({
                meals: all_meals
            });
        } 
    });

    app.get('/:id', async (request, reply) => {
        const parametersSchema = z.object({
            id: z.string().uuid()
        });

        const _parameters = parametersSchema.safeParse(request.params);

        if(_parameters.success == false ){
            throw new RequiredParametersIncorrect();
        }

        const jwt_token = request.cookies.session;
        
        if(jwt_token){
            const id = await getUserIDFromToken(request, reply, jwt_token);
        
            const all_meals = await prisma.meals.findMany({
                where: {
                    userId: id
                }
            });

            reply.status(200).send({
                meals: all_meals
            });
        } 
    });
} 