export class IncorrectUsernameOrPassword extends Error{
    constructor(){
        super('User id are incorrect');
    }
}