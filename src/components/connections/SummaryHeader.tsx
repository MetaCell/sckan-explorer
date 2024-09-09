import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Typography,
  Stack,
} from '@mui/material';
import { vars } from '../../theme/variables';
import { ArrowRight } from '../icons';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { SummaryType, KsRecord } from '../common/Types';
import { useDataContext } from '../../context/DataContext.ts';
import { generateJourneyCsvService } from '../../services/csvService.ts';

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
    const blob = generateJourneyCsvService(selectedConnectionSummary['connections'], selectedConnectionSummary?.endOrgan?.name);
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
                width: '7.8rem',
                height: '2rem',
                borderRadius: '0.25rem',
                border: `0.0625rem solid ${primaryPurple600}`,
                color: primaryPurple600,
                marginRight: '1rem',
              },
            }}
          >
            <Button onClick={() => setShowDetails(SummaryType.Summary)}>
              Back to Summary
            </Button>
          </ButtonGroup>
        )}

        <Breadcrumbs separator={<ArrowRight />} aria-label="breadcrumb">
          {showDetails === SummaryType.DetailedSummary ? (
            <></>
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
          <ButtonGroup
            variant="outlined"
            sx={{
              '& .MuiButtonBase-root': {
                width: '4rem',
                height: '2rem',
                borderRadius: '0.25rem',
                border: `0.0625rem solid ${primaryPurple600}`,
                color: primaryPurple600,
                marginRight: '1rem',
              },
            }}
          >
            <Button
              sx={{
                width: '5rem !important',
                marginLeft: '.25rem',
              }}
              onClick={handleDownClick}
            >
              Previous
            </Button>
            <Typography
              variant="subtitle1"
              color={gray500}
              style={{ width: '12rem' }}
            >
              Displaying connection {connectionPage} of {totalUniqueKS}
            </Typography>
            <Button
              sx={{
                width: '5rem !important',
                marginLeft: '.25rem',
              }}
              onClick={handleUpClick}
            >
              Next
            </Button>
          </ButtonGroup>
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
