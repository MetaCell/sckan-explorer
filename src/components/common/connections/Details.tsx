import React from 'react';
import {
  Typography,
  Button,
  Stack,
  Divider
} from "@mui/material";
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import { vars } from "../../../theme/variables.ts";
import PopulationDisplay from "./PopulationDisplay.tsx";
import CommonAccordion from "../Accordion.tsx";
import CommonChip from "../CommonChip.tsx";
import { ArrowOutward, HelpCircle } from "../../../icons";

const { gray500, gray700, gray800} = vars;

const RowStack = ({ label, value, Icon }: {label: string, value: string, Icon?: React.ElementType}) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={'.75rem'}
    sx={{
      '& .MuiSvgIcon-root': {
        height: '1rem',
        width: '1rem',
        marginLeft: '.5rem'
      }
    }}
  >
    <Typography variant='subtitle1' width='6rem'>{label}</Typography>
    <Typography variant='subtitle1' fontWeight={400}>
      {value}
      {Icon && <Icon />}
    </Typography>
  </Stack>
);

const Details = () => {
  return (
    <Stack p='.75rem' spacing='1.5rem'>
      <Stack direction='row' alignItems='center' justifyContent='space-between' mt='.75rem'>
        <Typography variant='h5' color={gray800}>
          Details
        </Typography>
        <Stack direction='row' alignItems='center' spacing='.5rem'>
          <Button variant="outlined" startIcon={<ArrowOutward />}>
            View on SPARC Portal
          </Button>
          <Button variant="contained">
            Download (.pdf)
          </Button>
        </Stack>
      </Stack>
      <Stack mt='1.75rem' spacing='.5rem'>
        <Typography variant='subtitle2' color={gray700} lineHeight={1.25}>
          Knowledge statement
        </Typography>
        <Typography variant='body1' color={gray500}>
          Fifth thoracic dorsal root ganglion to Heart right ventricle via White matter of spinal cord
        </Typography>
        <CommonChip label="Sympathetic" variant="outlined" />
        <CommonAccordion
          summary="Connection Details"
          details={
            <>
              <Stack spacing={1}>
                <RowStack label="Status" value="Inferred" Icon={HelpCircle} />
                <RowStack label="Species" value="Mammal" />
                <RowStack label="Label" value="Neuron type aacar 13" />
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing='.75rem'
                >
                  <Typography variant='subtitle1' width='6rem'>Provenances</Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={'.5rem'}
                  >
                    <CommonChip label="www.microsoft.com" variant="outlined" className='link' icon={<ArrowOutwardRoundedIcon fontSize='small' />} />
                    <CommonChip label="google.com" variant="outlined" className='link' icon={<ArrowOutwardRoundedIcon fontSize='small' />} />
                  </Stack>
                </Stack>
              </Stack>
            </>
          }
        />
      </Stack>
      <Divider />
      <PopulationDisplay />
    </Stack>
  );
};

export default Details;
