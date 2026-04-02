import accountModel from "../models/account.model.js";

async function createAccount(req, res) {
  const { user } = req;
  const account = await accountModel.create({ user: user._id });

  res.status(201).json({ account });
}

export { createAccount };
