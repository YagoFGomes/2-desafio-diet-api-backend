import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

export async function toDoRoutes(app: FastifyInstance){
    app.post('/user', async (request, reply) => {
        const createUserBodySchema = z.object({
            username: z.string(),
            password: z.string(),
            gender: z.enum(['men', 'woman'])
        });

        const _body = createUserBodySchema.safeParse(request.body);
        
        if(_body.success == false){
            const message = 'Invalid body';
            console.error(message, _body.error.format());
            return reply.status(400).send({message});
        }

        const {username, password, gender} = _body.data;

        let profileImage = '/public/default-profile-images/default-image-men.png';
        
        if (gender === 'woman') {
            profileImage = '/public/default-profile-images/default-image-woman.png';
        }

        await prisma.user.create({
            data: {
                username,
                password,   
                gender,
                profileImage 
            }
        });

        return reply.status(201).send();
    });
}