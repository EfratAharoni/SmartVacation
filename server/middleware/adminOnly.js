import { t } from "../utils/i18n.js";
import User from "../models/User.js";

const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("role");
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: t(req, "adminOnly") });
    }
    next();
  } catch {
    return res.status(500).json({ message: t(req, "authCheckFailed") });
  }
};

export default adminOnly;
