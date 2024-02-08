import {widgetIds} from "./widgets.ts";
import ConnectivityGrid from "../components/ConnectivityGrid.tsx";

const componentMap = {
    [widgetIds.connectivityGrid]: ConnectivityGrid,
    [widgetIds.connections]: ConnectivityGrid,
};

export default componentMap