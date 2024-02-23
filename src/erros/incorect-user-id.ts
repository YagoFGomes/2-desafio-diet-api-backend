export class IncorectUserId extends Error{
    constructor(){
        super('Username os password are incorrect');
    }
}