import { z } from "zod";

// ============================================
// IP ADDRESS
// ============================================

const IPAddressSchema = z
    .object({
        address: z.string().min(1),
        prefix_length: z.number().int().min(0).max(128),
    })
    .strict()
    .superRefine((data, ctx) => {
        const ipv4 =
            /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;

        const ipv6 =
            /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(([0-9a-fA-F]{1,4}:){1,7}:)|(([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2})|(([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3})|(([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4})|(([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5})|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6}))|(:((:[0-9a-fA-F]{1,4}){1,7}|:)))$/;

        if (!ipv4.test(data.address) && !ipv6.test(data.address)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["address"],
                message: `Invalid IP address: ${data.address}`,
            });
        }

        if (ipv4.test(data.address) && data.prefix_length > 32) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["prefix_length"],
                message: "IPv4 prefix_length must be between 0 and 32",
            });
        }
    });

// ============================================
// INTERFACE
// ============================================

const InterfaceSchema = z
    .object({
        id: z.string().min(1),
        name: z.string().min(1),
        enabled: z.boolean(),
        description: z.string().optional(),
        ip_addresses: z.array(IPAddressSchema).optional(),
    })
    .strict();

// ============================================
// METADATA
// ============================================

const MetadataSchema = z
    .object({
        vendor: z.string().min(1).optional(),
        platform: z.string().min(1).optional(),
    })
    .strict();

// ============================================
// SECURITY RULE
// ============================================

const SecurityRuleSchema = z
    .object({
        id: z.string().min(1),

        action: z.enum(["allow", "deny"]),

        protocol: z.enum([
            "tcp",
            "udp",
            "icmp",
        ]),

        source: z.string().min(1),

        destination: z.string().min(1),

        destination_port: z
            .number()
            .int()
            .min(1)
            .max(65535)
            .optional(),

        enabled: z.boolean(),
    })
    .strict();

// ============================================
// DEVICE
// ============================================

const DeviceSchema = z
    .object({
        id: z.string().min(1),

        hostname: z.string().min(1),

        metadata: MetadataSchema.optional(),

        interfaces: z.array(InterfaceSchema),

        security_policies: z.array(SecurityRuleSchema),

        routing: z
            .record(z.string(), z.any())
            .optional(),
    })
    .strict();

// ============================================
// ROOT CDM
// ============================================

const NetworkSecurityCDMSchema = z
    .object({
        schema_version: z
            .string()
            .regex(
                /^\d+\.\d+\.\d+$/,
                "schema_version must follow semantic version format (example: 1.0.0)"
            ),

        device: DeviceSchema,
    })
    .strict();

// ============================================
// VALIDATE CDM OBJECT
// ============================================

function validateCDM(cdmData) {
    const result = NetworkSecurityCDMSchema.safeParse(cdmData);

    if (result.success) {
        return {
            valid: true,
            cdm: result.data,
            errors: [],
        };
    }

    return {
        valid: false,
        cdm: null,
        errors: result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
            code: issue.code,
        })),
    };
}

// ============================================
// VALIDATE JSON FILE
// ============================================

async function validateJSONFile(file) {
    let text;

    try {
        text = await file.text();
    } catch (error) {
        return {
            valid: false,
            cdm: null,
            errors: [
                {
                    message: "Unable to read file.",
                },
            ],
        };
    }

    let cdmData;

    try {
        cdmData = JSON.parse(text);
    } catch (error) {
        return {
            valid: false,
            cdm: null,
            errors: [
                {
                    path: "",
                    message: `Invalid JSON: ${error.message}`,
                },
            ],
        };
    }

    if (
        typeof cdmData !== "object" ||
        cdmData === null ||
        Array.isArray(cdmData)
    ) {
        return {
            valid: false,
            cdm: null,
            errors: [
                {
                    path: "",
                    message: "JSON root must be an object/dictionary.",
                },
            ],
        };
    }

    return validateCDM(cdmData);
}

export {
    IPAddressSchema,
    InterfaceSchema,
    MetadataSchema,
    SecurityRuleSchema,
    DeviceSchema,
    NetworkSecurityCDMSchema,
    validateCDM,
    validateJSONFile,
};