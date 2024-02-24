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
                inDiet: z.boolean(),
                mealHour: z.string()
            });

            const _body = mealBodySchema.safeParse(request.body);
        
            if(_body.success == false){
                throw new RequiredParametersIncorrect();
            }

            const {name, description, inDiet, mealHour} = _body.data;

            await prisma.meals.create({
                data: {
                    name,
                    description,
                    inDiet,
                    mealHour,
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
        const jwt_token = request.cookies.session;
        
        if(jwt_token){
            const user_id = await getUserIDFromToken(request, reply, jwt_token);

            const parametersSchema = z.object({
                id: z.string().uuid()
            });
    
            const _parameters = parametersSchema.safeParse(request.params);
    
            if(_parameters.success == false ){
                throw new RequiredParametersIncorrect();
            }
    
            const { id } = _parameters.data;

            try {
                const meal = await prisma.meals.findUnique({
                    where: {
                        id,
                        userId: user_id
                    }
                });

                if(meal == null){
                    return reply.status(404).send();
                }

                reply.status(200).send({ meal });

            } catch (err){
                return reply.status(404).send();
            }
        } 
    });

    app.patch('/:id', async (request, reply) => {
        const jwt_token = request.cookies.session;
        
        if(jwt_token){
            const user_id = await getUserIDFromToken(request, reply, jwt_token);

            const parametersSchema = z.object({
                id: z.string().uuid(),
            });
    
            const _parameters = parametersSchema.safeParse(request.params);

            const bodySchema = z.object({
                name: z.string(),
                description: z.string(),
                inDiet: z.boolean(),
                mealHour: z.string()
            });

            const _bodySchema = bodySchema.safeParse(request.body);
    
            if(_parameters.success == false || _bodySchema.success == false ){
                throw new RequiredParametersIncorrect();
            }
            
    
            const { id } = _parameters.data;
            const { name, description, mealHour, inDiet } = _bodySchema.data;

            try {
                const existingTask = await prisma.meals.findUnique({ where: { id } });

                if (!existingTask) {
                    return reply.status(404).send();
                }

                const meal = await prisma.meals.update({
                    where: { 
                        id,
                        userId: user_id
                    },
                    data: {
                        name, 
                        description,
                        inDiet,
                        mealHour
                    }
                });

                if(meal == null){
                    return reply.status(404).send();
                }

                reply.status(200).send({ meal });

            } catch (err){
                return reply.status(404).send();
            }
        } 
    });

    app.delete('/:id', async (request, reply) => {
        const jwt_token = request.cookies.session;
        
        if(jwt_token){
            const user_id = await getUserIDFromToken(request, reply, jwt_token);

            const parametersSchema = z.object({
                id: z.string().uuid()
            });
    
            const _parameters = parametersSchema.safeParse(request.params);
    
            if(_parameters.success == false ){
                throw new RequiredParametersIncorrect();
            }
    
            const { id } = _parameters.data;

            try {
                await prisma.meals.delete({
                    where: {
                        id,
                        userId: user_id
                    }
                });

            } catch (err){
                return reply.status(404).send();
            }

            reply.status(200).send();
        } 
    });
} 