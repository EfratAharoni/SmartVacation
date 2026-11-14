import { t } from "../utils/i18n.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: t(req, "missingToken") });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: t(req, "invalidToken") });
  }
};

export default authenticateToken;
