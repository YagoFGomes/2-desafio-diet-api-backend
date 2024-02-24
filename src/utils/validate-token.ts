import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtPayload } from '../types';
import { prisma } from '../lib/prisma';
import { app } from '../app';

export async function getUserIDFromToken(request: FastifyRequest, reply:FastifyReply, jwt_token:string){
    const jwt_decoded = app.jwt.decode(jwt_token);

    const { id: user_id } = jwt_decoded as JwtPayload;

    const user = await prisma.user.findUnique({
        where: {
            id: user_id
        }
    });
    
    if(!user){
        return reply.status(401).send();
    }
    
    const { id } = user;

    return id;
}