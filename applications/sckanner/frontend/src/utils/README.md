# URL State Management

This implementation provides URL state management for the SCKAN Explorer application, allowing users to share URLs that preserve the exact state of their view.

## Features

The URL state management system preserves the following state:

1. **Datasnapshot**: The currently selected datasnapshot
2. **Filters**: All filter settings from the left side widget
3. **Selected Cluster**: The cluster selected in the main heatmap
4. **Right Widget State**: Complete state of the right widget including:
   - Type (summary/connection/null)
   - Cluster ID
   - Connection ID
   - Population ID
   - Right widget filters (nerve, phenotype, etc.)

## Usage in Components

### Accessing Context

```typescript
import { useDataContext } from '../context/DataContext';

const MyComponent = () => {
  const { 
    selectedCluster, 
    setSelectedCluster, 
    rightWidgetState, 
    setRightWidgetState,
    filters,
    setFilters,
    updateUrlState
  } = useDataContext();
};
```

### Setting States

```typescript
// Select a cluster
setSelectedCluster('cluster-id');

// Show a summary in right widget
setRightWidgetState({
  type: 'summary',
  clusterId: 'cluster-id',
  filters: {
    ...filters,
    Nerve: [{ value: 'some-nerve', label: 'Some Nerve' }]
  }
});

// Show a specific connection
setRightWidgetState({
  type: 'connection',
  clusterId: 'cluster-id',
  connectionId: 'connection-id',
  populationId: 'population-id'
});

// Clear right widget
setRightWidgetState({ type: null });
```

### Manual URL Updates

In rare cases where you need to manually trigger URL updates:

```typescript
updateUrlState();
```

## URL Parameters

The URL parameters are encoded for efficiency:

- `ds`: Datasnapshot ID
- `f`: Base64 encoded filters object
- `c`: Selected cluster ID
- `rw`: Base64 encoded right widget state

Example URL:
```
https://yourapp.com/?ds=12345&f=eyJPcmlnaW4iOlt7InZhbHVlIjoidGVzdCIsImxhYmVsIjoidGVzdCJ9XX0%3D&c=cluster-123&rw=eyJ0eXBlIjoic3VtbWFyeSIsImNsdXN0ZXJJZCI6ImNsdXN0ZXItMTIzIn0%3D
```

## Implementation Details

### URL State Interface

```typescript
interface URLState {
  datasnapshot?: string;
  filters?: Filters;
  selectedCluster?: string;
  rightWidget?: RightWidgetState;
}

interface RightWidgetState {
  type: 'summary' | 'connection' | null;
  clusterId?: string;
  connectionId?: string;
  populationId?: string;
  filters?: SummaryFilters;
}
```

### Automatic URL Updates

The system automatically updates the URL whenever:
- Filters are changed
- A cluster is selected/deselected
- Right widget state changes
- Datasnapshot is changed

### URL Restoration

When the application loads, it:
1. Parses URL parameters
2. Initializes all state from URL values
3. Falls back to defaults if URL parameters are missing or invalid

## Error Handling

The system includes error handling for:
- Invalid base64 encoded parameters
- Malformed JSON in URL parameters
- Missing or corrupted state data

Errors are logged to the console and the application continues with default values.
