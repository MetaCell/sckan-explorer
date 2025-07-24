/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import InfoMenu from './InfoMenu';
import NavigationMenu from './NavigationMenu';
import createEngine, {
  BasePositionModelOptions,
  DefaultLinkModel,
  DiagramModel,
} from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { CustomNodeModel } from './models/CustomNodeModel';
import { CustomNodeFactory } from './factories/CustomNodeFactory';
import {
  AnatomicalEntity,
  DestinationExplorerSerializerDetails,
  ViaExplorerSerializerDetails,
  ForwardConnection,
} from '../../models/explorer';
import { Box } from '@mui/material';
import dagre from 'dagre';
import { processData } from '../../services/GraphDiagramService.ts';

export interface CustomNodeOptions extends BasePositionModelOptions {
  forward_connection: ForwardConnection[];
  to?: Array<{ name: string; type: string }>;
  from?: Array<{ name: string; type: string }>;
  anatomicalType?: string;
  uri?: string;
}

interface GraphDiagramProps {
  origins: AnatomicalEntity[] | undefined;
  vias: ViaExplorerSerializerDetails[] | undefined;
  destinations: DestinationExplorerSerializerDetails[] | undefined;
  forward_connection?: ForwardConnection[] | undefined;
}

const checkXMargin = (
  vias: ViaExplorerSerializerDetails[] | undefined,
  destinations: DestinationExplorerSerializerDetails[] | undefined,
) => {
  let condition = false;

  if (vias !== undefined) {
    vias.forEach((via: ViaExplorerSerializerDetails) => {
      if (via?.anatomical_entities.length > 1) {
        condition = true;
      }
    });
  }

  if (!condition && destinations !== undefined) {
    destinations.forEach(
      (destination: DestinationExplorerSerializerDetails) => {
        if (destination?.anatomical_entities.length > 1) {
          condition = true;
        }
      },
    );
  }
  return condition;
};

