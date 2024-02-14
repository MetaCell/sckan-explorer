import { useEffect, useState } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { Box, CircularProgress } from "@mui/material";
import { getLayoutManagerInstance } from "@metacell/geppetto-meta-client/common/layout/LayoutManager";
import { addWidget } from '@metacell/geppetto-meta-client/common/layout/actions';
import { connectionsWidget, connectivityGridWidget } from "./layout-manager/widgets.ts";
import '@metacell/geppetto-meta-ui/flex-layout/style/light.scss';
import theme from './theme/index.tsx';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/common/Header.tsx';

const App = () => {
    const store = useStore();
    const dispatch = useDispatch();
    const [LayoutComponent, setLayoutComponent] = useState<React.ComponentType | undefined>(undefined);

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

    return (
        <>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box>
                    <Header />
                    <Box className="MuiContainer">
                        {LayoutComponent === undefined ? <CircularProgress /> : <LayoutComponent />}
                    </Box>
                </Box>
            </ThemeProvider>
        </>
    );
}

export default App;