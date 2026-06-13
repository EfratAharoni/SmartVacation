import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const getAllUser = () => User.find().select("-password");

export const getUserById = (id) => User.findById(id).select("-password");

export const createUser = async (userData) => {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(userData.password, salt);

    return await User.create({
        ...userData,
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

const FORBIDDEN_UPDATE_FIELDS = ["password", "_id", "__v", "role"];

export const updateUserById = (id, updateData) => {
    const safe = { ...updateData };
    FORBIDDEN_UPDATE_FIELDS.forEach((f) => delete safe[f]);
    return User.findByIdAndUpdate(id, safe, { new: true, runValidators: true }).select("-password");
};

export const loginService = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) return null;
    const isMatch = bcrypt.compareSync(password, user.password);
    return isMatch ? user : null;
};

export const changePasswordService = async (userId, oldPassword, newPassword) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("משתמש לא נמצא");

    const isMatch = bcrypt.compareSync(oldPassword, user.password);
    if (!isMatch) throw new Error("הסיסמה הישנה שגויה");

    const hashedNewPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
    return await User.findByIdAndUpdate(
        userId,
        { password: hashedNewPassword },
        { new: true }
    ).select("-password");
};
