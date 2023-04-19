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


const userSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required().min(3),
    confirmPassword: joi.any().valid(joi.ref('password')).required()
})


app.post("/cadastro", async (req, res) => {

})

app.post("/", async (req, res) => {

})


const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))