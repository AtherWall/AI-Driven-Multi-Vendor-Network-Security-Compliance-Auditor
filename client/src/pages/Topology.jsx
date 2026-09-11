import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ReactFlow, Background, Controls, MiniMap, Handle, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FaShieldAlt, FaNetworkWired, FaFileAlt, FaBrain, FaChartBar, FaSearch, FaServer, FaDatabase, FaRoute, FaGlobe, FaTimes, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaCircleNotch } from "react-icons/fa";
import api from "../utils/axios";

function NetworkTopology({ user, onLogout }) {
    const navigate = useNavigate();

    const [configurations, setConfigurations] = useState([]);
    const [selectedAuditId, setSelectedAuditId] = useState("");
    const [graph, setGraph] = useState({ success: false, audit_id: null, nodes: [], edges: [] });
    const [selectedNode, setSelectedNode] = useState(null);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [vendorFilter, setVendorFilter] = useState("all");
    const [showDetails, setShowDetails] = useState(false);
    const [loadingConfigurations, setLoadingConfigurations] = useState(true);
    const [loadingGraph, setLoadingGraph] = useState(false);
    const [error, setError] = useState("");

    const fetchConfigurations = async () => {
        try {
            setLoadingConfigurations(true);
            setError("");

            const response = await api.get("/api/configurations");

            const data = response.data.configurations || [];
            const completedConfigurations = data.filter(
                (configuration) =>
                    configuration.status === "completed" &&
                    configuration.auditId
            );

            setConfigurations(completedConfigurations);

            if (completedConfigurations.length > 0) {
                const firstAuditId =
                    typeof completedConfigurations[0].auditId === "object"
                        ? completedConfigurations[0].auditId._id
                        : completedConfigurations[0].auditId;

                setSelectedAuditId(firstAuditId);
            } else {
                setSelectedAuditId("");
                setGraph({
                    success: false,
                    audit_id: null,
                    nodes: [],
                    edges: [],
                });
            }
        } catch (error) {
            console.error("Fetch configurations error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load configurations."
            );
        } finally {
            setLoadingConfigurations(false);
        }
    };

    const fetchGraph = async (auditId) => {
        if (!auditId) {
            setGraph({
                success: false,
                audit_id: null,
                nodes: [],
                edges: [],
            });
            return;
        }

        try {
            setLoadingGraph(true);
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
        } catch (error) {
            console.error("Fetch graph error:", error);

            setGraph({
                success: false,
                audit_id: auditId,
                nodes: [],
                edges: [],
            });

            setError(
                error.response?.data?.message ||
                "Unable to load network topology."
            );
        } finally {
            setLoadingGraph(false);
        }
    };

    useEffect(() => {
        fetchConfigurations();
    }, []);

    useEffect(() => {
        if (selectedAuditId) {
            fetchGraph(selectedAuditId);
        }
    }, [selectedAuditId]);

    const selectedConfiguration = useMemo(() => {
        return configurations.find((configuration) => {
            const auditId =
                typeof configuration.auditId === "object"
                    ? configuration.auditId?._id
                    : configuration.auditId;

            return auditId === selectedAuditId;
        });
    }, [configurations, selectedAuditId]);

    const filteredNodes = useMemo(() => {
        return graph.nodes.filter((node) => {
            const searchValue = search.toLowerCase();

            const matchesSearch =
                !searchValue ||
                node.label?.toLowerCase().includes(searchValue) ||
                node.id?.toLowerCase().includes(searchValue) ||
                node.hostname?.toLowerCase().includes(searchValue) ||
                node.deviceId?.toLowerCase().includes(searchValue) ||
                node.vendor?.toLowerCase().includes(searchValue) ||
                node.address?.toLowerCase().includes(searchValue) ||
                node.name?.toLowerCase().includes(searchValue);

            const matchesType =
                typeFilter === "all" ||
                node.type?.toLowerCase() === typeFilter.toLowerCase();

            const matchesVendor =
                vendorFilter === "all" ||
                node.vendor?.toLowerCase() === vendorFilter.toLowerCase();

            return matchesSearch && matchesType && matchesVendor;
        });
    }, [graph.nodes, search, typeFilter, vendorFilter]);

    const filteredNodeIds = useMemo(
        () => new Set(filteredNodes.map((node) => node.id)),
        [filteredNodes]
    );

    const filteredEdges = useMemo(() => {
        return graph.edges.filter(
            (edge) =>
                filteredNodeIds.has(edge.source) &&
                filteredNodeIds.has(edge.target)
        );
    }, [graph.edges, filteredNodeIds]);

    const flowNodes = useMemo(() => {
        return filteredNodes.map((node, index) => ({
            id: node.id,
            position: {
                x: (index % 4) * 280 + 80,
                y: Math.floor(index / 4) * 190 + 80,
            },
            type: "networkNode",
            data: {
                ...node,
                onClick: () => {
                    setSelectedNode(node);
                    setShowDetails(true);
                },
            },
        }));
    }, [filteredNodes]);

    const flowEdges = useMemo(() => {
        return filteredEdges.map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: "smoothstep",
            animated: false,
            label: edge.relationship || "",
            style: {
                stroke: "#3b82f6",
                strokeWidth: 2,
            },
            labelStyle: {
                fill: "#475569",
                fontSize: 10,
                fontWeight: 600,
            },
        }));
    }, [filteredEdges]);

    const vendors = useMemo(() => {
        return [
            ...new Set(
                graph.nodes
                    .map((node) => node.vendor)
                    .filter(Boolean)
            ),
        ];
    }, [graph.nodes]);

    const nodeTypes = useMemo(() => {
        return [
            ...new Set(
                graph.nodes
                    .map((node) => node.type)
                    .filter(Boolean)
            ),
        ];
    }, [graph.nodes]);

    const statistics = {
        nodes: graph.nodes.length,
        connections: graph.edges.length,
        devices: graph.nodes.filter((node) => node.type === "device").length,
        interfaces: graph.nodes.filter((node) => node.type === "interface").length,
        ips: graph.nodes.filter((node) => node.type === "ip").length,
        rules: graph.nodes.filter((node) => node.type === "security_rule").length,
    };

    const getAuditLabel = (configuration) => {
        if (!configuration) {
            return "Select configuration";
        }

        return configuration.originalName || configuration.filename;
    };

    return (
        <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
            <div className="flex min-h-screen">
                <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#07152f] text-white lg:flex">
                    <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                            <FaShieldAlt className="text-lg" />
                        </div>

                        <div>
                            <p className="text-sm font-bold leading-tight">AI Network Security</p>
                            <p className="text-sm font-bold leading-tight text-blue-400">Auditor</p>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 py-6">
                        <SidebarLink to="/dashboard" icon={<FaNetworkWired />} label="Dashboard" />
                        <SidebarLink to="/configurations" icon={<FaFileAlt />} label="Configurations" />
                        <SidebarLink to="/topology" icon={<FaRoute />} label="Network Topology" />
                        <SidebarLink to="/ai-training" icon={<FaBrain />} label="AI Training" />
                        <SidebarLink to="/compliance" icon={<FaShieldAlt />} label="Audit & Compliance" />
                        <SidebarLink to="/reports" icon={<FaChartBar />} label="Reports" />
                    </nav>

                    <div className="border-t border-white/10 px-4 py-5">
                        <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white">
                            Logout
                        </button>
                    </div>
                </aside>

                <main className="min-w-0 flex-1 lg:ml-64">
                    <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-6 py-4 lg:px-8">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Network Topology</h1>
                            <p className="text-sm text-slate-500">Explore the topology generated from your analyzed configurations</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-semibold text-slate-800">{user?.name || "Network Administrator"}</p>
                                <p className="text-xs text-slate-400">{user?.email || ""}</p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                {user?.name?.charAt(0)?.toUpperCase() || "A"}
                            </div>
                        </div>
                    </header>

                    <div className="p-6 lg:p-8">
                        <section className="mb-6">
                            <p className="text-sm font-semibold text-blue-600">Network Visualization</p>

                            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                                Infrastructure Topology
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                Visualize the network structure generated from the selected configuration's validated CDM.
                            </p>
                        </section>

                        {loadingConfigurations ? (
                            <LoadingCard message="Loading configurations..." />
                        ) : configurations.length === 0 ? (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                                <div className="flex items-start gap-4">
                                    <FaExclamationTriangle className="mt-1 text-lg text-amber-500" />

                                    <div>
                                        <h3 className="font-bold text-amber-800">No completed configurations</h3>
                                        <p className="mt-1 text-sm text-amber-700">
                                            Upload and successfully analyze a configuration before viewing its topology.
                                        </p>

                                        <button onClick={() => navigate("/configurations")} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                                            Go to Configurations
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700">Configuration</p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                Select a completed configuration to load its real graph.
                                            </p>
                                        </div>

                                        <select value={selectedAuditId} onChange={(event) => setSelectedAuditId(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 md:w-[420px]">
                                            {configurations.map((configuration) => {
                                                const auditId =
                                                    typeof configuration.auditId === "object"
                                                        ? configuration.auditId?._id
                                                        : configuration.auditId;

                                                return (
                                                    <option key={auditId} value={auditId}>
                                                        {getAuditLabel(configuration)}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>

                                    {selectedConfiguration && (
                                        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
                                            <DetailRow label="File" value={selectedConfiguration.originalName || selectedConfiguration.filename} />
                                            <DetailRow label="Vendor" value={selectedConfiguration.vendor} />
                                            <DetailRow label="Audit ID" value={selectedAuditId} />
                                        </div>
                                    )}
                                </section>

                                {error && (
                                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <StatCard title="Devices" value={statistics.devices} description="Device nodes" icon={<FaServer />} />
                                    <StatCard title="Interfaces" value={statistics.interfaces} description="Interface nodes" icon={<FaNetworkWired />} />
                                    <StatCard title="IP Addresses" value={statistics.ips} description="IP nodes" icon={<FaGlobe />} />
                                    <StatCard title="Security Rules" value={statistics.rules} description="Security policy nodes" icon={<FaShieldAlt />} />
                                </section>

                                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                                        <div className="relative flex-1">
                                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                                            <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search node, hostname, ID, vendor or IP..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white" />
                                        </div>

                                        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500">
                                            <option value="all">All Node Types</option>

                                            {nodeTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type.replaceAll("_", " ")}
                                                </option>
                                            ))}
                                        </select>

                                        <select value={vendorFilter} onChange={(event) => setVendorFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500">
                                            <option value="all">All Vendors</option>

                                            {vendors.map((vendor) => (
                                                <option key={vendor} value={vendor.toLowerCase()}>
                                                    {vendor}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </section>

                                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">Network Graph</h3>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {filteredNodes.length} nodes and {filteredEdges.length} connections visible
                                            </p>
                                        </div>

                                        {loadingGraph && (
                                            <div className="flex items-center gap-2 text-sm text-blue-600">
                                                <FaCircleNotch className="animate-spin" />
                                                Loading graph...
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative h-[650px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                                        {loadingGraph ? (
                                            <LoadingCard message="Generating topology..." />
                                        ) : filteredNodes.length === 0 ? (
                                            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl text-slate-400 shadow-sm">
                                                    <FaSearch />
                                                </div>

                                                <h4 className="mt-4 text-sm font-bold text-slate-700">
                                                    No graph nodes found
                                                </h4>

                                                <p className="mt-2 text-sm text-slate-500">
                                                    The selected audit did not return nodes matching your filters.
                                                </p>
                                            </div>
                                        ) : (
                                            <ReactFlow nodes={flowNodes} edges={flowEdges} nodeTypes={{ networkNode: NetworkNode }} fitView fitViewOptions={{ padding: 0.2 }} nodesConnectable={false} nodesDraggable zoomOnScroll panOnDrag>
                                                <Background color="#cbd5e1" gap={24} size={1} />
                                                <Controls />
                                                <MiniMap nodeColor={() => "#3b82f6"} />
                                            </ReactFlow>
                                        )}

                                        {showDetails && selectedNode && (
                                            <div className="absolute right-4 top-4 z-10 w-80 max-w-[calc(100%-2rem)] rounded-2xl border border-slate-200 bg-white shadow-xl">
                                                <div className="flex items-center justify-between border-b border-slate-100 p-5">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                                            Node Details
                                                        </p>

                                                        <h4 className="mt-1 break-all text-lg font-bold text-slate-900">
                                                            {selectedNode.label || selectedNode.id}
                                                        </h4>
                                                    </div>

                                                    <button onClick={() => setShowDetails(false)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200">
                                                        <FaTimes />
                                                    </button>
                                                </div>

                                                <div className="space-y-4 p-5">
                                                    <DetailRow label="Type" value={selectedNode.type} />
                                                    <DetailRow label="Node ID" value={selectedNode.id} />
                                                    <DetailRow label="Hostname" value={selectedNode.hostname} />
                                                    <DetailRow label="Device ID" value={selectedNode.deviceId} />
                                                    <DetailRow label="Interface" value={selectedNode.name} />
                                                    <DetailRow label="Address" value={selectedNode.address} />
                                                    <DetailRow label="Prefix Length" value={selectedNode.prefixLength} />
                                                    <DetailRow label="Vendor" value={selectedNode.vendor} />
                                                    <DetailRow label="Platform" value={selectedNode.platform} />
                                                    <DetailRow label="Description" value={selectedNode.description} />
                                                    <DetailRow label="Relationship" value={selectedNode.relationship} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="mb-5">
                                        <h3 className="text-lg font-bold text-slate-900">Graph Nodes</h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Real nodes generated from the selected audit's CDM.
                                        </p>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[800px] text-left">
                                            <thead>
                                                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                                                    <th className="pb-3 font-semibold">Node</th>
                                                    <th className="pb-3 font-semibold">Type</th>
                                                    <th className="pb-3 font-semibold">Vendor</th>
                                                    <th className="pb-3 font-semibold">Address</th>
                                                    <th className="pb-3 font-semibold">ID</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {filteredNodes.map((node) => (
                                                    <tr key={node.id} onClick={() => { setSelectedNode(node); setShowDetails(true); }} className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-slate-50">
                                                        <td className="py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                                                    {getNodeIcon(node.type)}
                                                                </div>

                                                                <div>
                                                                    <p className="text-sm font-semibold text-slate-800">
                                                                        {node.label || node.id}
                                                                    </p>

                                                                    <p className="text-xs text-slate-400">
                                                                        {node.hostname || node.name || ""}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="py-4 text-sm capitalize text-slate-600">
                                                            {node.type?.replaceAll("_", " ") || "—"}
                                                        </td>

                                                        <td className="py-4 text-sm text-slate-600">
                                                            {node.vendor || "—"}
                                                        </td>

                                                        <td className="py-4 text-sm text-slate-600">
                                                            {node.address || "—"}
                                                        </td>

                                                        <td className="py-4 text-xs text-slate-400">
                                                            {node.id}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

function NetworkNode({ data }) {
    return (
        <div onClick={data.onClick} className="relative min-w-[190px] cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center shadow-lg transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl">
            <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-0 !bg-blue-500" />

            <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${getNodeBackground(data.type)} ${getNodeColor(data.type)}`}>
                {getNodeIcon(data.type)}
            </div>

            <p className="mt-3 max-w-[170px] truncate text-sm font-bold text-slate-800">
                {data.label || data.id}
            </p>

            <p className="mt-1 text-xs capitalize text-slate-400">
                {data.type?.replaceAll("_", " ") || "node"}
            </p>

            {data.address && (
                <p className="mt-2 truncate text-xs text-slate-500">
                    {data.address}
                </p>
            )}

            <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-0 !bg-blue-500" />
        </div>
    );
}

function SidebarLink({ to, icon, label }) {
    return (
        <NavLink to={to} className={({ isActive }) => `mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
            {icon}
            {label}
        </NavLink>
    );
}

function StatCard({ title, value, description, icon }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
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

function DetailRow({ label, value }) {
    return (
        <div>
            <p className="text-xs font-medium text-slate-400">
                {label}
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                {value !== null && value !== undefined && value !== "" ? String(value) : "Not available"}
            </p>
        </div>
    );
}

function LoadingCard({ message }) {
    return (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="text-center">
                <FaCircleNotch className="mx-auto animate-spin text-3xl text-blue-600" />
                <p className="mt-4 text-sm text-slate-500">{message}</p>
            </div>
        </div>
    );
}

function getNodeIcon(type) {
    switch (type?.toLowerCase()) {
        case "device":
            return <FaServer />;
        case "interface":
            return <FaNetworkWired />;
        case "ip":
            return <FaGlobe />;
        case "security_rule":
            return <FaShieldAlt />;
        case "endpoint":
            return <FaRoute />;
        case "firewall":
            return <FaShieldAlt />;
        case "router":
            return <FaRoute />;
        case "switch":
            return <FaNetworkWired />;
        case "database":
            return <FaDatabase />;
        case "internet":
            return <FaGlobe />;
        default:
            return <FaNetworkWired />;
    }
}

function getNodeBackground(type) {
    switch (type?.toLowerCase()) {
        case "device":
            return "bg-blue-50";
        case "interface":
            return "bg-indigo-50";
        case "ip":
            return "bg-emerald-50";
        case "security_rule":
            return "bg-red-50";
        case "endpoint":
            return "bg-amber-50";
        default:
            return "bg-blue-50";
    }
}

function getNodeColor(type) {
    switch (type?.toLowerCase()) {
        case "device":
            return "text-blue-600";
        case "interface":
            return "text-indigo-600";
        case "ip":
            return "text-emerald-600";
        case "security_rule":
            return "text-red-600";
        case "endpoint":
            return "text-amber-600";
        default:
            return "text-blue-600";
    }
}

export default NetworkTopology;