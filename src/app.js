import express from "express";
import cors from "cors"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import joi from 'joi';
import bcrypt from 'bcrypt';

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
    password: joi.string().min(6).required(),
    confirmPassword: joi.any().valid(joi.ref('password')).required()
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

app.post("/", async (req, res) => {

})


const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))