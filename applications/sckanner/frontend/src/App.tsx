import React, { useEffect, useState, useRef } from 'react';
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
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import SummaryPage from './components/SummaryPage.tsx';
import Loader from './components/common/Loader.tsx';
import { DataContextProvider } from './context/DataContextProvider.tsx';
import {
  fetchDatasnapshots,
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
import ReactGA from 'react-ga4';
import { Datasnapshot, OrderJson } from './models/json.ts';
import { useDataContext } from './context/DataContext.ts';
import LoadingOverlay from './components/common/LoadingOverlay.tsx';
import ErrorModal from './components/common/ErrorModal.tsx';

const AppWithReset = ({
  selectedDatasnaphshot,
  children,
}: {
  selectedDatasnaphshot: string;
  children: React.ReactNode;
}) => {
  const { resetApplicationState } = useDataContext();
  const previousDatasnaphshot = useRef<string>(selectedDatasnaphshot);
  const dispatch = useDispatch();

  useEffect(() => {
    if (previousDatasnaphshot.current !== selectedDatasnaphshot) {
      resetApplicationState();

      // Reset layout widgets to their initial state
      dispatch(addWidget(connectivityGridWidget()));
      dispatch(addWidget(connectionsWidget()));

      previousDatasnaphshot.current = selectedDatasnaphshot;
    }
  }, [selectedDatasnaphshot, resetApplicationState, dispatch]);

  return <>{children}</>;
};

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
  const [datasnapshots, setdatasnapshots] = useState<Datasnapshot[]>([]);
  const [selectedDatasnaphshot, setSelectedDatasnaphshot] =
    useState<string>('');
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [fetchError, setFetchError] = useState<{
    show: boolean;
    message: string;
    details: string;
  }>({
    show: false,
    message: '',
    details: '',
  });
  const previousDatasnaphshot = useRef<string>('');
  const [orderData, setOrderData] = useState<OrderJson>({});

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

  const fetchJSONAndSetHierarchicalNodes = (
    datasnapshot: Datasnapshot,
    orderData: OrderJson,
  ) => {
    fetchJSON(datasnapshot.a_b_via_c_json_file).then((jsonData) => {
      setHierarchicalNodes(getHierarchicalNodes(jsonData, orderData));
      setOrgans(getOrgans(jsonData));
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderDataFetched, majorNervesData, datasnapshots] =
          await Promise.all([
            fetchOrderJson(),
            fetchMajorNerves(),
            fetchDatasnapshots(),
          ]);

        setOrderData(orderDataFetched);
        setMajorNerves(getUniqueMajorNerves(majorNervesData));
        setdatasnapshots(datasnapshots);
        setSelectedDatasnaphshot(datasnapshots[0].id.toString());
        fetchJSONAndSetHierarchicalNodes(datasnapshots[0], orderDataFetched);
      } catch (error) {
        // TODO: We should give feedback to the user
        console.error('Failed to fetch data:', error);
        setMajorNerves(undefined);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (Object.keys(hierarchicalNodes).length > 0 && selectedDatasnaphshot) {
      // Check if this is a datasnapshot change (not initial load)
      if (
        previousDatasnaphshot.current !== '' &&
        previousDatasnaphshot.current !== selectedDatasnaphshot
      ) {
        setIsDataLoading(true);
        setFetchError({ show: false, message: '', details: '' });
      }

      const neuronIDsSet = new Set<string>();

      // Loop through each node's connectionDetails and add all ids to the neuronIDsSet
      Object.values(hierarchicalNodes).forEach((node) => {
        const typedNode = node as HierarchicalNode;
        if (typedNode.connectionDetails) {
          Object.values(typedNode.connectionDetails).forEach((subOrgans) => {
            Object.values(subOrgans).forEach((ksIds) => {
              (ksIds as string[]).forEach((id) => neuronIDsSet.add(id));
            });
          });
        }
      });

      fetchKnowledgeStatements(selectedDatasnaphshot)
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
          // Set loading to false once data is loaded
          setIsDataLoading(false);
          // Update the previous datasnapshot reference
          previousDatasnaphshot.current = selectedDatasnaphshot;
        })
        .catch((error) => {
          console.error('Failed to fetch knowledge statements data:', error);
          setIsDataLoading(false);
          setFetchError({
            show: true,
            message: `Failed to load data snapshot "${selectedDatasnaphshot}". Please try again or select a different snapshot.`,
            details: error.message || 'Unknown error occurred',
          });
        });
    }
  }, [hierarchicalNodes, selectedDatasnaphshot]);

  useEffect(() => {
    const selectedSnapshotObj = datasnapshots.find(
      (ds: Datasnapshot) => ds.id === parseInt(selectedDatasnaphshot),
    );
    if (selectedSnapshotObj) {
      fetchJSONAndSetHierarchicalNodes(selectedSnapshotObj, orderData);
    }
  }, [selectedDatasnaphshot, orderData, datasnapshots]);

  const handleErrorModalClose = () => {
    setFetchError({ show: false, message: '', details: '' });
  };

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
          <GoogleAnalyticsTracker />
          <Box>
            <Header
              datasnapshots={datasnapshots}
              selectedDatasnaphshot={selectedDatasnaphshot}
              setSelectedDatasnaphshot={setSelectedDatasnaphshot}
            />
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
                      <>
                        <DataContextProvider
                          key={selectedDatasnaphshot}
                          majorNerves={
                            majorNerves ? majorNerves : new Set<string>()
                          }
                          hierarchicalNodes={hierarchicalNodes}
                          organs={organs}
                          knowledgeStatements={knowledgeStatements}
                        >
                          <AppWithReset
                            selectedDatasnaphshot={selectedDatasnaphshot}
                          >
                            {LayoutComponent && <LayoutComponent />}
                          </AppWithReset>
                        </DataContextProvider>
                        <LoadingOverlay
                          open={isDataLoading}
                          message="Loading new data snapshot..."
                        />
                        <ErrorModal
                          open={fetchError.show}
                          handleClose={handleErrorModalClose}
                          title="Data Loading Error"
                          message={fetchError.message}
                          details={fetchError.details}
                        />
                      </>
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

const GoogleAnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.VITE_REACT_APP_GA4_ID) {
      ReactGA.initialize(import.meta.env.VITE_REACT_APP_GA4_ID);
      ReactGA.send({ hitType: 'pageview', page: location.pathname });
    } else {
      console.warn('Google Analytics ID not set');
    }
  }, [location]);

  return null;
};

export default App;
