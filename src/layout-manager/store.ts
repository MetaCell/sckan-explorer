import { createStore } from '@metacell/geppetto-meta-client/common';
import componentMap from "./componentMap.ts";
import baseLayout from "./layout.ts";


const store = createStore(
    {},
    {},
    [],
    { undefined, baseLayout, componentMap }
)

export default store;
