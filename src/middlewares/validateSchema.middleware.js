import { userRegisterSchema } from "../schemas/auth.schemas.js";

export function validateSchema(schema) {
    const validation = userRegisterSchema.validate(schema, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return errors;
    }
}
