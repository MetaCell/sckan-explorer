import React, { useState } from 'react';
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
import { ksMapType } from '../common/Types.ts';
import { KnowledgeStatement } from '../../models/explorer.ts';

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

const Details = ({
  uniqueKS,
  connectionCount
}: {
  uniqueKS: ksMapType,
  connectionCount: number
}) => {
  const connectionDetails = uniqueKS !== undefined ?
    uniqueKS[Object.keys(uniqueKS)[connectionCount - 1]]?.ks
    : {} as KnowledgeStatement;
  const phenotype = connectionDetails?.phenotype || ''
  const detailsObject = [
    {
      label: 'Laterality',
      value: connectionDetails?.laterality || '-',
    },
    {
      label: 'Projection',
      value: connectionDetails?.projection || '-',
    },
    {
      label: 'Circuit Type',
      value: connectionDetails?.circuit_type || '-',
    },
    {
      label: 'Provenances',
      value: connectionDetails?.provenances || [],
    }, 
    {
      label: 'Sex',
      value: connectionDetails?.sex.name || '-',
    }
  ]

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
            {connectionDetails.statement_preview || connectionDetails.knowledge_statement}
          </Typography>
          {phenotype && <CommonChip label={phenotype} variant="outlined" />}
          <CommonAccordion
            summary="Connection Details"
            details={
              <>
                <Stack spacing={1}>
                  {
                    detailsObject.map((row) =>
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
                            flexWrap={'wrap'}
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
      <PopulationDisplay
        connectionDetails={connectionDetails}
      />
    </Stack>
  );
};

export default Details;
