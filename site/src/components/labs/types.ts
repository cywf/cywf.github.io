export type GraphNode = {
  id: string;
  label: string;
  type: string;
  description: string;
};

export type GraphEdge = {
  source: string;
  target: string;
  label: string;
};

export type LabGraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};
