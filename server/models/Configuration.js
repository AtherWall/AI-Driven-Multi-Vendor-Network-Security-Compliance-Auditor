import mongoose from "mongoose";

const configurationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        filename: {
            type: String,
            required: true,
            trim: true,
        },

        originalName: {
            type: String,
            required: true,
            trim: true,
        },

        filePath: {
            type: String,
            required: true,
        },

        fileType: {
            type: String,
            trim: true,
        },

        fileSize: {
            type: Number,
            default: 0,
        },

        vendor: {
            type: String,
            default: "Unknown",
            trim: true,
        },

        status: {
            type: String,
            enum: [
                "uploaded",
                "processing",
                "completed",
                "failed",
            ],
            default: "uploaded",
        },

        auditId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Audit",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Configuration = mongoose.model(
    "Configuration",
    configurationSchema
);

export default Configuration;