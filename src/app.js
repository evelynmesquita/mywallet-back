import express from "express";
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb"
import dotenv from "dotenv"
import joi from 'joi';
import bcrypt from 'bcrypt';
import { v4 as uuidV4 } from 'uuid'
import dayjs from 'dayjs'

const app = express();

app.use(express.json());
app.use(cors());
dotenv.config();


const mongoClient = new MongoClient(process.env.DATABASE_URL)
try {
    await mongoClient.connect()
    console.log("MongoDB conectado!")
} catch (err) {
    console.log(err.message)
}
const db = mongoClient.db()


const userRegisterSchema = joi.object({
    name: joi.string().pattern(/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]+$/).required(),
    email: joi.string().email().required(),
    password: joi.string().min(3).required(),
    confirmPassword: joi.any().valid(joi.ref('password')).required()
})

const userLoginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(3).required(),
})

const entriesSchema = joi.object({
    value: joi.number().min(0).required(),
    description: joi.string().required(),
    type: joi.string().valid("entry", "exit").required(),
})

app.post("/sign-up", async (req, res) => {
    const { name, email, password } = req.body;

    const validation = userRegisterSchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
        const erros = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(erros)
    }

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
})

app.post("/sign-in", async (req, res) => {
    const user = req.body
    const validateUser = userLoginSchema.validate(user, { abortEarly: false })

    if (validateUser.error) {
        const erros = validaValue.error.details.map((err) => {
            return err.message
        })
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
})

app.get("/wallet", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    if (!token) return res.status(422).send("Informe o token!")

    const checkSession = await db.collection("sessions").findOne({ token })
    try {
        const userWallet = await db.collection("wallet").find({ userId: checkSession.idUser }).toArray()
        return res.send(userWallet)
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

app.post("/newValueWallet", async (req, res) => {
    const newValue = req.body
    const { authorization } = req.headers
    const validaValue = entriesSchema.validate(newValue, { abortEarly: false })

    if (validaValue.error) {
        const erros = validaValue.error.details.map((err) => {
            return err.message
        })
        return res.status(422).send(erros)
    }

    const token = authorization?.replace("Bearer ", "")
    if (!token) return res.status(422).send("Informe o token!")

    try {
        const checkSession = await db.collection("sessions").findOne({ token })
        if (!checkSession) return res.status(401).send("Você não tem autorização para cadastrar um novo valor na carteira")
        console.log(checkSession)
        console.log(checkSession.idUser)
        await db.collection("wallet").insertOne({ value: newValue.value, description: newValue.description, type: newValue.type, date: dayjs().format("DD/MM"), userId: checkSession.idUser })
        return res.send("ok")
    } catch (error) {
        return res.sendStatus(500)
    }
})


const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))