// @ts-nocheck
import React from 'react';
import { Typography, Button, Stack, Divider, Box } from '@mui/material';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import { vars } from '../../theme/variables.ts';
import PopulationDisplay from './PopulationDisplay.tsx';
import CommonAccordion from '../common/Accordion.tsx';
import CommonChip from '../common/CommonChip.tsx';
import { ArrowOutward } from '../icons/index.tsx';
import { KsMapType } from '../common/Types.ts';
import { getConnectionDetails } from '../../services/summaryHeatmapService.ts';
import { getKnowledgeStatementMap } from '../../services/heatmapService.ts';

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
  knowledgeStatementsMap: KsMapType;
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
      label: 'PhenoType',
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
    const properties = [
      'id',
      'statement_preview',
      'provenances',
      'journey',
      'phenotype',
      'laterality',
      'projection',
      'circuit_type',
      'sex',
      'species',
      'apinatomy',
      'journey',
      'origins',
      'vias',
      'destinations',
    ];
    const keys = Object.keys(knowledgeStatementsMap);
    const rows = [properties];
    keys.forEach((key) => {
      const ks = knowledgeStatementsMap[key];
      const row = properties.map((property) => {
        if (property === 'origins') {
          const node = [];
          // node.push('[');
          ks[property].forEach((origin) => {
            node.push(
              'URIs: ' +
                origin['ontology_uri'] +
                '; Label: ' +
                origin['name'] +
                ' # ',
            );
          });
          // node.push(']');
          const toReturn = node
            .join('')
            .replaceAll('\n', '. ')
            .replaceAll('\r', '')
            .replaceAll('\t', ' ')
            .replaceAll(',', ';');
          return toReturn;
        } else if (property === 'vias' || property === 'destinations') {
          const node = [];
          node.push('[');
          ks[property].forEach((viaDest) => {
            node.push(
              viaDest['anatomical_entities'].map(
                (e) =>
                  'URI: ' + e['ontology_uri'] + ' Label: ' + e['name'] + '; ',
              ) +
                '; Type: ' +
                viaDest['type'] +
                '; From: ' +
                viaDest['from_entities']
                  .map((e) => e['ontology_uri'])
                  .join('; ') +
                ' # ',
            );
          });
          node.push(']');
          const toReturn = node
            .join('')
            .replaceAll('\n', '. ')
            .replaceAll('\r', '')
            .replaceAll('\t', ' ')
            .replaceAll(',', ';');
          return toReturn;
        } else if (property === 'sex') {
          return ks[property].name + ' ' + ks[property].ontology_uri;
        } else if (Array.isArray(ks[property])) {
          // @ts-expect-error - TS doesn't know that ks[property] exists
          const toReturn = ks[property]
            .join(' # ')
            .replaceAll('\n', '. ')
            .replaceAll('\r', '')
            .replaceAll('\t', ' ')
            .replaceAll(',', ';');
          return toReturn;
        } else {
          // @ts-expect-error - TS doesn't know that ks[property] exists
          const toReturn = ks[property]
            .replaceAll('\n', '. ')
            .replaceAll('\r', '')
            .replaceAll('\t', ' ')
            .replaceAll(',', ';');
          return toReturn;
        }
      });
      rows.push(row);
    });

    let csvData = '';
    rows.forEach((e) => {
      const toReturn = e
        .map(String)
        .map((v) => v.replaceAll('"', '""'))
        .map((v) => `"${v}"`)
        .join(',');
      csvData += toReturn + '\n';
    });
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8,' });
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
            {connectionDetails?.statement_preview ||
              connectionDetails?.knowledge_statement ||
              '-'}
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
