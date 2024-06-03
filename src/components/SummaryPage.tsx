import React, { useState, useEffect } from 'react';
import { Box, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import { vars } from '../theme/variables.ts';
import { Detail } from './summaryPage/Detail.tsx';
import { Section } from './summaryPage/Section.tsx';
import { Notes } from './summaryPage/Notes.tsx';
import { TabPanel } from './summaryPage/TabPanel.tsx';
import InfoTab from './summaryPage/InfoTab.tsx';
import Loader from './common/Loader.tsx';

interface DataType {
  [key: string]: {
    [key: string]: string | number;
    notes: string;
  };
}
type LabelsType = {
  [key: string]: string;
};

const { primaryPurple600, gray500, white } = vars;

const databaseSummaryURL =
  'https://raw.githubusercontent.com/MetaCell/sckan-explorer/feature/ESCKAN-28/src/data/database_summary_data.json';
const databaseSummaryLabelsURL =
  'https://raw.githubusercontent.com/MetaCell/sckan-explorer/feature/ESCKAN-28/src/data/database_summary_labels.json';

const SummaryPage = () => {
  const [data, setData] = useState<DataType | null>(null);
  const [labels, setLabels] = useState<LabelsType | null>(null);
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
      .catch((error) => console.error('Error fetching data:', error));

    fetch(databaseSummaryLabelsURL)
      .then((response) => response.json())
      .then((jsonData) => {
        setLabels(jsonData);
      })
      .catch((error) => console.error('Error fetching labels:', error));
  }, []);

  if (!data || !labels)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" width={1}>
        <Loader />
      </Box>
    );
  return (
    <Box width={1} className="database-summary">
      <Stack
        justifyContent="center"
        alignItems="center"
        pt="6.5rem"
        pb="6.5rem"
        width={1}
        spacing=".5rem"
      >
        <Typography
          sx={{
            color: primaryPurple600,
            fontSize: '1.875rem',
            fontWeight: 600,
            lineHeight: '2.375rem',
          }}
        >
          Database summary
        </Typography>
        <Typography variant="body1" color={gray500}>
          Last updated on September 15, 2023
        </Typography>
      </Stack>
      <Box
        sx={{
          backgroundColor: white,
          '& .tabpanel': {
            display: 'flex',
            justifyContent: 'center',
          },
        }}
      >
        <Box
          sx={{
            backgroundColor: white,
            position: 'sticky',
            top: '0',
            zIndex: 1,
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            sx={{ borderBottom: 1, borderColor: '#EDEFF2', width: 1 }}
          >
            <Tab label="Summary" />
            <Tab label="Info" />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          {Object.keys(data).map((sectionName) => (
            <Section key={sectionName} title={labels[sectionName]}>
              {Object.entries(data[sectionName]).map(([key, value], index) => {
                if (key.endsWith('changes') || key === 'notes') {
                  return null;
                }

                return (
                  <Detail
                    keyName={key}
                    sectionData={data[sectionName]}
                    value={value}
                    labels={labels}
                    index={index}
                  />
                );
              })}
              {data[sectionName].notes && (
                <Notes text={data[sectionName].notes} />
              )}
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