const GraphDiagram: React.FC<GraphDiagramProps> = ({
  origins,
  vias,
  destinations,
  forward_connection = [],
}) => {
  const [engine] = useState(() => createEngine());
  const [modelUpdated, setModelUpdated] = useState(false);
  const [modelFitted, setModelFitted] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rankdir, setRankdir] = useState<string>('TB');
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  let g = new dagre.graphlib.Graph();

  const marginCondition =
    origins !== undefined && origins?.length > 1
      ? true
      : checkXMargin(vias, destinations);

  const layoutNodes = (
    nodes: CustomNodeModel[],
    links: DefaultLinkModel[],
    preserveUserPositions = false,
  ) => {
    g = new dagre.graphlib.Graph();

    g.setGraph({
      rankdir: rankdir,
      ranksep: rankdir === 'TB' ? 250 : 100,
      marginx:
        rankdir === 'TB'
          ? marginCondition
            ? 10
            : 250
          : marginCondition
            ? 10
            : 50,
      marginy: rankdir === 'TB' ? 50 : marginCondition ? 10 : 250,
      edgesep: 50,
      nodesep: 150,
    });

    g.setDefaultEdgeLabel(() => ({}));

    // Store user-moved positions before layout
    const userPositions = new Map<
      string,
      { x: number; y: number; userMoved: boolean }
    >();
    if (preserveUserPositions) {
      const currentModel = engine.getModel();
      if (currentModel) {
        const currentNodes = currentModel.getNodes();
        currentNodes.forEach((node) => {
          const pos = node.getPosition();
          // Consider a node as user-moved if it has custom metadata or if it's not at initial position
          const userMoved =
            (node as unknown as { _userMoved?: boolean })._userMoved || false;
          userPositions.set(node.getID(), { x: pos.x, y: pos.y, userMoved });
        });
      }
    }

    nodes.forEach((node) => {
      node.setPosition(0, 0);
      g.setNode(node.getID(), { width: 100, height: 50 });
    });

    links.forEach((link) => {
      g.setEdge(
        link.getSourcePort().getNode().getID(),
        link.getTargetPort().getNode().getID(),
      );
    });

    dagre.layout(g);

    g.nodes().forEach((nodeId: string) => {
      const node = nodes.find((n) => n.getID() === nodeId);
      if (node) {
        const userPos = userPositions.get(nodeId);
        if (userPos && userPos.userMoved) {
          // Preserve user-moved position
          node.setPosition(userPos.x, userPos.y);
          (node as unknown as { _userMoved?: boolean })._userMoved = true;
        } else {
          // Use calculated dagre position
          const { x, y } = g.node(nodeId);
          node.setPosition(x, y);
        }
      }
    });
  };

  const toggleRankdir = () => {
    const currentModel = engine.getModel();
    if (!currentModel) return;

    g = new dagre.graphlib.Graph();
    let newDir = rankdir === 'TB' ? 'LR' : 'TB';
    const nodes = currentModel.getNodes();
    const links = currentModel.getLinks();

    if (nodes.length === 0) return;

    const firstPos = nodes[0].getPosition();
    const lastPos = nodes[nodes.length - 1].getPosition();
    g.setGraph({
      rankdir: newDir,
      ranksep: newDir === 'TB' ? 150 : 100,
      marginx: newDir === 'TB' ? 10 : 100,
      marginy: newDir === 'TB' ? 100 : 150,
      edgesep: 50,
      nodesep: 150,
    });
    g.setDefaultEdgeLabel(() => ({}));
    nodes.forEach((node) => {
      g.setNode(node.getID(), { width: 100, height: 50 });
    });

    links.forEach((link) => {
      g.setEdge(
        link.getSourcePort().getNode().getID(),
        link.getTargetPort().getNode().getID(),
      );
    });

    dagre.layout(g);

    const newFirst = g.node(nodes[0].getID());
    const newLast = g.node(nodes[nodes.length - 1].getID());

    if (
      firstPos.x === newFirst.x &&
      firstPos.y === newFirst.y &&
      lastPos.x === newLast.x &&
      lastPos.y === newLast.y
    ) {
      newDir = newDir === 'TB' ? 'LR' : 'TB';
    }

    setRankdir(newDir);
    setModelUpdated(true);
    // Don't trigger auto-scaling when changing rank direction
    setIsFirstLoad(false);
  };

  // This effect runs once to set up the engine
  useEffect(() => {
    engine.getNodeFactories().registerFactory(new CustomNodeFactory());

    // Ensure the engine is properly configured for interactions
    const model = engine.getModel();
    if (model) {
      model.setLocked(false);
    }
  }, [engine]);

  const initializeGraph = () => {
    // Check if we already have a model with nodes that might have been moved
    const existingModel = engine.getModel();
    const hasExistingNodes =
      existingModel && existingModel.getNodes().length > 0;

    const model = new DiagramModel();

    const { nodes, links } = processData({
      origins,
      vias,
      destinations,
      forwardConnection: forward_connection,
    });

    // Only preserve user positions if this is a re-initialization and we had existing nodes
    layoutNodes(nodes, links, hasExistingNodes);

    // Ensure nodes are movable and track when they're moved
    nodes.forEach((node) => {
      node.setLocked(false);

      // Add listener to track when node is moved by user
      node.registerListener({
        positionChanged: () => {
          (node as unknown as { _userMoved?: boolean })._userMoved = true;
        },
      });
    });

    model.addAll(...nodes, ...links);

    engine.setModel(model);
    // Keep model unlocked to allow node movement
    const currentModel = engine.getModel();
    if (currentModel) {
      currentModel.setLocked(false);
    }
    setModelUpdated(true);
    setModelFitted(false); // Reset the fitted state so it can be fitted again
  };

  const resetGraph = () => {
    // Clear any pending zoom timeout
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current);
      zoomTimeoutRef.current = null;
    }
    // Reset first load state so the graph will auto-scale again
    setIsFirstLoad(true);
    setModelFitted(false);
    initializeGraph();
  };

  // This effect runs whenever origins, vias, or destinations change
  useEffect(() => {
    // Only initialize if we have actual data
    if (origins || vias || destinations) {
      // Clear any pending zoom timeout before reinitializing
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
        zoomTimeoutRef.current = null;
      }

      // Check if the model already exists and has the same data structure
      const existingModel = engine.getModel();
      const shouldRecreate =
        !existingModel || existingModel.getNodes().length === 0;

      if (shouldRecreate) {
        initializeGraph();
      } else {
        // If we have existing nodes, just update their positions if needed
        // but don't recreate the entire model
        const { nodes } = processData({
          origins,
          vias,
          destinations,
          forwardConnection: forward_connection,
        });

        // Only update layout if the number of nodes changed
        if (existingModel.getNodes().length !== nodes.length) {
          initializeGraph();
        } else {
          // If we're not recreating the model, mark as not first load
          setIsFirstLoad(false);
        }
      }
    }
  }, [origins, vias, destinations, forward_connection]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }
    };
  }, []);

  // This effect prevents the default scroll behavior but preserves drag functionality
  useEffect(() => {
    const currentContainer = containerRef.current;

    if (modelUpdated && currentContainer) {
      const handleWheel = (event: WheelEvent) => {
        // Allow zoom with Ctrl+wheel or Cmd+wheel
        if (event.ctrlKey || event.metaKey) {
          return;
        }

        // Check if we're currently dragging a node
        const target = event.target as HTMLElement;
        if (target.closest('[data-default-node]') || target.closest('.node')) {
          // Don't prevent wheel events on nodes to allow drag operations
          return;
        }

        event.preventDefault();
      };

      currentContainer.addEventListener('wheel', handleWheel, {
        passive: false,
      });

      return () => {
        currentContainer?.removeEventListener('wheel', handleWheel);
      };
    }
  }, [modelUpdated]);

  const customZoomToFit = () => {
    const model = engine.getModel();
    if (!model) return;

    const nodes = model.getNodes();
    if (nodes.length === 0) return;

    // Step 1: Force ports to report their positions
    nodes.forEach((node) => {
      Object.values(node.getPorts()).forEach((port) => {
        port.reportPosition();
      });
    });

    // Step 2: Repaint and zoom to fit
    engine.repaintCanvas();

    // Use a single timeout to avoid multiple rapid calls
    const timeoutId = setTimeout(() => {
      engine.zoomToFit();

      // Step 3: Wait a bit and then re-center the diagram
      const centerTimeoutId = setTimeout(() => {
        const canvas = document.querySelector(
          '.graphContainer',
        ) as HTMLDivElement;
        if (!canvas) return;

        // Compute bounding box again
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;

        nodes.forEach((node) => {
          const { x, y } = node.getPosition();
          const width = 100;
          const height = 50;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x + width);
          maxY = Math.max(maxY, y + height);
        });

        const diagramWidth = maxX - minX;
        const diagramHeight = maxY - minY;

        const canvasWidth = canvas.clientWidth;
        const canvasHeight = canvas.clientHeight;

        const zoom = model.getZoomLevel() / 100;

        const offsetX = canvasWidth / 2 - (minX + diagramWidth / 2) * zoom;
        const offsetY = canvasHeight / 2 - (minY + diagramHeight / 2) * zoom;

        model.setOffset(offsetX, offsetY);
        engine.repaintCanvas();
      }, 250); // Give zoomToFit time to apply

      // Clean up timeout references
      return () => {
        clearTimeout(centerTimeoutId);
      };
    }, 50); // Wait for port updates

    // Clean up timeout references
    return () => {
      clearTimeout(timeoutId);
    };
  };

  useEffect(() => {
    if (modelUpdated && !modelFitted && isFirstLoad) {
      // Clear any existing timeout to prevent multiple calls
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }

      // Use a longer delay to ensure the canvas is fully rendered
      zoomTimeoutRef.current = setTimeout(() => {
        const model = engine.getModel();
        const nodes = model?.getNodes();
        const container = containerRef.current;

        if (model && nodes && nodes.length > 0 && container) {
          // Ensure container has dimensions
          const containerRect = container.getBoundingClientRect();
          if (containerRect.width === 0 || containerRect.height === 0) {
            // If container is not ready, try again after a short delay
            setTimeout(() => {
              if (zoomTimeoutRef.current === null) {
                zoomTimeoutRef.current = setTimeout(() => {
                  customZoomToFit();
                  setModelFitted(true);
                  setIsFirstLoad(false);
                  zoomTimeoutRef.current = null;
                }, 200);
              }
            }, 200);
            return;
          }

          // Check if nodes are actually positioned (not all at 0,0)
          const nodePositions = nodes.map((node) => node.getPosition());
          const allAtOrigin = nodePositions.every(
            (pos) => pos.x === 0 && pos.y === 0,
          );

          if (allAtOrigin) {
            // Nodes are not positioned yet, try again after a short delay
            setTimeout(() => {
              if (zoomTimeoutRef.current === null) {
                zoomTimeoutRef.current = setTimeout(() => {
                  customZoomToFit();
                  setModelFitted(true);
                  setIsFirstLoad(false);
                  zoomTimeoutRef.current = null;
                }, 300);
              }
            }, 300);
            return;
          }

          // Force ports to report their positions first
          nodes.forEach((node) => {
            Object.values(node.getPorts()).forEach((port) => {
              port.reportPosition();
            });
          });

          // Repaint the canvas
          engine.repaintCanvas();

          // Add another small delay to ensure everything is rendered
          setTimeout(() => {
            customZoomToFit(); // Use the more robust custom zoom function
            setModelFitted(true);
            setIsFirstLoad(false); // Mark that first load is complete
          }, 100);
        }
        zoomTimeoutRef.current = null;
      }, 800); // Increased delay to ensure proper rendering

      return () => {
        if (zoomTimeoutRef.current) {
          clearTimeout(zoomTimeoutRef.current);
          zoomTimeoutRef.current = null;
        }
      };
    }
  }, [modelUpdated, modelFitted, engine, isFirstLoad]);

  useEffect(() => {
    if (isFirstLoad) {
      customZoomToFit();
    }
  }, [isFirstLoad]);

  return modelUpdated ? (
    <Box sx={{ height: '50rem', width: '100%' }}>
      <NavigationMenu
        engine={engine}
        toggleRankdir={toggleRankdir}
        resetGraph={resetGraph}
        customZoomToFit={customZoomToFit}
      />
      <div
        ref={containerRef}
        className={'graphContainer'}
        style={{
          height: '100%',
          width: '100%',
          userSelect: 'none', // Prevents text selection during drag
        }}
      >
        <CanvasWidget className={'graphContainer'} engine={engine} />
      </div>
      <InfoMenu engine={engine} forwardConnection={true} />
    </Box>
  ) : null;
};

export default GraphDiagram;
