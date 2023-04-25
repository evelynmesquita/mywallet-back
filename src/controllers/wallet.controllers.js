import { db } from "../database/database.connection.js"
import dayjs from 'dayjs'
import { entriesSchema } from "../schemas/wallet.schemas.js"

export async function getWallet(req, res) {
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
}

export async function postNewTransition(req, res) {
    const newValue = req.body
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    if (!token) return res.status(422).send("Informe o token!")
    const validaValue = entriesSchema.validate(newValue, { abortEarly: false })

    if (validaValue.error) {
        const erros = validaValue.error.details.map((err) => {
            return err.message
        })
        return res.status(422).send(erros)
    }

    try {
        const checkSession = await db.collection("sessions").findOne({ token })
        if (!checkSession) return res.status(401).send("Você não tem autorização para cadastrar um novo valor na carteira")

        await db.collection("wallet").insertOne({
            value: newValue.value,
            description: newValue.description,
            type: newValue.type,
            date: dayjs().format("DD/MM"),
            userId: checkSession.idUser
        })
        return res.send("ok")
    } catch (error) {
        return res.sendStatus(500)
    }
}