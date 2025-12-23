import express from "express";
import { registerUser, verification, loginUser, logoutUser, forgotPassword } from "../controllers/userController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
// import { verification } from "../controllers/userController.js";
// import { loginUser } from "../controllers/userController.js";

const router = express.Router()

router.post('/register', registerUser)
router.post('/verify-email', verification)
router.post('/login', loginUser)
router.post('/logout', isAuthenticated, logoutUser)
router.post('/forgot-password', forgotPassword)
export default router;