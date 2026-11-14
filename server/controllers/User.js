import * as userService from "../services/User.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/jwt.js";
import { t, getLang, AppError } from "../utils/i18n.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s\-+()]{7,20}$/;

function validateRegisterInput({ fullName, email, phone, password }) {
    if (!fullName || fullName.trim().length < 2)
        return "fullNameInvalid";
    if (!email || !EMAIL_RE.test(email))
        return "emailInvalid";
    if (!phone || !PHONE_RE.test(phone))
        return "phoneInvalid";
    if (!password || password.length < 6)
        return "passwordTooShort";
    return null;
}

const buildSafeUser = (user) => ({
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    preferredLanguage: user.preferredLanguage,
});

const signUserToken = (user) =>
    jwt.sign(
        {
            sub: String(user._id),
            email: user.email,
            fullName: user.fullName,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

export const getUsers = async(req, res) => {
    try {
        const users = await userService.getAllUser();
        res.json(users);
    } catch(err) {
        res.status(500).json({ message: t(req, "serverError") });
    }
};

export const getUser = async(req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) return res.status(404).json({ message: t(req, "userNotFound") });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: t(req, "serverError") });
    }
};

export const createUser = async(req, res) => {
    try {
        const validationError = validateRegisterInput(req.body);
        if (validationError) return res.status(400).json({ message: t(req, validationError) });

        const newUser = await userService.createUser({ ...req.body, preferredLanguage: getLang(req) });
        const token = signUserToken(newUser);
        res.status(201).json({
            message: "User created successfully",
            user: buildSafeUser(newUser),
            token,
        });
    } catch (err) {
        const message = t(req, err.code === 11000 ? "emailTaken" : "serverError");
        res.status(400).json({ message });
    }
};

export const addManyUsers = async(req, res)=> {
    try {
        if (!Array.isArray(req.body) || req.body.length === 0)
            return res.status(400).json({ message: t(req, "usersArrayRequired") });
        const users = await userService.createManyUsers(req.body);
        res.status(201).json(users);
    } catch (err) {
        res.status(400).json({ message: t(req, "serverError") });
    }
};

export const removeUser = async(req, res) => {
    try {
        const deleted = await userService.deleteUserById(req.params.id);
        if (!deleted) return res.status(404).json({ message: t(req, "userNotFound") });
        res.json({ message: t(req, "deleted"), deleted });
    } catch (err) {
        res.status(500).json({ message: t(req, "serverError") });
    }
};

export const removeAllUsers = async(req, res) =>{
    try {
        const deleted = await userService.deleteManyUsers();
        if (!deleted) return res.status(404).json({ message: t(req, "userNotFound") });
        res.json({ message: t(req, "deleted"), deleted });
    } catch (err) {
        res.status(500).json({ message: t(req, "serverError") });
    }
};

export const updateUser = async(req, res) => {
    try {
        const updated = await userService.updateUserById(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: t(req, "userNotFound") });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: t(req, "serverError") });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: t(req, "emailPasswordRequired") });
        if (!EMAIL_RE.test(email))
            return res.status(400).json({ message: t(req, "emailInvalid") });

        const user = await userService.loginService(email, password);
        if (!user) {
            return res.status(401).json({ message: t(req, "wrongCredentials") });
        }

        res.json({
            message: "Success",
            user: buildSafeUser(user),
            token: signUserToken(user),
        });
    } catch (err) {
        res.status(401).json({ message: t(req, "wrongCredentials") });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await userService.getUserById(req.userId);
        if (!user) {
            return res.status(404).json({ message: t(req, "userNotFound") });
        }
        res.json({ user: buildSafeUser(user) });
    } catch (err) {
        res.status(500).json({ message: t(req, "serverError") });
    }
};

export const changePassword = async (req, res) => {
    try {
        const id = req.userId;
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword)
            return res.status(400).json({ message: t(req, "passwordsRequired") });
        if (newPassword.length < 6)
            return res.status(400).json({ message: t(req, "newPasswordTooShort") });

        await userService.changePasswordService(id, oldPassword, newPassword);
        res.json({ message: t(req, "passwordChanged") });
    } catch (err) {
        if (err instanceof AppError) return res.status(err.status).json({ message: t(req, err.key) });
        res.status(500).json({ message: t(req, "serverError") });
    }
};

// ── Cart & favorites (synced from the client) ───────────────────────────────
export const getMyLists = async (req, res) => {
    try {
        const lists = await userService.getUserLists(req.userId);
        if (!lists) return res.status(404).json({ message: t(req, "userNotFound") });
        res.json({ cart: lists.cart || [], favorites: lists.favorites || [] });
    } catch (err) {
        res.status(500).json({ message: t(req, "serverError") });
    }
};

export const updateMyLists = async (req, res) => {
    try {
        const { cart, favorites } = req.body || {};
        const lists = await userService.updateUserLists(req.userId, { cart, favorites });
        if (!lists) return res.status(404).json({ message: t(req, "userNotFound") });
        res.json({ cart: lists.cart || [], favorites: lists.favorites || [] });
    } catch (err) {
        res.status(500).json({ message: t(req, "serverError") });
    }
};

export const updateMyLanguage = async (req, res) => {
    try {
        const lang = req.body?.lang === "en" ? "en" : "he";
        await userService.setPreferredLanguage(req.userId, lang);
        res.json({ lang });
    } catch (err) {
        res.status(500).json({ message: t(req, "serverError") });
    }
};

// ── Forgot / reset password ─────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body || {};
        if (!email || !EMAIL_RE.test(email))
            return res.status(400).json({ message: t(req, "emailInvalid") });

        const result = await userService.createPasswordResetToken(email);
        if (result) {
            const base = process.env.CLIENT_URL || req.headers.origin || "http://localhost:5173";
            const link = `${base}/reset-password?token=${result.token}`;
            await sendPasswordResetEmail(result.user, link, getLang(req));
        }
        // Same answer whether or not the email exists (no account enumeration)
        res.json({ message: t(req, "resetSent") });
    } catch (err) {
        res.status(500).json({ message: t(req, "serverError") });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body || {};
        if (!token) return res.status(400).json({ message: t(req, "resetInvalid") });
        if (!newPassword || newPassword.length < 6)
            return res.status(400).json({ message: t(req, "newPasswordTooShort") });
        await userService.resetPasswordWithToken(token, newPassword);
        res.json({ message: t(req, "passwordChanged") });
    } catch (err) {
        if (err instanceof AppError) return res.status(err.status).json({ message: t(req, err.key) });
        res.status(500).json({ message: t(req, "serverError") });
    }
};
