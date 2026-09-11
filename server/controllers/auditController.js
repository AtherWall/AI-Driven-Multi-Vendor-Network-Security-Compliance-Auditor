import fs from "fs/promises";
import Audit from "../models/Audit.js";
import Configuration from "../models/Configuration.js";
import { convertWithGroq } from "../utils/llm_cdm_engine.js";
import { validateCDM } from "../utils/cdmValidator.js";

export const createAudit = async (req, res) => {
    try {
        const { file_id } = req.body;

        if (!file_id) {
            return res.status(400).json({
                success: false,
                message: "file_id is required",
            });
        }

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

        const existingAudit = await Audit.findOne({
            configurationId: configuration._id,
            userId: req.user._id,
        });

        if (existingAudit && existingAudit.status === "completed") {
            return res.status(200).json({
                success: true,
                audit_id: existingAudit._id,
                file_id: configuration._id,
                status: existingAudit.status,
                vendor: existingAudit.vendor,
                cdm_valid: existingAudit.cdmValid,
                message: "Audit already exists for this configuration",
            });
        }

        let audit = existingAudit;

        if (!audit) {
            audit = await Audit.create({
                userId: req.user._id,
                configurationId: configuration._id,
                status: "processing",
                cdmValid: null,
                validationErrors: [],
            });

            configuration.auditId = audit._id;
        } else {
            audit.status = "processing";
            audit.cdmValid = null;
            audit.validationErrors = [];
            audit.vendor = null;
            audit.cdm = null;
        }

        configuration.status = "processing";

        await audit.save();
        await configuration.save();

        try {
            const rawConfiguration = await fs.readFile(
                configuration.filePath,
                "utf-8"
            );

            console.log("Starting CDM conversion...");

            const cdm = await convertWithGroq(rawConfiguration);

            console.log("CDM conversion completed");
            console.log("Generated CDM:", JSON.stringify(cdm, null, 2));

            const validation = validateCDM(cdm);

            console.log("CDM validation result:", JSON.stringify(validation, null, 2));

            if (!validation.valid) {
                const error = new Error("Generated CDM failed validation.");
                error.name = "CDMValidationError";
                error.errors = validation.errors;
                error.candidate = cdm;
                throw error;
            }

            const validatedCDM = validation.cdm;
            const vendor = validatedCDM.device?.metadata?.vendor ?? null;

            audit.status = "completed";
            audit.cdmValid = true;
            audit.cdm = validatedCDM;
            audit.vendor = vendor;
            audit.validationErrors = [];

            await audit.save();

            configuration.status = "completed";
            configuration.vendor = vendor;

            await configuration.save();

            return res.status(201).json({
                success: true,
                audit_id: audit._id,
                file_id: configuration._id,
                status: audit.status,
                vendor: audit.vendor,
                cdm_valid: audit.cdmValid,
                message: "Configuration converted to CDM and validated successfully",
            });
        } catch (processingError) {
            console.error("Audit processing error:", processingError);
            console.error(
                "Validation errors:",
                JSON.stringify(processingError.errors ?? [], null, 2)
            );

            audit.status = "failed";
            audit.cdmValid = false;
            audit.cdm = null;
            audit.vendor = null;
            audit.validationErrors = processingError.errors ?? [];

            await audit.save();

            configuration.status = "failed";
            configuration.vendor = null;

            await configuration.save();

            return res.status(422).json({
                success: false,
                audit_id: audit._id,
                file_id: configuration._id,
                status: "failed",
                message: processingError.message,
                errors: processingError.errors ?? [],
            });
        }
    } catch (error) {
        console.error("Create audit error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create audit",
        });
    }
};