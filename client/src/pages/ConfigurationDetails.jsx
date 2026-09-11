import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaServer, FaNetworkWired, FaShieldHalved, FaCircleNotch } from "react-icons/fa6";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import api from "../utils/axios";

function ConfigurationDetails({ user, onLogout }) {
    const { file_id } = useParams();
    const navigate = useNavigate();

    const [configuration, setConfiguration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchConfiguration = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(`/api/configurations/${file_id}`);
            setConfiguration(response.data.configuration);
        } catch (error) {
            console.error("Fetch configuration error:", error);
            setError(
                error.response?.data?.message ||
                "Failed to load configuration."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfiguration();
    }, [file_id]);

    const formatDate = (date) => {
        if (!date) {
            return "Not available";
        }

        return new Date(date).toLocaleString();
    };

    const formatFileSize = (size) => {
        if (!size) {
            return "0 B";
        }

        if (size < 1024) {
            return `${size} B`;
        }

        if (size < 1024 * 1024) {
            return `${(size / 1024).toFixed(2)} KB`;
        }

        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    };

    const getStatusStyle = (status) => {
        if (status === "completed") {
            return "bg-emerald-100 text-emerald-700";
        }

        if (status === "processing") {
            return "bg-blue-100 text-blue-700";
        }

        if (status === "failed") {
            return "bg-red-100 text-red-700";
        }

        return "bg-slate-100 text-slate-700";
    };

    const renderValue = (value) => {
        if (value === null || value === undefined || value === "") {
            return "Not available";
        }

        return String(value);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-100">
                <aside className="flex w-64 flex-col bg-[#06152f] text-white">
                    <div className="flex h-24 items-center border-b border-white/10 px-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
                            <FaShieldHalved className="text-xl" />
                        </div>
                        <div className="ml-3">
                            <h1 className="text-sm font-bold">AI Network Security</h1>
                            <p className="text-sm font-bold text-blue-400">Auditor</p>
                        </div>
                    </div>
                </aside>

                <main className="flex flex-1 items-center justify-center">
                    <div className="text-center">
                        <FaCircleNotch className="mx-auto animate-spin text-3xl text-blue-600" />
                        <p className="mt-4 text-sm text-slate-500">Loading configuration...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-100">
            <aside className="flex w-64 flex-col bg-[#06152f] text-white">
                <div className="flex h-24 items-center border-b border-white/10 px-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-900/30">
                        <FaShieldHalved className="text-xl" />
                    </div>

                    <div className="ml-3">
                        <h1 className="text-sm font-bold">AI Network Security</h1>
                        <p className="text-sm font-bold text-blue-400">Auditor</p>
                    </div>
                </div>

                <nav className="flex-1 p-3">
                    <button onClick={() => navigate("/dashboard")} className="mb-1 flex w-full items-center rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white">
                        Dashboard
                    </button>

                    <button onClick={() => navigate("/configurations")} className="mb-1 flex w-full items-center rounded-lg bg-blue-600 px-4 py-3 text-left text-sm font-semibold text-white">
                        Configurations
                    </button>

                    <button onClick={() => navigate("/topology")} className="mb-1 flex w-full items-center rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white">
                        Network Topology
                    </button>

                    <button onClick={() => navigate("/ai-training")} className="mb-1 flex w-full items-center rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white">
                        AI Training
                    </button>

                    <button onClick={() => navigate("/compliance")} className="mb-1 flex w-full items-center rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white">
                        Audit & Compliance
                    </button>

                    <button onClick={() => navigate("/reports")} className="mb-1 flex w-full items-center rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white">
                        Reports
                    </button>
                </nav>

                <div className="border-t border-white/10 p-3">
                    <button onClick={onLogout} className="flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white">
                        Logout
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-7xl p-8">
                    <button onClick={() => navigate("/configurations")} className="mb-6 flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700">
                        <FaArrowLeft />
                        Back to Configurations
                    </button>

                    {error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
                            {error}
                        </div>
                    ) : configuration ? (
                        <>
                            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                                    <div>
                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                            Configuration
                                        </p>
                                        <h2 className="text-2xl font-bold text-slate-900">
                                            {renderValue(configuration.originalName)}
                                        </h2>
                                        <p className="mt-2 break-all text-sm text-slate-400">
                                            ID: {renderValue(configuration._id)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${getStatusStyle(configuration.status)}`}>
                                            {renderValue(configuration.status)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <p className="text-sm text-slate-400">Vendor</p>
                                    <p className="mt-2 text-lg font-bold text-slate-900">
                                        {renderValue(configuration.vendor || configuration.auditId?.vendor)}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <p className="text-sm text-slate-400">File Type</p>
                                    <p className="mt-2 text-lg font-bold text-slate-900">
                                        {renderValue(configuration.fileType)}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <p className="text-sm text-slate-400">File Size</p>
                                    <p className="mt-2 text-lg font-bold text-slate-900">
                                        {formatFileSize(configuration.fileSize)}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <p className="text-sm text-slate-400">Uploaded</p>
                                    <p className="mt-2 text-lg font-bold text-slate-900">
                                        {formatDate(configuration.createdAt)}
                                    </p>
                                </div>
                            </div>

                            {configuration.auditId ? (
                                <>
                                    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <div className="mb-5 flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                                <FaServer />
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">
                                                    CDM Device Information
                                                </h3>
                                                <p className="text-sm text-slate-400">
                                                    Normalized device information generated from the configuration
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    Device ID
                                                </p>
                                                <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                                                    {renderValue(configuration.auditId.cdm?.device?.id)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    Hostname
                                                </p>
                                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                                    {renderValue(configuration.auditId.cdm?.device?.hostname)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    Platform
                                                </p>
                                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                                    {renderValue(configuration.auditId.cdm?.device?.metadata?.platform)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <div className="mb-5 flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                                <FaNetworkWired />
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">
                                                    Interfaces
                                                </h3>
                                                <p className="text-sm text-slate-400">
                                                    Interfaces extracted into the Common Data Model
                                                </p>
                                            </div>
                                        </div>

                                        {configuration.auditId.cdm?.device?.interfaces?.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                                                            <th className="pb-3 pr-4">Name</th>
                                                            <th className="pb-3 pr-4">ID</th>
                                                            <th className="pb-3 pr-4">Status</th>
                                                            <th className="pb-3">Description</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {configuration.auditId.cdm.device.interfaces.map((item, index) => (
                                                            <tr key={item.id || index} className="border-b border-slate-100 last:border-0">
                                                                <td className="py-4 pr-4 text-sm font-semibold text-slate-900">
                                                                    {renderValue(item.name)}
                                                                </td>
                                                                <td className="py-4 pr-4 text-sm text-slate-500">
                                                                    {renderValue(item.id)}
                                                                </td>
                                                                <td className="py-4 pr-4">
                                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.enabled ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                                                        {item.enabled ? "Enabled" : "Disabled"}
                                                                    </span>
                                                                </td>
                                                                <td className="py-4 text-sm text-slate-500">
                                                                    {renderValue(item.description)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                                                No interfaces were found in the CDM.
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <div className="mb-5 flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                                <FaShieldHalved />
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">
                                                    Security Policies
                                                </h3>
                                                <p className="text-sm text-slate-400">
                                                    Security rules extracted from the normalized configuration
                                                </p>
                                            </div>
                                        </div>

                                        {configuration.auditId.cdm?.device?.security_policies?.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                                                            <th className="pb-3 pr-4">ID</th>
                                                            <th className="pb-3 pr-4">Action</th>
                                                            <th className="pb-3 pr-4">Protocol</th>
                                                            <th className="pb-3 pr-4">Source</th>
                                                            <th className="pb-3 pr-4">Destination</th>
                                                            <th className="pb-3">Port</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {configuration.auditId.cdm.device.security_policies.map((rule, index) => (
                                                            <tr key={rule.id || index} className="border-b border-slate-100 last:border-0">
                                                                <td className="py-4 pr-4 text-sm font-semibold text-slate-900">
                                                                    {renderValue(rule.id)}
                                                                </td>
                                                                <td className="py-4 pr-4">
                                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${rule.action === "allow" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                                                        {renderValue(rule.action)}
                                                                    </span>
                                                                </td>
                                                                <td className="py-4 pr-4 text-sm text-slate-500">
                                                                    {renderValue(rule.protocol)}
                                                                </td>
                                                                <td className="py-4 pr-4 text-sm text-slate-500">
                                                                    {renderValue(rule.source)}
                                                                </td>
                                                                <td className="py-4 pr-4 text-sm text-slate-500">
                                                                    {renderValue(rule.destination)}
                                                                </td>
                                                                <td className="py-4 text-sm text-slate-500">
                                                                    {renderValue(rule.destination_port)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                                                No security policies were found in the CDM.
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">
                                                    Audit Result
                                                </h3>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    CDM conversion and validation status
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {configuration.auditId.cdmValid === true ? (
                                                    <>
                                                        <FaCheckCircle className="text-xl text-emerald-500" />
                                                        <span className="font-semibold text-emerald-600">
                                                            CDM Valid
                                                        </span>
                                                    </>
                                                ) : configuration.auditId.cdmValid === false ? (
                                                    <>
                                                        <FaExclamationTriangle className="text-xl text-red-500" />
                                                        <span className="font-semibold text-red-600">
                                                            CDM Invalid
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="font-semibold text-slate-500">
                                                        Validation Pending
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {configuration.auditId.validationErrors?.length > 0 && (
                                            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-5">
                                                <h4 className="mb-3 text-sm font-bold text-red-700">
                                                    Validation Errors
                                                </h4>

                                                <div className="space-y-2">
                                                    {configuration.auditId.validationErrors.map((item, index) => (
                                                        <p key={index} className="text-sm text-red-600">
                                                            {typeof item === "string" ? item : JSON.stringify(item)}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <h3 className="mb-5 text-lg font-bold text-slate-900">
                                            Audit Information
                                        </h3>

                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    Audit ID
                                                </p>
                                                <p className="mt-2 break-all text-sm text-slate-700">
                                                    {renderValue(configuration.auditId._id)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    Audit Status
                                                </p>
                                                <p className="mt-2 text-sm font-semibold capitalize text-slate-700">
                                                    {renderValue(configuration.auditId.status)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    CDM Schema Version
                                                </p>
                                                <p className="mt-2 text-sm text-slate-700">
                                                    {renderValue(configuration.auditId.cdm?.schema_version)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    Processed At
                                                </p>
                                                <p className="mt-2 text-sm text-slate-700">
                                                    {formatDate(configuration.auditId.updatedAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                                    <div className="flex items-start gap-4">
                                        <FaExclamationTriangle className="mt-1 text-xl text-amber-500" />
                                        <div>
                                            <h3 className="font-bold text-amber-800">
                                                Audit not available
                                            </h3>
                                            <p className="mt-1 text-sm text-amber-700">
                                                This configuration has not been processed by the audit engine yet.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                            Configuration not found.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default ConfigurationDetails;