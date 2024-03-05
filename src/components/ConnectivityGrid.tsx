import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import CustomFilterDropdown from "./common/CustomFilterDropdown";
import { vars } from "../theme/variables";
import { Option } from "./common/Types";
import { mockEntities } from "./common/MockEntities";
import HeatmapGrid from "./common/Heatmap";

interface ListItem {
  label: string;
  options: (ListItem | string)[];
  expanded: boolean;
}

const { gray500, baseWhite, gray25, gray100, primary600, gray400 } = vars;

const xLabels: string[] = ["Brain", "Lungs", "Cervical", "Spinal", "Thoraic", "Kidney", "Urinary Tract", "Muscle organ", "Small Intestine", "Pancreas", "Skin", "Spleen", "Stomach", "Urinary bladder"];
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

const initialData: number[][] = initialList.reduce((acc: number[][], item: ListItem) => {
  const mainRow: number[] = new Array(xLabels.length)
    .fill(0)
    .map(() => Math.floor(Math.random() * 100));
  const optionRows: number[][] = item.options.map(() =>
   /* remove the logic , it is just to show empty values as well */
    new Array(xLabels.length).fill(0).map((v:number, i:number) => i%3 === 0 ? Math.floor(Math.random() * 100) : 0)
  );
  return [...acc, mainRow, ...optionRows];
}, []);


const getEntities = (searchValue: string /* unused */): Option[] => {

  console.log(`Received search value: ${searchValue}`);

  // Return mockEntities or perform other logic
  return mockEntities;
};

function ConnectivityGrid() {
  const [list, setList] = useState<ListItem[]>(initialList);
  const [data, setData] = useState<number[][]>(initialData);

  const [selectedCell, setSelectedCell] = useState<{ x: number, y: number } | null>(null);

  const handleClick = (x: number, y: number): void => {
    setSelectedCell({ x, y });
  };
  return (
    <Box minHeight='100%' p={3} pb={0} fontSize={14} display='flex' flexDirection='column' alignItems='flex-start'>
      <Box pb={2.5}>
        <Typography variant="h6" sx={{fontWeight: 400}}>Connection Origin to End Organ</Typography>
      </Box>

      <Box display="flex" gap={1} flexWrap='wrap'>
        <CustomFilterDropdown
          key={"Origin"}
          placeholder="Origin"
          options={{
            value: "",
            id: "origin",
            searchPlaceholder: "Search origin",
            onSearch: (searchValue: string): Option[] => getEntities(searchValue),
          }}
        />
        <CustomFilterDropdown
          key={"End Origin"}
          placeholder="End organ"
          options={{
            value: "",
            id: "endorgan",
            searchPlaceholder: "Search End organ",
            onSearch: (searchValue: string) => getEntities(searchValue),
          }}
        />
        <CustomFilterDropdown
          key={"Species"}
          placeholder="Species"
          options={{
            value: "",
            id: "species",
            searchPlaceholder: "Search Species",
            onSearch: (searchValue: string) => getEntities(searchValue),
          }}
        />
        <CustomFilterDropdown
          key={"Phenotype"}
          placeholder="Phenotype"
          options={{
            value: "",
            id: "phenotype",
            searchPlaceholder: "Search Phenotype",
            onSearch: (searchValue: string) => getEntities(searchValue),
          }}
        />
        <CustomFilterDropdown
          key={"ApiNATOMY"}
          placeholder="ApiNATOMY"
          options={{
            value: "",
            id: "ApiNATOMY",
            searchPlaceholder: "Search ApiNATOMY",
            onSearch: (searchValue: string) => getEntities(searchValue),
          }}
        />
        <CustomFilterDropdown
          key={"Via"}
          placeholder="Via"
          options={{
            value: "",
            id: "via",
            searchPlaceholder: "Search Via",
            onSearch: (searchValue: string) => getEntities(searchValue),
          }}
        />
      </Box>

      <HeatmapGrid list={list} data={data} xLabels={xLabels} setList={setList} setData={setData} xAxis={'End organ'} yAxis={'Connection Origin'} cellClick={handleClick} selectedCell={selectedCell} />

      <Box
        py={1.5}
        borderTop={`0.0625rem solid ${gray100}`}
        width={1}
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        position='sticky'
        bottom={0}
        sx={{ background: baseWhite }}
      >
        <Button variant="text" sx={{
          fontSize: '0.875rem',
          fontWeight: 600,
          lineHeight: '1.25rem',
          color: primary600,
          padding: 0,

          '&:hover': {
            background: 'transparent'
          }
        }}>Reset grid</Button>

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          height: '1.875rem',
          padding: '0 0.75rem',
          borderRadius: '0.25rem',
          background: gray25,
          border: `0.0625rem solid ${gray100}`,
          gap: '0.75rem'

        }}>
          <Typography sx={{
            fontSize: '0.75rem',
            fontWeight: 500,
            lineHeight: '1.125rem',
            color: gray500
          }}>Connections</Typography>

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <Typography sx={{
              fontSize: '0.75rem',
              fontWeight: 400,
              lineHeight: '1.125rem',
              color: gray400
            }}>1</Typography>

            <Box sx={{
              display: 'flex',
              alignItems: 'center',
            }}>
              {[1,2,3,4,5,6].reverse().map((el: number) => <Box sx={{
                width: '1.5rem',
                height: '1rem',
                background: `rgba(131, 0, 191, ${1 - (el/6.5)})`,
              }} />)}
            </Box>

            <Typography sx={{
              fontSize: '0.75rem',
              fontWeight: 400,
              lineHeight: '1.125rem',
              color: gray400
            }}>100+</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default ConnectivityGrid
