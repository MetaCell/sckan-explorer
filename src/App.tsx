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
    fetchJSON()
      .then((data) => {
        setHierarchicalNodes(getHierarchicalNodes(data));
        setOrgans(getOrgans(data));
      })
      .catch((error) => {
        // TODO: We should give feedback to the user
        console.error('Failed to fetch JSON data:', error);
      });

    fetchMajorNerves()
      .then((data) => {
        setMajorNerves(getUniqueMajorNerves(data));
      })
      .catch((error) => {
        // TODO: We should give feedback to the user
        console.error('Failed to fetch major nerves data:', error);
        setMajorNerves(undefined);
      });
  }, []);

  useEffect(() => {
    if (Object.keys(hierarchicalNodes).length > 0) {
      const neuronIDsSet = new Set<string>();

      // Loop through each node's connectionDetails and add all ids to the neuronIDsSet
      Object.values(hierarchicalNodes).forEach((node) => {
        if (node.connectionDetails) {
          Object.values(node.connectionDetails).forEach((ksIds) => {
            ksIds.forEach((id) => neuronIDsSet.add(id));
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

  const isLoading =
    LayoutComponent === undefined ||
    Object.keys(hierarchicalNodes).length === 0 ||
    majorNerves === undefined ||
    Object.keys(organs).length == 0 ||
    Object.keys(knowledgeStatements).length == 0;

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
                      <Loader />
                    ) : (
                      <DataContextProvider
                        majorNerves={majorNerves}
                        hierarchicalNodes={hierarchicalNodes}
                        organs={organs}
                        knowledgeStatements={knowledgeStatements}
                      >
                        <LayoutComponent />
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
