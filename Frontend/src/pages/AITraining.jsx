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
  FaExclamationTriangle,
  FaClock,
  FaTimes,
  FaLightbulb,
  FaCode,
  FaHistory,
  FaArrowRight,
  FaRobot,
} from "react-icons/fa";
import api from "../utils/axios";

function AITraining() {
  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [useBackend, setUseBackend] = useState(false);

  /*
   * Temporary frontend data.
   * Replace this with GET /api/training/pending
   * once the backend endpoint is available.
   */
  const [pendingPatterns, setPendingPatterns] = useState([
    {
      id: "pattern_001",
      command: "set security admin-timeout 15",
      source_file: "unknown_device.conf",
      vendor: "Unknown",
      confidence: 87,
      detected_at: "2026-09-10T09:24:00",
      suggested_category: "Authentication",
      suggested_parameter: "admin_session_timeout",
      suggested_value: "15 minutes",
      description: "The command appears to control the administrative session timeout.",
      framework_controls: ["CIS-AC-02", "NIST-AC-12"],
      status: "pending",
    },
    {
      id: "pattern_002",
      command: "set protocol telnet disabled",
      source_file: "branch_router.conf",
      vendor: "Unknown",
      confidence: 94,
      detected_at: "2026-09-10T09:15:00",
      suggested_category: "Secure Protocols",
      suggested_parameter: "telnet_enabled",
      suggested_value: "false",
      description: "The command appears to disable the insecure Telnet protocol.",
      framework_controls: ["CIS-NET-01"],
      status: "pending",
    },
    {
      id: "pattern_003",
      command: "logging host 10.0.5.20 severity informational",
      source_file: "router_backup.cfg",
      vendor: "Unknown",
      confidence: 79,
      detected_at: "2026-09-09T18:40:00",
      suggested_category: "Logging",
      suggested_parameter: "remote_syslog",
      suggested_value: "enabled",
      description: "The command appears to configure a remote logging destination.",
      framework_controls: ["CIS-LOG-01", "NIST-AU-02"],
      status: "pending",
    },
    {
      id: "pattern_004",
      command: "set password-policy minimum-length 14",
      source_file: "security_gateway.conf",
      vendor: "Unknown",
      confidence: 91,
      detected_at: "2026-09-09T15:32:00",
      suggested_category: "Authentication",
      suggested_parameter: "password_min_length",
      suggested_value: "14",
      description: "The command appears to configure the minimum password length.",
      framework_controls: ["CIS-AUTH-03", "NIST-IA-05"],
      status: "pending",
    },
  ]);

  /*
   * Temporary frontend history.
   * Replace this with GET /api/training/history.
   */
  const [trainingHistory, setTrainingHistory] = useState([
    {
      id: "mapping_001",
      command: "set ssh version 2",
      category: "Secure Protocols",
      parameter: "ssh_version",
      value: "2",
      trained_by: "Admin",
      trained_at: "10 Sep 2026, 09:12 AM",
      confidence: 96,
    },
    {
      id: "mapping_002",
      command: "set login-attempts 5",
      category: "Authentication",
      parameter: "login_attempt_limit",
      value: "5",
      trained_by: "Admin",
      trained_at: "09 Sep 2026, 06:40 PM",
      confidence: 92,
    },
    {
      id: "mapping_003",
      command: "logging enable",
      category: "Logging",
      parameter: "logging_enabled",
      value: "true",
      trained_by: "Admin",
      trained_at: "09 Sep 2026, 04:18 PM",
      confidence: 89,
    },
  ]);

  const [mappingData, setMappingData] = useState({
    category: "",
    parameter: "",
    value: "",
    notes: "",
  });

  const filteredPatterns = useMemo(() => {
    const query = search.toLowerCase();

    return pendingPatterns.filter((pattern) => {
      return (
        pattern.command.toLowerCase().includes(query) ||
        pattern.source_file.toLowerCase().includes(query) ||
        pattern.suggested_category.toLowerCase().includes(query) ||
        pattern.suggested_parameter.toLowerCase().includes(query)
      );
    });
  }, [pendingPatterns, search]);

  const openMapping = (pattern) => {
    setSelectedPattern(pattern);

    setMappingData({
      category: pattern.suggested_category || "",
      parameter: pattern.suggested_parameter || "",
      value: pattern.suggested_value || "",
      notes: "",
    });

    setShowMappingModal(true);
    setMessage("");
  };

  const closeMapping = () => {
    if (saving) return;

    setShowMappingModal(false);
    setSelectedPattern(null);
    setMessage("");
  };

  const saveMapping = async (event) => {
    event.preventDefault();

    if (
      !mappingData.category ||
      !mappingData.parameter ||
      !mappingData.value
    ) {
      setMessage("Please complete the mapping fields.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      if (useBackend) {
        await api.post("/api/training/mapping", {
          pattern_id: selectedPattern.id,
          command: selectedPattern.command,
          category: mappingData.category,
          parameter: mappingData.parameter,
          value: mappingData.value,
          notes: mappingData.notes,
        });
      }

      const newHistoryItem = {
        id: `mapping_${Date.now()}`,
        command: selectedPattern.command,
        category: mappingData.category,
        parameter: mappingData.parameter,
        value: mappingData.value,
        trained_by: "Admin",
        trained_at: new Date().toLocaleString("en-IN"),
        confidence: selectedPattern.confidence,
      };

      setTrainingHistory((prev) => [newHistoryItem, ...prev]);

      setPendingPatterns((prev) =>
        prev.filter((pattern) => pattern.id !== selectedPattern.id)
      );

      setShowMappingModal(false);
      setSelectedPattern(null);

      setMessage("Mapping saved successfully.");
      setActiveTab("history");
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.detail ||
        "Unable to save the mapping."
      );
    } finally {
      setSaving(false);
    }
  };

  const rejectPattern = (id) => {
    setPendingPatterns((prev) =>
      prev.filter((pattern) => pattern.id !== id)
    );

    setMessage("Pattern rejected.");
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
              icon={<FaNetworkWired />}
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

            <SidebarLink
              to="/settings"
              icon={<FaCog />}
              label="Settings"
            />

          </nav>

          <div className="border-t border-white/10 px-4 py-5">

            <NavLink
              to="/"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <FaSignOutAlt />
              Exit Dashboard
            </NavLink>

          </div>

        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 lg:ml-64">

          {/* Header */}
          <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-6 py-4 lg:px-8">

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                AI Training
              </h1>

              <p className="text-sm text-slate-500">
                Teach the auditor to understand new configuration patterns
              </p>
            </div>

            <div className="flex items-center gap-3">

              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-800">
                  Network Administrator
                </p>

                <p className="text-xs text-slate-500">
                  AI Training Center
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                A
              </div>

            </div>

          </header>

          {/* Content */}
          <div className="p-6 lg:p-8">

            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl bg-[#07152f] p-7 text-white shadow-sm lg:p-9">

              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl"></div>

              <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

                <div className="max-w-3xl">

                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
                    <FaRobot />
                    Adaptive AI Training
                  </div>

                  <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                    Teach your auditor to understand new vendors.
                  </h2>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                    When the system encounters an unfamiliar configuration pattern, review the AI's interpretation and map it to a standardized security parameter.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-400">

                    <span className="rounded-full bg-white/5 px-3 py-1.5">
                      Detect unknown patterns
                    </span>

                    <span className="rounded-full bg-white/5 px-3 py-1.5">
                      Review AI suggestions
                    </span>

                    <span className="rounded-full bg-white/5 px-3 py-1.5">
                      Save reusable mappings
                    </span>

                  </div>

                </div>

                <div className="hidden h-28 w-28 shrink-0 items-center justify-center rounded-3xl border border-blue-400/20 bg-blue-500/10 text-5xl text-blue-400 lg:flex">
                  <FaBrain />
                </div>

              </div>

            </section>

            {/* Stats */}
            <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                title="Pending Patterns"
                value={pendingPatterns.length}
                description="Need administrator review"
                icon={<FaExclamationTriangle />}
                bg="bg-amber-50"
                color="text-amber-600"
              />

              <StatCard
                title="Mappings Learned"
                value={trainingHistory.length}
                description="Previously trained patterns"
                icon={<FaBrain />}
                bg="bg-blue-50"
                color="text-blue-600"
              />

              <StatCard
                title="High Confidence"
                value={
                  pendingPatterns.filter(
                    (item) => item.confidence >= 90
                  ).length
                }
                description="AI confidence above 90%"
                icon={<FaCheckCircle />}
                bg="bg-emerald-50"
                color="text-emerald-600"
              />

              <StatCard
                title="Training Status"
                value="Active"
                description="Adaptive learning enabled"
                icon={<FaRobot />}
                bg="bg-purple-50"
                color="text-purple-600"
              />

            </section>

            {/* Tabs */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">

              <div className="flex flex-col gap-2 sm:flex-row">

                <button
                  onClick={() => setActiveTab("pending")}
                  className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${activeTab === "pending" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  <FaExclamationTriangle />
                  Pending Patterns
                  {pendingPatterns.length > 0 && (
                    <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === "pending" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"}`}>
                      {pendingPatterns.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${activeTab === "history" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  <FaHistory />
                  Training History
                </button>

              </div>

            </section>

            {/* Search / controls */}
            {activeTab === "pending" && (
              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex flex-col gap-4 xl:flex-row xl:items-center">

                  <div className="relative flex-1">

                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search commands, files, categories..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                    />

                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

                    <div className={`h-2.5 w-2.5 rounded-full ${useBackend ? "bg-emerald-500" : "bg-amber-500"}`}></div>

                    <span className="text-xs font-semibold text-slate-600">
                      {useBackend ? "Backend mode" : "Demo mode"}
                    </span>

                    <button
                      onClick={() => setUseBackend(!useBackend)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Change
                    </button>

                  </div>

                </div>

              </section>
            )}

            {/* Pending Patterns */}
            {activeTab === "pending" && (
              <section className="mt-6">

                {filteredPatterns.length === 0 ? (

                  <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-2xl text-emerald-600">
                      <FaCheckCircle />
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-slate-900">
                      No pending patterns
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      All currently detected configuration patterns have been reviewed.
                    </p>

                  </div>

                ) : (

                  <div className="space-y-5">

                    {filteredPatterns.map((pattern) => (

                      <PatternCard
                        key={pattern.id}
                        pattern={pattern}
                        onMap={() => openMapping(pattern)}
                        onReject={() => rejectPattern(pattern.id)}
                      />

                    ))}

                  </div>

                )}

              </section>
            )}

            {/* History */}
            {activeTab === "history" && (
              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-6">

                  <p className="text-sm font-semibold text-blue-600">
                    Learned Knowledge
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    Training History
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Previously approved mappings that can be reused by the auditor.
                  </p>

                </div>

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[850px] text-left">

                    <thead>

                      <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">

                        <th className="pb-4 font-semibold">
                          Configuration Pattern
                        </th>

                        <th className="pb-4 font-semibold">
                          Category
                        </th>

                        <th className="pb-4 font-semibold">
                          Parameter
                        </th>

                        <th className="pb-4 font-semibold">
                          Value
                        </th>

                        <th className="pb-4 font-semibold">
                          Confidence
                        </th>

                        <th className="pb-4 font-semibold">
                          Trained
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {trainingHistory.map((item) => (

                        <tr
                          key={item.id}
                          className="border-b border-slate-100 last:border-0"
                        >

                          <td className="py-5">

                            <div className="flex items-start gap-3">

                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <FaCode />
                              </div>

                              <div className="min-w-0">

                                <p className="max-w-[300px] break-all text-sm font-semibold text-slate-800">
                                  {item.command}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {item.trained_by}
                                </p>

                              </div>

                            </div>

                          </td>

                          <td className="py-5">

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {item.category}
                            </span>

                          </td>

                          <td className="py-5 text-sm font-medium text-slate-700">
                            {item.parameter}
                          </td>

                          <td className="py-5 text-sm text-slate-600">
                            {item.value}
                          </td>

                          <td className="py-5">

                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.confidence >= 90 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                              {item.confidence}%
                            </span>

                          </td>

                          <td className="py-5 text-xs text-slate-500">
                            {item.trained_at}
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </section>
            )}

            {/* How Training Works */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-7 text-center">

                <p className="text-sm font-semibold text-blue-600">
                  Adaptive Learning
                </p>

                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  How AI Training Works
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  The administrator remains in control of what the system learns.
                </p>

              </div>

              <div className="grid gap-4 md:grid-cols-3">

                <TrainingStep
                  number="01"
                  icon={<FaSearch />}
                  title="AI detects"
                  description="An unfamiliar configuration command is identified during analysis."
                />

                <TrainingStep
                  number="02"
                  icon={<FaLightbulb />}
                  title="Admin reviews"
                  description="The AI provides a suggested meaning and confidence score."
                />

                <TrainingStep
                  number="03"
                  icon={<FaBrain />}
                  title="AI learns"
                  description="The approved mapping becomes reusable for future configurations."
                />

              </div>

            </section>

          </div>

        </main>

      </div>

      {/* Mapping Modal */}
      {showMappingModal && selectedPattern && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 p-6">

              <div>

                <p className="text-sm font-semibold text-blue-600">
                  Train AI
                </p>

                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  Review Configuration Pattern
                </h3>

              </div>

              <button
                onClick={closeMapping}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <FaTimes />
              </button>

            </div>

            <form onSubmit={saveMapping}>

              <div className="space-y-6 p-6">

                {/* Raw command */}
                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label className="text-sm font-semibold text-slate-700">
                      Unrecognized Command
                    </label>

                    <span className="text-xs font-semibold text-amber-600">
                      {selectedPattern.confidence}% AI confidence
                    </span>

                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-950 p-4">

                    <code className="break-all text-sm leading-6 text-emerald-400">
                      {selectedPattern.command}
                    </code>

                  </div>

                </div>

                {/* AI suggestion */}
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      <FaBrain />
                    </div>

                    <div>

                      <p className="text-sm font-bold text-blue-900">
                        AI Suggestion
                      </p>

                      <p className="mt-1 text-sm leading-6 text-blue-700">
                        {selectedPattern.description}
                      </p>

                    </div>

                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">

                    <SuggestionBox
                      label="Category"
                      value={selectedPattern.suggested_category}
                    />

                    <SuggestionBox
                      label="Parameter"
                      value={selectedPattern.suggested_parameter}
                    />

                    <SuggestionBox
                      label="Value"
                      value={selectedPattern.suggested_value}
                    />

                  </div>

                </div>

                {/* Mapping */}
                <div>

                  <h4 className="text-sm font-bold text-slate-800">
                    Security Mapping
                  </h4>

                  <p className="mt-1 text-xs text-slate-500">
                    Confirm or edit how this command should be represented in the normalized security model.
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">

                    <div>

                      <label className="mb-2 block text-xs font-semibold text-slate-600">
                        Security Category
                      </label>

                      <input
                        type="text"
                        value={mappingData.category}
                        onChange={(event) =>
                          setMappingData({
                            ...mappingData,
                            category: event.target.value,
                          })
                        }
                        placeholder="e.g. Authentication"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                      />

                    </div>

                    <div>

                      <label className="mb-2 block text-xs font-semibold text-slate-600">
                        Security Parameter
                      </label>

                      <input
                        type="text"
                        value={mappingData.parameter}
                        onChange={(event) =>
                          setMappingData({
                            ...mappingData,
                            parameter: event.target.value,
                          })
                        }
                        placeholder="e.g. admin_session_timeout"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                      />

                    </div>

                    <div>

                      <label className="mb-2 block text-xs font-semibold text-slate-600">
                        Normalized Value
                      </label>

                      <input
                        type="text"
                        value={mappingData.value}
                        onChange={(event) =>
                          setMappingData({
                            ...mappingData,
                            value: event.target.value,
                          })
                        }
                        placeholder="e.g. 15"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                      />

                    </div>

                    <div>

                      <label className="mb-2 block text-xs font-semibold text-slate-600">
                        Notes
                      </label>

                      <input
                        type="text"
                        value={mappingData.notes}
                        onChange={(event) =>
                          setMappingData({
                            ...mappingData,
                            notes: event.target.value,
                          })
                        }
                        placeholder="Optional explanation"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                      />

                    </div>

                  </div>

                </div>

                {/* Framework controls */}
                <div>

                  <p className="text-xs font-semibold text-slate-600">
                    Related Controls
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">

                    {selectedPattern.framework_controls.map((control) => (
                      <span
                        key={control}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"
                      >
                        {control}
                      </span>
                    ))}

                  </div>

                </div>

                {message && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    {message}
                  </div>
                )}

              </div>

              <div className="flex gap-3 border-t border-slate-100 p-6">

                <button
                  type="button"
                  onClick={closeMapping}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaCheckCircle />
                  {saving ? "Saving..." : "Approve & Train AI"}
                </button>

              </div>

            </form>

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

      <div className="flex items-start justify-between">

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg} ${color}`}>
          {icon}
        </div>

        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Training
        </span>

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

function PatternCard({ pattern, onMap, onReject }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">

            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              Needs Review
            </span>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              {pattern.confidence}% Confidence
            </span>

          </div>

          <div className="mt-5 rounded-xl bg-slate-950 p-4">

            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <FaCode />
              Unrecognized configuration
            </div>

            <code className="break-all text-sm leading-6 text-emerald-400">
              {pattern.command}
            </code>

          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">

            <div className="rounded-xl bg-slate-50 p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Source File
              </p>

              <p className="mt-2 truncate text-sm font-semibold text-slate-700">
                {pattern.source_file}
              </p>

            </div>

            <div className="rounded-xl bg-slate-50 p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Detected
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-700">
                {formatDate(pattern.detected_at)}
              </p>

            </div>

          </div>

        </div>

        {/* AI Suggestion */}
        <div className="w-full rounded-2xl border border-blue-100 bg-blue-50 p-5 xl:max-w-md">

          <div className="flex items-center gap-2 text-sm font-bold text-blue-900">
            <FaLightbulb className="text-blue-600" />
            AI Suggestion
          </div>

          <p className="mt-3 text-sm leading-6 text-blue-700">
            {pattern.description}
          </p>

          <div className="mt-5 space-y-3">

            <SuggestionRow
              label="Category"
              value={pattern.suggested_category}
            />

            <SuggestionRow
              label="Parameter"
              value={pattern.suggested_parameter}
            />

            <SuggestionRow
              label="Value"
              value={pattern.suggested_value}
            />

          </div>

          <div className="mt-5 flex gap-2">

            <button
              onClick={onMap}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Review & Map
              <FaArrowRight />
            </button>

            <button
              onClick={onReject}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Reject
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

function SuggestionRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-blue-100 pb-3 last:border-0 last:pb-0">

      <span className="text-xs font-medium text-blue-500">
        {label}
      </span>

      <span className="break-all text-right text-xs font-semibold text-blue-900">
        {value}
      </span>

    </div>
  );
}

function SuggestionBox({ label, value }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white p-3">

      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-all text-xs font-bold text-slate-800">
        {value}
      </p>

    </div>
  );
}

function TrainingStep({ number, icon, title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

      <div className="flex items-center justify-between">

        <span className="text-sm font-bold text-blue-600">
          {number}
        </span>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
          {icon}
        </div>

      </div>

      <h4 className="mt-6 text-base font-bold text-slate-800">
        {title}
      </h4>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
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

export default AITraining;