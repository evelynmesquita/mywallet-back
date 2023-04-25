import bcrypt from 'bcrypt';
import { db } from "../database/database.connection.js"
import { v4 as uuidV4 } from 'uuid'
import { userLoginSchema } from '../schemas/auth.schemas.js';
import { validateSchema } from '../middlewares/validateSchema.middleware.js';

export async function signUp (req, res) {
    const { name, email, password } = req.body;

    const errors = validateSchema(req.body);
    if(errors) return res.status(422).send(errors)

    try {
        const exisstingUser = await db.collection('users').findOne({ email });
        if (exisstingUser) {
            res.status(409).send("E-mail already exists")
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        await db.collection("users").insertOne({ name, email, password: hashedPassword });
        res.status(201).send("User created successfully")

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
}

export async function signIn (req, res) {
    const user = req.body

    const validation = userLoginSchema.validate(user, { abortEarly: false })
    if (validation.error) {
        const erros = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(erros)
    }

    try {
        const userExist = await db.collection("users").findOne({ email: user.email })
        console.log(userExist)
        if (!userExist) return res.status(400).send("Usuário ou senha incorretos")

        const matchPassword = bcrypt.compareSync(user.password, userExist.password)
        if (!matchPassword) return res.status(400).send("Usuário ou senha incorretos")

        const token = uuidV4()

        await db.collection("sessions").insertOne({ idUser: userExist._id, token, user: userExist.name })
        const resp = await db.collection("sessions").findOne({ token })
        return res.send(resp)

    } catch (error) {
        console.log(error.message)
        return res.status(500).send(error.message)
    }
}