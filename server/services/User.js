import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const getAllUser = () => User.find();

export const getUserById = (id) => User.findById(id);

export const createUser = async (userData) => {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(userData.password, salt);
    
    return await User.create({ 
        ...userData, 
        password: hashedPassword 
    });
};

export const createManyUsers = (UsersArray) => User.insertMany(UsersArray);

export const deleteUserById = (id) => User.findByIdAndDelete(id);

export const deleteManyUsers = () => User.deleteMany({});

export const updateUserById = (id, updateData) => 
    User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

export const loginService = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) return null;
    const isMatch = bcrypt.compareSync(password, user.password);
    return isMatch ? user : null;
};

export const changePasswordService = async (userId, newPassword) => {
    const salt = bcrypt.genSaltSync(10);
    const hashedNewPassword = bcrypt.hashSync(newPassword, salt);
    
    return await User.findByIdAndUpdate(
        userId, 
        { password: hashedNewPassword }, 
        { new: true }
    );
};