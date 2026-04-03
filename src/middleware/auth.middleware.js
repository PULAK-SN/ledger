import userModel from "../models/user.model.js";
import tokenBlackListModel from "../models/blackList.model.js";
import jwt from "jsonwebtoken";

async function checkLogin(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ message: "Unathorized access, token is missing" });

  const isBlacklisted = await tokenBlackListModel.findOne({ token });

  if (isBlacklisted) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid",
    });
  }

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

async function authSystemUser(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ message: "Unathorized access, token is missing" });

  const isBlacklisted = await tokenBlackListModel.findOne({ token });

  if (isBlacklisted) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.userId).select("+systemUser");

    if (!user.systemUser)
      return res
        .status(403)
        .json({ memssage: "Forbidden access, not a system user" });

    req.user = user;

    next();
  } catch (error) {
    console.error("Unathorized access, token is invalid ", error);
    return res
      .status(401)
      .json({ message: "Unathorized access, token is invalid" });
  }
}
export { checkLogin, authSystemUser };
