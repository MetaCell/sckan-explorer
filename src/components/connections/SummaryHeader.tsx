import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Typography,
  Stack,
} from '@mui/material';
import { vars } from '../../theme/variables';
import IconButton from '@mui/material/IconButton';
import { CloseArrows, ArrowRight, ArrowLeft, HelpCircle } from '../icons';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { SummaryType, KsRecord } from '../common/Types';
import { useDataContext } from '../../context/DataContext.ts';
import { generateCsvService } from '../../services/csvService.ts';

const { gray100, gray600A, gray500, primaryPurple600 } = vars;

type SummaryHeaderProps = {
  showDetails: SummaryType;
  setShowDetails: (showDetails: SummaryType) => void;
  knowledgeStatementsMap: KsRecord;
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
    // @ts-expect-error - TS doesn't know that selectedConnectionSummary exists
    const blob = generateCsvService(selectedConnectionSummary['connections']);
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
                borderRadius: '0.25rem',
                border: `0.0625rem solid ${primaryPurple600}`,
              },
            }}
          >
            <IconButton onClick={() => setShowDetails(SummaryType.Summary)}>
              <CloseArrows />
            </IconButton>
            <IconButton
              sx={{
                marginLeft: '.25rem',
              }}
              onClick={handleDownClick}
            >
              <ArrowLeft />
            </IconButton>
            <IconButton
              sx={{
                marginLeft: '.25rem',
              }}
              onClick={handleUpClick}
            >
              <ArrowRight />
            </IconButton>
          </ButtonGroup>
        )}

        <Breadcrumbs separator={<ArrowRight />} aria-label="breadcrumb">
          {showDetails === SummaryType.DetailedSummary ? (
            <Typography>{connectionId}</Typography>
          ) : (
            <Typography>Summary</Typography>
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
