import { WidgetStatus } from '@metacell/geppetto-meta-client/common/layout/model';

export const widgetIds = {
  connectivityGrid: 'connectivityGrid',
  connections: 'connections',
};

export const connectivityGridWidget = () => ({
  id: widgetIds.connectivityGrid,
  name: 'Connectivity Grid',
  component: widgetIds.connectivityGrid,
  panelName: 'leftPanel',
  enableClose: false,
  status: WidgetStatus.ACTIVE,
});
export const connectionsWidget = () => ({
  id: widgetIds.connections,
  name: 'Connections',
  component: widgetIds.connections,
  panelName: 'rightPanel',
  enableClose: false,
  status: WidgetStatus.ACTIVE,
});
