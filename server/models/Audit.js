import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        configurationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Configuration",
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "processing", "completed", "failed"],
            default: "pending",
        },

        vendor: {
            type: String,
            default: null,
            trim: true,
        },

        cdmValid: {
            type: Boolean,
            default: null,
        },

        cdm: {
            schema_version: {
                type: String,
                default: null,
            },

            device: {
                id: {
                    type: String,
                    default: null,
                },

                hostname: {
                    type: String,
                    default: null,
                },

                metadata: {
                    vendor: {
                        type: String,
                        default: null,
                    },

                    platform: {
                        type: String,
                        default: null,
                    },
                },

                interfaces: {
                    type: Array,
                    default: [],
                },

                security_policies: {
                    type: Array,
                    default: [],
                },

                routing: {
                    type: mongoose.Schema.Types.Mixed,
                    default: null,
                },
            },
        },

        validationErrors: {
            type: Array,
            default: [],
        },

        score: {
            type: Number,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Audit = mongoose.model("Audit", auditSchema);

export default Audit;