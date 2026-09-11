import fs from "fs/promises";
import Configuration from "../models/Configuration.js";
import Audit from "../models/Audit.js";

export const uploadConfiguration = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Configuration file is required",
            });
        }

        const configuration = await Configuration.create({
            userId: req.user._id,
            filename: req.file.filename,
            originalName: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            status: "uploaded",
        });

        return res.status(201).json({
            success: true,
            file_id: configuration._id,
            filename: configuration.originalName,
            message: "Configuration uploaded successfully",
        });
    } catch (error) {
        console.error("Upload configuration error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to upload configuration",
        });
    }
};

export const getConfigurations = async (req, res) => {
    try {
        const configurations = await Configuration.find({
            userId: req.user._id,
        })
            .populate("auditId")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            configurations,
        });
    } catch (error) {
        console.error("Get configurations error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch configurations",
        });
    }
};

export const getConfiguration = async (req, res) => {
    try {
        const configuration = await Configuration.findOne({
            _id: req.params.file_id,
            userId: req.user._id,
        }).populate("auditId");

        if (!configuration) {
            return res.status(404).json({
                success: false,
                message: "Configuration not found",
            });
        }

        return res.status(200).json({
            success: true,
            configuration,
        });
    } catch (error) {
        console.error("Get configuration error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch configuration",
        });
    }
};
export const deleteConfiguration = async (req, res) => {
    try {
        const { file_id } = req.params;

        const configuration = await Configuration.findOne({
            _id: file_id,
            userId: req.user._id,
        });

        if (!configuration) {
            return res.status(404).json({
                success: false,
                message: "Configuration not found",
            });
        }

        if (configuration.filePath) {
            try {
                await fs.unlink(configuration.filePath);
            } catch (fileError) {
                if (fileError.code !== "ENOENT") {
                    console.error("File deletion error:", fileError);
                }
            }
        }

        await Audit.deleteMany({
            configurationId: configuration._id,
            userId: req.user._id,
        });

        await Configuration.deleteOne({
            _id: configuration._id,
            userId: req.user._id,
        });

        return res.status(200).json({
            success: true,
            message: "Configuration deleted successfully",
        });
    } catch (error) {
        console.error("Delete configuration error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete configuration",
        });
    }
};