import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { AppError } from "../utils/i18n.js";

export const getAllUser = () => User.find().select("-password -cart -favorites");

export const getUserById = (id) => User.findById(id).select("-password");

export const createUser = async (userData) => {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(userData.password, salt);

    // Only whitelisted fields — never let the client set role/cart/etc. on signup
    const { fullName, email, phone, preferredLanguage } = userData;
    return await User.create({
        fullName,
        email,
        phone,
        ...(preferredLanguage === "en" || preferredLanguage === "he" ? { preferredLanguage } : {}),
        password: hashedPassword,
    });
};

export const createManyUsers = async (usersArray) => {
    const hashed = await Promise.all(
        usersArray.map(async (u) => ({
            ...u,
            password: bcrypt.hashSync(u.password, bcrypt.genSaltSync(10)),
        }))
    );
    return User.insertMany(hashed);
};

export const deleteUserById = (id) => User.findByIdAndDelete(id);

export const deleteManyUsers = () => User.deleteMany({});

const FORBIDDEN_UPDATE_FIELDS = ["password", "_id", "__v", "role", "resetPasswordToken", "resetPasswordExpires"];

export const updateUserById = (id, updateData) => {
    const safe = { ...updateData };
    FORBIDDEN_UPDATE_FIELDS.forEach((f) => delete safe[f]);
    return User.findByIdAndUpdate(id, safe, { returnDocument: "after", runValidators: true }).select("-password");
};

export const loginService = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) return null;
    const isMatch = bcrypt.compareSync(password, user.password);
    return isMatch ? user : null;
};

export const changePasswordService = async (userId, oldPassword, newPassword) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError("userNotFound", 404);

    const isMatch = bcrypt.compareSync(oldPassword, user.password);
    if (!isMatch) throw new AppError("oldPasswordWrong");

    const hashedNewPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
    return await User.findByIdAndUpdate(
        userId,
        { password: hashedNewPassword },
        { returnDocument: "after" }
    ).select("-password");
};

const MAX_LIST_ITEMS = 100;

export const getUserLists = (userId) => User.findById(userId).select("cart favorites").lean();

export const updateUserLists = (userId, { cart, favorites }) => {
    const update = {};
    if (Array.isArray(cart)) update.cart = cart.slice(0, MAX_LIST_ITEMS);
    if (Array.isArray(favorites)) update.favorites = favorites.slice(0, MAX_LIST_ITEMS);
    return User.findByIdAndUpdate(userId, update, { returnDocument: "after" }).select("cart favorites").lean();
};

export const setPreferredLanguage = (userId, lang) =>
    User.findByIdAndUpdate(userId, { preferredLanguage: lang }, { returnDocument: "after" }).select("-password");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

/** Creates a reset token for the user (if exists). Returns { user, token } or null. */
export const createPasswordResetToken = async (email) => {
    const user = await User.findOne({ email });
    if (!user) return null;
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = hashToken(token);
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();
    return { user, token };
};

export const resetPasswordWithToken = async (token, newPassword) => {
    const user = await User.findOne({
        resetPasswordToken: hashToken(String(token)),
        resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");
    if (!user) throw new AppError("resetInvalid");
    user.password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return true;
};
