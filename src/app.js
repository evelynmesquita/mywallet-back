import express from "express";
import cors from "cors"
import router from "./routes/index.routes.js";
import dotenv from "dotenv"

const app = express();
app.use(express.json());
app.use(cors());
app.use(router)

dotenv.config();

const PORT = 5000;
app.listen(process.env.PORT, () => console.log("Servidor rodando na porta" + process.env.PORT))