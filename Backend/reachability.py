import networkx as nx


def find_reachable_paths(graph, source, destination):

    try:
        paths = list(
            nx.all_simple_paths(
                graph,
                source=source,
                target=destination
            )
        )

        return paths

    except nx.NetworkXNoPath:
        return []

paths = find_reachable_paths(
    graph,
    "INTERNET",
    "DATABASE"
)

print(paths)

SECURITY_ZONES = {
    "INTERNET",
    "DMZ",
    "APP",
    "DATABASE"
}

SENSITIVE_ZONES = {
    "DATABASE",
    "INTERNAL"
}

def find_cross_zone_exposure(graph, sources, sensitive_zones):

    exposures = []

    for source in sources:

        for destination in sensitive_zones:

            if source == destination:
                continue

            try:
                paths = nx.all_simple_paths(
                    graph,
                    source=source,
                    target=destination
                )

                for path in paths:

                    exposures.append({
                        "source": source,
                        "destination": destination,
                        "path": path
                    })

            except nx.NetworkXNoPath:
                pass

    return exposures