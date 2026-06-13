import * as userService from "../services/User.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/jwt.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s\-+()]{7,20}$/;

function validateRegisterInput({ fullName, email, phone, password }) {
    if (!fullName || fullName.trim().length < 2)
        return "שם מלא חייב להכיל לפחות 2 תווים";
    if (!email || !EMAIL_RE.test(email))
        return "כתובת אימייל לא תקינה";
    if (!phone || !PHONE_RE.test(phone))
        return "מספר טלפון לא תקין";
    if (!password || password.length < 6)
        return "סיסמה חייבת להכיל לפחות 6 תווים";
    return null;
}

const buildSafeUser = (user) => ({
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
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
        res.status(500).json({ message: "שגיאת שרת פנימית" });
    }
};

export const getUser = async(req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) return res.status(404).json({ message: "user not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "שגיאת שרת פנימית" });
    }
};

export const createUser = async(req, res) => {
    try {
        const validationError = validateRegisterInput(req.body);
        if (validationError) return res.status(400).json({ message: validationError });

        const newUser = await userService.createUser(req.body);
        const token = signUserToken(newUser);
        res.status(201).json({
            message: "User created successfully",
            user: buildSafeUser(newUser),
            token,
        });
    } catch (err) {
        const message = err.code === 11000
            ? "האימייל כבר רשום במערכת"
            : "שגיאת שרת פנימית";
        res.status(400).json({ message });
    }
};

export const addManyUsers = async(req, res)=> {
    try {
        if (!Array.isArray(req.body) || req.body.length === 0)
            return res.status(400).json({ message: "נדרש מערך משתמשים" });
        const users = await userService.createManyUsers(req.body);
        res.status(201).json(users);
    } catch (err) {
        res.status(400).json({ message: "שגיאת שרת פנימית" });
    }
};

export const removeUser = async(req, res) => {
    try {
        const deleted = await userService.deleteUserById(req.params.id);
        if (!deleted) return res.status(404).json({ message: "user not found" });
        res.json({ message: "user deleted", deleted });
    } catch (err) {
        res.status(500).json({ message: "שגיאת שרת פנימית" });
    }
};

export const removeAllUsers = async(req, res) =>{
    try {
        const deleted = await userService.deleteManyUsers();
        if (!deleted) return res.status(404).json({ message: "users not found" });
        res.json({ message: "all users deleted", deleted });
    } catch (err) {
        res.status(500).json({ message: "שגיאת שרת פנימית" });
    }
};

export const updateUser = async(req, res) => {
    try {
        const updated = await userService.updateUserById(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: "user not found" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: "שגיאת שרת פנימית" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "נדרשים אימייל וסיסמה" });
        if (!EMAIL_RE.test(email))
            return res.status(400).json({ message: "כתובת אימייל לא תקינה" });

        const user = await userService.loginService(email, password);
        if (!user) {
            return res.status(401).json({ message: "אימייל או סיסמה שגויים" });
        }

        res.json({
            message: "Success",
            user: buildSafeUser(user),
            token: signUserToken(user),
        });
    } catch (err) {
        res.status(401).json({ message: "אימייל או סיסמה שגויים" });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await userService.getUserById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }
        res.json({ user: buildSafeUser(user) });
    } catch (err) {
        res.status(500).json({ message: "שגיאת שרת פנימית" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const id = req.userId;
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword)
            return res.status(400).json({ message: "נדרשות סיסמה ישנה וחדשה" });
        if (newPassword.length < 6)
            return res.status(400).json({ message: "הסיסמה החדשה חייבת להכיל לפחות 6 תווים" });

        const result = await userService.changePasswordService(id, oldPassword, newPassword);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
