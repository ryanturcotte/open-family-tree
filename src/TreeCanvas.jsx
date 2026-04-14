import { useCallback, useEffect, useState, useRef } from 'react';
import { ReactFlow, Background, applyNodeChanges, ReactFlowProvider, useReactFlow, Panel } from '@xyflow/react';
import { Plus, Minus, Lock, Unlock, LayoutGrid, Focus } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import PersonNode from './PersonNode';
import { getLayoutedElements } from './genealogyLogic';
import { useDisplaySettings } from './DisplaySettingsContext';

const nodeTypes = {
  personNode: PersonNode,
};

const PANEL_WIDTH = 320;

function FlowCanvas({ genealogyNodes, onNodeSelect, focusNodeId, panelOpen, selectedNodeId, layoutKey }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  
  const [isZoomLocked, setIsZoomLocked] = useState(false);
  const [isNodesLocked, setIsNodesLocked] = useState(false);
  
  const { fitView, setCenter, getZoom, zoomIn, zoomOut } = useReactFlow();
  const { showBirthLocationOnNode, showDeathLocationOnNode, panelMode, fixedCardSize } = useDisplaySettings();
  const containerRef = useRef(null);

  // Layout whenever nodes change OR re-arrange is triggered (layoutKey bumps)
  useEffect(() => {
    const extraRows = (showBirthLocationOnNode ? 1 : 0) + (showDeathLocationOnNode ? 1 : 0);
    const nodeHeight = 140 + extraRows * 24;
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(genealogyNodes, 'TB', nodeHeight, fixedCardSize);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    setTimeout(() => {
      fitView({ maxZoom: 1, padding: 0.2, duration: 800 });
    }, 150);
  }, [genealogyNodes, layoutKey, showBirthLocationOnNode, showDeathLocationOnNode, fixedCardSize, fitView]);

  // Responsive: re-fit on window resize (debounced)
  useEffect(() => {
    let timer;
    const handleResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fitView({ maxZoom: 1, padding: 0.2, duration: 400 });
      }, 300);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [fitView]);

  // Center on node, offset so panel can show on the right
  const centerOnNode = useCallback((nodeId, duration = 700) => {
    const target = nodes.find(n => n.id === nodeId);
    if (!target) return;
    
    // If zoom is locked, maintain current zoom level. Otherwise use a more gentle zoom (0.8 max)
    const currentZoom = getZoom();
    const targetZoom = isZoomLocked ? currentZoom : Math.min(0.8, currentZoom > 0.8 ? currentZoom : 0.8);
    
    // We want the node to be on the left side of the screen, so the panel (either docked or floating)
    // appears on the right. To move the node left, we must move the camera RIGHT (+ offset).
    // The panel is ~380px wide. We offset camera by half of that divided by zoom.
    const xOffset = panelOpen ? (190 / targetZoom) : 0;
    
    const nodeHalfWidth = target.data.layoutWidth ? target.data.layoutWidth / 2 : 120;
    setCenter(target.position.x + nodeHalfWidth + xOffset, target.position.y + 60, { zoom: targetZoom, duration });
  }, [nodes, panelOpen, panelMode, isZoomLocked, getZoom, setCenter]);

  useEffect(() => {
    if (focusNodeId && nodes.length > 0) centerOnNode(focusNodeId);
  }, [focusNodeId, centerOnNode, nodes]);

  useEffect(() => {
    if (selectedNodeId && nodes.length > 0) centerOnNode(selectedNodeId);
  }, [selectedNodeId, centerOnNode, nodes]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const handleNodeClick = (_, node) => {
    onNodeSelect(node.id);
  };

  const handlePaneClick = () => {
    onNodeSelect(null);
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={!isNodesLocked}
        nodesConnectable={!isNodesLocked}
        zoomOnScroll={!isZoomLocked}
        zoomOnPinch={!isZoomLocked}
        zoomOnDoubleClick={!isZoomLocked}
        panOnScroll={isZoomLocked} // When zoom is locked, we want scroll wheel to PAN instead
        minZoom={0.2}
        maxZoom={3}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#AA3BFF', strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#71717a" gap={24} size={1} className="opacity-50 dark:opacity-100" />
        
        <Panel position="bottom-left" className="m-4 flex gap-2">
           {/* Zoom controls: + Lock - */}
           <div className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden divide-x divide-zinc-300 dark:divide-zinc-800 items-center">
             <button onClick={() => zoomIn({ duration: 300 })} disabled={isZoomLocked} className={`p-2 transition-colors ${isZoomLocked ? 'text-zinc-400 opacity-50 cursor-not-allowed' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'}`} title="Zoom In">
                <Plus size={20} />
             </button>
             <button onClick={() => setIsZoomLocked(!isZoomLocked)} className="p-2 transition-colors" title={isZoomLocked ? "Unlock Zoom" : "Lock Zoom"}>
                {isZoomLocked ? <Lock size={18} className="text-amber-500" /> : <Unlock size={18} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100" />}
             </button>
             <button onClick={() => zoomOut({ duration: 300 })} disabled={isZoomLocked} className={`p-2 transition-colors ${isZoomLocked ? 'text-zinc-400 opacity-50 cursor-not-allowed' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'}`} title="Zoom Out">
                <Minus size={20} />
             </button>
           </div>
           
           {/* Layout controls: Fit Tree | Re-arrange | Lock Nodes */}
           <div className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden divide-x divide-zinc-300 dark:divide-zinc-800 items-center">
             <button onClick={() => fitView({ padding: 0.2, duration: 800 })} className="px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-medium text-sm flex items-center gap-1.5" title="Fit Entire Tree">
                <Focus size={16} /> Fit Tree
             </button>
             <button onClick={() => {
               // Force a re-layout by bumping the layout key in the parent
               // For now, re-run layout inline and fit
               const extraRows = (showBirthLocationOnNode ? 1 : 0) + (showDeathLocationOnNode ? 1 : 0);
               const nodeHeight = 140 + extraRows * 24;
               const { nodes: ln, edges: le } = getLayoutedElements(genealogyNodes, 'TB', nodeHeight, fixedCardSize);
               setNodes(ln);
               setEdges(le);
               setTimeout(() => fitView({ maxZoom: 1, padding: 0.2, duration: 800 }), 50);
             }} className="px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-medium text-sm flex items-center gap-1.5" title="Re-arrange Tree (reset dragged positions)">
                <LayoutGrid size={16} /> Re-arrange
             </button>
             <button onClick={() => setIsNodesLocked(!isNodesLocked)} className="px-3 py-2 transition-colors font-medium text-sm flex items-center gap-1.5" title={isNodesLocked ? "Unlock Nodes (allow dragging)" : "Lock Nodes (prevent dragging)"}>
                {isNodesLocked
                  ? <><Lock size={16} className="text-rose-500" /> <span className="text-rose-500">Locked</span></>
                  : <><Unlock size={16} className="text-zinc-600 dark:text-zinc-400" /> <span className="text-zinc-600 dark:text-zinc-400">Unlocked</span></>
                }
             </button>
           </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default function TreeCanvas(props) {
  return (
    <ReactFlowProvider>
      <FlowCanvas {...props} />
    </ReactFlowProvider>
  );
}
