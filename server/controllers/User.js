import * as userService from "../services/User.js";
import bcrypt from "bcryptjs";

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
        res.status(201).json(newUser);
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
        res.json({ message: "Success", user });
    } catch (err) {
        res.status(401).json({ message: err.message });
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
