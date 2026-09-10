import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
    FaShieldAlt,
    FaNetworkWired,
    FaFileAlt,
    FaBrain,
    FaChartBar,
    FaCog,
    FaSignOutAlt,
    FaSearch,
    FaDownload,
    FaEye,
    FaFilePdf,
    FaCheckCircle,
    FaExclamationTriangle,
    FaTimesCircle,
    FaClock,
    FaFilter,
    FaTimes,
    FaPrint,
    FaRoute,
} from "react-icons/fa";
import api from "../utils/axios";

function Reports() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [frameworkFilter, setFrameworkFilter] = useState("all");
    const [selectedReport, setSelectedReport] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [useBackend, setUseBackend] = useState(false);
    const [loading, setLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [error, setError] = useState("");

    /*
     * Temporary frontend data.
     * Replace with GET /api/reports when backend is ready.
     */
    const [reports, setReports] = useState([
        {
            id: "report_001",
            audit_id: "audit_001",
            filename: "cisco-core-router-report.pdf",
            device: {
                hostname: "SIH-Router-01",
                vendor: "Cisco",
                model: "ISR 4451",
                serial_number: "FCZ1234A1BC",
                ip_address: "192.168.1.1",
                os_version: "17.9",
            },
            framework: "CIS",
            score: 82,
            status: "completed",
            summary: {
                passed: 42,
                failed: 8,
                warnings: 5,
                critical: 2,
            },
            generated_at: "2026-09-10T09:30:00",
        },

        {
            id: "report_002",
            audit_id: "audit_002",
            filename: "palo-alto-firewall-report.pdf",
            device: {
                hostname: "PA-FW-01",
                vendor: "Palo Alto",
                model: "PA-3220",
                serial_number: "PA123456789",
                ip_address: "10.0.0.1",
                os_version: "11.2",
            },
            framework: "NIST SP 800-53",
            score: 91,
            status: "completed",
            summary: {
                passed: 51,
                failed: 4,
                warnings: 3,
                critical: 1,
            },
            generated_at: "2026-09-09T16:45:00",
        },

        {
            id: "report_003",
            audit_id: "audit_003",
            filename: "arista-core-switch-report.pdf",
            device: {
                hostname: "CORE-SW-01",
                vendor: "Arista",
                model: "7280R",
                serial_number: "JPE123456",
                ip_address: "10.0.1.1",
                os_version: "4.32",
            },
            framework: "DISA STIG",
            score: 68,
            status: "completed",
            summary: {
                passed: 31,
                failed: 14,
                warnings: 6,
                critical: 4,
            },
            generated_at: "2026-09-09T11:20:00",
        },

        {
            id: "report_004",
            audit_id: "audit_004",
            filename: "juniper-branch-router-report.pdf",
            device: {
                hostname: "BRANCH-SRX-01",
                vendor: "Juniper",
                model: "SRX300",
                serial_number: "JNPR987654",
                ip_address: "10.1.0.1",
                os_version: "23.4",
            },
            framework: "ISO/IEC 27001",
            score: 76,
            status: "completed",
            summary: {
                passed: 36,
                failed: 9,
                warnings: 7,
                critical: 2,
            },
            generated_at: "2026-09-08T14:10:00",
        },
    ]);

    const frameworks = [
        "CIS",
        "NIST SP 800-53",
        "DISA STIG",
        "ISO/IEC 27001",
    ];

    const loadReports = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/api/reports");

            setReports(response.data.reports || response.data || []);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to load reports."
            );
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = async (report) => {
        try {
            setDownloadLoading(true);
            setError("");

            if (!useBackend) {
                /*
                 * Demo mode.
                 * No backend request is made.
                 */
                alert(
                    `Demo mode: PDF download would request /api/reports/${report.audit_id}/pdf`
                );

                return;
            }

            const response = await api.get(
                `/api/reports/${report.audit_id}/pdf`,
                {
                    responseType: "blob",
                }
            );

            const blob = new Blob([response.data], {
                type: "application/pdf",
            });

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = report.filename || `${report.audit_id}.pdf`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to download the report."
            );
        } finally {
            setDownloadLoading(false);
        }
    };

    const filteredReports = useMemo(() => {
        const query = search.toLowerCase();

        return reports.filter((report) => {
            const matchesSearch =
                report.filename?.toLowerCase().includes(query) ||
                report.audit_id?.toLowerCase().includes(query) ||
                report.device?.hostname?.toLowerCase().includes(query) ||
                report.device?.vendor?.toLowerCase().includes(query) ||
                report.device?.model?.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "all" ||
                report.status === statusFilter;

            const matchesFramework =
                frameworkFilter === "all" ||
                report.framework === frameworkFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesFramework
            );
        });
    }, [reports, search, statusFilter, frameworkFilter]);

    const statistics = {
        total: reports.length,
        completed: reports.filter(
            (report) => report.status === "completed"
        ).length,
        averageScore:
            reports.length > 0
                ? Math.round(
                    reports.reduce(
                        (sum, report) => sum + report.score,
                        0
                    ) / reports.length
                )
                : 0,
        critical: reports.reduce(
            (sum, report) =>
                sum + (report.summary?.critical || 0),
            0
        ),
    };

    return (
        <div className="min-h-screen bg-[#f5f7fb] text-slate-900">

            <div className="flex min-h-screen">

                {/* Sidebar */}
                <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#07152f] text-white lg:flex">

                    <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
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
                        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white">
                            <FaSignOutAlt />
                            Logout
                        </button>
                    </div>

                </aside>

                {/* Main */}
                <main className="min-w-0 flex-1 lg:ml-64">

                    {/* Header */}
                    <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-6 py-4 lg:px-8">

                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                Reports
                            </h1>

                            <p className="text-sm text-slate-500">
                                Compliance audit reports and PDF documents
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

                    {/* Content */}
                    <div className="p-6 lg:p-8">

                        {/* Intro */}
                        <section className="mb-6">

                            <p className="text-sm font-semibold text-blue-600">
                                Compliance Reporting
                            </p>

                            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                                Audit Reports
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                View generated compliance reports, inspect audit summaries, and download device-specific PDF reports.
                            </p>

                        </section>

                        {/* Statistics */}
                        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

                            <StatCard
                                title="Total Reports"
                                value={statistics.total}
                                description="Generated reports"
                                icon={<FaFilePdf />}
                                bg="bg-blue-50"
                                color="text-blue-600"
                            />

                            <StatCard
                                title="Completed"
                                value={statistics.completed}
                                description="Ready to download"
                                icon={<FaCheckCircle />}
                                bg="bg-emerald-50"
                                color="text-emerald-600"
                            />

                            <StatCard
                                title="Average Score"
                                value={`${statistics.averageScore}%`}
                                description="Across all reports"
                                icon={<FaChartBar />}
                                bg="bg-indigo-50"
                                color="text-indigo-600"
                            />

                            <StatCard
                                title="Critical Findings"
                                value={statistics.critical}
                                description="Across all audits"
                                icon={<FaExclamationTriangle />}
                                bg="bg-red-50"
                                color="text-red-600"
                            />

                        </section>

                        {/* Toolbar */}
                        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">

                                {/* Search */}
                                <div className="relative flex-1">

                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Search reports, devices, vendors..."
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                                    />

                                </div>

                                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                    <FaFilter />
                                    Filters
                                </div>

                                <select
                                    value={frameworkFilter}
                                    onChange={(event) =>
                                        setFrameworkFilter(event.target.value)
                                    }
                                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                                >
                                    <option value="all">
                                        All Frameworks
                                    </option>

                                    {frameworks.map((framework) => (
                                        <option key={framework} value={framework}>
                                            {framework}
                                        </option>
                                    ))}

                                </select>

                                <select
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(event.target.value)
                                    }
                                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                                >
                                    <option value="all">
                                        All Status
                                    </option>

                                    <option value="completed">
                                        Completed
                                    </option>

                                    <option value="processing">
                                        Processing
                                    </option>

                                    <option value="failed">
                                        Failed
                                    </option>

                                </select>

                                {/* Demo / Backend */}
                                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">

                                    <button
                                        onClick={() => setUseBackend(false)}
                                        className={`rounded-lg px-3 py-2 text-xs font-semibold ${!useBackend ? "bg-blue-600 text-white" : "text-slate-500"}`}
                                    >
                                        Demo
                                    </button>

                                    <button
                                        onClick={() => {
                                            setUseBackend(true);
                                            loadReports();
                                        }}
                                        className={`rounded-lg px-3 py-2 text-xs font-semibold ${useBackend ? "bg-blue-600 text-white" : "text-slate-500"}`}
                                    >
                                        Backend
                                    </button>

                                </div>

                            </div>

                            {error && (
                                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                        </section>

                        {/* Reports Table */}
                        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                            <div className="mb-6 flex items-center justify-between">

                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">
                                        Generated Reports
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {filteredReports.length} report{filteredReports.length === 1 ? "" : "s"} found
                                    </p>
                                </div>

                            </div>

                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[1050px] text-left">

                                    <thead>

                                        <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">

                                            <th className="pb-4 font-semibold">
                                                Report
                                            </th>

                                            <th className="pb-4 font-semibold">
                                                Device
                                            </th>

                                            <th className="pb-4 font-semibold">
                                                Framework
                                            </th>

                                            <th className="pb-4 font-semibold">
                                                Score
                                            </th>

                                            <th className="pb-4 font-semibold">
                                                Findings
                                            </th>

                                            <th className="pb-4 font-semibold">
                                                Generated
                                            </th>

                                            <th className="pb-4 text-right font-semibold">
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {loading ? (

                                            <tr>

                                                <td
                                                    colSpan="7"
                                                    className="py-16 text-center"
                                                >

                                                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                                                    <p className="mt-4 text-sm text-slate-500">
                                                        Loading reports...
                                                    </p>

                                                </td>

                                            </tr>

                                        ) : filteredReports.length === 0 ? (

                                            <tr>

                                                <td
                                                    colSpan="7"
                                                    className="py-16 text-center"
                                                >

                                                    <FaFilePdf className="mx-auto text-3xl text-slate-300" />

                                                    <p className="mt-4 text-sm font-semibold text-slate-700">
                                                        No reports found
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-400">
                                                        Try changing your search or filters.
                                                    </p>

                                                </td>

                                            </tr>

                                        ) : (

                                            filteredReports.map((report) => (

                                                <tr
                                                    key={report.id}
                                                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                                >

                                                    {/* Report */}
                                                    <td className="py-5">

                                                        <div className="flex items-center gap-3">

                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                                                                <FaFilePdf />
                                                            </div>

                                                            <div className="min-w-0">

                                                                <p className="max-w-[250px] truncate text-sm font-semibold text-slate-800">
                                                                    {report.filename}
                                                                </p>

                                                                <p className="mt-1 text-xs text-slate-400">
                                                                    {report.audit_id}
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* Device */}
                                                    <td className="py-5">

                                                        <div>

                                                            <p className="text-sm font-semibold text-slate-700">
                                                                {report.device.hostname}
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-400">
                                                                {report.device.vendor} · {report.device.model}
                                                            </p>

                                                        </div>

                                                    </td>

                                                    {/* Framework */}
                                                    <td className="py-5">

                                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                                            {report.framework}
                                                        </span>

                                                    </td>

                                                    {/* Score */}
                                                    <td className="py-5">

                                                        <div className="flex items-center gap-3">

                                                            <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">

                                                                <div
                                                                    className={`h-full rounded-full ${report.score >= 80 ? "bg-emerald-500" : report.score >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                                                                    style={{
                                                                        width: `${report.score}%`,
                                                                    }}
                                                                ></div>

                                                            </div>

                                                            <span className="text-sm font-bold text-slate-700">
                                                                {report.score}%
                                                            </span>

                                                        </div>

                                                    </td>

                                                    {/* Findings */}
                                                    <td className="py-5">

                                                        <div className="flex gap-2 text-xs">

                                                            <span className="rounded-full bg-red-100 px-2.5 py-1 font-semibold text-red-700">
                                                                {report.summary.critical} Critical
                                                            </span>

                                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                                                                {report.summary.failed} Failed
                                                            </span>

                                                        </div>

                                                    </td>

                                                    {/* Date */}
                                                    <td className="py-5 text-sm text-slate-500">
                                                        {formatDate(report.generated_at)}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-5">

                                                        <div className="flex justify-end gap-2">

                                                            <button
                                                                onClick={() => {
                                                                    setSelectedReport(report);
                                                                    setShowPreview(true);
                                                                }}
                                                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                                                                title="Preview"
                                                            >
                                                                <FaEye />
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    downloadReport(report)
                                                                }
                                                                disabled={downloadLoading}
                                                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-50"
                                                                title="Download PDF"
                                                            >
                                                                <FaDownload />
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            ))

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </section>

                        {/* Report information */}
                        <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">

                            <div className="flex gap-4">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                    <FaFilePdf />
                                </div>

                                <div>

                                    <h3 className="text-sm font-bold text-blue-900">
                                        Device-specific PDF reports
                                    </h3>

                                    <p className="mt-1 max-w-3xl text-sm leading-6 text-blue-700">
                                        Each report can contain device identification, compliance results, risk severity, failed controls and remediation recommendations for the audited configuration.
                                    </p>

                                </div>

                            </div>

                        </section>

                    </div>
                </main>
            </div>

            {/* Report Preview Modal */}
            {showPreview && selectedReport && (

                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">

                    <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

                        {/* Modal header */}
                        <div className="flex items-center justify-between border-b border-slate-100 p-6">

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                    Report Preview
                                </p>

                                <h3 className="mt-1 text-xl font-bold text-slate-900">
                                    {selectedReport.device.hostname}
                                </h3>

                            </div>

                            <button
                                onClick={() => {
                                    setShowPreview(false);
                                    setSelectedReport(null);
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                            >
                                <FaTimes />
                            </button>

                        </div>

                        {/* Report */}
                        <div className="space-y-7 p-6">

                            {/* Header */}
                            <div className="rounded-2xl bg-[#07152f] p-6 text-white">

                                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                                    <div>

                                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">
                                            Network Security Compliance Report
                                        </p>

                                        <h2 className="mt-2 text-2xl font-bold">
                                            {selectedReport.device.hostname}
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-400">
                                            {selectedReport.device.vendor} · {selectedReport.device.model}
                                        </p>

                                    </div>

                                    <div className="text-left md:text-right">

                                        <p className="text-xs text-slate-400">
                                            Framework
                                        </p>

                                        <p className="mt-1 font-semibold">
                                            {selectedReport.framework}
                                        </p>

                                    </div>

                                </div>

                            </div>

                            {/* Score */}
                            <div className="grid gap-5 md:grid-cols-4">

                                <ReportMetric
                                    label="Compliance Score"
                                    value={`${selectedReport.score}%`}
                                />

                                <ReportMetric
                                    label="Passed"
                                    value={selectedReport.summary.passed}
                                />

                                <ReportMetric
                                    label="Failed"
                                    value={selectedReport.summary.failed}
                                />

                                <ReportMetric
                                    label="Critical"
                                    value={selectedReport.summary.critical}
                                />

                            </div>

                            {/* Device Information */}
                            <div>

                                <h3 className="text-lg font-bold text-slate-900">
                                    Device Information
                                </h3>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                                    <InfoBox
                                        label="Hostname"
                                        value={selectedReport.device.hostname}
                                    />

                                    <InfoBox
                                        label="Vendor"
                                        value={selectedReport.device.vendor}
                                    />

                                    <InfoBox
                                        label="Model"
                                        value={selectedReport.device.model}
                                    />

                                    <InfoBox
                                        label="Serial Number"
                                        value={selectedReport.device.serial_number}
                                    />

                                    <InfoBox
                                        label="IP Address"
                                        value={selectedReport.device.ip_address}
                                    />

                                    <InfoBox
                                        label="OS Version"
                                        value={selectedReport.device.os_version}
                                    />

                                </div>

                            </div>

                            {/* Findings summary */}
                            <div>

                                <h3 className="text-lg font-bold text-slate-900">
                                    Compliance Summary
                                </h3>

                                <div className="mt-4 grid gap-4 sm:grid-cols-4">

                                    <SummaryBox
                                        label="Passed"
                                        value={selectedReport.summary.passed}
                                        color="text-emerald-600"
                                    />

                                    <SummaryBox
                                        label="Failed"
                                        value={selectedReport.summary.failed}
                                        color="text-red-600"
                                    />

                                    <SummaryBox
                                        label="Warnings"
                                        value={selectedReport.summary.warnings}
                                        color="text-amber-600"
                                    />

                                    <SummaryBox
                                        label="Critical"
                                        value={selectedReport.summary.critical}
                                        color="text-purple-600"
                                    />

                                </div>

                            </div>

                            {/* Report description */}
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                                <p className="text-sm leading-7 text-slate-600">
                                    This report summarizes the security compliance assessment performed against the selected device and framework. The generated PDF should contain detailed controls, failed findings, severity information and remediation recommendations.
                                </p>

                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="flex flex-col gap-3 border-t border-slate-100 p-6 sm:flex-row">

                            <button
                                onClick={() => {
                                    setShowPreview(false);
                                    setSelectedReport(null);
                                }}
                                className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Close
                            </button>

                            <button
                                onClick={() => downloadReport(selectedReport)}
                                disabled={downloadLoading}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                            >
                                <FaDownload />
                                {downloadLoading
                                    ? "Downloading..."
                                    : "Download PDF"}
                            </button>

                            <button
                                onClick={() => window.print()}
                                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                <FaPrint />
                                Print
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

function SidebarLink({ to, icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}`
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
    description,
    icon,
    bg,
    color,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg} ${color}`}>
                {icon}
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
                {title}
            </p>

            <h3 className="mt-1 text-3xl font-bold text-slate-900">
                {value}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
                {description}
            </p>

        </div>
    );
}

function ReportMetric({ label, value }) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">

            <p className="text-xs text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-2xl font-bold">
                {value}
            </p>

        </div>
    );
}

function InfoBox({ label, value }) {
    return (
        <div className="rounded-xl bg-slate-50 p-4">

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-2 break-all text-sm font-semibold text-slate-800">
                {value || "—"}
            </p>

        </div>
    );
}

function SummaryBox({ label, value, color }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">

            <p className="text-xs font-medium text-slate-400">
                {label}
            </p>

            <p className={`mt-2 text-2xl font-bold ${color}`}>
                {value}
            </p>

        </div>
    );
}

function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default Reports;