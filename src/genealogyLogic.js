import dagre from 'dagre';

export const createPersonData = () => ({
  name: 'New Person',
  maidenName: '',
  sex: 'unknown',
  skinTone: 'none',
  avatar: null,
  colorTheme: 'purple',
  dob: '',
  birthLocation: '',
  dod: '',
  deathLocation: '',
  biography: '',
  customFields: [],
  parents: [],
  spouses: []
});

export const parseMaidenName = (fullName) => {
  if (!fullName) return { name: '', maidenName: '' };
  const open = fullName.indexOf('(');
  const close = fullName.indexOf(')', open);
  if (open !== -1 && close !== -1 && close > open) {
    const parsedMaidenName = fullName.substring(open + 1, close).trim();
    const parsedNameStr = (fullName.substring(0, open) + fullName.substring(close + 1)).replace(/\s+/g, ' ').trim();
    return { name: parsedNameStr, maidenName: parsedMaidenName };
  }
  return { name: fullName.trim(), maidenName: '' };
};

export const initialNodes = [
  {
    id: 'root-1',
    data: { ...createPersonData(), name: 'Main Root' },
    position: { x: 0, y: 0 },
    type: 'personNode', // custom node type
  }
];

export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 9);
}

// Converts our list of Person Nodes into xyflow nodes + edges layouted via dagre
export function getLayoutedElements(nodes, direction = 'TB', nodeHeight = 140) {
  const edges = [];
  
  nodes.forEach(node => {
     if (node.data.parents && Array.isArray(node.data.parents)) {
       node.data.parents.forEach(parentId => {
         // parent -> child edge
         edges.push({
           id: `e-${parentId}-to-${node.id}`,
           source: parentId,
           target: node.id,
           type: 'smoothstep', 
           animated: false,
           style: { stroke: '#AA3BFF', strokeWidth: 2 } // Custom styling for genealogy tree
         });
       });
     }
     if (node.data.spouses && Array.isArray(node.data.spouses)) {
       node.data.spouses.forEach(spouseId => {
         if (node.id < spouseId) { // Prevent bidirectional duplicates
           edges.push({
             id: `e-spouse-${node.id}-${spouseId}`,
             source: node.id,
             target: spouseId,
             type: 'straight',
             animated: false,
             style: { stroke: '#EC4899', strokeWidth: 2, strokeDasharray: '6,6' } // Pink dashed line
           });
         }
       });
     }
  });

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 100 });

  nodes.forEach((node) => {
    // Estimate name length to determine dynamic width
    let nameStr = node.data.name || 'Unknown';
    if (node.data.maidenName) nameStr += ` (${node.data.maidenName})`;
    
    // ~11px per character + 100px base padding. Cap max width at 400px
    const width = Math.min(Math.max(240, nameStr.length * 11 + 100), 400);
    node.data.layoutWidth = width;
    
    dagreGraph.setNode(node.id, { width, height: nodeHeight });
  });

  edges.forEach((edge) => {
    if (!edge.id.startsWith('e-spouse-')) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((n) => {
    const nodeWithPosition = dagreGraph.node(n.id);
    const node = { ...n };
    const width = node.data.layoutWidth || 240;
    // Node position represents top-left, while Dagre centers. Correcting:
    node.position = {
      x: nodeWithPosition.x - width / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });

  return { nodes: layoutedNodes, edges };
}
