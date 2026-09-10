import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  FaShieldAlt,
  FaNetworkWired,
  FaFileAlt,
  FaBrain,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaSearch,
  FaServer,
  FaDatabase,
  FaRoute,
  FaGlobe,
  FaTimes,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import api from "../utils/axios";

function NetworkTopology() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [search, setSearch] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [showDetails, setShowDetails] = useState(false);
  const [useRealApi, setUseRealApi] = useState(false);
  const [auditId, setAuditId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * Temporary graph data for frontend development.
   * Replace this with the API response when the backend is ready.
   */
  const dummyGraph = {
    success: true,
    audit_id: "audit_demo_001",

    nodes: [
      {
        id: "internet",
        label: "Internet",
        type: "internet",
        vendor: "External",
        ip: "Public",
        status: "healthy",
      },
      {
        id: "firewall-01",
        label: "Cisco Firewall",
        type: "firewall",
        vendor: "Cisco",
        model: "ASA 5525-X",
        ip: "10.0.0.1",
        status: "warning",
        risk: "Medium",
      },
      {
        id: "router-01",
        label: "Core Router",
        type: "router",
        vendor: "Cisco",
        model: "ISR 4451",
        ip: "10.0.0.2",
        status: "healthy",
        risk: "Low",
      },
      {
        id: "switch-01",
        label: "Core Switch",
        type: "switch",
        vendor: "Arista",
        model: "7280R",
        ip: "10.0.1.1",
        status: "healthy",
        risk: "Low",
      },
      {
        id: "web-01",
        label: "Web Server",
        type: "server",
        vendor: "Linux",
        model: "Ubuntu Server",
        ip: "10.0.2.10",
        status: "healthy",
        risk: "Low",
      },
      {
        id: "app-01",
        label: "Application Server",
        type: "server",
        vendor: "Linux",
        model: "Ubuntu Server",
        ip: "10.0.2.20",
        status: "warning",
        risk: "Medium",
      },
      {
        id: "db-01",
        label: "Database Server",
        type: "database",
        vendor: "PostgreSQL",
        model: "PostgreSQL 16",
        ip: "10.0.2.30",
        status: "healthy",
        risk: "Low",
      },
      {
        id: "branch-router",
        label: "Branch Router",
        type: "router",
        vendor: "Juniper",
        model: "SRX300",
        ip: "10.1.0.1",
        status: "critical",
        risk: "High",
      },
      {
        id: "branch-switch",
        label: "Branch Switch",
        type: "switch",
        vendor: "HPE Aruba",
        model: "CX 6100",
        ip: "10.1.0.2",
        status: "healthy",
        risk: "Low",
      },
    ],

    edges: [
      {
        id: "edge-1",
        source: "internet",
        target: "firewall-01",
      },
      {
        id: "edge-2",
        source: "firewall-01",
        target: "router-01",
      },
      {
        id: "edge-3",
        source: "router-01",
        target: "switch-01",
      },
      {
        id: "edge-4",
        source: "switch-01",
        target: "web-01",
      },
      {
        id: "edge-5",
        source: "switch-01",
        target: "app-01",
      },
      {
        id: "edge-6",
        source: "app-01",
        target: "db-01",
      },
      {
        id: "edge-7",
        source: "router-01",
        target: "branch-router",
      },
      {
        id: "edge-8",
        source: "branch-router",
        target: "branch-switch",
      },
    ],
  };

  const [graph, setGraph] = useState(dummyGraph);

  const fetchRealGraph = async () => {
    if (!auditId.trim()) {
      setError("Please enter an audit ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/api/graph/${auditId}`);

      setGraph({
        success: response.data.success,
        audit_id: response.data.audit_id,
        nodes: response.data.nodes || [],
        edges: response.data.edges || [],
      });

      setSelectedNode(null);
      setShowDetails(false);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Unable to load network topology."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredNodes = useMemo(() => {
    return graph.nodes.filter((node) => {
      const matchesSearch =
        node.label?.toLowerCase().includes(search.toLowerCase()) ||
        node.id?.toLowerCase().includes(search.toLowerCase()) ||
        node.vendor?.toLowerCase().includes(search.toLowerCase()) ||
        node.ip?.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        deviceFilter === "all" ||
        node.type?.toLowerCase() === deviceFilter.toLowerCase();

      const matchesVendor =
        vendorFilter === "all" ||
        node.vendor?.toLowerCase() === vendorFilter.toLowerCase();

      return matchesSearch && matchesType && matchesVendor;
    });
  }, [graph.nodes, search, deviceFilter, vendorFilter]);

  const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));

  const filteredEdges = useMemo(() => {
    return graph.edges.filter(
      (edge) =>
        filteredNodeIds.has(edge.source) &&
        filteredNodeIds.has(edge.target)
    );
  }, [graph.edges, filteredNodeIds]);

  const nodePositions = {
    internet: { x: 500, y: 40 },
    "firewall-01": { x: 500, y: 170 },
    "router-01": { x: 500, y: 300 },
    "switch-01": { x: 500, y: 440 },
    "web-01": { x: 220, y: 600 },
    "app-01": { x: 500, y: 600 },
    "db-01": { x: 500, y: 760 },
    "branch-router": { x: 800, y: 440 },
    "branch-switch": { x: 800, y: 600 },
  };

  const flowNodes = filteredNodes.map((node, index) => {
    const position = nodePositions[node.id] || {
      x: (index % 4) * 260 + 80,
      y: Math.floor(index / 4) * 180 + 80,
    };

    return {
      id: node.id,
      position,
      type: "networkNode",
      data: {
        ...node,
        onClick: () => {
          setSelectedNode(node);
          setShowDetails(true);
        },
      },
    };
  });

  const flowEdges = filteredEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "smoothstep",
    animated: false,
    style: {
      stroke: "#3b82f6",
      strokeWidth: 2,
    },
  }));

  const vendors = [
    ...new Set(
      graph.nodes
        .map((node) => node.vendor)
        .filter(Boolean)
    ),
  ];

  const deviceTypes = [
    ...new Set(
      graph.nodes
        .map((node) => node.type)
        .filter(Boolean)
    ),
  ];

  const statistics = {
    devices: graph.nodes.length,
    connections: graph.edges.length,
    critical: graph.nodes.filter((node) => node.risk === "High").length,
    warnings: graph.nodes.filter((node) => node.risk === "Medium").length,
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
                Network Topology
              </h1>

              <p className="text-sm text-slate-500">
                Explore devices and network connections
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

            {/* Page Header */}
            <section className="mb-6">

              <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">

                <div>
                  <p className="text-sm font-semibold text-blue-600">
                    Network Visualization
                  </p>

                  <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                    Infrastructure Topology
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Visualize devices, connections, vendors and network structure discovered during configuration analysis.
                  </p>
                </div>

                {/* API Toggle */}
                <div className="flex flex-col gap-2 sm:flex-row">

                  <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">

                    <button
                      onClick={() => {
                        setUseRealApi(false);
                        setGraph(dummyGraph);
                        setSelectedNode(null);
                      }}
                      className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${!useRealApi ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}
                    >
                      Demo Data
                    </button>

                    <button
                      onClick={() => setUseRealApi(true)}
                      className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${useRealApi ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}
                    >
                      Backend
                    </button>

                  </div>

                </div>

              </div>

            </section>

            {/* Statistics */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                title="Network Devices"
                value={statistics.devices}
                description="Devices discovered"
                icon={<FaNetworkWired />}
                bg="bg-blue-50"
                color="text-blue-600"
              />

              <StatCard
                title="Connections"
                value={statistics.connections}
                description="Network relationships"
                icon={<FaRoute />}
                bg="bg-indigo-50"
                color="text-indigo-600"
              />

              <StatCard
                title="High Risk"
                value={statistics.critical}
                description="Devices requiring attention"
                icon={<FaExclamationTriangle />}
                bg="bg-red-50"
                color="text-red-600"
              />

              <StatCard
                title="Medium Risk"
                value={statistics.warnings}
                description="Devices to review"
                icon={<FaInfoCircle />}
                bg="bg-amber-50"
                color="text-amber-600"
              />

            </section>

            {/* Backend Controls */}
            {useRealApi && (
              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex flex-col gap-4 md:flex-row md:items-end">

                  <div className="flex-1">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Audit ID
                    </label>

                    <input
                      type="text"
                      value={auditId}
                      onChange={(event) => setAuditId(event.target.value)}
                      placeholder="audit_xxxxxxxx"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  <button
                    onClick={fetchRealGraph}
                    disabled={loading}
                    className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Loading..." : "Load Network Graph"}
                  </button>

                </div>

                {error && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

              </section>
            )}

            {/* Filters */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex flex-col gap-4 xl:flex-row xl:items-center">

                {/* Search */}
                <div className="relative flex-1">

                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search device, vendor, IP address..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  />

                </div>

                {/* Device Filter */}
                <select
                  value={deviceFilter}
                  onChange={(event) => setDeviceFilter(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="all">All Device Types</option>

                  {deviceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Vendor Filter */}
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

            {/* Graph */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Network Graph
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {filteredNodes.length} devices and {filteredEdges.length} connections visible
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">

                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                    Healthy
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                    Warning
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                    Critical
                  </div>

                </div>

              </div>

              <div className="relative h-[650px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

                {filteredNodes.length === 0 ? (

                  <div className="flex h-full flex-col items-center justify-center text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl text-slate-400 shadow-sm">
                      <FaSearch />
                    </div>

                    <h4 className="mt-4 text-sm font-bold text-slate-700">
                      No devices found
                    </h4>

                    <p className="mt-2 text-sm text-slate-500">
                      Try changing your search or filters.
                    </p>

                  </div>

                ) : (

                  <ReactFlow
                    nodes={flowNodes}
                    edges={flowEdges}
                    nodeTypes={{
                      networkNode: NetworkNode,
                    }}
                    fitView
                    fitViewOptions={{
                      padding: 0.2,
                    }}
                    nodesConnectable={false}
                    nodesDraggable
                    zoomOnScroll
                    panOnDrag
                    onNodeClick={(_, node) => {
                      setSelectedNode(node.data);
                      setShowDetails(true);
                    }}
                  >

                    <Background
                      color="#cbd5e1"
                      gap={24}
                      size={1}
                    />

                    <Controls />

                    <MiniMap
                      nodeColor={(node) => {
                        const status = node.data?.status;

                        if (status === "critical") {
                          return "#ef4444";
                        }

                        if (status === "warning") {
                          return "#f59e0b";
                        }

                        return "#10b981";
                      }}
                    />

                  </ReactFlow>

                )}

                {/* Selected Node Panel */}
                {showDetails && selectedNode && (
                  <div className="absolute right-4 top-4 z-10 w-80 max-w-[calc(100%-2rem)] rounded-2xl border border-slate-200 bg-white shadow-xl">

                    <div className="flex items-center justify-between border-b border-slate-100 p-5">

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                          Device Details
                        </p>

                        <h4 className="mt-1 text-lg font-bold text-slate-900">
                          {selectedNode.label}
                        </h4>
                      </div>

                      <button
                        onClick={() => setShowDetails(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                      >
                        <FaTimes />
                      </button>

                    </div>

                    <div className="space-y-4 p-5">

                      <DetailRow
                        label="Type"
                        value={selectedNode.type}
                      />

                      <DetailRow
                        label="Vendor"
                        value={selectedNode.vendor}
                      />

                      <DetailRow
                        label="Model"
                        value={selectedNode.model}
                      />

                      <DetailRow
                        label="IP Address"
                        value={selectedNode.ip}
                      />

                      <DetailRow
                        label="Node ID"
                        value={selectedNode.id}
                      />

                      <div>

                        <p className="text-xs font-medium text-slate-400">
                          Security Status
                        </p>

                        <div className="mt-2">

                          <StatusBadge status={selectedNode.status} />

                        </div>

                      </div>

                      {selectedNode.risk && (
                        <div>
                          <p className="text-xs font-medium text-slate-400">
                            Risk Level
                          </p>

                          <p className={`mt-1 text-sm font-bold ${selectedNode.risk === "High" ? "text-red-600" : selectedNode.risk === "Medium" ? "text-amber-600" : "text-emerald-600"}`}>
                            {selectedNode.risk}
                          </p>
                        </div>
                      )}

                    </div>

                    <div className="border-t border-slate-100 p-5">

                      <NavLink
                        to="/compliance"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        <FaShieldAlt />
                        View Compliance
                      </NavLink>

                    </div>

                  </div>
                )}

              </div>

            </section>

            {/* Device List */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-900">
                  Network Devices
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Devices discovered in the current network topology.
                </p>
              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[750px] text-left">

                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                      <th className="pb-3 font-semibold">Device</th>
                      <th className="pb-3 font-semibold">Type</th>
                      <th className="pb-3 font-semibold">Vendor</th>
                      <th className="pb-3 font-semibold">IP Address</th>
                      <th className="pb-3 font-semibold">Risk</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredNodes.map((node) => (

                      <tr
                        key={node.id}
                        onClick={() => {
                          setSelectedNode(node);
                          setShowDetails(true);
                        }}
                        className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                      >

                        <td className="py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              {getNodeIcon(node.type)}
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {node.label}
                              </p>

                              <p className="text-xs text-slate-400">
                                {node.id}
                              </p>
                            </div>

                          </div>

                        </td>

                        <td className="py-4 text-sm capitalize text-slate-600">
                          {node.type}
                        </td>

                        <td className="py-4 text-sm text-slate-600">
                          {node.vendor || "—"}
                        </td>

                        <td className="py-4 text-sm text-slate-600">
                          {node.ip || "—"}
                        </td>

                        <td className="py-4">

                          {node.risk ? (
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${node.risk === "High" ? "bg-red-100 text-red-700" : node.risk === "Medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                              {node.risk}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">
                              —
                            </span>
                          )}

                        </td>

                        <td className="py-4">
                          <StatusBadge status={node.status} />
                        </td>

                      </tr>

                    ))}

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

function NetworkNode({ data }) {
  return (
    <div
      onClick={data.onClick}
      className="relative min-w-[170px] cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center shadow-lg transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl"
    >

      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-0 !bg-blue-500"
      />

      <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${getNodeBackground(data.type)} ${getNodeColor(data.type)}`}>
        {getNodeIcon(data.type)}
      </div>

      <p className="mt-3 truncate text-sm font-bold text-slate-800">
        {data.label}
      </p>

      <p className="mt-1 text-xs capitalize text-slate-400">
        {data.type}
      </p>

      <div className="mt-3 flex items-center justify-center gap-2">

        <span className={`h-2 w-2 rounded-full ${getStatusColor(data.status)}`}></span>

        <span className="text-xs capitalize text-slate-500">
          {data.status || "Unknown"}
        </span>

      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-0 !bg-blue-500"
      />

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
          Live
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

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-semibold text-slate-700">
        {value || "Not available"}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "critical") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        <span className="h-2 w-2 rounded-full bg-red-500"></span>
        Critical
      </span>
    );
  }

  if (status === "warning") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
        Warning
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
      <FaCheckCircle className="text-[10px]" />
      Healthy
    </span>
  );
}

function getNodeIcon(type) {
  switch (type?.toLowerCase()) {
    case "internet":
      return <FaGlobe />;

    case "firewall":
      return <FaShieldAlt />;

    case "router":
      return <FaRoute />;

    case "switch":
      return <FaNetworkWired />;

    case "server":
      return <FaServer />;

    case "database":
      return <FaDatabase />;

    default:
      return <FaNetworkWired />;
  }
}

function getNodeBackground(type) {
  switch (type?.toLowerCase()) {
    case "firewall":
      return "bg-red-50";

    case "router":
      return "bg-blue-50";

    case "switch":
      return "bg-indigo-50";

    case "server":
      return "bg-emerald-50";

    case "database":
      return "bg-purple-50";

    case "internet":
      return "bg-slate-100";

    default:
      return "bg-blue-50";
  }
}

function getNodeColor(type) {
  switch (type?.toLowerCase()) {
    case "firewall":
      return "text-red-600";

    case "router":
      return "text-blue-600";

    case "switch":
      return "text-indigo-600";

    case "server":
      return "text-emerald-600";

    case "database":
      return "text-purple-600";

    case "internet":
      return "text-slate-600";

    default:
      return "text-blue-600";
  }
}

function getStatusColor(status) {
  switch (status) {
    case "critical":
      return "bg-red-500";

    case "warning":
      return "bg-amber-500";

    case "healthy":
      return "bg-emerald-500";

    default:
      return "bg-slate-400";
  }
}

export default NetworkTopology;