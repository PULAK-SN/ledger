import express from "express";
import authRouter from "./routes/auth.routes.js";
import accountRouter from "./routes/account.route.js";
import transactionRouter from "./routes/transaction.route.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transaction", transactionRouter);

export { app };
