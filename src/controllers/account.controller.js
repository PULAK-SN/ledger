import accountModel from "../models/account.model.js";

async function createAccount(req, res) {
  const { user } = req;
  const account = await accountModel.create({ user: user._id });

  res.status(201).json({ account });
}

async function getUserAccount(req, res) {
  const accounts = await accountModel.find({ user: req.user._id });
  res.status(200).json({ accounts });
}
export { createAccount, getUserAccount };
