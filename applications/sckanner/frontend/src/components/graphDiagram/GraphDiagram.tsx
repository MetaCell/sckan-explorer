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

const checkXMargin = (entities: any) => {
  let condition = false;
  entities.forEach((entity: any) => {
    if (entity.anatomical_entities.length > 1) {
      condition = true;
    }
  });
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [rankdir, setRankdir] = useState<string>('TB');
  let g = new dagre.graphlib.Graph();

  const marginCondition =
    origins?.length > 1 ? true : checkXMargin([...vias, ...destinations]);

  const layoutNodes = (nodes: CustomNodeModel[], links: DefaultLinkModel[]) => {
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
      const { x, y } = g.node(nodeId);
      node?.setPosition(x, y);
    });
  };

  const toggleRankdir = () => {
    g = new dagre.graphlib.Graph();
    let newDir = rankdir === 'TB' ? 'LR' : 'TB';
    const nodes = engine.getModel().getNodes();
    const links = engine.getModel().getLinks();
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
  };

  // This effect runs once to set up the engine
  useEffect(() => {
    engine.getNodeFactories().registerFactory(new CustomNodeFactory());
  }, [engine]);

  const initializeGraph = () => {
    const model = new DiagramModel();

    const { nodes, links } = processData({
      origins,
      vias,
      destinations,
      forwardConnection: forward_connection,
    });

    layoutNodes(nodes, links);

    model.addAll(...nodes, ...links);

    engine.setModel(model);
    // engine.getModel().setLocked(true)
    setModelUpdated(true);
    setTimeout(() => {
      engine.zoomToFit();
    }, 300);
  };

  const resetGraph = () => {
    initializeGraph();
  };

  // This effect runs once to set up the engine
  useEffect(() => {
    engine.getNodeFactories().registerFactory(new CustomNodeFactory());
  }, [engine]);

  // This effect runs whenever origins, vias, or destinations change
  useEffect(() => {
    initializeGraph();
  }, [origins, vias, destinations, engine, forward_connection]);

  // This effect prevents the default scroll and touchmove behavior
  useEffect(() => {
    const currentContainer = containerRef.current;

    if (modelUpdated && currentContainer) {
      const disableScroll = (event: Event) => {
        event.stopPropagation();
      };

      currentContainer.addEventListener('wheel', disableScroll, {
        passive: false,
      });
      currentContainer.addEventListener('touchmove', disableScroll, {
        passive: false,
      });

      return () => {
        currentContainer?.removeEventListener('wheel', disableScroll);
        currentContainer?.removeEventListener('touchmove', disableScroll);
      };
    }
  }, [modelUpdated]);
  
  const customZoomToFit = () => {
    const model = engine.getModel();
    const nodes = model.getNodes();
    
    // Step 1: Force ports to report their positions
    nodes.forEach((node) => {
      Object.values(node.getPorts()).forEach((port) => {
        port.reportPosition();
      });
    });
    
    // Step 2: Zoom to fit after ports are updated
    engine.repaintCanvas();
    
    setTimeout(() => {
      engine.zoomToFit();
      
      // Step 3: Wait a bit and then re-center the diagram
      setTimeout(() => {
        const canvas = document.querySelector('.graphContainer') as HTMLDivElement;
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
        
        const offsetX = (canvasWidth / 2) - ((minX + diagramWidth / 2) * zoom);
        const offsetY = (canvasHeight / 2) - ((minY + diagramHeight / 2) * zoom);
        
        model.setOffset(offsetX, offsetY);
        engine.repaintCanvas();
      }, 100); // Give zoomToFit time to apply
    }, 50); // Wait for port updates
  };
  
  useEffect(() => {
    if (modelUpdated && !modelFitted) {
      // TODO: for unknown reason at the moment if I call zoomToFit too early breaks the graph
      // To fix later in the next contract.
      setTimeout(() => {
        engine.zoomToFit();
      }, 1000);
      setModelFitted(true);
    }
  }, [modelUpdated, modelFitted, engine]);

  return modelUpdated ? (
    <Box sx={{ height: '50rem', width: '100%' }}>
      <NavigationMenu
        engine={engine}
        toggleRankdir={toggleRankdir}
        resetGraph={resetGraph}
        customZoomToFit={customZoomToFit}
      />
      <div ref={containerRef} className={'graphContainer'}>
        <CanvasWidget className={'graphContainer'} engine={engine} />
      </div>
      <InfoMenu engine={engine} forwardConnection={true} />
    </Box>
  ) : null;
};

export default GraphDiagram;
