import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { ZodError } from 'zod';
import { env } from './env';
import { userRoutes } from './api/users/user';
import { UsernameAlreadyExistsError } from './erros/username-already-exists';

export const app = fastify();

app.register(fastifyStatic, {
    root: path.join(__dirname, 'uploads'),
    prefix: '/public/',
});

app.register(userRoutes, { prefix: '/api/user' });

app.setErrorHandler((error, _request, reply)=> {
    if(error instanceof ZodError){
        return reply.status(400).send({message: 'Validation error', issues: error.format()});
    }
    if(error instanceof UsernameAlreadyExistsError){
        return reply.status(400).send({message: 'Validation error', issues: error.message});
    }

    if(env.NODE_ENV !== 'production'){
        console.error(error);
    } 

    return reply.status(500).send({message: 'Internal server error'});
});