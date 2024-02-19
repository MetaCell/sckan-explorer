import { Box, Button, Typography } from "@mui/material";
import React, { useState, FC } from "react";
import HeatMap from "react-heatmap-grid";
import { MinusIcon, PlusIcon } from "./icons";
import CustomFilterDropdown from "./common/CustomFilterDropdown";

interface ListItem {
  label: string;
  options: (ListItem | string)[];
  expanded: boolean;
}

const xLabels: string[] = ["Brain", "Lungs", "Cervical", "Spinal", "Thoraic"];
const initialList: ListItem[] = [
  {
    label: "Brain",
    options: [
      {
        label: "Cerebrum",
        options: [
          {
            label: "Frontal Lobe",
            options: [
              "Primary Motor Cortex",
              "Prefrontal Cortex",
            ],
            expanded: false,
          },
          {
            label: "Parietal Lobe",
            options: [
              "Primary Somatosensory Cortex",
              "Angular Gyrus",
            ],
            expanded: false,
          },
          {
            label: "Temporal Lobe",
            options: [
              "Primary Auditory Cortex",
              "Hippocampus",
            ],
            expanded: false,
          },
        ],
        expanded: false,
      },
      {
        label: "Cerebellum",
        options: [
          {
            label: "Anterior Lobe",
            options: [
              "Spinocerebellum",
              "Vestibulocerebellum",
            ],
            expanded: false,
          },
          {
            label: "Posterior Lobe",
            options: [
              "Neocerebellum",
            ],
            expanded: false,
          },
        ],
        expanded: false,
      },
      {
        label: "Brainstem",
        options: [
          {
            label: "Midbrain",
            options: [
              "Tectum",
              "Tegmentum",
            ],
            expanded: false,
          },
          {
            label: "Pons",
            options: [
              "Ventral Surface",
              "Dorsal Surface",
            ],
            expanded: false,
          },
          {
            label: "Medulla Oblongata",
            options: [
              {
                label: "Pyramids",
                options: [
                  "Corticospinal Tract",
                ],
                expanded: false,
              },
              {
                label: "Olive",
                options: [
                  "Inferior Olive",
                ],
                expanded: false,
              },
            ],
            expanded: false,
          },
        ],
        expanded: false,
      },
    ],
    expanded: false,
  },
  {
    label: "Nerves",
    options: [
      {
        label: "Cranial Nerves",
        options: [
          {
            label: "Olfactory Nerve",
            options: [
              "Olfactory Bulb",
            ],
            expanded: false,
          },
          {
            label: "Optic Nerve",
            options: [
              "Optic Chiasm",
            ],
            expanded: false,
          },
          {
            label: "Oculomotor Nerve",
            options: [
              "Superior Colliculus",
              "Edinger-Westphal Nucleus",
            ],
            expanded: false,
          },
        ],
        expanded: false,
      },
      {
        label: "Spinal Nerves",
        options: [
          {
            label: "Cervical Nerves",
            options: [
              "C1",
              "C2",
            ],
            expanded: false,
          },
          {
            label: "Thoracic Nerves",
            options: [
              // New nested options under "T1"
              {
                label: "T1",
                options: ["Sublevel 1", "Sublevel 2"],
                expanded: false,
              },
              // New nested options under "T2"
              {
                label: "T2",
                options: ["Sublevel 1", "Sublevel 2"],
                expanded: false,
              },
              // Add more nested options as needed
            ],
            expanded: false,
          },
          {
            label: "Lumbar Nerves",
            options: [
              "L1",
              "L2",
            ],
            expanded: false,
          },
        ],
        expanded: false,
      },
    ],
    expanded: false,
  },
];


const initialData: number[][] = initialList.reduce((acc, item) => {
  const mainRow: number[] = new Array(xLabels.length)
    .fill(0)
    .map(() => Math.floor(Math.random() * 100));
  const optionRows: number[][] = item.options.map(() =>
    new Array(xLabels.length).fill(0).map(() => Math.floor(Math.random() * 100))
  );
  return [...acc, mainRow, ...optionRows];
}, []);

interface CollapsibleListProps {
  list: ListItem[];
  onItemClick: (item: ListItem | string) => void;
}

