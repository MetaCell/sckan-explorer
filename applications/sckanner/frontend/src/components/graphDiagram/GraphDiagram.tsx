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
}

interface GraphDiagramProps {
  origins: AnatomicalEntity[] | undefined;
  vias: ViaExplorerSerializerDetails[] | undefined;
  destinations: DestinationExplorerSerializerDetails[] | undefined;
  forward_connection?: ForwardConnection[] | undefined;
}

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

  const layoutNodes = (nodes: CustomNodeModel[], links: DefaultLinkModel[]) => {
    g = new dagre.graphlib.Graph();

    g.setGraph({
      rankdir: rankdir,
      ranksep: rankdir === 'TB' ? 150 : 100,
      marginx: rankdir === 'TB' ? 150 : 100,
      marginy: rankdir === 'TB' ? 100 : 150,
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
      marginx: newDir === 'TB' ? 150 : 100,
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
    setRankdir('TB');
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
      />
      <div ref={containerRef} className={'graphContainer'}>
        <CanvasWidget className={'graphContainer'} engine={engine} />
      </div>
      <InfoMenu engine={engine} forwardConnection={true} />
    </Box>
  ) : null;
};

export default GraphDiagram;
