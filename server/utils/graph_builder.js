import Graph from "graphology";

/*
=========================================================
NETWORK GRAPH BUILDER
=========================================================

Input:
    Validated Network Security CDM

Output:
    Graphology graph

Graph structure:

    DEVICE
       |
       ├── INTERFACE
       |      |
       |      └── IP ADDRESS
       |
       └── SECURITY RULE
              |
              ├── SOURCE
              └── DESTINATION
*/


// ========================================================
// CREATE NODE ID
// ========================================================

function createNodeId(type, id) {
  return `${type}:${id}`;
}


// ========================================================
// ADD DEVICE
// ========================================================

function addDevice(graph, device) {

  const nodeId = createNodeId("device", device.id);

  graph.addNode(nodeId, {
    type: "device",
    label: device.hostname,
    hostname: device.hostname,
    deviceId: device.id,
  });

  return nodeId;
}


// ========================================================
// ADD INTERFACE
// ========================================================

function addInterfaces(graph, device, deviceNodeId) {

  if (!device.interfaces) {
    return;
  }

  for (const iface of device.interfaces) {

    const interfaceNodeId =
      createNodeId("interface", iface.id);

    graph.addNode(interfaceNodeId, {
      type: "interface",
      label: iface.name,
      interfaceId: iface.id,
      name: iface.name,
      enabled: iface.enabled,
      description: iface.description || "",
    });


    // Device -> Interface
    graph.addEdge(
      deviceNodeId,
      interfaceNodeId,
      {
        type: "contains",
        relationship: "HAS_INTERFACE",
      }
    );


    // Add IP addresses
    if (iface.ip_addresses) {

      for (const ip of iface.ip_addresses) {

        const ipNodeId =
          createNodeId(
            "ip",
            `${iface.id}-${ip.address}/${ip.prefix_length}`
          );

        graph.addNode(ipNodeId, {
          type: "ip",
          label: `${ip.address}/${ip.prefix_length}`,
          address: ip.address,
          prefixLength: ip.prefix_length,
        });


        // Interface -> IP
        graph.addEdge(
          interfaceNodeId,
          ipNodeId,
          {
            type: "assigned",
            relationship: "HAS_IP",
          }
        );
      }
    }
  }
}


// ========================================================
// ADD SECURITY RULE
// ========================================================

function addSecurityRules(graph, device) {

  if (!device.security_policies) {
    return;
  }

  for (const rule of device.security_policies) {

    const ruleNodeId =
      createNodeId("rule", rule.id);


    // Security rule node
    graph.addNode(ruleNodeId, {

      type: "security_rule",

      label: rule.id,

      ruleId: rule.id,

      action: rule.action,

      protocol: rule.protocol,

      source: rule.source,

      destination: rule.destination,

      destinationPort:
        rule.destination_port ?? null,

      enabled: rule.enabled,
    });


    // -----------------------------------------
    // SOURCE NODE
    // -----------------------------------------

    const sourceNodeId =
      createNodeId(
        "endpoint",
        `source-${rule.id}-${rule.source}`
      );


    if (!graph.hasNode(sourceNodeId)) {

      graph.addNode(sourceNodeId, {

        type: "endpoint",

        label: rule.source,

        address: rule.source,

        endpointType: "source",
      });

    }


    // -----------------------------------------
    // DESTINATION NODE
    // -----------------------------------------

    const destinationNodeId =
      createNodeId(
        "endpoint",
        `destination-${rule.id}-${rule.destination}`
      );


    if (!graph.hasNode(destinationNodeId)) {

      graph.addNode(destinationNodeId, {

        type: "endpoint",

        label: rule.destination,

        address: rule.destination,

        endpointType: "destination",
      });

    }


    // -----------------------------------------
    // SOURCE -> RULE
    // -----------------------------------------

    graph.addEdge(
      sourceNodeId,
      ruleNodeId,
      {
        type: "security",
        relationship: "SOURCE",
      }
    );


    // -----------------------------------------
    // RULE -> DESTINATION
    // -----------------------------------------

    graph.addEdge(
      ruleNodeId,
      destinationNodeId,
      {
        type: "security",

        relationship:
          rule.action === "allow"
            ? "ALLOWS"
            : "DENIES",

        action: rule.action,

        protocol: rule.protocol,

        port:
          rule.destination_port ?? null,

        enabled: rule.enabled,
      }
    );
  }
}


// ========================================================
// BUILD SECURITY GRAPH
// ========================================================

function buildSecurityGraph(cdm) {

  const graph = new Graph();

  // -----------------------------------------
  // Safety check
  // -----------------------------------------

  if (!cdm || !cdm.device) {

    throw new Error(
      "Invalid CDM: device is required."
    );

  }


  const device = cdm.device;


  // -----------------------------------------
  // DEVICE
  // -----------------------------------------

  const deviceNodeId =
    addDevice(graph, device);


  // -----------------------------------------
  // INTERFACES + IPs
  // -----------------------------------------

  addInterfaces(
    graph,
    device,
    deviceNodeId
  );


  // -----------------------------------------
  // SECURITY RULES
  // -----------------------------------------

  addSecurityRules(
    graph,
    device
  );


  return graph;
}


// ========================================================
// CONVERT GRAPH TO JSON
// ========================================================
//
// Useful when sending the graph to your React UI.
//

function graphToJSON(graph) {

  return {

    nodes: graph.nodes().map((nodeId) => ({

      id: nodeId,

      ...graph.getNodeAttributes(nodeId),

    })),

    edges: graph.edges().map((edgeId) => {

      const attributes =
        graph.getEdgeAttributes(edgeId);

      const source =
        graph.source(edgeId);

      const target =
        graph.target(edgeId);

      return {

        id: edgeId,

        source,

        target,

        ...attributes,

      };

    }),

  };
}


// ========================================================
// MAIN FUNCTION
// ========================================================

function buildGraphFromCDM(cdm) {

  const graph =
    buildSecurityGraph(cdm);

  return graphToJSON(graph);
}


// ========================================================
// EXPORTS
// ========================================================

export {
  buildSecurityGraph,
  buildGraphFromCDM,
  graphToJSON,
};