const CollapsibleList: FC<CollapsibleListProps> = ({ list, onItemClick }) => {
  const renderOptions = (options: (ListItem | string)[], expanded: boolean, index?: number) => (
    <Box sx={{
      paddingLeft: '0.75rem',
      position: 'relative',

      '&:before': {
        content: '""',
        height: '100%',
        width: '0.0625rem',
        background: 'rgba(241, 242, 244, 1)',
        position: 'absolute',
        left: '0.3125rem',
        top: 0
      },

      '& .MuiButton-root': {
        position: 'relative',
        '&:hover:before': {
          content: '""',
          height: '100%',
          width: '0.0625rem',
          background: 'rgba(155, 24, 216, 1)',
          position: 'absolute',
          left: '-0.4375rem',
          top: 0
        },
        '&:focus': {
          color: 'rgba(94, 0, 138, 1)',
          fontWeight: 600,
          '&:before': {
            content: '""',
            height: '100%',
            width: '0.0625rem',
            background: 'rgba(155, 24, 216, 1)',
            position: 'absolute',
            left: '-0.4375rem',
            top: 0
          },
        }
      }
    }}>
      {expanded &&
        options.map((option, optionIndex) => (
          <React.Fragment key={optionIndex}>
            {typeof option === 'string' ? (
              <Button
                variant="contained"
                disableElevation
                onClick={() => onItemClick(option)}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  borderRadius: '0.25rem',
                  marginTop: '0.25rem',
                  fontSize: '0.875rem',
                  fontWeight: '400',
                  alignItems: 'center',
                  padding: '0 0.5rem',
                  height: '2rem',
                  background: 'transparent',
                  color: 'rgba(74, 76, 79, 1)',
                  '&:hover': {
                    background: 'rgba(252, 252, 253, 1)',
                    color: 'rgba(74, 76, 79, 1)',
                  },
                  '&:focus': {
                    background: 'rgba(252, 252, 253, 1)',
                    color: 'rgba(74, 76, 79, 1)',
                  },
                }}
              >
                {option}
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  disableElevation
                  onClick={() => onItemClick(option)}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    borderRadius: '0.25rem',
                    marginTop: '0.25rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    alignItems: 'center',
                    padding: '0 0.5rem',
                    height: '2rem',
                    background: index === 0 ? 'rgba(252, 252, 253, 1)' : 'rgba(246, 247, 249, 1)',
                    color: 'rgba(74, 76, 79, 1)',
                    '&:hover': {
                      background: index === 0 ? 'rgba(246, 247, 249, 1)' : 'rgba(237, 239, 242, 1)',
                      color: 'rgba(74, 76, 79, 1)',
                    },
                    '&:focus': {
                      background: index === 0 ? 'rgba(246, 247, 249, 1)' : 'rgba(237, 239, 242, 1)',
                      color: 'rgba(74, 76, 79, 1)',
                    },
                  }}
                >
                  {option.label} {option.expanded ? <MinusIcon /> : <PlusIcon />}
                </Button>
                {renderOptions(option.options, option.expanded, optionIndex)}
              </>
            )}
          </React.Fragment>
        ))}
    </Box>
  );

  return (
    <Box sx={{ width: '15.625rem', position: 'absolute', bottom: 0 }}>
      {list.map((item, index) => (
        <Box key={index} style={{ padding: '0.125rem 0.125rem 0.125rem 0' }}>
          <Button
            variant="contained"
            disableElevation
            onClick={() => onItemClick(item)}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              borderRadius: '0.25rem',
              boxSizing: 'border-box',
              fontSize: '0.875rem',
              fontWeight: '500',
              alignItems: 'center',
              padding: '0 0.5rem',
              height: '2rem',
              background: 'rgba(237, 239, 242, 1)',
              border: '0.0625rem solid transparent',
              color: 'rgba(74, 76, 79, 1)',
              '&:hover': {
                background: 'rgba(237, 239, 242, 1)',
                color: 'rgba(74, 76, 79, 1)',
                borderColor: 'rgba(210, 215, 223, 1)'
              },
              '&:focus': {
                background: 'rgba(237, 239, 242, 1)',
                color: 'rgba(74, 76, 79, 1)',
                borderColor: 'rgba(210, 215, 223, 1)'
              },
            }}
          >
            {item.label} {item.expanded ? <MinusIcon /> : <PlusIcon />}
          </Button>
          {renderOptions(item.options, item.expanded)}
        </Box>
      ))}
    </Box>)
};

