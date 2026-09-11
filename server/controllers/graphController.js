import Audit from "../models/Audit.js";
import { buildGraphFromCDM } from "../utils/graph_builder.js";

export const getGraph = async (req, res) => {
    try {
        const { audit_id } = req.params;

        if (!audit_id) {
            return res.status(400).json({
                success: false,
                message: "audit_id is required",
            });
        }

        const audit = await Audit.findOne({
            _id: audit_id,
            userId: req.user._id,
        });

        if (!audit) {
            return res.status(404).json({
                success: false,
                message: "Audit not found",
            });
        }

        if (audit.status !== "completed") {
            return res.status(409).json({
                success: false,
                message: "Audit is not completed yet",
                status: audit.status,
            });
        }

        if (audit.cdmValid !== true || !audit.cdm) {
            return res.status(409).json({
                success: false,
                message: "Valid CDM is not available for this audit",
            });
        }

        const graph = buildGraphFromCDM(audit.cdm);

        return res.status(200).json({
            success: true,
            audit_id: audit._id,
            nodes: graph.nodes,
            edges: graph.edges,
        });
    } catch (error) {
        console.error("Get graph error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to generate network graph",
        });
    }
};