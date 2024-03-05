import React from "react";
import { Box, Divider, Stack, Tab, Tabs, Typography } from "@mui/material";
import { vars } from "../theme/variables.ts";
import data from "../data/database_summary.ts";
import {sckanInfoText} from "../data/database_summary_info.ts";
import {Detail} from "./summaryPage/Detail.tsx";
import {Section} from "./summaryPage/Section.tsx";
import {Notes} from "./summaryPage/Notes.tsx";
import {TabPanel} from "./summaryPage/TabPanel.tsx";

const { primarypurple600, gray500, gray600 } = vars;
const SummaryPage = () => {
  const [value, setValue] = React.useState(0);
  
  const handleChange = (_: any, newValue: number) => {
    setValue(newValue);
  };
  
  return (
    <Box width={1} className='database-summary'>
      <Stack justifyContent='center' alignItems='center' pt='6.5rem' pb='6.5rem' width={1} spacing={'.5rem'}>
        <Typography
          sx={{
            color: primarypurple600,
            fontSize: '1.875rem',
            fontWeight: 600,
          }}
        >Database summary</Typography>
        <Typography variant='body1' color={gray500}>Last updated on September 15, 2023</Typography>
      </Stack>
      <Box sx={{
        backgroundColor: '#fff',
        '& .tabpanel': {
          display: 'flex',
          justifyContent: 'center'
        }
      }}>
        <Box sx={{
          backgroundColor: '#fff',
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
          {Object.entries(data).map(([sectionName, sectionData]) => (
            <Section key={sectionName} title={sectionData.title}>
              {Object.entries<any>(sectionData).map(([key, { label, value, note }]) => (
                <Detail key={key} label={label} value={value} note={note} />
              ))}
              {sectionData.notes && <Notes text={sectionData.notes} />}
              <Divider />
            </Section>
          ))}
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Stack p="2rem" spacing="3rem">
            <Stack>
              <Typography variant="h2">
                {sckanInfoText.summary.title}
              </Typography>
              <Typography variant="h5" fontWeight={400} color={gray600}>
                {sckanInfoText.summary.content}
              </Typography>
            </Stack>
            <Stack spacing=".75rem">
              <Typography variant="h2">
                {sckanInfoText.connectivityStats.title}
              </Typography>
              <Typography variant="h5" fontWeight={400} color={gray600}>
                {sckanInfoText.connectivityStats.content}
              </Typography>
              <ul
                style={{
                  paddingLeft: "1.5rem",
                  fontSize: "1rem",
                  fontWeight: 400,
                  lineHeight: "1.5rem",
                  color: "#6C707A",
                }}
              >
                {sckanInfoText.connectivityStats.bulletPoints.map(
                  (bulletPoint, index) => (
                    <li key={index}>{bulletPoint}</li>
                  )
                )}
              </ul>
              <Typography variant="h5" fontWeight={400} color={gray600}>
                {sckanInfoText.connectivityStats.note}
              </Typography>
            </Stack>
          </Stack>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default SummaryPage;