const mockEntities = [
  {
    "id": "5304",
    "group": 'Origins',
    "label": "('Aortic arch', 'arch of aorta')",
    "content": [
      {
        "title": "Name",
        "value": "('Aortic arch', 'arch of aorta')"
      },
      {
        "title": "Ontology URI",
        "value": "http://purl.obolibrary.org/obo/UBERON_0001508"
      }
    ]
  },
  {
    "id": "32845",
    "group": 'Origins',
    "label": "(embryonic) hindbrain flexure",
    "content": [
      {
        "title": "Name",
        "value": "(embryonic) hindbrain flexure"
      },
      {
        "title": "Ontology URI",
        "value": "http://purl.obolibrary.org/obo/UBERON_0005820"
      }
    ]
  },
  {
    "id": "47428",
    "group": 'Origins',
    "label": "(mid-third) lateral capsular ligament",
    "content": [
      {
        "title": "Name",
        "value": "(mid-third) lateral capsular ligament"
      },
      {
        "title": "Ontology URI",
        "value": "http://purl.obolibrary.org/obo/UBERON_0014899"
      }
    ]
  },
  {
    "id": "12822",
    "group": 'Origins',
    "label": "(pre-)piriform cortex",
    "content": [
      {
        "title": "Name",
        "value": "(pre-)piriform cortex"
      },
      {
        "title": "Ontology URI",
        "value": "http://purl.obolibrary.org/obo/UBERON_0002590"
      }
    ]
  },
  {
    "id": "1798",
    "group": 'Origins',
    "label": "02 optic nerve",
    "content": [
      {
        "title": "Name",
        "value": "02 optic nerve"
      },
      {
        "title": "Ontology URI",
        "value": "http://purl.obolibrary.org/obo/UBERON_0000941"
      }
    ]
  },
  {
    "id": "53259",
    "group": 'Origins',
    "label": "10 R+L thoracic",
    "content": [
      {
        "title": "Name",
        "value": "10 R+L thoracic"
      },
      {
        "title": "Ontology URI",
        "value": "http://purl.obolibrary.org/obo/UBERON_0039167"
      }
    ]
  },
  {
    "id": "6604",
    "group": 'Origins',
    "label": "10n",
    "content": [
      {
        "title": "Name",
        "value": "10n"
      },
      {
        "title": "Ontology URI",
        "value": "http://purl.obolibrary.org/obo/UBERON_0001759"
      }
    ]
  },
  {
    "id": "52948",
    "group": 'Origins',
    "label": "11 R+L thoracic",
    "content": [
      {
        "title": "Name",
        "value": "11 R+L thoracic"
      },
      {
        "title": "Ontology URI",
        "value": "http://purl.obolibrary.org/obo/UBERON_0038635"
      }
    ]
  },
  {
    "id": "52950",
    "group": 'Origins',
    "label": "11 thoracic lymph node",
    "content": [
      {
        "title": "Name",
        "value": "11 thoracic lymph node"
      },
      {
        "title": "Ontology URI",
        "value": "http://purl.obolibrary.org/obo/UBERON_0038635"
      }
    ]
  },
  {
    "id": "52956",
    "group": 'Origins',
    "label": "12R+L thoracic lymph node",
    "content": [
      {
        "title": "Name",
        "value": "12R+L thoracic lymph node"
      },
      {
        "title": "Ontology URI",
        "value": "http://purl.obolibrary.org/obo/UBERON_0038638"
      }
    ]
  },
  {
    "id": "6050",
    "group": 'Origins',
    "label": "12n",
    "content": [
      {
        "title": "Name",
        "value": "12n"
      },
      {
        "title": "Ontology URI",
        "value": "http://purl.obolibrary.org/obo/UBERON_0001650"
      }
    ]
  }
];
const getEntities = (searchValue: string) => mockEntities;
const updateOriginsInStatment = (options: any, id: string) => {
  return false;
}

