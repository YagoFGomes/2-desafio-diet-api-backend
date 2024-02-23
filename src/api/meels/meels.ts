import { FastifyInstance } from 'fastify';
// import { prisma } from '../../lib/prisma';
// import { z } from 'zod';

export async function userMeel(app: FastifyInstance){
    app.post('/register', async (request, reply) => {
        reply.status(200).send();
    });
} 