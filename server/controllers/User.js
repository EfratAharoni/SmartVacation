import * as userService from "../services/User.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

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
        res.status(500).json({ message: err.message });
    }
};

export const getUser = async(req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) return res.status(404).json({ message: "user not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const createUser = async(req, res) => {
    try {
        const newUser = await userService.createUser(req.body);
        const token = signUserToken(newUser);
        res.status(201).json({
            message: "User created successfully",
            user: buildSafeUser(newUser),
            token,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const addManyUsers = async(req, res)=> {
    try {
        const users = await userService.createManyUsers(req.body);
        res.status(201).json(users);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const removeUser = async(req, res) => {
    try {
        const deleted = await userService.deleteUserById(req.params.id);
        if (!deleted) return res.status(404).json({ message: "user not found" });
        res.json({ message: "user deleted", deleted });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const removeAllUsers = async(req, res) =>{
    try {
        const deleted = await userService.deleteManyUsers();
        if (!deleted) return res.status(404).json({ message: "users not found" });
        res.json({ message: "all users deleted", deleted });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateUser = async(req, res) => {
    try {
        const updated = await userService.updateUserById(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: "user not found" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
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
        res.status(401).json({ message: err.message });
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
        res.status(500).json({ message: err.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { id, oldPassword, newPassword } = req.body;
        const result = await userService.changePasswordService(id, oldPassword, newPassword);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
