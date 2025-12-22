import express from "express";
import { registerUser } from "../controllers/userController.js";
import { verification } from "../controllers/userController.js";
const router = express.Router()
router.post('/register', registerUser)
router.post('/verify-email', verification)
export default router;