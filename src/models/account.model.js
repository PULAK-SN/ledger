import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      ref: "user",
      required: [true, "Account must be associated with a user"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["Active", "Frozen", "Closed"],
        message: "Status can be either Active, Frozen or Closed",
      },
      default: "Active",
    },
    currency: {
      type: String,
      required: [true, "Currency is required for creating an account"],
      default: "INR",
    },
  },
  { timestamps: true },
);

accountSchema.index({ user: 1, status: 1 });

const accountModel = mongoose.model("account", accountSchema);

export default accountModel;
