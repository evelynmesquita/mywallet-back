import joi from 'joi';

export const entriesSchema = joi.object({
    value: joi.number().min(0).required(),
    description: joi.string().required(),
    type: joi.string().valid("entry", "exit").required(),
})