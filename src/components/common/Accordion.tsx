import React, { ReactNode } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Stack } from "@mui/material";
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';

interface CommonAccordionProps {
  summary: string;
  details: ReactNode;
}

const CommonAccordion: React.FC<CommonAccordionProps> = ({ summary, details }) => {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<KeyboardArrowRightRoundedIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography>{summary}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1}>
          {details}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default CommonAccordion;