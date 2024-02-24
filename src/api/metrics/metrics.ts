import { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma';
import { getUserIDFromToken } from '../../utils/validate-token';
import { longestStreak } from '../../utils/calculate-best-meals-strick';

export async function userMetricsRoutes(app: FastifyInstance){
    app.get('/', async (request, reply) => {
        const jwt_token = request.cookies.session;
        
        if(jwt_token){
            const user_id = await getUserIDFromToken(request, reply, jwt_token);

            const all_user_meals = await prisma.meals.findMany({
                where: {
                    userId: user_id
                }
            });

            if(!all_user_meals){
                return reply.status(404).send();
            }

            const count_all_meals = all_user_meals.length;

            const count_meals_in_diet = all_user_meals.filter(meal => meal.inDiet).length;
            
            const count_meals_out_diet = all_user_meals.filter(meal => !meal.inDiet).length;

            const in_diet_strick = longestStreak(all_user_meals);

            return reply.status(200).send({
                userId: user_id,
                metrics: {
                    countMeals: count_all_meals,
                    mealsInDiet: count_meals_in_diet,
                    mealsOutDiet: count_meals_out_diet,
                    bestStrick: in_diet_strick,
                }
            });


        } 
    });
}