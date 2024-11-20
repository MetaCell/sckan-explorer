import React, { useEffect, useState } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { Box } from '@mui/material';
import { getLayoutManagerInstance } from '@metacell/geppetto-meta-client/common/layout/LayoutManager';
import { addWidget } from '@metacell/geppetto-meta-client/common/layout/actions';
import {
  connectionsWidget,
  connectivityGridWidget,
} from './layout-manager/widgets.ts';
import '@metacell/geppetto-meta-ui/flex-layout/style/light.scss';
import theme from './theme/index.tsx';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/common/Header.tsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SummaryPage from './components/SummaryPage.tsx';
import Loader from './components/common/Loader.tsx';
import { DataContextProvider } from './context/DataContextProvider.tsx';
import {
  fetchJSON,
  fetchKnowledgeStatements,
  fetchMajorNerves,
  fetchOrderJson,
} from './services/fetchService.ts';
import { getUniqueMajorNerves } from './services/filterValuesService.ts';
import {
  HierarchicalNode,
  KnowledgeStatement,
  Organ,
} from './models/explorer.ts';
import {
  getHierarchicalNodes,
  getOrgans,
} from './services/hierarchyService.ts';

const App = () => {
  const store = useStore();
  const dispatch = useDispatch();
  const [LayoutComponent, setLayoutComponent] = useState<
    React.ComponentType | undefined
  >(undefined);
  const [hierarchicalNodes, setHierarchicalNodes] = useState<
    Record<string, HierarchicalNode>
  >({});
  const [organs, setOrgans] = useState<Record<string, Organ>>({});
  const [majorNerves, setMajorNerves] = useState<Set<string>>();
  const [knowledgeStatements, setKnowledgeStatements] = useState<
    Record<string, KnowledgeStatement>
  >({});

  useEffect(() => {
    if (LayoutComponent === undefined) {
      const myManager = getLayoutManagerInstance();
      if (myManager) {
        setLayoutComponent(myManager.getComponent());
      }
    }
  }, [store, dispatch, LayoutComponent]);

  useEffect(() => {
    dispatch(addWidget(connectivityGridWidget()));
    dispatch(addWidget(connectionsWidget()));
  }, [LayoutComponent, dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jsonData, orderData, majorNervesData] = await Promise.all([
          fetchJSON(),
          fetchOrderJson(),
          fetchMajorNerves(),
        ]);

        setHierarchicalNodes(getHierarchicalNodes(jsonData, orderData));
        setOrgans(getOrgans(jsonData));
        setMajorNerves(getUniqueMajorNerves(majorNervesData));
      } catch (error) {
        // TODO: We should give feedback to the user
        console.error('Failed to fetch data:', error);
        setMajorNerves(undefined);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (Object.keys(hierarchicalNodes).length > 0) {
      const neuronIDsSet = new Set<string>();

      // Loop through each node's connectionDetails and add all ids to the neuronIDsSet
      Object.values(hierarchicalNodes).forEach((node) => {
        if (node.connectionDetails) {
          Object.values(node.connectionDetails).forEach((subOrgans) => {
            Object.values(subOrgans).forEach((ksIds) => {
              ksIds.forEach((id) => neuronIDsSet.add(id));
            });
          });
        }
      });

      fetchKnowledgeStatements(Array.from(neuronIDsSet))
        .then((statements) => {
          // Convert array to a map by ID for easy access
          const ksMap = statements.reduce<Record<string, KnowledgeStatement>>(
            (acc, ks) => {
              acc[ks.id] = ks;
              return acc;
            },
            {},
          );
          setKnowledgeStatements(ksMap);
        })
        .catch((error) => {
          // TODO: We should give feedback to the user
          console.error('Failed to fetch knowledge statements data:', error);
        });
    }
  }, [hierarchicalNodes]);

  const loadingLabels = [
    'Layout',
    'Nodes',
    'Nerves',
    'Organs',
    'Knowledge Statements',
  ];
  const loadingConditions = [
    LayoutComponent === undefined,
    Object.keys(hierarchicalNodes).length === 0,
    majorNerves === undefined,
    Object.keys(organs).length == 0,
    Object.keys(knowledgeStatements).length == 0,
  ];

  const isLoading = loadingConditions.some(Boolean);
  const loadingProgress =
    (loadingConditions.filter((c) => !c).length / loadingConditions.length) *
    100;
  const loadingInfo =
    loadingLabels[loadingConditions.findIndex((c) => c)] ?? '';

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box>
            <Header />
            <Box className="MuiContainer">
              <Routes>
                <Route path="/summary" element={<SummaryPage />} />
                <Route
                  path="/"
                  element={
                    isLoading ? (
                      <Loader
                        progress={loadingProgress}
                        text={`Loading ${loadingInfo}...`}
                      />
                    ) : (
                      <DataContextProvider
                        majorNerves={
                          majorNerves ? majorNerves : new Set<string>()
                        }
                        hierarchicalNodes={hierarchicalNodes}
                        organs={organs}
                        knowledgeStatements={knowledgeStatements}
                      >
                        {LayoutComponent && <LayoutComponent />}
                      </DataContextProvider>
                    )
                  }
                />
              </Routes>
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
    </>
  );
};

export default App;
