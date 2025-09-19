import React, { ReactNode } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Stack,
} from '@mui/material';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';

interface CommonAccordionProps {
  summary: string;
  details: ReactNode;
}

const CommonAccordion: React.FC<CommonAccordionProps> = ({
  summary,
  details,
}) => {
  return (
    <Accordion
      disableGutters
      elevation={0}
      square
      sx={{ mt: '1rem !important' }}
    >
      <AccordionSummary
        expandIcon={<KeyboardArrowRightRoundedIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography>{summary}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: 0 }}>
        <Stack spacing={1}>{details}</Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default CommonAccordion;
