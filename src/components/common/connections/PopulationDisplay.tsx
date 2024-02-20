import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Tabs, Tab
} from "@mui/material";
import { vars } from "../../../theme/variables.ts";
import ConnectionsTableView from "./ConnectionsTableView.tsx";

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
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
const PopulationDisplay = () => {
  const [value, setValue] = React.useState(0);
  
  
  // @ts-expect-error Explanation: Handling Event properly
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  
  return (
    <Stack spacing='1.3rem'>
      <Stack direction='row' alignItems='center' justifyContent='space-between' mt='.75rem'>
        <Typography variant='h5' fontWeight={500} color={gray700}>
          Population Display
        </Typography>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Graph view" {...a11yProps(0)} />
          <Tab label="List view" {...a11yProps(1)} />
        </Tabs>
      </Stack>
      <CustomTabPanel value={value} index={0}>
        Graph view
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <ConnectionsTableView />
      </CustomTabPanel>
    </Stack>
  );
};

export default PopulationDisplay;
