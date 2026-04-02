import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

async function checkLogin(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ message: "Unathorized access, token is missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.userId);

    req.user = user;

    next();
  } catch (error) {
    console.error("Unathorized access, token is invalid ", error);
    return res
      .status(401)
      .json({ message: "Unathorized access, token is invalid" });
  }
}

export { checkLogin };
