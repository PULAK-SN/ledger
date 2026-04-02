import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: [true, "Transaction must be associated with a from account"],
      index: true,
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: [true, "Transaction must be associated with a to account"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["Pending", "Completed", "Faild", "Reversed"],
        message: "Status can be either Pending, Completed, Faild or Reversed",
      },
      default: "Pending",
    },
    amount: {
      type: Number,
      required: [true, "Amount is required for creating an transaction"],
      min: [0, "Transaction amount can not be negative"],
    },
    idempotencyKey: {
      type: String,
      required: [
        true,
        "Idempotency key is required for creating an transaction",
      ],
      index: true,
      unique: true,
    },
  },
  { timestamps: true },
);

const transactionModel = mongoose.model("transaction", transactionSchema);

export default transactionModel;
