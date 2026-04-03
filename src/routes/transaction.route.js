import { Router } from "express";
import {
  createTransaction,
  createInitialFundsTransaction,
} from "../controllers/transaction.controller.js";

import { checkLogin, authSystemUser } from "../middleware/auth.middleware.js";
const transactionRouter = Router();

transactionRouter.post("/", checkLogin, createTransaction);

transactionRouter.post(
  "/system/initial-funds",
  authSystemUser,
  createInitialFundsTransaction,
);
export default transactionRouter;
