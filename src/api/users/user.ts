import { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma';
import { compare, hash } from 'bcryptjs';
import { z } from 'zod';
import { UsernameAlreadyExistsError } from '../../erros/username-already-exists';
import { IncorectUserId } from '../../erros/incorect-user-id';
import { IncorrectUsernameOrPassword } from '../../erros/username-or-password-incorect';
import { getUserIDFromToken } from '../../utils/validate-token';

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

        await prisma.user.create({
            data: {
                username,
                password: password_hash,   
                gender,
                profileImage 
            }
        });

        return reply.status(201).send();
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

            const token = app.jwt.sign({ id: user.id, username: user.username });

            // Adicionar 7 dias à data atual
            const expirationDate = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);

            reply.setCookie('session', token, {
                path: '/',
                httpOnly: true,  // Importante para garantir que o cookie seja server-side only
                secure: true,    // Recomendado para produção (requer HTTPS)
                sameSite: 'strict', // Ajuda a prevenir ataques CSRF
                expires: expirationDate // Data atual + 7 dias
            });

            reply.status(200).send({
                user: { 
                    id: user.id, 
                    username: user.username,
                    profileImage: user.profileImage
                }
            });
        } 

        else {   
            throw new IncorrectUsernameOrPassword();
        }
    });

    app.post('/logout', async (request, reply) => {
        // Apagar o cookie JWT
        reply.clearCookie('session', {
            path: '/',
            httpOnly: true,
            secure: true,    // Recomendado para produção (requer HTTPS)
            sameSite: 'strict' // Ajuda a prevenir ataques CSRF
        });
    
        reply.send({ message: 'Logout successfuly' });
    });

    // /api/users/
    app.get('/', async (request, reply) => {
        const jwt_token = request.cookies.session;
        
        if(jwt_token){
            const user_id = await getUserIDFromToken(request, reply, jwt_token);

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
        } else {
            throw new Error('Validation error');
        }
    });
}