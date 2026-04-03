import userModel from "../models/user.model.js";
import { sendRegistrationEmail } from "../services/email.service.js";
import tokenBlackListModel from "../models/blackList.model.js";
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

async function logout(req, res) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(200).json({
      message: "User logged out successfully",
    });
  }

  await tokenBlackListModel.create({
    token,
  });

  res.clearCookie("token");

  res.status(200).json({
    message: "User logged out successfully",
  });
}

export { login, signup, logout };
