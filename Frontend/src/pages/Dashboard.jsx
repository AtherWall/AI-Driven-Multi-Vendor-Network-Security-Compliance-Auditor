import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
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
  FaServer,
  FaRoute,
  FaDatabase,
} from "react-icons/fa";
import api from "../utils/axios";

function Dashboard({ user, setuser }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [auditId, setAuditId] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const flowNodes = useMemo(() => {
    const positions = [
      { x: 500, y: 40 },
      { x: 500, y: 180 },
      { x: 500, y: 320 },
      { x: 500, y: 460 },
      { x: 220, y: 600 },
      { x: 500, y: 600 },
      { x: 780, y: 600 },
      { x: 780, y: 320 },
      { x: 220, y: 320 },
      { x: 220, y: 460 },
    ];

    return graph.nodes.map((node, index) => ({
      id: node.id,
      position: positions[index] || {
        x: (index % 4) * 260 + 100,
        y: Math.floor(index / 4) * 160 + 100,
      },
      data: {
        label: node.label,
      },
      style: {
        width: 170,
        padding: "12px",
        borderRadius: "14px",
        border: "1px solid #cbd5e1",
        background: "#ffffff",
        color: "#0f172a",
        fontSize: "13px",
        fontWeight: "600",
        textAlign: "center",
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
      },
    }));
  }, [graph.nodes]);

  const flowEdges = useMemo(() => {
    return graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: false,
      style: {
        stroke: "#3b82f6",
        strokeWidth: 2,
      },
    }));
  }, [graph.edges]);

  const handleFileSelect = (file) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setFileId(null);
    setAuditId(null);
    setAuditData(null);
    setGraph({ nodes: [], edges: [] });
    setProcessingStep(0);
    setError("");
  };

  const handleFileChange = (event) => {
    handleFileSelect(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files[0];

    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadAndAudit = async () => {
    if (!selectedFile) {
      setError("Please select a configuration file first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setProcessingStep(1);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadResponse = await api.post("/api/upload", formData);

      const uploadedFileId = uploadResponse.data.file_id;

      setFileId(uploadedFileId);
      setProcessingStep(2);

      const auditResponse = await api.post("/api/audit", {
        file_id: uploadedFileId,
      });

      const audit = auditResponse.data;

      setAuditId(audit.audit_id);
      setAuditData(audit);
      setProcessingStep(3);

      const graphResponse = await api.get(`/api/graph/${audit.audit_id}`);

      const graphData = graphResponse.data;

      setGraph({
        nodes: graphData.nodes || [],
        edges: graphData.edges || [],
      });

      setProcessingStep(4);
      setProcessingStep(5);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail?.message ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Something went wrong while processing the configuration."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setuser(null);
  };

  const userName =
    user?.name ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "Admin User";

  const userEmail = user?.email || "Network Administrator";

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

            <SidebarLink
              to="/settings"
              icon={<FaCog />}
              label="Settings"
            />

          </nav>

          <div className="border-t border-white/10 px-4 py-5">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
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
                Dashboard
              </h1>

              <p className="text-sm text-slate-500">
                AI-powered network security compliance
              </p>
            </div>

            <div className="flex items-center gap-3">

              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-800">
                  {userName}
                </p>

                <p className="text-xs text-slate-500">
                  {userEmail}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </div>

            </div>

          </header>

          {/* Content */}
          <div className="p-6 lg:p-8">

            {/* Welcome */}
            <section className="mb-7">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

                <div>
                  <p className="text-sm font-semibold text-blue-600">
                    Security Overview
                  </p>

                  <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                    Welcome back, {userName}!
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Monitor your network configurations and security analysis.
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

            {/* Stats */}
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                title="Configurations"
                value={fileId ? "1" : "0"}
                subtitle={fileId ? selectedFile?.name : "No configuration uploaded"}
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
                    : "Awaiting audit"
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
                title="Network Elements"
                value={graph.nodes.length}
                subtitle={`${graph.edges.length} network connection${graph.edges.length === 1 ? "" : "s"}`}
                icon={<FaNetworkWired />}
                iconBg="bg-purple-50"
                iconColor="text-purple-600"
              />

            </section>

            {/* Upload + Processing */}
            <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">

              {/* Upload */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-start justify-between">

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Upload Configuration
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Upload a configuration file to begin the security analysis.
                    </p>
                  </div>

                  <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:flex">
                    <FaUpload />
                  </div>

                </div>

                <label
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`mt-6 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center transition ${dragActive ? "border-blue-500 bg-blue-50" : "border-blue-200 bg-blue-50/40 hover:border-blue-400 hover:bg-blue-50"}`}
                >

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
                      : "Drag & drop your configuration here"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    or click to browse files
                  </p>

                  <p className="mt-4 text-xs text-slate-400">
                    Supported formats: .txt, .conf, .cfg, .json
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

                      <button
                        onClick={() => handleFileSelect(null)}
                        className="text-xs font-semibold text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>

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

              {/* Processing Status */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h3 className="text-lg font-bold text-slate-900">
                  Processing Status
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Follow the configuration through the analysis pipeline.
                </p>

                <div className="mt-7 space-y-6">

                  <ProcessStep
                    number="1"
                    title="File uploaded"
                    complete={processingStep >= 1}
                    active={loading && processingStep === 1}
                  />

                  <ProcessStep
                    number="2"
                    title="Configuration audited"
                    complete={processingStep >= 2}
                    active={loading && processingStep === 2}
                  />

                  <ProcessStep
                    number="3"
                    title="CDM validated"
                    complete={processingStep >= 3}
                    active={loading && processingStep === 3}
                  />

                  <ProcessStep
                    number="4"
                    title="Network topology loaded"
                    complete={processingStep >= 4}
                    active={loading && processingStep === 4}
                  />

                  <ProcessStep
                    number="5"
                    title="Analysis complete"
                    complete={processingStep >= 5}
                    active={loading && processingStep === 5}
                  />

                </div>

              </div>

            </section>

            {/* Current Audit */}
            {auditId && (
              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Current Audit
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Information returned by the audit API.
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    {auditData?.status || "Completed"}
                  </span>

                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                  <InfoCard
                    title="File ID"
                    value={fileId}
                  />

                  <InfoCard
                    title="Audit ID"
                    value={auditId}
                  />

                  <InfoCard
                    title="Vendor"
                    value={auditData?.vendor || "Unknown"}
                  />

                  <InfoCard
                    title="CDM Status"
                    value={auditData?.cdm_valid ? "Valid" : "Invalid"}
                  />

                </div>

                {auditData?.message && (
                  <div className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    {auditData.message}
                  </div>
                )}

              </section>
            )}

            {/* Network Topology */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Network Topology
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Network devices and connections.
                  </p>
                </div>

                {graph.nodes.length > 0 && (
                  <div className="flex gap-2">

                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                      {graph.nodes.length} Nodes
                    </span>

                    <span className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-600">
                      {graph.edges.length} Edges
                    </span>

                  </div>
                )}

              </div>

              <div className="mt-6 h-[500px] overflow-hidden rounded-2xl border border-slate-200">

                {graph.nodes.length === 0 ? (

                  <div className="flex h-full flex-col items-center justify-center bg-slate-50 text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl text-slate-400 shadow-sm">
                      <FaNetworkWired />
                    </div>

                    <h4 className="mt-4 text-sm font-bold text-slate-700">
                      No network topology available
                    </h4>

                    <p className="mt-2 max-w-md text-sm text-slate-500">
                      Upload and analyze a configuration to generate the network graph.
                    </p>

                  </div>

                ) : (

                  <ReactFlow
                    nodes={flowNodes}
                    edges={flowEdges}
                    fitView
                    nodesConnectable={false}
                    nodesDraggable
                    zoomOnScroll
                    panOnDrag
                  >
                    <Background gap={20} size={1} />
                    <Controls />
                    <MiniMap />
                  </ReactFlow>

                )}

              </div>

            </section>

            {/* Recent Configuration */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Recent Configurations
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Configuration processed during this session.
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
                      <th className="pb-3 font-semibold">Configuration</th>
                      <th className="pb-3 font-semibold">Vendor</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Audit ID</th>
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

                            <div className="min-w-0">

                              <p className="truncate text-sm font-semibold text-slate-800">
                                {selectedFile.name}
                              </p>

                              <p className="text-xs text-slate-400">
                                {fileId || "Waiting for upload"}
                              </p>

                            </div>

                          </div>

                        </td>

                        <td className="py-4 text-sm text-slate-600">
                          {auditData?.vendor || "—"}
                        </td>

                        <td className="py-4">

                          {auditId ? (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              Completed
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                              Waiting
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
        `mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

function StatCard({ title, value, subtitle, icon, iconBg, iconColor }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
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

      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${complete ? "bg-emerald-100 text-emerald-600" : active ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
        {complete ? <FaCheckCircle /> : number}
      </div>

      <div>
        <p className={`text-sm font-semibold ${complete || active ? "text-slate-800" : "text-slate-400"}`}>
          {title}
        </p>

        <p className="text-xs text-slate-400">
          {complete ? "Completed" : active ? "Processing..." : "Waiting"}
        </p>
      </div>

    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-2 break-all text-sm font-semibold text-slate-800">
        {value || "—"}
      </p>

    </div>
  );
}

export default Dashboard;