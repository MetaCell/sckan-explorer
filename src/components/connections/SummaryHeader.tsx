// @ts-nocheck
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Typography,
  Stack,
  Link,
} from '@mui/material';
import { vars } from '../../theme/variables';
import IconButton from '@mui/material/IconButton';
import { ArrowDown, ArrowRight, ArrowUp, HelpCircle } from '../icons';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { SummaryType, KsMapType } from '../common/Types';
import { useDataContext } from '../../context/DataContext.ts';

const { gray100, gray600A, gray500 } = vars;

type SummaryHeaderProps = {
  showDetails: SummaryType;
  setShowDetails: (showDetails: SummaryType) => void;
  knowledgeStatementsMap: KsMapType;
  connectionPage: number;
  setConnectionPage: (connectionPage: number) => void;
  totalConnectionCount: number;
};

const SummaryHeader = ({
  showDetails,
  setShowDetails,
  knowledgeStatementsMap,
  connectionPage,
  setConnectionPage,
  totalConnectionCount,
}: SummaryHeaderProps) => {
  const totalUniqueKS = Object.keys(knowledgeStatementsMap).length;

  const { selectedConnectionSummary } = useDataContext();

  function getConnectionId() {
    return Object.keys(knowledgeStatementsMap)[connectionPage - 1] || '';
  }
  const connectionId = getConnectionId();

  const handleUpClick = () => {
    if (connectionPage < totalUniqueKS) {
      setConnectionPage(connectionPage + 1);
    }
  };

  const handleDownClick = () => {
    if (connectionPage > 1) {
      setConnectionPage(connectionPage - 1);
    }
  };

  const generateCSV = () => {
    const properties = [
      'id',
      'statement_preview',
      'provenances',
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
    const keys = Object.keys(selectedConnectionSummary['connections']);
    const rows = [properties];
    keys.forEach((key) => {
      const ks = selectedConnectionSummary['connections'][key];
      const row = properties.map((property) => {
        if (property === 'origins') {
          const node = [];
          ks[property].forEach((origin) => {
            node.push(
              '[ URIs: ' +
                origin['ontology_uri'] +
                '; Label: ' +
                origin['name'] +
                ' ]',
            );
          });
          const toReturn = node
            .join(' & ')
            .replaceAll('\n', '. ')
            .replaceAll('\r', '')
            .replaceAll('\t', ' ')
            .replaceAll(',', ';');
          return toReturn;
        } else if (property === 'vias') {
          const node = [];
          ks[property].forEach((via) => {
            node.push(
              '[ (' +
                via['anatomical_entities']
                  .map(
                    (e) =>
                      'URI: ' + e['ontology_uri'] + '; Label: ' + e['name'],
                  )
                  .join(' & ') +
                '); Type: ' +
                via['type'] +
                '; From: ' +
                via['from_entities'].map((e) => e['ontology_uri']).join('; ') +
                ' ]',
            );
          });
          const toReturn = node
            .join(' & ')
            .replaceAll('\n', '. ')
            .replaceAll('\r', '')
            .replaceAll('\t', ' ')
            .replaceAll(',', ';');
          return toReturn;
        } else if (property === 'destinations') {
          const node = [];
          ks[property].forEach((dest) => {
            node.push(
              '[ (' +
                dest['anatomical_entities']
                  .map(
                    (e) =>
                      'URI: ' + e['ontology_uri'] + '; Label: ' + e['name'],
                  )
                  .join(' & ') +
                '); Type: ' +
                dest['type'] +
                '; From: ' +
                dest['from_entities'].map((e) => e['ontology_uri']).join('; ') +
                ' ]',
            );
          });
          const toReturn = node
            .join(' & ')
            .replaceAll('\n', '. ')
            .replaceAll('\r', '')
            .replaceAll('\t', ' ')
            .replaceAll(',', ';');
          return toReturn;
        } else if (property === 'sex') {
          if (ks[property].name && ks[property].ontology_uri) {
            return (
              '[ URI: ' +
              ks[property].ontology_uri +
              '; Label: ' +
              ks[property].name +
              ' ]'
            );
          } else {
            return '';
          }
        } else if (property === 'species') {
          if (ks[property].length) {
            return ks[property]
              .map((e) => '[ URI: ' + e.id + '; Label: ' + e.name + ' ]')
              .join(' & ');
          } else {
            return '';
          }
        } else if (Array.isArray(ks[property])) {
          // @ts-expect-error - TS doesn't know that ks[property] exists
          const toReturn = ks[property]
            .map((v) => '[ ' + v + ' ]')
            .join(' & ')
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

  if (showDetails === SummaryType.Instruction) {
    return <></>;
  }

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `0.0625rem solid ${gray100}`,
        padding: '0.625rem 0.75rem 0.625rem 1.25rem',
        height: '3.938rem',

        '& .MuiSvgIcon-root': {
          height: '1.25rem',
          width: '1.25rem',
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing="1rem">
        {showDetails === SummaryType.DetailedSummary && (
          <ButtonGroup
            variant="outlined"
            sx={{
              '& .MuiButtonBase-root': {
                width: '2rem',
                height: '2rem',
              },
            }}
          >
            <IconButton onClick={handleDownClick}>
              <ArrowUp />
            </IconButton>
            <IconButton
              sx={{
                marginLeft: '.25rem',
              }}
              onClick={handleUpClick}
            >
              <ArrowDown />
            </IconButton>
          </ButtonGroup>
        )}

        <Breadcrumbs separator={<ArrowRight />} aria-label="breadcrumb">
          {showDetails === SummaryType.DetailedSummary ? (
            <Link
              underline="hover"
              onClick={() => setShowDetails(SummaryType.Summary)}
            >
              Summary
            </Link>
          ) : (
            <Typography>Summary</Typography>
          )}
          {showDetails === SummaryType.DetailedSummary && (
            <Typography>{connectionId}</Typography>
          )}
        </Breadcrumbs>
      </Stack>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        {showDetails === SummaryType.DetailedSummary ? (
          <>
            <Typography variant="subtitle1" color={gray500}>
              Displaying connection {connectionPage} of {totalUniqueKS}
            </Typography>
            <HelpCircle />
          </>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  lineHeight: '1.25rem',
                  color: gray600A,
                }}
              >
                {totalConnectionCount} populations
              </Typography>

              <Divider
                sx={{
                  height: '2.25rem',
                  width: '0.0625rem',
                  background: gray100,
                }}
              />

              <Button variant="contained" onClick={generateCSV}>
                Download results (.csv)
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Stack>
  );
};

export default SummaryHeader;
