import express from "express";
import { checkLogin } from "../middleware/auth.middleware.js";
import { createAccount } from "../controllers/account.controller.js";

const router = express.Router();

router.post("/", checkLogin, createAccount);

export default router;