function ConnectivityGrid() {
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const [list, setList] = useState<ListItem[]>(initialList);
  const [data, setData] = useState<number[][]>(initialData);

  const handleItemClick = (item: ListItem | string) => {
    if (typeof item === "string") {
      // Clicked on an option without children
      alert(`Clicked on ${item}`);
    } else if (item.options) {
      const updateList = (list: ListItem[], selectedItem: ListItem) => {
        return list.map((listItem) => {
          if (listItem.label === selectedItem.label) {
            return { ...listItem, expanded: !listItem.expanded };
          } else if (listItem.options) {
            return {
              ...listItem,
              options: updateList(listItem.options as ListItem[], selectedItem),
            };
          }
          return listItem;
        });
      };

      const updatedList = updateList(list, item);

      if (collapsed) {
        // Expand
        setList(updatedList);
        setData((prevData) => {
          const mainRow: number[] = new Array(xLabels.length)
            .fill(0)
            .map(() => Math.floor(Math.random() * 100));
          const optionRows: number[][] = updatedList.flatMap((item) =>
            item.expanded ? item.options.map(() =>
              new Array(xLabels.length)
                .fill(0)
                .map(() => Math.floor(Math.random() * 100))
            ) : []
          );
          return [...prevData, mainRow, ...optionRows];
        });
      } else {
        // Collapse
        setList(updatedList.filter((item) => !item.expanded));
        setData((prevData) =>
          prevData.filter(
            (_, index) =>
              !updatedList.some(
                (item) => item.expanded && index === updatedList.indexOf(item)
              )
          )
        );
      }
    }
  };

  const generateYLabels = (list: (ListItem | string)[], prefix = ''): string[] => {
    let labels: string[] = [];
    list.forEach(item => {
      const label = typeof item === 'string' ? item : item.label;
      const fullLabel = prefix ? `${prefix} - ${label}` : label;
      labels.push('');
      if (typeof item !== 'string' && item.expanded && item.options) {
        labels = labels.concat(generateYLabels(item.options, fullLabel));
      }
    });
    return labels;
  };

  return (
    <Box p={1.5} py={2} fontSize={14}>
      <Box pb={2.5}>
        <Typography variant="h6">Connection Origin to End Organ</Typography>
      </Box>
      <Box display="flex">
        <Box pb={4} mr={1}>
          <CustomFilterDropdown
            placeholder="Origin"
            options={{
              value: mockEntities[0] ?? "",
              id: "origins",
              placeholder: "Origin1",
              searchPlaceholder: "Search origin",
              fieldName: "origins",
              onSearch: (searchValue: string) => getEntities(searchValue),
            }}
          />
        </Box>
        <Box pb={4} mr={1}>
          <CustomFilterDropdown
            placeholder="End organ"
            options={{
              value: mockEntities[0] ?? "",
              id: "origins",
              placeholder: "Origin1",
              searchPlaceholder: "End organ",
              fieldName: "origins",
              onSearch: (searchValue: string) => getEntities(searchValue),
            }}
          />
        </Box>
        <Box pb={4} mr={1}>
          <CustomFilterDropdown
            placeholder="Species"
            options={{
              value: mockEntities[0] ?? "",
              id: "origins",
              placeholder: "Origin1",
              searchPlaceholder: "Species",
              fieldName: "origins",
              onSearch: (searchValue: string) => getEntities(searchValue),
            }}
          />
        </Box>
        <Box pb={4} mr={1}>
          <CustomFilterDropdown
            placeholder="Phenotype"
            options={{
              value: mockEntities[0] ?? "",
              id: "origins",
              placeholder: "Origin1",
              searchPlaceholder: "Phenotype",
              fieldName: "origins",
              onSearch: (searchValue: string) => getEntities(searchValue),
            }}
          />
        </Box>
        <Box pb={4} mr={1}>
          <CustomFilterDropdown
            placeholder="ApiNATOMY"
            options={{
              value: mockEntities[0] ?? "",
              id: "origins",
              placeholder: "Origin1",
              searchPlaceholder: "ApiNATOMY",
              fieldName: "origins",
              onSearch: (searchValue: string) => getEntities(searchValue),
            }}
          />
        </Box>
        <Box pb={4} mr={1}>
          <CustomFilterDropdown
            placeholder="Via"
            options={{
              value: mockEntities[0] ?? "",
              id: "origins",
              placeholder: "Origin1",
              searchPlaceholder: "Via",
              fieldName: "origins",
              onSearch: (searchValue: string) => getEntities(searchValue),
            }}
          />
        </Box>
      </Box>
      <Box position='relative' sx={{
        '& > div:first-of-type': {
          '& > div:first-of-type': {
            '& > div': {
              writingMode: 'sideways-lr',
              lineHeight: 1,
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginLeft: '0.1563rem',
              padding: '0.875rem 0',
              position: 'relative',
              borderRadius: '0.25rem',

              '&:hover': {
                background: 'rgba(246, 247, 249, 1)',
                '&:before': {
                  content: '""',
                  width: '100%',
                  height: '0.0625rem',
                  background: 'rgba(155, 24, 216, 1)',
                  position: 'absolute',
                  top: '-0.25rem',
                  left: 0
                },
              },

              '&:first-of-type': {
                marginLeft: 0,
                '&:hover': {
                  background: 'none',
                  '&:before': {
                    display: 'none'
                  }
                }
              }
            }
          }
        }
      }}>
        <HeatMap
          xLabels={xLabels}
          yLabels={generateYLabels(list)}
          xLabelsLocation={"top"}
          xLabelsVisibility={xLabels.map(() => true)}
          xLabelWidth={160}
          yLabelWidth={250}
          data={data}
          squares
          height={43}
          onClick={(x: any, y: any) => alert(`Clicked ${x}, ${y}`)}


          cellStyle={(_background: any, value: number, min: number, max: number, _data: any, _x: any, _y: any) => {
            console.log(`rgba(131, 0, 191, ${1 - (max - value) / (max - min)})`)
            return {
              background: `rgba(131, 0, 191, ${1 - (max - value) / (max - min)})`,
              fontSize: "0.7188rem",
              color: "#444",
              widht: '2.6875rem',
              height: '2rem',
              borderRadius: '0.25rem',
              border: '0.0625rem solid',
              borderColor: 1 - (max - value) / (max - min) <= 0.1 ? 'rgba(241, 242, 244, 1)' : 'rgba(255, 255, 255, 0.2)',
              margin: '0.125rem'
            }
          }}
          cellRender={(_value: any) => <></>}
        />

        {collapsed ? (
          <CollapsibleList list={list} onItemClick={handleItemClick} />
        ) : null}
      </Box>
    </Box>
  )
}

export default ConnectivityGrid
