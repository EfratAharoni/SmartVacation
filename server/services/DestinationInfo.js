import DestinationInfo from "../models/DestinationInfo.js";

export const getAllDestinationInfos = () => DestinationInfo.find();

export const getDestinationInfoByName = (destination) => {
    const regex = new RegExp(destination, "i");
    return DestinationInfo.findOne({ $or: [{ destination: regex }, { country: regex }] });
};

export const createDestinationInfo = (data) => DestinationInfo.create(data);

export const createManyDestinationInfos = (dataArray) => DestinationInfo.insertMany(dataArray);

export const updateDestinationInfoById = (id, updateData) =>
    DestinationInfo.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

export const deleteDestinationInfoById = (id) => DestinationInfo.findByIdAndDelete(id);
