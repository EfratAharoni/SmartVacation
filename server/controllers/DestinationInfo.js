import * as destinationInfoService from "../services/DestinationInfo.js";
import { t } from "../utils/i18n.js";

export const getDestinationInfos = async (req, res) => {
    try {
        const { destination } = req.query;
        if (destination) {
            const found = await destinationInfoService.getDestinationInfoByName(destination);
            if (!found) return res.status(404).json({ message: t(req, "notFound") });
            return res.json(found);
        }
        const all = await destinationInfoService.getAllDestinationInfos();
        res.json(all);
    } catch (err) {
        res.status(500).json({ message: t(req, "serverError") });
    }
};

export const createDestinationInfo = async (req, res) => {
    try {
        const created = await destinationInfoService.createDestinationInfo(req.body);
        res.status(201).json(created);
    } catch (err) {
        res.status(400).json({ message: t(req, "serverError") });
    }
};

export const addManyDestinationInfos = async (req, res) => {
    try {
        const created = await destinationInfoService.createManyDestinationInfos(req.body);
        res.status(201).json(created);
    } catch (err) {
        res.status(400).json({ message: t(req, "serverError") });
    }
};

export const updateDestinationInfo = async (req, res) => {
    try {
        const updated = await destinationInfoService.updateDestinationInfoById(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: t(req, "notFound") });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: t(req, "serverError") });
    }
};

export const removeDestinationInfo = async (req, res) => {
    try {
        const deleted = await destinationInfoService.deleteDestinationInfoById(req.params.id);
        if (!deleted) return res.status(404).json({ message: t(req, "notFound") });
        res.json({ message: t(req, "deleted"), deleted });
    } catch (err) {
        res.status(500).json({ message: t(req, "serverError") });
    }
};
