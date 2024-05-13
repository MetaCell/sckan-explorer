import { Box, Chip, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { ArrowRightIcon } from "./icons";
import { vars } from "../theme/variables";
import SummaryHeader from "./connections/SummaryHeader";
import CustomFilterDropdown from "./common/CustomFilterDropdown";
import { Option } from "./common/Types";
import { mockEntities } from "./common/MockEntities";
// import HeatmapGrid from "./common/Heatmap";
import Details from "./connections/Details.tsx";

const { gray700, gray600A, gray100 } = vars;

const styles = {
    heading: {
        fontSize: '0.875rem',
        fontWeight: '500',
        lineHeight: '1.25rem',
        color: gray700,
        marginBottom: '0.5rem'
    },
    text: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: '1.25rem',
        color: gray600A
    }
}

type PhenotypeDetail = {
    label: string;
    color: string;
};
const phenotype: PhenotypeDetail[] = [
    {
        label: 'Sympathetic',
        color: '#9B18D8'
    },
    {
        label: 'Parasympathetic',
        color: '#2C2CCE'
    },
    {
        label: 'Sensory',
        color: '#DC6803'
    },
    {
        label: 'Motor',
        color: '#EAAA08'
    }
]

// const xLabels: string[] = ["Brain", "Lungs", "Cervical", "Spinal", "Thoraic", "Kidney", "Urinary Tract"];
// const initialList: ListItem[] = [
//   {
//     label: "Brain",
//     options: [
//       {
//         label: "Cerebrum",
//         options: [
//           {
//             label: "Frontal Lobe",
//             options: [
//               "Primary Motor Cortex",
//               "Prefrontal Cortex",
//             ],
//             expanded: false,
//           },
//           {
//             label: "Parietal Lobe",
//             options: [
//               "Primary Somatosensory Cortex",
//               "Angular Gyrus",
//             ],
//             expanded: false,
//           },
//           {
//             label: "Temporal Lobe",
//             options: [
//               "Primary Auditory Cortex",
//               "Hippocampus",
//             ],
//             expanded: false,
//           },
//         ],
//         expanded: false,
//       },
//       {
//         label: "Cerebellum",
//         options: [
//           {
//             label: "Anterior Lobe",
//             options: [
//               "Spinocerebellum",
//               "Vestibulocerebellum",
//             ],
//             expanded: false,
//           },
//           {
//             label: "Posterior Lobe",
//             options: [
//               "Neocerebellum",
//             ],
//             expanded: false,
//           },
//         ],
//         expanded: false,
//       },
//       {
//         label: "Brainstem",
//         options: [
//           {
//             label: "Midbrain",
//             options: [
//               "Tectum",
//               "Tegmentum",
//             ],
//             expanded: false,
//           },
//           {
//             label: "Pons",
//             options: [
//               "Ventral Surface",
//               "Dorsal Surface",
//             ],
//             expanded: false,
//           },
//           {
//             label: "Medulla Oblongata",
//             options: [
//               {
//                 label: "Pyramids",
//                 options: [
//                   "Corticospinal Tract",
//                 ],
//                 expanded: false,
//               },
//               {
//                 label: "Olive",
//                 options: [
//                   "Inferior Olive",
//                 ],
//                 expanded: false,
//               },
//             ],
//             expanded: false,
//           },
//         ],
//         expanded: false,
//       },
//     ],
//     expanded: false,
//   },
//   {
//     label: "Nerves",
//     options: [
//       {
//         label: "Cranial Nerves",
//         options: [
//           {
//             label: "Olfactory Nerve",
//             options: [
//               "Olfactory Bulb",
//             ],
//             expanded: false,
//           },
//           {
//             label: "Optic Nerve",
//             options: [
//               "Optic Chiasm",
//             ],
//             expanded: false,
//           },
//           {
//             label: "Oculomotor Nerve",
//             options: [
//               "Superior Colliculus",
//               "Edinger-Westphal Nucleus",
//             ],
//             expanded: false,
//           },
//         ],
//         expanded: false,
//       },
//       {
//         label: "Spinal Nerves",
//         options: [
//           {
//             label: "Cervical Nerves",
//             options: [
//               "C1",
//               "C2",
//             ],
//             expanded: false,
//           },
//           {
//             label: "Thoracic Nerves",
//             options: [
//               // New nested options under "T1"
//               {
//                 label: "T1",
//                 options: ["Sublevel 1", "Sublevel 2"],
//                 expanded: false,
//               },
//               // New nested options under "T2"
//               {
//                 label: "T2",
//                 options: ["Sublevel 1", "Sublevel 2"],
//                 expanded: false,
//               },
//               // Add more nested options as needed
//             ],
//             expanded: false,
//           },
//           {
//             label: "Lumbar Nerves",
//             options: [
//               "L1",
//               "L2",
//             ],
//             expanded: false,
//           },
//         ],
//         expanded: false,
//       },
//     ],
//     expanded: false,
//   },
// ];

