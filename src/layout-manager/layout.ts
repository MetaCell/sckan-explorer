export default {
  global: {
    sideBorders: 8,
    tabSetHeaderHeight: 26,
    tabSetTabStripHeight: 26,
    enableEdgeDock: false,
    borderBarSize: 0,
    tabEnableDrag: false,
  },
  layout: {
    type: 'row',
    id: 'root',
    children: [
      {
        type: 'row',
        weight: 55,
        children: [
          {
            type: 'tabset',
            id: 'leftPanel',
            weight: 100,
            enableDeleteWhenEmpty: false,
            children: [],
          },
        ],
      },
      {
        type: 'row',
        weight: 45,
        children: [
          {
            type: 'tabset',
            weight: 100,
            id: 'rightPanel',
            enableDeleteWhenEmpty: false,
            children: [],
          },
        ],
      },
    ],
  },
};
