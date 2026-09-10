import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    FaShieldAlt,
    FaUpload,
    FaNetworkWired,
    FaFileAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaBrain,
    FaChartBar,
    FaCog,
    FaSignOutAlt,
    FaRoute,
    FaArrowRight,
} from "react-icons/fa";
import api from "../utils/axios";

function Dashboard() {
    const navigate = useNavigate();

    const [selectedFile, setSelectedFile] = useState(null);
    const [fileId, setFileId] = useState(null);
    const [auditId, setAuditId] = useState(null);
    const [auditData, setAuditData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (!file) return;

        setSelectedFile(file);
        setFileId(null);
        setAuditId(null);
        setAuditData(null);
        setError("");
    };

    const handleUploadAndAudit = async () => {
        if (!selectedFile) {
            setError("Please select a configuration file first.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            // Upload configuration
            const formData = new FormData();
            formData.append("file", selectedFile);

            const uploadResponse = await api.post("/api/upload", formData);
            const uploadedFileId = uploadResponse.data.file_id;

            setFileId(uploadedFileId);

            // Audit configuration
            const auditResponse = await api.post("/api/audit", {
                file_id: uploadedFileId,
            });

            const audit = auditResponse.data;

            setAuditId(audit.audit_id);
            setAuditData(audit);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail?.message ||
                err.response?.data?.detail ||
                "Something went wrong while processing the configuration."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
            <div className="flex min-h-screen">
                {/* SIDEBAR */}
                <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#07152f] text-white lg:flex">
                    {/* Logo */}
                    <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                            <FaShieldAlt className="text-lg" />
                        </div>

                        <div>
                            <p className="text-sm font-bold leading-tight">
                                AI Network Security
                            </p>

                            <p className="text-sm font-bold leading-tight text-blue-400">
                                Auditor
                            </p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6">
                        <SidebarLink
                            to="/dashboard"
                            icon={<FaNetworkWired />}
                            label="Dashboard"
                        />

                        <SidebarLink
                            to="/configurations"
                            icon={<FaFileAlt />}
                            label="Configurations"
                        />

                        <SidebarLink
                            to="/topology"
                            icon={<FaRoute />}
                            label="Network Topology"
                        />

                        <SidebarLink
                            to="/ai-training"
                            icon={<FaBrain />}
                            label="AI Training"
                        />

                        <SidebarLink
                            to="/compliance"
                            icon={<FaShieldAlt />}
                            label="Audit & Compliance"
                        />

                        <SidebarLink
                            to="/reports"
                            icon={<FaChartBar />}
                            label="Reports"
                        />

                    </nav>

                    {/* Bottom */}
                    <div className="border-t border-white/10 px-4 py-5">
                        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white">
                            <FaSignOutAlt />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* MAIN */}
                <main className="min-w-0 flex-1 lg:ml-64">
                    {/* HEADER */}
                    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-8">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                Dashboard
                            </h1>

                            <p className="text-sm text-slate-500">
                                AI-powered network security compliance
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-semibold text-slate-800">
                                    Network Administrator
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                A
                            </div>
                        </div>
                    </header>

                    {/* CONTENT */}
                    <div className="p-6 lg:p-8">
                        {/* WELCOME */}
                        <section className="mb-7">
                            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                                <div>
                                    <p className="text-sm font-semibold text-blue-600">
                                        Security Overview
                                    </p>

                                    <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                                        Welcome back!
                                    </h2>

                                    <p className="mt-2 text-sm text-slate-500">
                                        Monitor your network security and compliance from one place.
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        document.getElementById("fileInput")?.click()
                                    }
                                    className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                                >
                                    <FaUpload />
                                    Upload Configuration
                                </button>
                            </div>
                        </section>

                        {/* STAT CARDS */}
                        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            <StatCard
                                title="Configurations"
                                value={fileId ? "1" : "0"}
                                subtitle={fileId ? "Current upload" : "No uploads yet"}
                                icon={<FaFileAlt />}
                                iconBg="bg-blue-50"
                                iconColor="text-blue-600"
                            />

                            <StatCard
                                title="Valid CDM"
                                value={auditData?.cdm_valid ? "1" : "0"}
                                subtitle={
                                    auditData?.cdm_valid
                                        ? "Validation successful"
                                        : "Awaiting analysis"
                                }
                                icon={<FaCheckCircle />}
                                iconBg="bg-emerald-50"
                                iconColor="text-emerald-600"
                            />

                            <StatCard
                                title="Invalid CDM"
                                value={auditData?.cdm_valid === false ? "1" : "0"}
                                subtitle={
                                    auditData?.cdm_valid === false
                                        ? "Requires attention"
                                        : "No invalid CDM"
                                }
                                icon={<FaTimesCircle />}
                                iconBg="bg-red-50"
                                iconColor="text-red-600"
                            />

                            <StatCard
                                title="Audit Status"
                                value={auditId ? "Done" : loading ? "Running" : "Idle"}
                                subtitle={
                                    auditId
                                        ? `Audit ${auditId}`
                                        : "No active audit"
                                }
                                icon={<FaShieldAlt />}
                                iconBg="bg-purple-50"
                                iconColor="text-purple-600"
                            />
                        </section>

                        {/* MAIN TWO COLUMN */}
                        <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                            {/* UPLOAD */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">
                                            Upload Configuration
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Upload a network device configuration for analysis.
                                        </p>
                                    </div>

                                    <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:flex">
                                        <FaUpload />
                                    </div>
                                </div>

                                <label className="mt-6 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 px-6 text-center transition hover:border-blue-400 hover:bg-blue-50">
                                    <input
                                        id="fileInput"
                                        type="file"
                                        className="hidden"
                                        accept=".txt,.conf,.cfg,.json"
                                        onChange={handleFileChange}
                                    />

                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-600">
                                        <FaUpload />
                                    </div>

                                    <p className="mt-4 text-sm font-semibold text-slate-800">
                                        {selectedFile
                                            ? selectedFile.name
                                            : "Drag and drop your configuration here"}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        or click to browse files
                                    </p>

                                    <p className="mt-4 text-xs text-slate-400">
                                        Supports .txt, .conf, .cfg and .json
                                    </p>
                                </label>

                                {selectedFile && (
                                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-slate-800">
                                                    {selectedFile.name}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>

                                            <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                                Ready
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleUploadAndAudit}
                                    disabled={loading}
                                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <FaUpload />
                                    {loading ? "Processing..." : "Upload & Analyze"}
                                </button>
                            </div>

                            {/* PROCESSING STATUS */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900">
                                    Processing Status
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Configuration analysis pipeline
                                </p>

                                <div className="mt-6 space-y-5">
                                    <ProcessStep
                                        number="1"
                                        title="File uploaded"
                                        active={Boolean(fileId)}
                                        complete={Boolean(fileId)}
                                    />

                                    <ProcessStep
                                        number="2"
                                        title="Configuration analyzed"
                                        active={Boolean(fileId)}
                                        complete={Boolean(auditId)}
                                    />

                                    <ProcessStep
                                        number="3"
                                        title="CDM validated"
                                        active={Boolean(auditId)}
                                        complete={Boolean(auditData?.cdm_valid)}
                                    />

                                    <ProcessStep
                                        number="4"
                                        title="Audit completed"
                                        active={Boolean(auditData)}
                                        complete={Boolean(auditData)}
                                    />
                                </div>

                                {auditId && (
                                    <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                        <div className="flex items-start gap-3">
                                            <FaCheckCircle className="mt-0.5 text-emerald-600" />

                                            <div>
                                                <p className="text-sm font-semibold text-emerald-800">
                                                    Analysis completed successfully
                                                </p>

                                                <p className="mt-1 text-xs text-emerald-700">
                                                    Audit ID: {auditId}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* TOPOLOGY SHORTCUT */}
                        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
                                        <FaNetworkWired />
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">
                                            Network Topology
                                        </h3>

                                        <p className="mt-1 max-w-2xl text-sm text-slate-500">
                                            Explore the complete interactive network topology,
                                            devices, connections, vendors and risk information
                                            on the topology page.
                                        </p>

                                        {auditId && (
                                            <div className="mt-3 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                Topology available for {auditId}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate("/topology")}
                                    className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                                >
                                    View Full Topology
                                    <FaArrowRight className="text-xs" />
                                </button>
                            </div>
                        </section>

                        {/* RECENT CONFIGURATIONS */}
                        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">
                                        Recent Configurations
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Recently analyzed network configuration files.
                                    </p>
                                </div>

                                <NavLink
                                    to="/configurations"
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                                >
                                    View All
                                </NavLink>
                            </div>

                            <div className="mt-6 overflow-x-auto">
                                <table className="w-full min-w-[650px] text-left">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                                            <th className="pb-3 font-semibold">
                                                Configuration
                                            </th>

                                            <th className="pb-3 font-semibold">
                                                Vendor
                                            </th>

                                            <th className="pb-3 font-semibold">
                                                Status
                                            </th>

                                            <th className="pb-3 font-semibold">
                                                Audit ID
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {!selectedFile ? (
                                            <tr>
                                                <td
                                                    colSpan="4"
                                                    className="py-10 text-center text-sm text-slate-400"
                                                >
                                                    No configurations analyzed yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr className="border-b border-slate-100 last:border-0">
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                                            <FaFileAlt />
                                                        </div>

                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800">
                                                                {selectedFile.name}
                                                            </p>

                                                            <p className="text-xs text-slate-400">
                                                                {fileId || "Uploading..."}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-4 text-sm text-slate-600">
                                                    {auditData?.vendor || "Detecting..."}
                                                </td>

                                                <td className="py-4">
                                                    {auditId ? (
                                                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                            Completed
                                                        </span>
                                                    ) : loading ? (
                                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                                            Processing
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                                            Ready
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-4 text-sm text-slate-500">
                                                    {auditId || "—"}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}

function SidebarLink({ to, icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
            }
        >
            {icon}
            {label}
        </NavLink>
    );
}

function StatCard({
    title,
    value,
    subtitle,
    icon,
    iconBg,
    iconColor,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
                >
                    {icon}
                </div>

                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Overview
                </span>
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
                {title}
            </p>

            <h3 className="mt-1 text-3xl font-bold text-slate-900">
                {value}
            </h3>

            <p className="mt-1 truncate text-xs text-slate-400">
                {subtitle}
            </p>
        </div>
    );
}

function ProcessStep({ number, title, complete, active }) {
    return (
        <div className="flex items-center gap-3">
            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    complete
                        ? "bg-emerald-100 text-emerald-600"
                        : active
                        ? "bg-blue-100 text-blue-600"
                        : "bg-slate-100 text-slate-400"
                }`}
            >
                {complete ? <FaCheckCircle /> : number}
            </div>

            <div>
                <p
                    className={`text-sm font-semibold ${
                        complete || active
                            ? "text-slate-800"
                            : "text-slate-400"
                    }`}
                >
                    {title}
                </p>

                <p className="text-xs text-slate-400">
                    {complete
                        ? "Completed"
                        : active
                        ? "In progress"
                        : "Waiting"}
                </p>
            </div>
        </div>
    );
}

export default Dashboard;