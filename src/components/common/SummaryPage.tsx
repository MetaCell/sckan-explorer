import React from "react";
import {Box, Stack, Tab, Tabs, Typography} from "@mui/material";
import {vars} from "../../theme/variables.ts";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import CommonChip from "./CommonChip.tsx";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
const { primaryPurple600, gray500} = vars

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}
const SummaryPage = () => {
  const [value, setValue] = React.useState(0);
  
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <Box width={1} className='database-summary'>
      <Stack justifyContent='center' alignItems='center' pt='6.5rem' pb='6.5rem' width={1} spacing={'.5rem'}>
        <Typography
          sx={{
            color: primaryPurple600,
            fontSize: '1.875rem',
            fontWeight: 600,
          }}
        >Database summary</Typography>
        <Typography variant='body1' color={gray500}>Last updated on September 15, 2023</Typography>
      </Stack>
      <Box sx={{
        backgroundColor: '#fff'
      }}>
        <Tabs value={value} onChange={handleChange} sx={{ borderBottom: 1, borderColor: 'divider', width: 1 }}>
          <Tab label="Summary" />
          <Tab label="Info" />
        </Tabs>
        <TabPanel value={value} index={0}>
          <Stack spacing={1}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent='space-between'
              textAlign='left'
            >
              <Typography variant='subtitle1' width='6rem'>Status</Typography>
              <Typography variant='subtitle1' fontWeight={400} display='flex' alignItems='center' gap='.5rem'  width='6rem'>
                Inferred
              </Typography>
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent='space-between'
              textAlign='left'
            >
              <Typography variant='subtitle1' width='6rem'>Species</Typography>
              <Typography variant='subtitle1' fontWeight={400}  width='6rem'>Mammal</Typography>
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent='space-between'
              textAlign='left'
            >
              <Typography variant='subtitle1' width='6rem'>Label</Typography>
              <Typography variant='subtitle1' fontWeight={400} width='6rem'>Neuron type aacar 13</Typography>
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent='space-between'
            >
              <Typography variant='subtitle1' width='6rem' >Provenances</Typography>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent='space-between'
                width='6rem'
              >
                <CommonChip label="www.microsoft.com" variant="outlined" className='link' icon={<ArrowOutwardRoundedIcon fontSize='small' />} />
                <CommonChip label="google.com" variant="outlined" className='link' icon={<ArrowOutwardRoundedIcon fontSize='small' />} />
              </Stack>
            </Stack>
          </Stack>
        </TabPanel>
        <TabPanel value={value} index={1}>
          Info
        </TabPanel>
      </Box>
    </Box>
  );
};

export default SummaryPage;
