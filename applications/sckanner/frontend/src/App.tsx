import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  Routes,
  Route,
  useLocation,
  BrowserRouter,
  useSearchParams,
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
  fetchEndorgansOrder,
} from './services/fetchService.ts';
import { getUniqueMajorNerves } from './services/filterValuesService.ts';
import {
  HierarchicalNode,
  KnowledgeStatement,
  Organ,
} from './models/explorer.ts';
import {
  getHierarchicalNodes,
  getOrgansAndTargetSystems,
} from './services/hierarchyService';
import ReactGA from 'react-ga4';
import { Datasnapshot, OrderJson, NerveResponse } from './models/json.ts';
import { useDataContext } from './context/DataContext.ts';
import LoadingOverlay from './components/common/LoadingOverlay.tsx';
import ErrorModal from './components/common/ErrorModal.tsx';
import {
  decodeURLState,
  getDatasnapshotFromURLStateOrDefault,
} from './utils/urlStateManager.ts';
import { validateURLState } from './utils/validateURL.ts';
import { URLState } from './context/DataContext.ts';

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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppContent />
        <GoogleAnalyticsTracker />
      </BrowserRouter>
    </ThemeProvider>
  );
};

const AppContent = () => {
  const store = useStore();
  const dispatch = useDispatch();
  const [LayoutComponent, setLayoutComponent] = useState<
    React.ComponentType | undefined
  >(undefined);
  const [hierarchicalNodes, setHierarchicalNodes] = useState<
    Record<string, HierarchicalNode>
  >({});
  const [organs, setOrgans] = useState<Record<string, Organ>>({});
  const [targetSystems, setTargetSystems] = useState<Record<string, Organ[]>>(
    {},
  );
  const [targetSystemNames, setTargetSystemNames] = useState<
    Record<string, string>
  >({});
  const [majorNerves, setMajorNerves] = useState<Set<string>>();
  const [knowledgeStatements, setKnowledgeStatements] = useState<
    Record<string, KnowledgeStatement>
  >({});
  const [datasnapshots, setdatasnapshots] = useState<Datasnapshot[]>([]);
  const [selectedDatasnaphshot, setSelectedDatasnaphshot] =
    useState<string>('');
  const [hasValidatedInitialURL, setHasValidatedInitialURL] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [hasCriticalError, setHasCriticalError] = useState(false);
  const [fetchError, setFetchError] = useState<{
    show: boolean;
    message: string;
    details: string;
    title?: string;
  }>({
    show: false,
    message: '',
    details: '',
  });
  const previousDatasnaphshot = useRef<string>('');
  const [orderData, setOrderData] = useState<OrderJson>({});
  const [endorgansOrder, setEndorgansOrder] = useState<
    Record<string, string[]>
  >({});
  const [searchParams] = useSearchParams();
  const [urlState, setUrlState] = useState<URLState>({
    datasnapshot: null,
    view: null,
    leftWidgetConnectionId: null,
    rightWidgetConnectionId: null,
    filters: null,
    summaryFilters: null,
    connectionPage: null,
    heatmapExpandedState: null,
    secondaryHeatmapExpandedState: null,
  });
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

  const fetchJSONAndSetHierarchicalNodes = useCallback(
    (datasnapshot: Datasnapshot, orderData: OrderJson) => {
      fetchJSON(datasnapshot.a_b_via_c_json_file).then((jsonData) => {
        setHierarchicalNodes(getHierarchicalNodes(jsonData, orderData));
        const { organs, targetSystems, targetSystemNames } =
          getOrgansAndTargetSystems(jsonData, endorgansOrder);
        setOrgans(organs);
        setTargetSystems(targetSystems);
        setTargetSystemNames(targetSystemNames);
      });
    },
    [endorgansOrder],
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      const failedResources: string[] = [];

      try {
        const results = await Promise.allSettled([
          fetchOrderJson().catch((err) => {
            failedResources.push('Organ hierarchy order (GitHub)');
            throw err;
          }),
          fetchMajorNerves().catch((err) => {
            failedResources.push('Major nerves data (GitHub)');
            throw err;
          }),
          fetchDatasnapshots().catch((err) => {
            failedResources.push('Data snapshots (API)');
            throw err;
          }),
          fetchEndorgansOrder().catch((err) => {
            failedResources.push('End organs hierarchy (GitHub)');
            throw err;
          }),
        ]);

        // Check if any fetch failed
        const failures = results.filter(
          (result) => result.status === 'rejected',
        );

        if (failures.length > 0) {
          const errorDetails = failures
            .map((failure, index) => {
              if (failure.status === 'rejected') {
                const resourceNames = [
                  'Organ hierarchy order (GitHub)',
                  'Major nerves data (GitHub)',
                  'Data snapshots (API)',
                  'End organs hierarchy (GitHub)',
                ];
                return `• ${resourceNames[index]}: ${failure.reason instanceof Error ? failure.reason.message : String(failure.reason)}`;
              }
              return '';
            })
            .filter(Boolean)
            .join('\n');

          setHasCriticalError(true);
          setFetchError({
            show: true,
            title: 'Resources Unavailable',
            message:
              'The resources needed to start the application are not available at the moment. Please try again later or contact support if the problem persists.',
            details: `Failed to fetch:\n${errorDetails}`,
          });
          return; // Don't proceed with partial data
        }

        // All fetches succeeded, extract the data
        const successfulResults = results.map((result) =>
          result.status === 'fulfilled' ? result.value : null,
        );

        const orderDataFetched = successfulResults[0] as OrderJson;
        const majorNervesData = successfulResults[1] as NerveResponse;
        const datasnaphotsData = successfulResults[2] as Datasnapshot[];
        const endorgansOrderFetched = successfulResults[3] as Record<
          string,
          string[]
        >;

        setOrderData(orderDataFetched);
        setMajorNerves(getUniqueMajorNerves(majorNervesData));
        setdatasnapshots(datasnaphotsData);
        setEndorgansOrder(endorgansOrderFetched);
      } catch (error) {
        // This catch is a fallback for unexpected errors
        console.error('Unexpected error during initial data fetch:', error);
        setHasCriticalError(true);
        setFetchError({
          show: true,
          title: 'Resources Unavailable',
          message:
            'The resources needed to start the application are not available at the moment. Please try again later.',
          details:
            error instanceof Error ? error.message : 'Unknown error occurred',
        });
      }
    };

    fetchInitialData();
  }, []); // Empty dependency array - runs only once

  useEffect(() => {
    if (datasnapshots.length === 0 || hasValidatedInitialURL) return; // Wait for datasnapshots and validate only once

    const urlValidationResult = validateURLState(urlState, datasnapshots);

    setHasValidatedInitialURL(true);

    if (urlValidationResult.errors.length > 0) {
      setFetchError({
        show: true,
        title: 'Invalid Data Reference',
        message:
          'Some URL parameters are no longer valid. The application will use corrected values.',
        details: urlValidationResult.errors.join('; '),
      });

      // Update the URL state with validated values
      if (urlValidationResult.validatedState) {
        // Update the URL immediately by modifying the current search params
        const currentParams = new URLSearchParams(window.location.search);
        if (urlValidationResult.validatedState.datasnapshot) {
          currentParams.set(
            'ds',
            urlValidationResult.validatedState.datasnapshot,
          );
        }
        const newSearch = currentParams.toString();

        // Update browser URL
        window.history.replaceState(null, '', `?${newSearch}`);

        // Update the URL state
        setUrlState((prev) => ({
          ...prev,
          ...urlValidationResult.validatedState,
        }));
      }
    }
  }, [urlState, datasnapshots, setUrlState, hasValidatedInitialURL]);

  useEffect(() => {
    if (datasnapshots.length === 0) return; // Wait for datasnapshots to be loaded

    const newSelectedDatasnapshot = getDatasnapshotFromURLStateOrDefault(
      urlState,
      datasnapshots,
    );
    setSelectedDatasnaphshot(newSelectedDatasnapshot);
  }, [urlState, datasnapshots]);

  // 4. Hierarchical nodes fetching - runs when selected datasnapshot or orderData changes
  useEffect(() => {
    const selectedSnapshotObj = datasnapshots.find(
      (ds: Datasnapshot) => ds.id === parseInt(selectedDatasnaphshot),
    );
    if (
      selectedSnapshotObj &&
      Object.keys(orderData).length > 0 &&
      Object.keys(endorgansOrder).length > 0
    ) {
      fetchJSONAndSetHierarchicalNodes(selectedSnapshotObj, orderData);
    }
  }, [
    selectedDatasnaphshot,
    orderData,
    datasnapshots,
    endorgansOrder,
    fetchJSONAndSetHierarchicalNodes,
  ]);

  useEffect(() => {
    if (Object.keys(hierarchicalNodes).length > 0 && selectedDatasnaphshot) {
      // Check if this is a datasnapshot change (not initial load)
      if (
        previousDatasnaphshot.current !== '' &&
        previousDatasnaphshot.current !== selectedDatasnaphshot
      ) {
        setIsDataLoading(true);
        // Only clear non-URL validation errors
        setFetchError((prev) =>
          prev.title === 'Invalid Data Reference'
            ? prev // Keep URL validation errors
            : { show: false, message: '', details: '' },
        );
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
            title: 'Data Loading Error',
            message: `Failed to load data snapshot "${selectedDatasnaphshot}". Please try again or select a different snapshot.`,
            details: error.message || 'Unknown error occurred',
          });
        });
    }
  }, [hierarchicalNodes, selectedDatasnaphshot]);

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

  const isLoading = !hasCriticalError && loadingConditions.some(Boolean);
  const loadingProgress =
    (loadingConditions.filter((c) => !c).length / loadingConditions.length) *
    100;
  const loadingInfo =
    loadingLabels[loadingConditions.findIndex((c) => c)] ?? '';

  useEffect(() => {
    const urlParsingResult = decodeURLState(searchParams);
    setUrlState(urlParsingResult.state);

    if (urlParsingResult.errors.length > 0) {
      setFetchError({
        show: true,
        title: 'URL Parameter Error',
        message:
          'Invalid URL parameters detected. The application will continue with default values.',
        details: urlParsingResult.errors.join('; '),
      });
    } else {
      // Clear any previous URL-related errors
      setFetchError((prev) =>
        prev.title === 'URL Parameter Error'
          ? { show: false, message: '', details: '' }
          : prev,
      );
    }
  }, [searchParams]);

  return (
    <>
      <DataContextProvider
        key={selectedDatasnaphshot}
        selectedDatasnapshot={selectedDatasnaphshot}
        urlState={urlState}
        setUrlState={setUrlState}
        majorNerves={majorNerves ? majorNerves : new Set<string>()}
        hierarchicalNodes={hierarchicalNodes}
        organs={organs}
        targetSystems={targetSystems}
        targetSystemNames={targetSystemNames}
        knowledgeStatements={knowledgeStatements}
        endorgansOrder={endorgansOrder}
      >
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
                      <AppWithReset
                        selectedDatasnaphshot={selectedDatasnaphshot}
                      >
                        {LayoutComponent && <LayoutComponent />}
                      </AppWithReset>
                      <LoadingOverlay
                        open={isDataLoading}
                        message="Loading new data snapshot..."
                      />
                      <ErrorModal
                        open={fetchError.show}
                        handleClose={handleErrorModalClose}
                        title={fetchError.title || 'Error'}
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
      </DataContextProvider>
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
