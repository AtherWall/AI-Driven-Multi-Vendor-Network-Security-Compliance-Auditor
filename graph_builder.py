import networkx as nx
from pydanticValidator import validate_json_file


def build_security_graph(rules):

    graph = nx.DiGraph()

    if "cdm" in rules:
        rules = rules["cdm"]

    if rules.get("devices") is not None:
        devices = rules["devices"]
    else:
        devices = [rules["device"]]

    rules = [
        rule
        for device in devices
        for rule in device["security_policies"]
    ]

    for rule in rules:

        if not rule["enabled"] or rule["action"] != "allow":
            continue

        source = rule["source"]
        destination = rule["destination"]

        graph.add_node(source)
        graph.add_node(destination)

        graph.add_edge(
            source,
            destination,
            protocol=rule["protocol"],
            port=rule["destination_port"]
        )

    return graph

result = validate_json_file("Datasets/fortinet_valid.json")

if result["valid"]:
    graph = build_security_graph(result)

    print("Nodes:")
    for node in graph.nodes:
        print(f"  {node}")

    print("\nEdges:")
    for source, destination, details in graph.edges(data=True):
        print(
            f"  {source} -> {destination} "
            f"({details['protocol']}/{details['port']})"
        )