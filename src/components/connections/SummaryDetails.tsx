import React from 'react';
import { Typography, Button, Stack, Divider, Box } from '@mui/material';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import { vars } from '../../theme/variables.ts';
import PopulationDisplay from './PopulationDisplay.tsx';
import CommonAccordion from '../common/Accordion.tsx';
import CommonChip from '../common/CommonChip.tsx';
import { ArrowOutward } from '../icons/index.tsx';
import { KsRecord } from '../common/Types.ts';
import { getConnectionDetails } from '../../services/summaryHeatmapService.ts';
import { generateCsvService } from '../../services/csvService.ts';

const { gray500, gray700, gray800 } = vars;

const RowStack = ({
  label,
  value,
  Icon,
}: {
  label: string;
  value: string;
  Icon?: React.ElementType;
}) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={'.75rem'}
    sx={{
      '& .MuiSvgIcon-root': {
        height: '1rem',
        width: '1rem',
        marginLeft: '.5rem',
      },
    }}
  >
    <Typography variant="subtitle1" width="6rem">
      {label}
    </Typography>
    <Typography variant="subtitle1" fontWeight={400}>
      {value}
      {Icon && <Icon />}
    </Typography>
  </Stack>
);

type SummaryDetailsProps = {
  knowledgeStatementsMap: KsRecord;
  connectionPage: number;
};

const SummaryDetails = ({
  knowledgeStatementsMap,
  connectionPage,
}: SummaryDetailsProps) => {
  const connectionDetails = getConnectionDetails(
    knowledgeStatementsMap,
    connectionPage,
  );
  const phenotype = connectionDetails?.phenotype || '';

  // Details shown in the dropdown - from composer
  const detailsObject = [
    {
      label: 'Name',
      value: connectionDetails?.id || '-',
      icon: undefined,
    },
    {
      label: 'Laterality',
      value: connectionDetails?.laterality || '-',
      icon: undefined,
    },
    {
      label: 'Projection',
      value: connectionDetails?.projection || '-',
      icon: undefined,
    },
    {
      label: 'Circuit Type',
      value: connectionDetails?.circuit_type || '-',
      icon: undefined,
    },
    {
      label: 'Provenances',
      value: connectionDetails?.provenances || [],
      icon: undefined,
    },
    {
      label: 'Phenotype',
      value: connectionDetails?.phenotype || '-',
      icon: undefined,
    },
    {
      label: 'Sex',
      value: connectionDetails?.sex.name || '-',
      icon: undefined,
    },
  ];

  const generateCSV = () => {
    const blob = generateCsvService(knowledgeStatementsMap);
    const objUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', objUrl);
    link.setAttribute('download', 'connections.csv');
    document.body.appendChild(link);
    link.click();
  };

  return (
    <Stack spacing="1.5rem">
      <Box pl="1.5rem" pr="1.5rem">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mt=".75rem"
        >
          <Typography variant="h5" color={gray800}>
            Details
          </Typography>
          <Stack direction="row" alignItems="center" spacing=".5rem">
            <Button
              variant="outlined"
              startIcon={<ArrowOutward />}
              disabled={true}
            >
              View on SPARC Portal
            </Button>
            <Button variant="contained" onClick={generateCSV}>
              Download (.csv)
            </Button>
          </Stack>
        </Stack>
        <Stack mt="1.75rem" spacing=".5rem">
          <Typography variant="subtitle2" color={gray700} lineHeight={1.25}>
            Knowledge statement
          </Typography>
          <Typography variant="body1" color={gray500}>
            {connectionDetails?.knowledge_statement || '-'}
          </Typography>
          {phenotype && <CommonChip label={phenotype} variant="outlined" />}
          <CommonAccordion
            summary="Connection Details"
            details={
              <>
                <Stack spacing={1}>
                  {detailsObject.map((row) =>
                    !Array.isArray(row.value) ? (
                      <RowStack
                        label={row.label}
                        value={row.value}
                        Icon={row.icon}
                      />
                    ) : (
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing=".75rem"
                      >
                        <Typography variant="subtitle1" width="6rem">
                          {row.label}
                        </Typography>
                        <Stack
                          direction="row"
                          alignItems="center"
                          flexWrap={'wrap'}
                          spacing={'.5rem'}
                        >
                          {row.value.map((row, index) => (
                            <CommonChip
                              key={index}
                              label={row}
                              variant="outlined"
                              className="link"
                              style={
                                row.includes('http')
                                  ? { cursor: 'pointer' }
                                  : {}
                              }
                              onClick={() => {
                                if (row.includes('http')) {
                                  window.open(row, '_blank');
                                }
                              }}
                              icon={
                                <ArrowOutwardRoundedIcon fontSize="small" />
                              }
                            />
                          ))}
                        </Stack>
                      </Stack>
                    ),
                  )}
                </Stack>
              </>
            }
          />
        </Stack>
      </Box>

      <Divider />
      <PopulationDisplay connectionDetails={connectionDetails} />
    </Stack>
  );
};

export default SummaryDetails;