const getEntities = (searchValue: string /* unused */): Option[] => {

    console.log(`Received search value: ${searchValue}`);

    // Return mockEntities or perform other logic
    return mockEntities;
};

//
// const initialData: number[][] = initialList.reduce((acc: number[][], item: ListItem) => {
// const mainRow: number[] = new Array(xLabels.length)
//     .fill(0)
//     .map(() => Math.floor(Math.random() * 100));
// const optionRows: number[][] = item.options.map(() =>
//     /* remove the logic , it is just to show empty values as well */
//     new Array(xLabels.length).fill(0).map((_, i:number) => i%3 === 0 ? Math.floor(Math.random() * 100) : 0)
// );
// return [...acc, mainRow, ...optionRows];
// }, []);



function Connections() {
    // const [list, setList] = useState<ListItem[]>(initialList);
    // const [data, setData] = useState<number[][]>(initialData);
    const [showConnectionDetails, setShowConnectionDetails] = useState<boolean>(true);
    
    return (
        <Box display='flex' flexDirection='column' minHeight={1}>
          <SummaryHeader
            showDetails={showConnectionDetails}
            setShowDetails={setShowConnectionDetails}
            numOfConnections={5}
            connection='ilxtr:neuron-type-aacar-11'
          />
          
          {showConnectionDetails ?
            <>
              <Details />
            </>
            :
            <>
              <Box p={3} display='flex' flexDirection='column' gap={3}>
                <Box display='flex' alignItems='flex-end' gap={1.5}>
                  <Box flex={1}>
                    <Typography sx={{...styles.heading, marginBottom: '0.75rem'}}>Connection origin</Typography>
                    <TextField value='Thoracic' fullWidth />
                  </Box>
                  <ArrowRightIcon />
                  <Box flex={1}>
                    <Typography sx={{...styles.heading, marginBottom: '0.75rem'}}>End Organ</Typography>
                    <TextField value='Heart' fullWidth />
                  </Box>
                </Box>
                
                <Box>
                  <Typography sx={styles.heading}>Amount of connections</Typography>
                  <Chip label="23 connections" variant="outlined" color="primary" />
                </Box>
                
                <Box>
                  <Typography sx={styles.heading}>Connections are through these nerves</Typography>
                  <Typography sx={styles.text}>Pudendal, vagus and splanchnic</Typography>
                </Box>
            </Box>

            <Box display='flex' flexDirection='column' flex={1} p={3} sx={{
                borderTop: `0.0625rem solid ${gray100}`,
              }}>
                <Box mb={3}>
                  <Typography sx={{...styles.heading, fontSize: '1rem', lineHeight: '1.5rem'}}>Summary map</Typography>
                  <Typography sx={styles.text}>
                    Summary map shows the connections of the selected connection origin and end organ with phenotypes. Select individual squares to view the details of each connections.
                  </Typography>
                </Box>
                <Box display="flex" gap={1} flexWrap='wrap'>
                    <CustomFilterDropdown
                        key={"Phenotype"}
                        id={"Phenotype"}
                        placeholder="Phenotype"
                        searchPlaceholder="Search Phenotype"
                        selectedOptions={[]}
                        onSearch={(searchValue: string) => getEntities(searchValue)}
                        onSelect={() => {}}
                    />
                    <CustomFilterDropdown
                        key={"Nerve"}
                        id={"Nerve"}
                        placeholder="Nerve"
                        searchPlaceholder="Search Nerve"
                        selectedOptions={[]}
                        onSearch={(searchValue: string) => getEntities(searchValue)}
                        onSelect={() => {}}
                    />
                </Box>
                {/*<HeatmapGrid secondary yAxisLabels={list} data={data} xAxisLabel={xLabels} setYAxis={setList} setXAxis={setData} xAxisLabel={'Project to'} yAxisLabel={'Somas in'} />*/}
              </Box>
              
              <Box sx={{
                position: 'sticky',
                bottom: 0,
                padding: '0 1.5rem',
                background: '#fff'
              }}>
                <Box sx={{
                  borderTop: `0.0625rem solid ${gray100}`,
                  padding: '0.9375rem 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Typography sx={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    lineHeight: '1.125rem',
                    color: '#818898'
                  }}>Phenotype</Typography>
                  
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem'
                  }}>
                    {phenotype.map((type: PhenotypeDetail) => (
                      <Box sx={{
                        p: '0.1875rem 0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem'
                      }}>
                        <Box sx={{
                          width: '1.4794rem',
                          height: '1rem',
                          borderRadius: '0.125rem',
                          background: type.color
                        }} />
                        <Typography sx={{
                          fontSize: '0.75rem',
                          fontWeight: 400,
                          lineHeight: '1.125rem',
                          color: '#4A4C4F'
                        }}>{type.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </>
          }
         
          
        </Box>
    )
}

export default Connections
