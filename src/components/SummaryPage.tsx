import React, {useState, useEffect} from "react";
import {Box, CircularProgress, Divider, Stack, Tab, Tabs, Typography} from "@mui/material";
import { vars } from "../theme/variables.ts";
import {Detail} from "./summaryPage/Detail.tsx";
import {Section} from "./summaryPage/Section.tsx";
import {Notes} from "./summaryPage/Notes.tsx";
import {TabPanel} from "./summaryPage/TabPanel.tsx";
import InfoTab from "./summaryPage/InfoTab.tsx";

const { primarypurple600, gray500, baseWhite } = vars;

const databaseSummaryURL = "https://raw.githubusercontent.com/MetaCell/sckan-explorer/feature/ESCKAN-28/src/data/database_summary_data.json";
const databaseSummaryLabelsURL = "https://raw.githubusercontent.com/MetaCell/sckan-explorer/feature/ESCKAN-28/src/data/database_summary_labels.json";

const SummaryPage = () => {
  const [data, setData] = useState(null);
  const [labels, setLabels] = useState(null);
  const [value, setValue] = useState(0);

  // @ts-expect-error Explanation: Handling Event properly
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  useEffect(() => {
    fetch(databaseSummaryURL)
      .then((response) => response.json())
      .then((jsonData) => {
        setData(jsonData);
      })
      .catch((error) => console.error("Error fetching data:", error));
    
    fetch(databaseSummaryLabelsURL)
      .then((response) => response.json())
      .then((jsonData) => {
        setLabels(jsonData);
      })
      .catch((error) => console.error("Error fetching labels:", error));
  }, []);

  if (!data || !labels) return <Box display='flex' justifyContent='center' alignItems='center' width={1}>
    <CircularProgress />
  </Box>
  
  return (
    <Box width={1} className='database-summary'>
      <Stack justifyContent='center' alignItems='center' pt='6.5rem' pb='6.5rem' width={1}>
        <Typography
          sx={{
            color: primarypurple600,
            fontSize: '1.875rem',
            fontWeight: 600,
            lineHeight: '2.375rem'
          }}
        >Database summary</Typography>
        <Typography variant='body1' color={gray500}>Last updated on September 15, 2023</Typography>
      </Stack>
      <Box sx={{
        backgroundColor: baseWhite,
        '& .tabpanel': {
          display: 'flex',
          justifyContent: 'center'
        }
      }}>
        <Box sx={{
          backgroundColor: baseWhite,
          position: 'sticky',
          top: '0',
          zIndex: 1,
        }}>
          <Tabs value={value} onChange={handleChange} sx={{ borderBottom: 1, borderColor: 'divider', width: 1 }}>
            <Tab label="Summary" />
            <Tab label="Info" />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          {Object.keys(data).map((sectionName) => (
            <Section key={sectionName} title={labels[sectionName]}>
              {Object.entries(data[sectionName]).map(([key, value]) => {
                if (key.endsWith("changes") || key === 'notes') {
                  return null;
                }
                
                return (
                  <Detail keyName={key} sectionData={data[sectionName]} value={value} labels={labels} />
                );
              })}
              {data[sectionName].notes && <Notes text={data[sectionName].notes} />}
              <Divider />
            </Section>
          ))}
        </TabPanel>
        <TabPanel value={value} index={1}>
          <InfoTab />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default SummaryPage;
