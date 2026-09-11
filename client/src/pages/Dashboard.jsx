import React, { useEffect, useState } from "react";
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
    FaRoute,
    FaArrowRight,
    FaSignOutAlt,
} from "react-icons/fa";
import api from "../utils/axios";

function Dashboard({ user, onLogout }) {
    const navigate = useNavigate();

    const [selectedFile, setSelectedFile] = useState(null);
    const [configurations, setConfigurations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboardData = async () => {
        try {
            setFetchingData(true);
            setError("");

            const response = await api.get("/api/configurations");

            setConfigurations(response.data.configurations || []);
        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load dashboard data."
            );
        } finally {
            setFetchingData(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (!file) return;

        setSelectedFile(file);
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

            const formData = new FormData();
            formData.append("file", selectedFile);

            const uploadResponse = await api.post(
                "/api/upload",
                formData
            );

            const uploadedFileId = uploadResponse.data.file_id;

            await api.post("/api/audit", {
                file_id: uploadedFileId,
            });

            setSelectedFile(null);

            const fileInput = document.getElementById("fileInput");

            if (fileInput) {
                fileInput.value = "";
            }

            await fetchDashboardData();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.detail ||
                "Something went wrong while processing the configuration."
            );
        } finally {
            setLoading(false);
        }
    };

    const totalConfigurations = configurations.length;

    const validCDM = configurations.filter(
        (configuration) =>
            configuration.auditId?.cdmValid === true
    ).length;

    const invalidCDM = configurations.filter(
        (configuration) =>
            configuration.auditId?.cdmValid === false
    ).length;

    const latestConfiguration = configurations[0] || null;

    const latestAudit = latestConfiguration?.auditId || null;

    return (
        <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
            <div className="flex min-h-screen">
                {/* SIDEBAR */}
                <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#07152f] text-white lg:flex">
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

                    <div className="border-t border-white/10 px-4 py-5">
                        <button
                            onClick={onLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
                        >
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
                                    {user?.name || "Network Administrator"}
                                </p>

                                <p className="text-xs text-slate-500">
                                    {user?.email || "Network Administrator"}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                {user?.name?.charAt(0)?.toUpperCase() || "A"}
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
                                        Welcome back, {user?.name || "User"}!
                                    </h2>

                                    <p className="mt-2 text-sm text-slate-500">
                                        Monitor your network security and compliance from one place.
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        document
                                            .getElementById("fileInput")
                                            ?.click()
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
                                value={
                                    fetchingData
                                        ? "..."
                                        : totalConfigurations
                                }
                                subtitle="Total uploaded configurations"
                                icon={<FaFileAlt />}
                                iconBg="bg-blue-50"
                                iconColor="text-blue-600"
                            />

                            <StatCard
                                title="Valid CDM"
                                value={
                                    fetchingData
                                        ? "..."
                                        : validCDM
                                }
                                subtitle="Successfully validated"
                                icon={<FaCheckCircle />}
                                iconBg="bg-emerald-50"
                                iconColor="text-emerald-600"
                            />

                            <StatCard
                                title="Invalid CDM"
                                value={
                                    fetchingData
                                        ? "..."
                                        : invalidCDM
                                }
                                subtitle="Requires attention"
                                icon={<FaTimesCircle />}
                                iconBg="bg-red-50"
                                iconColor="text-red-600"
                            />

                            <StatCard
                                title="Audit Status"
                                value={
                                    fetchingData
                                        ? "..."
                                        : latestAudit?.status === "completed"
                                        ? "Done"
                                        : latestAudit?.status || "Idle"
                                }
                                subtitle={
                                    latestAudit
                                        ? `Audit ${latestAudit._id}`
                                        : "No audits yet"
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
                                    {loading
                                        ? "Processing..."
                                        : "Upload & Analyze"}
                                </button>
                            </div>

                            {/* PROCESSING STATUS */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900">
                                    Processing Status
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Latest configuration analysis
                                </p>

                                <div className="mt-6 space-y-5">
                                    <ProcessStep
                                        number="1"
                                        title="File uploaded"
                                        active={Boolean(latestConfiguration)}
                                        complete={Boolean(
                                            latestConfiguration
                                        )}
                                    />

                                    <ProcessStep
                                        number="2"
                                        title="Configuration analyzed"
                                        active={Boolean(latestAudit)}
                                        complete={
                                            latestAudit?.status ===
                                            "completed"
                                        }
                                    />

                                    <ProcessStep
                                        number="3"
                                        title="CDM validated"
                                        active={Boolean(
                                            latestAudit
                                        )}
                                        complete={
                                            latestAudit?.cdmValid ===
                                            true
                                        }
                                    />

                                    <ProcessStep
                                        number="4"
                                        title="Audit completed"
                                        active={Boolean(latestAudit)}
                                        complete={
                                            latestAudit?.status ===
                                            "completed"
                                        }
                                    />
                                </div>

                                {latestAudit?.status === "completed" && (
                                    <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                        <div className="flex items-start gap-3">
                                            <FaCheckCircle className="mt-0.5 text-emerald-600" />

                                            <div>
                                                <p className="text-sm font-semibold text-emerald-800">
                                                    Analysis completed successfully
                                                </p>

                                                <p className="mt-1 text-xs text-emerald-700">
                                                    Audit ID:{" "}
                                                    {latestAudit._id}
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
                                            Explore the complete interactive network topology, devices, connections, vendors and risk information on the topology page.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() =>
                                        navigate("/topology")
                                    }
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
                                        Recently uploaded and analyzed configuration files.
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
                                        {fetchingData ? (
                                            <tr>
                                                <td
                                                    colSpan="4"
                                                    className="py-10 text-center text-sm text-slate-400"
                                                >
                                                    Loading configurations...
                                                </td>
                                            </tr>
                                        ) : configurations.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="4"
                                                    className="py-10 text-center text-sm text-slate-400"
                                                >
                                                    No configurations analyzed yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            configurations
                                                .slice(0, 5)
                                                .map((configuration) => (
                                                    <tr
                                                        key={configuration._id}
                                                        className="border-b border-slate-100 last:border-0"
                                                    >
                                                        <td className="py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                                                    <FaFileAlt />
                                                                </div>

                                                                <div>
                                                                    <p className="text-sm font-semibold text-slate-800">
                                                                        {
                                                                            configuration.originalName
                                                                        }
                                                                    </p>

                                                                    <p className="text-xs text-slate-400">
                                                                        {
                                                                            configuration._id
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="py-4 text-sm text-slate-600">
                                                            {configuration.vendor ||
                                                                configuration.auditId?.vendor ||
                                                                "Detecting..."}
                                                        </td>

                                                        <td className="py-4">
                                                            {configuration.status ===
                                                            "completed" ? (
                                                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                                    Completed
                                                                </span>
                                                            ) : configuration.status ===
                                                              "processing" ? (
                                                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                                                    Processing
                                                                </span>
                                                            ) : configuration.status ===
                                                              "failed" ? (
                                                                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                                                    Failed
                                                                </span>
                                                            ) : (
                                                                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                                                    Uploaded
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="py-4 text-sm text-slate-500">
                                                            {configuration.auditId?._id ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                ))
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

function ProcessStep({
    number,
    title,
    complete,
    active,
}) {
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