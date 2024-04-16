import React, {useEffect, useState} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {Box, CircularProgress} from "@mui/material";
import {getLayoutManagerInstance} from "@metacell/geppetto-meta-client/common/layout/LayoutManager";
import {addWidget} from '@metacell/geppetto-meta-client/common/layout/actions';
import {connectionsWidget, connectivityGridWidget} from "./layout-manager/widgets.ts";
import '@metacell/geppetto-meta-ui/flex-layout/style/light.scss';
import theme from './theme/index.tsx';
import {ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/common/Header.tsx';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import SummaryPage from "./components/SummaryPage.tsx";
import {DataContextProvider} from './context/DataContextProvider.tsx';
import {fetchJSON} from "./services/fetchService.ts";

const App = () => {
    const store = useStore();
    const dispatch = useDispatch();
    const [LayoutComponent, setLayoutComponent] = useState<React.ComponentType | undefined>(undefined);
    const [jsonData, setJsonData] = useState();

    useEffect(() => {
        if (LayoutComponent === undefined) {
            const myManager = getLayoutManagerInstance();
            if (myManager) {
                setLayoutComponent(myManager.getComponent());
            }
        }
    }, [store, dispatch, LayoutComponent])

    useEffect(() => {
        dispatch(addWidget(connectivityGridWidget()));
        dispatch(addWidget(connectionsWidget()));
    }, [LayoutComponent, dispatch])

    useEffect(() => {
        fetchJSON().then(data => {
            setJsonData(data);
        }).catch(error => {
            // TODO: We should give feedback to the user
            console.error("Failed to fetch JSON data:", error);
            setJsonData(undefined);
        });
    }, []);

    const isLoading = LayoutComponent === undefined || jsonData === undefined

    return (
        <>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <Router>
                    <Box>
                        <Header/>
                        <Box className="MuiContainer">
                            <Routes>
                                <Route path="/summary" element={<SummaryPage/>}/>
                                <Route path="/" element={isLoading ? <CircularProgress/> :
                                    <DataContextProvider
                                        jsonData={jsonData}>
                                        <LayoutComponent/>
                                    </DataContextProvider>
                                }
                                />
                            </Routes>
                        </Box>
                    </Box>
                </Router>
            </ThemeProvider>
        </>
    );
}

export default App;
