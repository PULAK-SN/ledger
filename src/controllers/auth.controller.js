import userModel from "../models/user.model.js";
import { sendRegistrationEmail } from "../services/email.service.js";
import jwt from "jsonwebtoken";

async function signup(req, res) {
  const { email, name, password } = req.body;

  const isExists = await userModel.findOne({ email });
  if (isExists)
    return res.status(422).json({ message: "User is already exists" });

  const user = await userModel.create({ email, name, password });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  res.cookie("token", token);
  res
    .status(201)
    .json({ user: { _id: user._id, email: user.email, name: user.name } });

  await sendRegistrationEmail(user.email, user.name);
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "invalid credential" });
  }

  const isValidPassword = await user.comparePassword(password);

  if (!isValidPassword) {
    return res.status(401).json({ message: "invalid credential" });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  res.cookie("token", token);
  res
    .status(201)
    .json({ user: { _id: user._id, email: user.email, name: user.name } });
}

export { login, signup };
