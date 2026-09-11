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
    FaCheckCircle,
    FaTimesCircle,
    FaExclamationTriangle,
    FaInfoCircle,
    FaArrowRight,
    FaTimes,
    FaCopy,
    FaCode,
    FaClipboardCheck,
    FaFilter,
    FaRoute,
} from "react-icons/fa";
import api from "../utils/axios";

function Compliance() {
    const [activeFramework, setActiveFramework] = useState("CIS");
    const [severityFilter, setSeverityFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");

    const [auditId, setAuditId] = useState("");
    const [useBackend, setUseBackend] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [auditResult, setAuditResult] = useState({
        audit_id: "audit_demo_001",
        framework: "CIS",
        score: 78,
        device: {
            hostname: "SIH-Router-01",
            vendor: "Cisco",
            model: "ISR 4451",
            platform: "IOS",
            serial_number: "FCZ1234A1BC",
            ip_address: "192.168.1.1",
            os_version: "17.9",
        },
        summary: {
            passed: 18,
            failed: 7,
            warnings: 4,
            critical: 2,
        },
        findings: [
            {
                finding_id: "finding_001",
                title: "Telnet is enabled",
                description:
                    "Telnet is enabled on the device and should be disabled in favor of secure remote administration.",
                severity: "critical",
                status: "failed",
                framework: "CIS",
                control: "CIS-NET-01",
                current_value: "enabled",
                expected_value: "disabled",
                category: "Secure Protocols",
            },
            {
                finding_id: "finding_002",
                title: "SSH version is not restricted",
                description:
                    "The configuration does not explicitly restrict SSH to version 2.",
                severity: "high",
                status: "failed",
                framework: "CIS",
                control: "CIS-SSH-01",
                current_value: "SSH 1/2",
                expected_value: "SSH 2",
                category: "Remote Access",
            },
            {
                finding_id: "finding_003",
                title: "Password minimum length is weak",
                description:
                    "The minimum administrator password length is below the recommended baseline.",
                severity: "high",
                status: "failed",
                framework: "CIS",
                control: "CIS-AUTH-03",
                current_value: "8",
                expected_value: "14",
                category: "Authentication",
            },
            {
                finding_id: "finding_004",
                title: "Remote logging configured",
                description:
                    "The device sends logs to the configured remote logging server.",
                severity: "low",
                status: "passed",
                framework: "CIS",
                control: "CIS-LOG-01",
                current_value: "enabled",
                expected_value: "enabled",
                category: "Logging",
            },
            {
                finding_id: "finding_005",
                title: "Administrative timeout configured",
                description:
                    "Administrative sessions have a defined timeout.",
                severity: "medium",
                status: "passed",
                framework: "CIS",
                control: "CIS-AC-02",
                current_value: "15 minutes",
                expected_value: "15 minutes",
                category: "Access Control",
            },
            {
                finding_id: "finding_006",
                title: "SNMP community is using a default value",
                description:
                    "A default SNMP community string can expose network management information.",
                severity: "critical",
                status: "failed",
                framework: "CIS",
                control: "CIS-MGMT-02",
                current_value: "public",
                expected_value: "custom secret",
                category: "Network Management",
            },
            {
                finding_id: "finding_007",
                title: "Unused service detected",
                description:
                    "An unnecessary service is enabled and should be disabled.",
                severity: "medium",
                status: "warning",
                framework: "CIS",
                control: "CIS-SVC-04",
                current_value: "enabled",
                expected_value: "disabled",
                category: "Services",
            },
        ],
    });

    const [selectedFinding, setSelectedFinding] = useState(null);
    const [showFinding, setShowFinding] = useState(false);

    const [remediation, setRemediation] = useState(null);
    const [remediationLoading, setRemediationLoading] = useState(false);
    const [showRemediation, setShowRemediation] = useState(false);

    const frameworks = [
        "CIS",
        "NIST SP 800-53",
        "DISA STIG",
        "ISO/IEC 27001",
    ];

    const loadAuditResults = async () => {
        if (!auditId.trim()) {
            setError("Please enter an audit ID.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/api/audit/${auditId}/results`,
                {
                    params: {
                        framework: activeFramework,
                    },
                }
            );

            setAuditResult(response.data);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to load audit results."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleFrameworkChange = async (framework) => {
        setActiveFramework(framework);

        if (!useBackend) {
            setAuditResult((prev) => ({
                ...prev,
                framework,
            }));

            return;
        }

        if (!auditId.trim()) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/api/audit/${auditId}/results`,
                {
                    params: {
                        framework,
                    },
                }
            );

            setAuditResult(response.data);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to load framework results."
            );
        } finally {
            setLoading(false);
        }
    };

    const openFinding = (finding) => {
        setSelectedFinding(finding);
        setShowFinding(true);
    };

    const closeFinding = () => {
        setShowFinding(false);
        setSelectedFinding(null);
    };

    const getRemediation = async (finding) => {
        setSelectedFinding(finding);
        setShowRemediation(true);
        setRemediationLoading(true);
        setRemediation(null);

        try {
            if (useBackend) {
                const response = await api.post("/api/remediate", {
                    audit_id: auditResult.audit_id,
                    finding_id: finding.finding_id,
                });

                setRemediation(response.data);
            } else {
                setRemediation({
                    success: true,
                    audit_id: auditResult.audit_id,
                    finding_id: finding.finding_id,
                    status: "recommended",
                    recommendation: getDummyRecommendation(finding),
                    commands: getDummyCommands(finding),
                });
            }
        } catch (err) {
            console.error(err);

            setRemediation({
                success: false,
                recommendation:
                    err.response?.data?.detail ||
                    "Unable to generate remediation recommendation.",
            });
        } finally {
            setRemediationLoading(false);
        }
    };

    const filteredFindings = useMemo(() => {
        const query = search.toLowerCase();

        return auditResult.findings.filter((finding) => {
            const matchesSearch =
                finding.title?.toLowerCase().includes(query) ||
                finding.description?.toLowerCase().includes(query) ||
                finding.category?.toLowerCase().includes(query) ||
                finding.control?.toLowerCase().includes(query);

            const matchesSeverity =
                severityFilter === "all" ||
                finding.severity === severityFilter;

            const matchesStatus =
                statusFilter === "all" ||
                finding.status === statusFilter;

            return matchesSearch && matchesSeverity && matchesStatus;
        });
    }, [
        auditResult.findings,
        search,
        severityFilter,
        statusFilter,
    ]);

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
                                Audit & Compliance
                            </h1>

                            <p className="text-sm text-slate-500">
                                Evaluate your network against security frameworks
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

                        {/* Page intro */}
                        <section className="mb-6">

                            <p className="text-sm font-semibold text-blue-600">
                                Security Assessment
                            </p>

                            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                                Audit & Compliance
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                Review security controls, identify configuration deviations, and get actionable remediation recommendations.
                            </p>

                        </section>

                        {/* Framework selection */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

                                <div className="flex-1">

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Compliance Framework
                                    </label>

                                    <div className="flex flex-wrap gap-2">

                                        {frameworks.map((framework) => (

                                            <button
                                                key={framework}
                                                onClick={() =>
                                                    handleFrameworkChange(framework)
                                                }
                                                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${activeFramework === framework ? "bg-blue-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                                            >
                                                {framework}
                                            </button>

                                        ))}

                                    </div>

                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row">

                                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">

                                        <button
                                            onClick={() => {
                                                setUseBackend(false);
                                                setError("");
                                            }}
                                            className={`rounded-lg px-3 py-2 text-xs font-semibold ${!useBackend ? "bg-blue-600 text-white" : "text-slate-500"}`}
                                        >
                                            Demo
                                        </button>

                                        <button
                                            onClick={() => setUseBackend(true)}
                                            className={`rounded-lg px-3 py-2 text-xs font-semibold ${useBackend ? "bg-blue-600 text-white" : "text-slate-500"}`}
                                        >
                                            Backend
                                        </button>

                                    </div>

                                </div>

                            </div>

                            {useBackend && (

                                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">

                                    <input
                                        type="text"
                                        value={auditId}
                                        onChange={(event) =>
                                            setAuditId(event.target.value)
                                        }
                                        placeholder="Enter audit ID e.g. audit_12345678"
                                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                                    />

                                    <button
                                        onClick={loadAuditResults}
                                        disabled={loading}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <FaClipboardCheck />
                                        {loading ? "Loading..." : "Load Audit"}
                                    </button>

                                </div>

                            )}

                            {error && (
                                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                        </section>

                        {/* Device */}
                        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                                <div className="flex items-center gap-4">

                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600">
                                        <FaNetworkWired />
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            Audited Device
                                        </p>

                                        <h3 className="mt-1 text-xl font-bold text-slate-900">
                                            {auditResult.device.hostname}
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {auditResult.device.vendor} · {auditResult.device.model}
                                        </p>
                                    </div>

                                </div>

                                <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">

                                    <DeviceValue
                                        label="Vendor"
                                        value={auditResult.device.vendor}
                                    />

                                    <DeviceValue
                                        label="Platform"
                                        value={auditResult.device.platform}
                                    />

                                    <DeviceValue
                                        label="IP Address"
                                        value={auditResult.device.ip_address}
                                    />

                                    <DeviceValue
                                        label="OS Version"
                                        value={auditResult.device.os_version}
                                    />

                                </div>

                            </div>

                        </section>

                        {/* Compliance Summary */}
                        <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">

                            {/* Score */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                                <div className="flex items-center justify-between">

                                    <div>
                                        <p className="text-sm font-semibold text-blue-600">
                                            {auditResult.framework}
                                        </p>

                                        <h3 className="mt-1 text-lg font-bold text-slate-900">
                                            Compliance Score
                                        </h3>
                                    </div>

                                    <FaShieldAlt className="text-xl text-blue-500" />

                                </div>

                                <div className="mt-8 flex items-center justify-center">

                                    <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-[18px] border-blue-100">

                                        <div className="absolute inset-0 rounded-full border-[18px] border-transparent border-t-blue-600 border-r-blue-600"></div>

                                        <div className="text-center">

                                            <p className="text-4xl font-bold text-slate-900">
                                                {auditResult.score}%
                                            </p>

                                            <p className="mt-1 text-xs font-medium text-slate-400">
                                                Overall Compliance
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                <div className="mt-8">

                                    <div className="flex items-center justify-between text-sm">

                                        <span className="text-slate-500">
                                            Security posture
                                        </span>

                                        <span className={`font-bold ${auditResult.score >= 80 ? "text-emerald-600" : auditResult.score >= 60 ? "text-amber-600" : "text-red-600"}`}>
                                            {getScoreLabel(auditResult.score)}
                                        </span>

                                    </div>

                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-blue-600 transition-all"
                                            style={{
                                                width: `${auditResult.score}%`,
                                            }}
                                        ></div>
                                    </div>

                                </div>

                            </div>

                            {/* Summary cards */}
                            <div className="grid grid-cols-2 gap-4">

                                <SummaryCard
                                    title="Passed"
                                    value={auditResult.summary.passed}
                                    description="Controls passed"
                                    icon={<FaCheckCircle />}
                                    bg="bg-emerald-50"
                                    color="text-emerald-600"
                                />

                                <SummaryCard
                                    title="Failed"
                                    value={auditResult.summary.failed}
                                    description="Controls failed"
                                    icon={<FaTimesCircle />}
                                    bg="bg-red-50"
                                    color="text-red-600"
                                />

                                <SummaryCard
                                    title="Warnings"
                                    value={auditResult.summary.warnings}
                                    description="Need review"
                                    icon={<FaExclamationTriangle />}
                                    bg="bg-amber-50"
                                    color="text-amber-600"
                                />

                                <SummaryCard
                                    title="Critical"
                                    value={auditResult.summary.critical}
                                    description="Immediate attention"
                                    icon={<FaShieldAlt />}
                                    bg="bg-purple-50"
                                    color="text-purple-600"
                                />

                            </div>

                        </section>

                        {/* Findings */}
                        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">

                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">
                                        Compliance Findings
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Security controls detected during the audit.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">

                                    <div className="relative">

                                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400" />

                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(event) =>
                                                setSearch(event.target.value)
                                            }
                                            placeholder="Search findings..."
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white sm:w-56"
                                        />

                                    </div>

                                    <select
                                        value={severityFilter}
                                        onChange={(event) =>
                                            setSeverityFilter(event.target.value)
                                        }
                                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
                                    >
                                        <option value="all">All Severity</option>
                                        <option value="critical">Critical</option>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>

                                    <select
                                        value={statusFilter}
                                        onChange={(event) =>
                                            setStatusFilter(event.target.value)
                                        }
                                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="failed">Failed</option>
                                        <option value="warning">Warning</option>
                                        <option value="passed">Passed</option>
                                    </select>

                                </div>

                            </div>

                            <div className="mt-6 space-y-4">

                                {filteredFindings.length === 0 ? (

                                    <div className="rounded-xl bg-slate-50 p-10 text-center">

                                        <FaCheckCircle className="mx-auto text-2xl text-emerald-500" />

                                        <p className="mt-3 text-sm font-semibold text-slate-700">
                                            No findings match your filters.
                                        </p>

                                    </div>

                                ) : (

                                    filteredFindings.map((finding) => (

                                        <FindingCard
                                            key={finding.finding_id}
                                            finding={finding}
                                            onView={() => openFinding(finding)}
                                            onRemediate={() => getRemediation(finding)}
                                        />

                                    ))

                                )}

                            </div>

                        </section>

                        {/* Device Information */}
                        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                            <div className="mb-6">

                                <h3 className="text-lg font-bold text-slate-900">
                                    Device Information
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Identification information associated with this audit.
                                </p>

                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                                <InfoBox
                                    label="Hostname"
                                    value={auditResult.device.hostname}
                                />

                                <InfoBox
                                    label="Vendor"
                                    value={auditResult.device.vendor}
                                />

                                <InfoBox
                                    label="Model"
                                    value={auditResult.device.model}
                                />

                                <InfoBox
                                    label="Serial Number"
                                    value={auditResult.device.serial_number}
                                />

                            </div>

                        </section>

                    </div>

                </main>

            </div>

            {/* Finding Modal */}
            {showFinding && selectedFinding && (

                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">

                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-100 p-6">

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                    Compliance Finding
                                </p>

                                <h3 className="mt-1 text-xl font-bold text-slate-900">
                                    {selectedFinding.title}
                                </h3>

                            </div>

                            <button
                                onClick={closeFinding}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                            >
                                <FaTimes />
                            </button>

                        </div>

                        <div className="space-y-6 p-6">

                            <div className="flex flex-wrap gap-2">

                                <SeverityBadge severity={selectedFinding.severity} />

                                <StatusBadge status={selectedFinding.status} />

                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                    {selectedFinding.control}
                                </span>

                            </div>

                            <div>

                                <p className="text-sm leading-7 text-slate-600">
                                    {selectedFinding.description}
                                </p>

                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">

                                <ValueBox
                                    label="Current Value"
                                    value={selectedFinding.current_value}
                                    danger={selectedFinding.status === "failed"}
                                />

                                <ValueBox
                                    label="Expected Value"
                                    value={selectedFinding.expected_value}
                                    success={selectedFinding.status === "passed"}
                                />

                            </div>

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Category
                                </p>

                                <p className="mt-2 text-sm font-semibold text-slate-700">
                                    {selectedFinding.category}
                                </p>

                            </div>

                        </div>

                        <div className="flex gap-3 border-t border-slate-100 p-6">

                            <button
                                onClick={closeFinding}
                                className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Close
                            </button>

                            {selectedFinding.status !== "passed" && (

                                <button
                                    onClick={() => {
                                        closeFinding();
                                        getRemediation(selectedFinding);
                                    }}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Get Remediation
                                    <FaArrowRight />
                                </button>

                            )}

                        </div>

                    </div>

                </div>

            )}

            {/* Remediation Modal */}
            {showRemediation && selectedFinding && (

                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">

                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-100 p-6">

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                    Remediation
                                </p>

                                <h3 className="mt-1 text-xl font-bold text-slate-900">
                                    {selectedFinding.title}
                                </h3>

                            </div>

                            <button
                                onClick={() => {
                                    setShowRemediation(false);
                                    setSelectedFinding(null);
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                            >
                                <FaTimes />
                            </button>

                        </div>

                        {remediationLoading ? (

                            <div className="flex min-h-72 flex-col items-center justify-center p-6 text-center">

                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                                <p className="mt-4 text-sm font-semibold text-slate-700">
                                    Generating remediation recommendation...
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Analyzing the selected finding.
                                </p>

                            </div>

                        ) : (

                            <div className="space-y-6 p-6">

                                <div className="rounded-2xl border border-red-100 bg-red-50 p-5">

                                    <div className="flex items-center gap-2 text-sm font-bold text-red-800">
                                        <FaExclamationTriangle />
                                        Security Issue
                                    </div>

                                    <p className="mt-2 text-sm leading-6 text-red-700">
                                        {selectedFinding.description}
                                    </p>

                                </div>

                                <div>

                                    <p className="text-sm font-bold text-slate-800">
                                        Recommended Action
                                    </p>

                                    <p className="mt-2 text-sm leading-7 text-slate-600">
                                        {remediation?.recommendation ||
                                            "No recommendation available."}
                                    </p>

                                </div>

                                {remediation?.commands && (
                                    <div>

                                        <div className="mb-2 flex items-center justify-between">

                                            <p className="text-sm font-bold text-slate-800">
                                                Recommended Commands
                                            </p>

                                            <button
                                                onClick={() =>
                                                    navigator.clipboard.writeText(
                                                        remediation.commands.join("\n")
                                                    )
                                                }
                                                className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                                            >
                                                <FaCopy />
                                                Copy
                                            </button>

                                        </div>

                                        <div className="overflow-x-auto rounded-xl bg-slate-950 p-4">

                                            <pre className="text-sm leading-7 text-emerald-400">
                                                {remediation.commands.join("\n")}
                                            </pre>

                                        </div>

                                    </div>
                                )}

                            </div>

                        )}

                        <div className="border-t border-slate-100 p-6">

                            <button
                                onClick={() => {
                                    setShowRemediation(false);
                                    setSelectedFinding(null);
                                }}
                                className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Close
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

function StatCard({ title, value, description, icon, bg, color }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl">
                <div className={`${bg} ${color} flex h-11 w-11 items-center justify-center rounded-xl`}>
                    {icon}
                </div>
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

function SummaryCard({ title, value, description, icon, bg, color }) {
    return (
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg} ${color}`}>
                    {icon}
                </div>

                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Audit
                </span>

            </div>

            <div className="mt-5">

                <p className="text-sm font-medium text-slate-500">
                    {title}
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                    {value}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                    {description}
                </p>

            </div>

        </div>
    );
}

function FindingCard({ finding, onView, onRemediate }) {
    return (
        <div className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:shadow-sm">

            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                        <SeverityBadge severity={finding.severity} />

                        <StatusBadge status={finding.status} />

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {finding.control}
                        </span>

                    </div>

                    <h4 className="mt-4 text-base font-bold text-slate-900">
                        {finding.title}
                    </h4>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                        {finding.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">

                        <span>
                            Current:{" "}
                            <strong className="text-slate-700">
                                {finding.current_value}
                            </strong>
                        </span>

                        <span>
                            Expected:{" "}
                            <strong className="text-slate-700">
                                {finding.expected_value}
                            </strong>
                        </span>

                        <span>
                            Category:{" "}
                            <strong className="text-slate-700">
                                {finding.category}
                            </strong>
                        </span>

                    </div>

                </div>

                <div className="flex shrink-0 gap-2">

                    <button
                        onClick={onView}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                        View
                    </button>

                    {finding.status !== "passed" && (

                        <button
                            onClick={onRemediate}
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                            Remediate
                            <FaArrowRight />
                        </button>

                    )}

                </div>

            </div>

        </div>
    );
}

function SeverityBadge({ severity }) {
    const config = {
        critical: "bg-red-100 text-red-700",
        high: "bg-orange-100 text-orange-700",
        medium: "bg-amber-100 text-amber-700",
        low: "bg-blue-100 text-blue-700",
    };

    return (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${config[severity] || "bg-slate-100 text-slate-600"}`}>
            {severity}
        </span>
    );
}

function StatusBadge({ status }) {
    if (status === "passed") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                <FaCheckCircle />
                Passed
            </span>
        );
    }

    if (status === "warning") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                <FaExclamationTriangle />
                Warning
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            <FaTimesCircle />
            Failed
        </span>
    );
}

function DeviceValue({ label, value }) {
    return (
        <div>
            <p className="text-xs font-medium text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-700">
                {value || "—"}
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

function ValueBox({ label, value, danger, success }) {
    return (
        <div className={`rounded-xl p-4 ${danger ? "bg-red-50" : success ? "bg-emerald-50" : "bg-slate-50"}`}>

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className={`mt-2 text-sm font-bold ${danger ? "text-red-700" : success ? "text-emerald-700" : "text-slate-800"}`}>
                {value || "—"}
            </p>

        </div>
    );
}

function getScoreLabel(score) {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 60) return "Needs Improvement";
    return "High Risk";
}

function getDummyRecommendation(finding) {
    const recommendations = {
        "Telnet is enabled":
            "Disable Telnet and use SSH version 2 for secure administrative access.",

        "SSH version is not restricted":
            "Configure the device to allow only SSH version 2.",

        "Password minimum length is weak":
            "Increase the minimum administrator password length to at least 14 characters.",

        "SNMP community is using a default value":
            "Replace the default SNMP community string with a strong custom secret.",

        "Unused service detected":
            "Disable the unnecessary network service unless it is required by the environment.",
    };

    return (
        recommendations[finding.title] ||
        "Review the current configuration and apply the security baseline recommendation."
    );
}

function getDummyCommands(finding) {
    const commands = {
        "Telnet is enabled": [
            "configure terminal",
            "no transport input telnet",
            "transport input ssh",
            "end",
            "write memory",
        ],

        "SSH version is not restricted": [
            "configure terminal",
            "ip ssh version 2",
            "end",
            "write memory",
        ],

        "Password minimum length is weak": [
            "configure terminal",
            "security passwords min-length 14",
            "end",
            "write memory",
        ],

        "SNMP community is using a default value": [
            "configure terminal",
            "no snmp-server community public",
            "snmp-server community <NEW_SECRET> ro",
            "end",
            "write memory",
        ],

        "Unused service detected": [
            "configure terminal",
            "no service <UNUSED_SERVICE>",
            "end",
            "write memory",
        ],
    };

    return (
        commands[finding.title] || [
            "configure terminal",
            "! Apply the recommended security configuration",
            "end",
            "write memory",
        ]
    );
}

export default Compliance;