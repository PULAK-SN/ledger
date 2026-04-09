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

async function getAccountBalance(req, res) {
  const { accountId } = req.params;

  const account = await accountModel.findOne({
    _id: accountId,
    user: req.user._id,
  });

  if (!account) res.send(404).json({ message: "Account not found" });

  const balance = await account.getBalance();

  res.status(200).json({
    accountId: account._id,
    balance,
  });
}

export { createAccount, getUserAccount, getAccountBalance };
