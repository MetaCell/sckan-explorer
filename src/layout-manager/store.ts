import { createStore } from '@metacell/geppetto-meta-client/common';
import componentMap from "./componentMap.ts";
import layout from "./layout.ts";


const store = createStore(
    {},
    {},
    [],
    { layout, componentMap }
)

export default store;