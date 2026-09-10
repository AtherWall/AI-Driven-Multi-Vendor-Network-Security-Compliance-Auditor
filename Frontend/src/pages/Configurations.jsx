import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaNetworkWired,
  FaFileAlt,
  FaBrain,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaUpload,
  FaSearch,
  FaEye,
  FaTrash,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaTimes,
  FaFilter,
  FaRoute,
} from "react-icons/fa";
import api from "../utils/axios";

function Configurations() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  const [configurations, setConfigurations] = useState([]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setSelectedFile(file);
    setError("");
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const file = event.dataTransfer.files[0];

    if (!file) return;

    setSelectedFile(file);
    setError("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a configuration file.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadResponse = await api.post("/api/upload", formData);

      const uploadedFileId = uploadResponse.data.file_id;

      const configuration = {
        id: uploadedFileId,
        file_id: uploadedFileId,
        filename: uploadResponse.data.filename || selectedFile.name,
        vendor: "Detecting...",
        status: "Uploaded",
        auditId: null,
        cdmValid: null,
        message: uploadResponse.data.message || "Configuration uploaded successfully",
        size: selectedFile.size,
        createdAt: new Date().toISOString(),
      };

      setConfigurations((prev) => [configuration, ...prev]);

      setSelectedFile(null);
      setUploadOpen(false);

      // Automatically start audit
      await runAudit(
        uploadedFileId,
        uploadResponse.data.filename || selectedFile.name
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail?.message ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to upload configuration."
      );
    } finally {
      setLoading(false);
    }
  };

  const runAudit = async (uploadedFileId, filename) => {
    try {
      setConfigurations((prev) =>
        prev.map((item) =>
          item.file_id === uploadedFileId
            ? {
              ...item,
              status: "Auditing",
            }
            : item
        )
      );

      const auditResponse = await api.post("/api/audit", {
        file_id: uploadedFileId,
      });

      const audit = auditResponse.data;

      setConfigurations((prev) =>
        prev.map((item) =>
          item.file_id === uploadedFileId
            ? {
              ...item,
              filename,
              vendor: audit.vendor || "Unknown",
              status: audit.status || "Completed",
              auditId: audit.audit_id,
              cdmValid: audit.cdm_valid,
              message: audit.message,
            }
            : item
        )
      );
    } catch (err) {
      console.error(err);

      setConfigurations((prev) =>
        prev.map((item) =>
          item.file_id === uploadedFileId
            ? {
              ...item,
              status: "Failed",
              message:
                err.response?.data?.detail ||
                "Audit failed.",
            }
            : item
        )
      );
    }
  };

  const handleDelete = (id) => {
    setConfigurations((prev) =>
      prev.filter((configuration) => configuration.id !== id)
    );
  };

  const handleView = (configuration) => {
    navigate(`/configurations/${configuration.file_id}`);
  };

  const filteredConfigurations = configurations.filter((configuration) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      configuration.filename?.toLowerCase().includes(searchValue) ||
      configuration.vendor?.toLowerCase().includes(searchValue) ||
      configuration.file_id?.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "all" ||
      configuration.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesVendor =
      vendorFilter === "all" ||
      configuration.vendor?.toLowerCase() === vendorFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesVendor;
  });

  const vendors = [
    ...new Set(
      configurations
        .map((configuration) => configuration.vendor)
        .filter(
          (vendor) =>
            vendor &&
            vendor !== "Detecting..." &&
            vendor !== "Unknown"
        )
    ),
  ];

  const statistics = {
    total: configurations.length,
    completed: configurations.filter(
      (item) => item.status?.toLowerCase() === "completed"
    ).length,
    auditing: configurations.filter(
      (item) => item.status?.toLowerCase() === "auditing"
    ).length,
    failed: configurations.filter(
      (item) => item.status?.toLowerCase() === "failed"
    ).length,
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
                Configurations
              </h1>

              <p className="text-sm text-slate-500">
                Upload and manage network configuration files
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
            <section className="mb-7">

              <p className="text-sm font-semibold text-blue-600">
                Configuration Management
              </p>

              <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Network Configurations
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Upload, audit and inspect network configuration files from a centralized workspace.
              </p>

            </section>

            {/* Statistics */}
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                title="Total Configurations"
                value={statistics.total}
                description="Uploaded this session"
                icon={<FaFileAlt />}
                bg="bg-blue-50"
                color="text-blue-600"
              />

              <StatCard
                title="Completed"
                value={statistics.completed}
                description="Successfully audited"
                icon={<FaCheckCircle />}
                bg="bg-emerald-50"
                color="text-emerald-600"
              />

              <StatCard
                title="In Progress"
                value={statistics.auditing}
                description="Currently being analyzed"
                icon={<FaClock />}
                bg="bg-amber-50"
                color="text-amber-600"
              />

              <StatCard
                title="Failed"
                value={statistics.failed}
                description="Require attention"
                icon={<FaExclamationTriangle />}
                bg="bg-red-50"
                color="text-red-600"
              />

            </section>

            {/* Filters */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex flex-col gap-4 xl:flex-row xl:items-center">

                <div className="relative flex-1">

                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search configurations, vendors or file IDs..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  />

                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <FaFilter />
                  Filters
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="uploaded">Uploaded</option>
                  <option value="auditing">Auditing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>

                <select
                  value={vendorFilter}
                  onChange={(event) => setVendorFilter(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="all">All Vendors</option>

                  {vendors.map((vendor) => (
                    <option key={vendor} value={vendor.toLowerCase()}>
                      {vendor}
                    </option>
                  ))}
                </select>

              </div>

            </section>

            {/* Configuration Table */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center justify-between">

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Configuration Files
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {filteredConfigurations.length} configuration{filteredConfigurations.length === 1 ? "" : "s"} found
                  </p>
                </div>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px] text-left">

                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                      <th className="pb-4 font-semibold">Configuration</th>
                      <th className="pb-4 font-semibold">Vendor</th>
                      <th className="pb-4 font-semibold">Status</th>
                      <th className="pb-4 font-semibold">Audit</th>
                      <th className="pb-4 font-semibold">Date</th>
                      <th className="pb-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredConfigurations.length === 0 ? (

                      <tr>
                        <td colSpan="6">

                          <div className="flex min-h-80 flex-col items-center justify-center text-center">

                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-2xl text-slate-400">
                              <FaFileAlt />
                            </div>

                            <h4 className="mt-5 text-sm font-bold text-slate-700">
                              No configurations found
                            </h4>

                            <p className="mt-2 max-w-md text-sm text-slate-500">
                              Upload your first network configuration to start analyzing your infrastructure.
                            </p>

                            <button
                              onClick={() => setUploadOpen(true)}
                              className="mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                              <FaUpload />
                              Upload Configuration
                            </button>

                          </div>

                        </td>
                      </tr>

                    ) : (

                      filteredConfigurations.map((configuration) => (

                        <tr
                          key={configuration.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                        >

                          {/* Configuration */}
                          <td className="py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <FaFileAlt />
                              </div>

                              <div className="min-w-0">

                                <p className="max-w-[260px] truncate text-sm font-semibold text-slate-800">
                                  {configuration.filename}
                                </p>

                                <p className="mt-1 truncate text-xs text-slate-400">
                                  {configuration.file_id}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* Vendor */}
                          <td className="py-5">

                            <span className="text-sm text-slate-600">
                              {configuration.vendor || "Unknown"}
                            </span>

                          </td>

                          {/* Status */}
                          <td className="py-5">
                            <StatusBadge status={configuration.status} />
                          </td>

                          {/* Audit */}
                          <td className="py-5">

                            {configuration.auditId ? (
                              <div>

                                <p className="text-sm font-semibold text-slate-700">
                                  Completed
                                </p>

                                <p className="mt-1 max-w-[150px] truncate text-xs text-slate-400">
                                  {configuration.auditId}
                                </p>

                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">
                                —
                              </span>
                            )}

                          </td>

                          {/* Date */}
                          <td className="py-5 text-sm text-slate-500">
                            {formatDate(configuration.createdAt)}
                          </td>

                          {/* Actions */}
                          <td className="py-5">

                            <div className="flex justify-end gap-2">

                              <button
                                onClick={() => handleView(configuration)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                                title="View configuration"
                              >
                                <FaEye />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(configuration.id)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
                                title="Delete"
                              >
                                <FaTrash />
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

            {/* Info */}
            <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">

              <div className="flex gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <FaShieldAlt />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-blue-900">
                    Vendor detection is automatic
                  </h3>

                  <p className="mt-1 max-w-3xl text-sm leading-6 text-blue-700">
                    You don't need to select a vendor before uploading a configuration. The analysis engine identifies the vendor from the configuration and returns it with the audit result.
                  </p>

                </div>

              </div>

            </section>

          </div>
        </main>
      </div>

      {/* Upload Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">

          <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl">

            <button
              onClick={() => {
                if (!loading) {
                  setUploadOpen(false);
                  setSelectedFile(null);
                  setError("");
                }
              }}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
            >
              <FaTimes />
            </button>

            <div className="p-7 sm:p-8">

              <div>
                <p className="text-sm font-semibold text-blue-600">
                  New Configuration
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Upload Configuration
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Upload a network configuration file. The platform will automatically upload and audit it.
                </p>
              </div>

              <label
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                className="mt-7 flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 px-6 text-center transition hover:border-blue-400 hover:bg-blue-50"
              >

                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.conf,.cfg,.json"
                  onChange={handleFileChange}
                />

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-600">
                  <FaUpload />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-800">
                  {selectedFile
                    ? selectedFile.name
                    : "Drop your configuration file here"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedFile
                    ? "File selected successfully"
                    : "or click to browse files"}
                </p>

                <p className="mt-4 text-xs text-slate-400">
                  Supported formats: TXT, CONF, CFG, JSON
                </p>

              </label>

              {selectedFile && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {selectedFile.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
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

              <div className="mt-6 flex gap-3">

                <button
                  onClick={() => {
                    setUploadOpen(false);
                    setSelectedFile(null);
                    setError("");
                  }}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpload}
                  disabled={loading || !selectedFile}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaUpload />
                  {loading ? "Uploading..." : "Upload & Audit"}
                </button>

              </div>

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

      <div className="flex items-start justify-between">

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg} ${color}`}>
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

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>

    </div>
  );
}

function StatusBadge({ status }) {
  const normalizedStatus = status?.toLowerCase();

  if (normalizedStatus === "completed") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
        <FaCheckCircle />
        Completed
      </span>
    );
  }

  if (normalizedStatus === "auditing") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        <FaClock />
        Auditing
      </span>
    );
  }

  if (normalizedStatus === "failed") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        <FaExclamationTriangle />
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
      <FaClock />
      Uploaded
    </span>
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

export default Configurations;