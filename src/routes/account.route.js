import express from "express";
import { checkLogin } from "../middleware/auth.middleware.js";
import {
  createAccount,
  getUserAccount,
} from "../controllers/account.controller.js";

const router = express.Router();

router.post("/", checkLogin, createAccount);

router.get("/", checkLogin, getUserAccount);
export default router;
