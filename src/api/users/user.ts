import { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma';
import { compare, hash } from 'bcryptjs';
import { z } from 'zod';
import { UsernameAlreadyExistsError } from '../../erros/username-already-exists';
import { RequiredParametersIncorrect } from '../../erros/required-parameters-incorrect';
import { IncorectUserId } from '../../erros/incorect-user-id';
import { IncorrectUsernameOrPassword } from '../../erros/username-or-password-incorect';

export async function userRoutes(app: FastifyInstance){
    app.post('/register', async (request, reply) => {
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

        const userWithSameUsername = await prisma.user.findUnique({
            where: {
                username
            }
        });

        if(userWithSameUsername){
            throw new UsernameAlreadyExistsError();
        }

        const password_hash = await hash(password, 6);

        let profileImage = '/public/default-profile-images/default-image-men.png';
        
        if (gender === 'woman') {
            profileImage = '/public/default-profile-images/default-image-woman.png';
        }

        const new_user = await prisma.user.create({
            data: {
                username,
                password: password_hash,   
                gender,
                profileImage 
            }
        });

        return reply.status(201).send({
            user: new_user
        });
    });

    app.post('/login', async (request, reply) => {

        const userLoginSchema = z.object({
            username: z.string(),
            password: z.string()
        });

        const _body = userLoginSchema.safeParse(request.body);

        if(_body.success == false){
            const message = 'Invalid body';
            console.error(message, _body.error.format());
            return reply.status(400).send({message});
        }

        const {username, password} = _body.data;

        const user = await prisma.user.findUnique({
            where: {
                username: username,
            }
        });

        if(user && await compare(password, user.password)){
            reply.status(200).send({
                user: { 
                    id: user.id, 
                    username: user.username,
                    profileImage: user.profileImage
                }
            });
        } 

        throw new IncorrectUsernameOrPassword();
    });

    app.get('/:id', async (request, reply) => {
        const getTaskParamsSchema = z.object({
            id: z.string().uuid()
        });
    
        const validatedQuery = getTaskParamsSchema.safeParse(request.params);
    
        if (!validatedQuery.success) {
            throw new RequiredParametersIncorrect();
        }
    
        const { id: user_id } = validatedQuery.data;

        const user = await prisma.user.findUnique({
            where: {
                id: user_id
            }
        });

        if(!user){
            throw new IncorectUserId();
        }

        const { id, username, gender, profileImage } = user;
    
        reply.status(200).send({
            user: {
                id,
                username,
                gender,
                profileImage
            }
        });
    });
}