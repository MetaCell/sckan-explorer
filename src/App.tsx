import {useEffect, useState} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {Box, CircularProgress} from "@mui/material";
import {getLayoutManagerInstance} from "@metacell/geppetto-meta-client/common/layout/LayoutManager";
import {addWidget} from '@metacell/geppetto-meta-client/common/layout/actions';
import {connectionsWidget, connectivityGridWidget} from "./layout-manager/widgets.ts";
import '@metacell/geppetto-meta-ui/flex-layout/style/dark.scss'

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
        <Box sx={{
            display: 'flex',
            position: 'relative',
            width: '100%',
            height: '100vh',
        }}>
            {LayoutComponent === undefined ? <CircularProgress/> : <LayoutComponent/>}
        </Box>
    );
}

export default App;