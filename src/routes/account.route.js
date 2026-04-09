import express from "express";
import { checkLogin } from "../middleware/auth.middleware.js";
import {
  createAccount,
  getUserAccount,
  getAccountBalance,
} from "../controllers/account.controller.js";

const router = express.Router();

router.post("/", checkLogin, createAccount);

router.get("/", checkLogin, getUserAccount);

router.get("/balance/:accountId", checkLogin, getAccountBalance);
export default router;
