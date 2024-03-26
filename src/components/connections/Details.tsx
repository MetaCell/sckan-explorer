import React from 'react';
import {
  Typography,
  Button,
  Stack,
  Divider, Box
} from "@mui/material";
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import { vars } from "../../theme/variables.ts";
import PopulationDisplay from "./PopulationDisplay.tsx";
import CommonAccordion from "../common/Accordion.tsx";
import CommonChip from "../common/CommonChip.tsx";
import { ArrowOutward, HelpCircle } from "../icons";

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
  const detailsObject = {
    knowledge_statement: 'Fifth thoracic dorsal root ganglion to Heart right ventricle via White matter of spinal cord',
    type: 'Sympathetic',
    connectionDetails: [
      {
        label: 'Status',
        value: 'Inferred',
        icon: HelpCircle
      },
      {
        label: 'Species',
        value: 'Mammal',
      },
      {
        label: 'Label',
        value: 'Neuron type aacar 13',
      },
      {
        label: 'Provenances',
        value: ['www.microsoft.com', 'google.com'],
      },
    ]
  }
  return (
    <Stack spacing='1.5rem'>
      <Box pl='1.5rem' pr='1.5rem'>
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
            {detailsObject.knowledge_statement}
          </Typography>
          <CommonChip label={detailsObject.type} variant="outlined" />
          <CommonAccordion
            summary="Connection Details"
            details={
              <>
                <Stack spacing={1}>
                  {
                    detailsObject.connectionDetails.map((row) =>
                      !Array.isArray(row.value) ?
                        <RowStack label={row.label} value={row.value} Icon={row.icon} /> :
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing='.75rem'
                        >
                          <Typography variant='subtitle1' width='6rem'>{row.label}</Typography>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={'.5rem'}
                          >
                            {
                              row.value.map((row) =>
                                <CommonChip label={row} variant="outlined" className='link' icon={<ArrowOutwardRoundedIcon fontSize='small' />} />
                              )
                            }
                          </Stack>
                        </Stack>
                    )
                  }
                </Stack>
              </>
            }
          />
        </Stack>
      </Box>
   
      <Divider />
      <PopulationDisplay />
    </Stack>
  );
};

export default Details;
