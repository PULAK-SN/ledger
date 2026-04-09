import transactionModel from "../models/transaction.model.js";
import ledgerModel from "../models/ledger.model.js";
import accountModel from "../models/account.model.js";
import mongoose from "mongoose";

import { sendTransactionEmail } from "../services/email.service.js";

/**
 * create new transaction
 * the 10 step transfer flow
 *  1. validate request
 *  2. validate idempotency key
 *  3. check account status
 *  4. derive sender balance fron the ledger
 *  5. create tanscation (PENDING)
 *  6. create DEBIT ledger entry
 *  7. create CREDIT ledger entry
 *  8. mark transaction COMPLETE
 *  9. commit mongoDB session
 *  10. send email notification
 */

async function createTransaction(req, res) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey)
    return res.status(400).json({
      message: "fromAccount, toAccount, amount and idempotencyKey is required",
    });

  const fromUserAccount = await accountModel.findOne({ _id: fromAccount });

  const toUserAccount = await accountModel.findOne({ _id: toAccount });

  if (!toUserAccount || !fromUserAccount)
    return res.status(400).json({ message: "Invalid credential" });

  // validate idempotencyKey
  const [isTransactionExists] = await transactionModel.find({
    idempotencyKey,
  });

  if (isTransactionExists) {
    if (isTransactionExists.status === "Completed")
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: isTransactionExists,
      });
    else if (isTransactionExists.status === "Pending")
      return res.status(200).json({
        message: "Transaction is still in process",
      });
    else if (isTransactionExists.status === "Faild")
      return res.status(500).json({
        message: "Transaction failed, please try again",
      });
    else if (isTransactionExists.status === "Reversed")
      return res.status(500).json({
        message: "Transaction was reversed, please retry",
      });
  }

  // check account status
  if (
    fromUserAccount.status !== "Active" ||
    toUserAccount.status !== "Active"
  ) {
    return res.status(400).json({
      message:
        "Both fromAccount and toAccount must be ACTIVE to process transaction",
    });
  }

  // Check balance
  const balance = await fromUserAccount.getBalance();

  if (balance < amount)
    return res.status(400).json({
      message: `Insufficient balance. Current balance is ${balance}. Request amount is ${amount}`,
    });

  let transaction;
  try {
    // Create transaction (PENDING)
    const session = await mongoose.startSession();
    session.startTransaction();

    transaction = (
      await transactionModel.create(
        [
          {
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "Pending",
          },
        ],
        { session },
      )
    )[0];

    await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount: amount,
          transaction: transaction._id,
          type: "Debit",
        },
      ],
      { session },
    );

    await (() => {
      return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
    })();

    await ledgerModel.create(
      [
        {
          account: toAccount,
          amount: amount,
          transaction: transaction._id,
          type: "Credit",
        },
      ],
      { session },
    );

    await transactionModel.findOneAndUpdate(
      { _id: transaction._id },
      { status: "Completed" },
      { session },
    );

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message:
        "Transaction is Pending due to some issue, please retry after sometime",
    });
  }

  // send email notification
  await sendTransactionEmail(req.user.email, req.user.name, amount, toAccount);

  return res.status(201).json({
    message: "Transaction completed successfully",
    transaction: transaction,
  });
}

async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey)
    return res
      .status(400)
      .json({ message: "toAccount, amount and idempotencyKey is required" });

  const toUserAccount = await accountModel.findOne({ _id: toAccount });

  if (!toUserAccount)
    return res.status(400).json({ message: "Invalid account" });

  const fromUserAccount = await accountModel.findOne({
    user: req.user._id,
  });

  if (!fromUserAccount)
    return res.status(400).json({ message: "System user account not found" });

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = new transactionModel({
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: "Pending",
  });

  await ledgerModel.create(
    [
      {
        account: fromUserAccount._id,
        amount,
        transaction: transaction._id,
        type: "Debit",
      },
    ],
    { session },
  );

  await ledgerModel.create(
    [
      {
        account: toAccount,
        amount,
        transaction: transaction._id,
        type: "Credit",
      },
    ],
    { session },
  );

  transaction.status = "Completed";
  await transaction.save({ session });

  await session.commitTransaction();
  session.endSession();

  res.status(201).json({
    message: "Initial funds transaction completed successfully",
    transaction,
  });
}

export { createTransaction, createInitialFundsTransaction };
