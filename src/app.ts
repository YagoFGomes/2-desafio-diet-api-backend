import fastify from 'fastify';
import fs from 'fs';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { ZodError } from 'zod';
import { env } from './env';
import { userRoutes } from './api/users/user';
import { UsernameAlreadyExistsError } from './erros/username-already-exists';
import { userMeelRoutes } from './api/meels/meels';
import fastifyJWT from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import { RequiredParametersIncorrect } from './erros/required-parameters-incorrect';
import { userMetricsRoutes } from './api/metrics/metrics';

export const app = fastify();

app.register(fastifyCookie, {
    secret: env.COOKIE_SECRET, 
    parseOptions: {}          
});

const pathToPrivateKey = path.join(__dirname, '../private_key.pem');
const pathToPublicKey = path.join(__dirname, '../public_key.pem');
export const privateKey = fs.readFileSync(pathToPrivateKey, 'utf8');
export const publicKey = fs.readFileSync(pathToPublicKey, 'utf8');

app.register(fastifyJWT, {
    secret: {
        private: privateKey,
        public: publicKey
    },
    sign: { algorithm: 'RS256' }
});

app.addHook('onRequest', async (request, reply) => {
    const routesToApplyHook = ['/api/user/login', '/api/user/register'];

    if (!routesToApplyHook.includes(request.routerPath)) {
        try {
            const token = request.cookies.session;
            if(token){
                app.jwt.verify(token);
            } else {
                throw new Error('Invalid or expired token');
            }
        } catch (err) {
            console.log(err);
            reply.status(401).send();
        }
    }
});

app.register(fastifyStatic, {
    root: path.join(__dirname, 'uploads'),
    prefix: '/public/',
});

app.register(userRoutes, { prefix: '/api/user' });
app.register(userMeelRoutes, { prefix: '/api/meal' });
app.register(userMetricsRoutes, { prefix: '/api/user/metrics' });

app.setErrorHandler((error, _request, reply)=> {
    if(error instanceof ZodError){
        return reply.status(400).send({message: 'Validation error', issues: error.format()});
    }
    if(error instanceof UsernameAlreadyExistsError){
        return reply.status(400).send({message: 'Validation error', issues: error.message});
    }
    if(error instanceof RequiredParametersIncorrect){
        return reply.status(400).send({message: 'Validation error', issues: error.message});
    }

    if(env.NODE_ENV !== 'production'){
        console.error(error);
    } 

    return reply.status(500).send({message: 'Internal server error'});
});