import {widgetIds} from "./widgets.ts";
import ConnectivityGrid from "../components/ConnectivityGrid.tsx";
import Connections from "../components/Connections.tsx";

const componentMap = {
    [widgetIds.connectivityGrid]: ConnectivityGrid,
    [widgetIds.connections]: Connections,
};

export default componentMap