import DestinationInfo from "../models/DestinationInfo.js";

export const getAllDestinationInfos = () => DestinationInfo.find();

export const getDestinationInfoByName = (destination) => {
    const escaped = String(destination).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    return DestinationInfo.findOne({ $or: [{ destination: regex }, { country: regex }] });
};

export const createDestinationInfo = (data) => DestinationInfo.create(data);

export const createManyDestinationInfos = (dataArray) => DestinationInfo.insertMany(dataArray);

export const updateDestinationInfoById = (id, updateData) =>
    DestinationInfo.findByIdAndUpdate(id, updateData, { returnDocument: "after", runValidators: true });

export const deleteDestinationInfoById = (id) => DestinationInfo.findByIdAndDelete(id);
