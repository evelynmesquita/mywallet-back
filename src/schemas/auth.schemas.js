import joi from 'joi';

export const userRegisterSchema = joi.object({
    name: joi.string().pattern(/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]+$/).required(),
    email: joi.string().email().required(),
    password: joi.string().min(3).required(),
    confirmPassword: joi.any().valid(joi.ref('password')).required()
})

export const userLoginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(3).required(),
})