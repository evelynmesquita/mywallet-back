import { Router } from "express";
import { getWallet, postNewTransition } from "../controllers/wallet.controllers.js";

const walletRoutes = Router();

walletRoutes.get("/wallet", getWallet);
walletRoutes.post("/newValueWallet", postNewTransition);

export default walletRoutes;