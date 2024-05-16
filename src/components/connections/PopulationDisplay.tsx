import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Tabs, Tab
} from "@mui/material";
import { vars } from "../../theme/variables.ts";
import ConnectionsTableView, { Row } from "./ConnectionsTableView.tsx";
import GraphDiagram from "../graphDiagram/GraphDiagram.tsx";
import { DestinationExplorerSerializerDetails, KnowledgeStatement, ViaExplorerSerializerDetails } from '../../models/explorer.ts';

const { gray700} = vars

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </Box>
  );
}
const PopulationDisplay = ({
  connectionDetails
}: {
  connectionDetails: KnowledgeStatement
}) => {
  const [value, setValue] = React.useState(0);
  
  const viaDetails: ViaExplorerSerializerDetails[] = connectionDetails?.via || [];
  const destinationDetails: DestinationExplorerSerializerDetails[] = connectionDetails?.destinations || [];
  const origins = connectionDetails?.origins || [];

  const getTabularData = (connectionDetails: KnowledgeStatement): Row[] => {
    const rowData: Row[] = [];
    const origins = connectionDetails?.origins || [];
    const destinations = destinationDetails.flatMap(dest => dest.anatomical_entities);
    const vias = viaDetails.flatMap(via => via.anatomical_entities);
    origins.forEach((origin) => {
      destinations.forEach((destination) => {
        vias.forEach((via) => {
          rowData.push({
            Origin: origin.name,
            Destination: destination.name,
            Via: via.name
          });
        })
      })
    })
    return rowData;
  }

  const tableData = getTabularData(connectionDetails);

  // @ts-expect-error Explanation: Handling Event properly
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  
  return (
    <Stack spacing='.75rem' pl='1.5rem' pr='1.5rem' pt={0}>
      <Stack direction='row' alignItems='center' justifyContent='space-between' mt='.75rem'>
        <Typography variant='h5' fontWeight={500} color={gray700}>
          Population Display
        </Typography>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" className='custom-tabs'>
          <Tab label="Graph view" {...a11yProps(0)} />
          <Tab label="List view" {...a11yProps(1)} />
        </Tabs>
      </Stack>
      <CustomTabPanel value={value} index={0}>
        <Box sx={{height: '50rem', width: '100%', background: '#EDEFF2'}}>
          <GraphDiagram origins={origins} vias={viaDetails}
            destinations={destinationDetails} />
        </Box>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <ConnectionsTableView tableData={tableData} />
      </CustomTabPanel>
    </Stack>
  );
};

export default PopulationDisplay;
