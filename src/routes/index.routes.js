import { Router } from "express";
import authRoutes from "./auth.routes.js"
import walletRoutes from "./wallet.routes.js"

const router = Router();

router.use(authRoutes);
router.use(walletRoutes);

export default router;